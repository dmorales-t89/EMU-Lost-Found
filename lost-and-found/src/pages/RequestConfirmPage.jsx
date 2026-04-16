import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function RequestConfirmPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const status = params.get('status'); // approved | rejected | returned
  const itemId = params.get('itemId'); // optional

  let title = 'Update complete';
  let message = 'You can close this tab.';

  if (status === 'approved') {
    title = 'Claim approved';
    message = 'The requestor has been notified.';
  } else if (status === 'rejected') {
    title = 'Claim rejected';
    message = 'The requestor has been notified.';
  } else if (status === 'returned') {
    title = 'Item marked returned';
    message = 'The requestor has been notified.';
  } else {
    title = 'Invalid link';
    message = 'This link is missing information or has expired.';
  }

  return (
    <main className="container" >
      <h1 >{title}</h1>
      <p>{message}</p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
        <button className="claim-btn" onClick={() => navigate('/lost-items')}>
          Back to items
        </button>

        {itemId && (
          <button className="claim-btn" onClick={() => navigate(`/lost-items/${itemId}`)}>
            View item
          </button>
        )}
      </div>
    </main>
  );
}

export default RequestConfirmPage;
