// @ts-nocheck
// supabase/functions/claim-action/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

function redirect(url: string) {
  return new Response(null, {
    status: 302,
    headers: { Location: url },
  });
}

async function sha256Hex(message: string) {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

function isEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendResendEmail(params: {
  apiKey: string;
  from: string;
  to: string[];
  subject: string;
  html: string;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error: ${text}`);
  }
}

type Action = "approved" | "rejected" | "returned";
function normalizeAction(value: string | null): Action | null {
  if (!value) return null;
  const v = value.toLowerCase();
  return ["approved", "rejected", "returned"].includes(v)
    ? (v as Action)
    : null;
}

serve(async (req) => {
  try {
    if (req.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    const fromEmail = Deno.env.get("FROM_EMAIL")!;
    const appUrl = (Deno.env.get("APP_URL") ?? "").replace(/\/+$/, "");

    const url = new URL(req.url);
    const action = normalizeAction(url.searchParams.get("action"));
    const token = (url.searchParams.get("token") ?? "").trim();

    if (!action || !token) {
      return redirect(`${appUrl}/request-confirm?status=invalid`);
    }

    const tokenHash = await sha256Hex(token);
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: claim } = await supabase
      .from("claim_requests")
      .select("*")
      .eq("action_token_hash", tokenHash)
      .eq("status", "pending")
      .is("action_token_used_at", null)
      .maybeSingle();

    if (!claim) {
      return redirect(`${appUrl}/request-confirm?status=expired`);
    }

    const expiresAt = claim.action_token_expires_at
      ? new Date(claim.action_token_expires_at)
      : null;

    if (expiresAt && expiresAt.getTime() < Date.now()) {
      return redirect(`${appUrl}/request-confirm?status=expired`);
    }

    const claimId = claim.id;
    const itemId = claim.item_id;

    const requestorEmail = isEmail(claim.requestor_email)
      ? claim.requestor_email
      : "";

    // ✅ Update claim
    await supabase
      .from("claim_requests")
      .update({
        status: action,
        action_token_used_at: new Date().toISOString(),
        decided_at: new Date().toISOString(),
      })
      .eq("id", claimId);

    // ✅ Update item
    if (action === "approved") {
      await supabase
        .from("items")
        .update({ status: "claimed" })
        .eq("id", itemId);
    }

    if (action === "returned") {
      await supabase
        .from("items")
        .update({ status: "returned" })
        .eq("id", itemId);
    }

    // ✅ Get item info
    const { data: item } = await supabase
      .from("items")
      .select("title, contact_info")
      .eq("id", itemId)
      .maybeSingle();

    const title = item?.title ?? "Lost & Found item";
    const safeTitle = escapeHtml(String(item.title ?? "Lost & Found item"));
    const reporterEmail = isEmail(item?.contact_info)
    
      ? item.contact_info
      : "";

    // ✅ Send email
    if (requestorEmail) {
      let subject = "";
      let html = "";

      if (action === "approved") {
        subject = `Claim approved: ${title}`;
        /*html = `
          <h2>Claim Approved ✅</h2>
          <p><strong>Item:</strong> ${title}</p>
          <p>Contact the poster to arrange pickup.</p>
          ${reporterEmail ? `<p>Email: ${reporterEmail}</p>` : ""}
        `;*/
        html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html dir="ltr" lang="en">
            <head>
              <link
                rel="preload"
                as="image"
                href="https://res.cloudinary.com/sutharjay/image/upload/v1739700369/me/projects/reactui-email/logo/supabase.svg"
              />
              <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
              <meta name="x-apple-disable-message-reformatting" />
            </head>
            <body style="font-family:'DM Sans', sans-serif;">
              <!--$-->
              <div
                style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0"
              >
                Click the button to confirm.
                <div>
                </div>
              </div>
              <table
                align="center"
                width="100%"
                border="0"
                cellpadding="0"
                cellspacing="0"
                role="presentation"
                style="background-color:#0f2c52;margin-left:auto;margin-right:auto;margin-top:20px;margin-bottom:20px;padding:2rem 1rem;max-width:37.5em"
              >
                <tbody>
                  <tr>
                    <td align="center">
                      <a
                        href="https://emu.edu"
                        style="color:#067df7;text-decoration-line:none"
                        target="_blank"
                      >
                        <img
                          alt="EMU Logo"
                          height="35"
                          src="https://emu.edu/_resources/images/emu-lettermark-logo-color-white.png"
                          style="display:block;outline:none;border:none;text-decoration:none"
                          width="120"
                        />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table
                align="center"
                width="100%"
                border="0"
                cellpadding="0"
                cellspacing="0"
                role="presentation"
                style="margin-left:auto;margin-right:auto;margin-top:20px;margin-bottom:20px;padding-left:1rem;padding-right:1rem;padding-top:1.25rem;padding-bottom:1.25rem;max-width:37.5em"
              >
                <tbody>
                  <tr style="width:100%">
                    <td>
                      <table
                        align="center"
                        width="100%"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="margin-top:1rem"
                      >
                        <tbody>
                          <tr>
                            <td>
                              <p
                                style="font-size:1.2rem;line-height:2rem;font-weight:400;margin:16px;text-align:center"
                              >
                                EMU Lost & Found Notification
                              </p>
                              <p
                                style="font-size:1.5rem;line-height:2rem;font-weight:700;margin:16px;text-align:center;margin-top:40px"
                              >
                                ${escapeHtml(reporterEmail)} has confirmed the request about the ${safeTitle}!
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table
                        align="center"
                        width="100%"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="margin-top:1rem"
                      >
                        <tbody>
                          <tr>
                            <td>
                              <p style="font-size:1rem;line-height:1.5rem;margin:16px 0">
                                Please contact them by ${escapeHtml(reporterEmail)} to arrange a time to meet.
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                        <tbody>
                          <tr>
                            <td>
                              <p
                                style="font-size:0.875rem;line-height:1.25rem;color:hsl(var(--primary) / 0.6);margin:16px 0;text-align:center"
                              >
                                If you didn&#x27;t request for this, you can ignore
                                this email.
                              </p>
                              <p style="font-size:0.75rem;line-height:24px;margin:16px 0;text-align:center">
                                Lost & Found EMU
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <!--7--><!--/$-->
            </body>
          </html>`

      } else if (action === "rejected") {
        subject = `Claim rejected: ${title}`;
        html = `
          <h2>Claim Rejected ❌</h2>
          <p><strong>Item:</strong> ${title}</p>
        `;
      } else {
        subject = `Item returned: ${title}`;
        html = `
          <h2>Item Marked Returned</h2>
          <p><strong>Item:</strong> ${title}</p>
        `;
      }

      await sendResendEmail({
        apiKey: resendApiKey,
        from: fromEmail,
        to: [requestorEmail],
        subject,
        html,
      });
    }

    // ✅ FINAL REDIRECT (this is what user sees)
    return redirect(
      `${appUrl}/request-confirm?status=${action}&itemId=${itemId}`
    );

  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
});