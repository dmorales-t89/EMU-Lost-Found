//@ts-nocheck
// supabase/functions/request-claim/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Payload = { itemId?: string; requestorEmail?: string };

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

function base64Url(bytes: Uint8Array) {
  const b64 = btoa(String.fromCharCode(...bytes));
  return b64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function sha256Hex(message: string) {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
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
    body: JSON.stringify({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (json && (json.message || json.error?.message || json.error)) ||
      `Resend error (${res.status})`;
    throw new Error(message);
  }

  return json;
}

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("FROM_EMAIL") ?? "onboarding@resend.dev";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let payload: Payload | null = null;
    try {
      payload = await req.json();
    } catch {
      payload = null;
    }

    const itemId = payload?.itemId?.trim() ?? "";
    const requestorEmail = payload?.requestorEmail?.trim()?.toLowerCase() ?? "";
    

    if (!itemId || !requestorEmail) {
      return new Response(JSON.stringify({ error: "itemId and requestorEmail are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isEmail(requestorEmail)) {
      return new Response(JSON.stringify({ error: "requestorEmail must be a valid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("id, title, contact_info, status")
      .eq("id", itemId)
      .maybeSingle();

    if (itemError) throw new Error(itemError.message);
    if (!item) {
      return new Response(JSON.stringify({ error: "Item not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (String(item.status) !== "open") {
      return new Response(JSON.stringify({ error: "Item is not open for claims" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reporterEmailRaw = String(item.contact_info ?? "").trim().toLowerCase();
    const reporterEmail = isEmail(reporterEmailRaw) ? reporterEmailRaw : "";

    if (!reporterEmail) {
      return new Response(
        JSON.stringify({ error: "Reporter email is missing/invalid; cannot send email." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Generate one-time token; store only hash in DB.
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const actionToken = base64Url(tokenBytes);
    const actionTokenHash = await sha256Hex(actionToken);

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days

    // 1) Create claim request (with token fields)
    const { data: created, error: insertError } = await supabase
      .from("claim_requests")
      .insert({
        item_id: itemId,
        requestor_email: requestorEmail,
        status: "pending",
        action_token_hash: actionTokenHash,
        action_token_expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (insertError) {
      // If you later add a unique index for "one pending per item", handle it gracefully:
      // if (insertError.code === '23505') { ... }
      throw new Error(insertError.message);
    }

    const requestId = String(created.id);

    // 2) Build decision links to the next edge function: claim-action
    const origin = new URL(req.url).origin;
    const base = `${origin}/functions/v1/claim-action`;


    const approveUrl =
      `${base}?action=approved&token=${encodeURIComponent(actionToken)}`;
    const rejectUrl =
      `${base}?action=rejected&token=${encodeURIComponent(actionToken)}`;
    const returnedUrl =
      `${base}?action=returned&token=${encodeURIComponent(actionToken)}`;


    const safeTitle = escapeHtml(String(item.title ?? "Lost & Found item"));
    const subject = `Claim request: ${String(item.title ?? "Lost & Found item")}`;

    /*const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
        <h2>Claim request</h2>
        <p><strong>Item:</strong> ${safeTitle}</p>
        <p><strong>Requestor email:</strong> ${escapeHtml(requestorEmail)}</p>

        <p>
          <a href="${approveUrl}" style="display:inline-block;padding:10px 14px;background:#16a34a;color:white;text-decoration:none;border-radius:6px;">Approve</a>
          <a href="${rejectUrl}" style="display:inline-block;margin-left:10px;padding:10px 14px;background:#dc2626;color:white;text-decoration:none;border-radius:6px;">Reject</a>
          <a href="${returnedUrl}" style="display:inline-block;margin-left:10px;padding:10px 14px;background:#0f2c52;color:white;text-decoration:none;border-radius:6px;">Item already returned</a>
        </p>

        <hr />
        <p style="color:#6b7280;font-size:12px;">
          Request ID: ${escapeHtml(requestId)}<br/>
          This link expires: ${escapeHtml(expiresAt)}
        </p>
      </div>
    `;*/

    const html = `
          <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
                            style="font-size:1.5rem;line-height:2rem;font-weight:700;margin:16px;text-align:center;margin-top:40px;text-decoration:none"
                          >
                            ${escapeHtml(requestorEmail)} requested a claim on the ${safeTitle} you found
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
                            You can accept the claim, reject the claim, or notify the person that the item was already picked up.
                            You can contact the person at ${escapeHtml(requestorEmail)}.
                            Please choose one of the options below.
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
                    style="margin-top:1rem;text-align:center"
                  >
                    <tbody>
                      <tr>
                        <td>
                          <table
                            align="center"
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            role="presentation"
                            style="border-collapse:separate;border-spacing:8px"
                          >
                            <tr>
                              <td>
                                <a
                                  href="${approveUrl}"
                                  style="background-color:#0f2c52;border-radius:4px;display:inline-block;padding:12px 24px;text-align:center;font-size:0.875rem;line-height:1.25rem;font-weight:600;color:rgb(255,255,255);text-decoration:none"
                                  target="_blank"
                                  >Accept Claim</a
                                >
                              </td>
                              <td>
                                <a
                                  href="${rejectUrl}"
                                  style="background-color:#0f2c52;border-radius:4px;display:inline-block;padding:12px 24px;text-align:center;font-size:0.875rem;line-height:1.25rem;font-weight:600;color:rgb(255,255,255);text-decoration:none"
                                  target="_blank"
                                  >Reject Claim</a
                                >
                              </td>
                              <td>
                                <a
                                  href="${returnedUrl}"
                                  style="background-color:#0f2c52;border-radius:4px;display:inline-block;padding:12px 24px;text-align:center;font-size:0.875rem;line-height:1.25rem;font-weight:600;color:rgb(255,255,255);text-decoration:none"
                                  target="_blank"
                                  >I No Longer Have this Item</a
                                >
                              </td>
                            </tr>
                          </table>
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
                            this email. The link will expire at ${escapeHtml(expiresAt)}
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
      </html>
    `

    await sendResendEmail({
      apiKey: resendApiKey,
      from: fromEmail,
      to: [reporterEmail],
      subject,
      html,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
