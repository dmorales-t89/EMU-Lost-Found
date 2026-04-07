import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchItemById, ITEM_IMAGE_PLACEHOLDER } from '../lib/itemsApi';
import ClaimItemModal from '../components/ClaimItemModal';
import { supabase } from '../lib/supabaseClient';


function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimError, setClaimError] = useState('');

  

  useEffect(() => {
    let isMounted = true;

    async function loadItem() {
      setLoading(true);
      setError('');
      setNotFound(false);

      try {
        const fetchedItem = await fetchItemById(id);

        if (!isMounted) {
          return;
        }

        if (!fetchedItem) {
          setNotFound(true);
          setItem(null);
          return;
        }

        setItem(fetchedItem);
      } catch (fetchError) {
        console.error('Error loading item detail:', fetchError);
        if (isMounted) {
          setError('Unable to load this item right now. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadItem();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="container">
        <p>Loading item...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <p>{error}</p>
        <button onClick={() => navigate('/lost-items')}>Back to Lost Items</button>
      </main>
    );
  }

  if (notFound || !item) {
    return (
      <main className="container">
        <p>Item not found.</p>
        <button onClick={() => navigate('/lost-items')}>Back to Lost Items</button>
      </main>
    );
  }

  const onClaimItem = () => {
    setClaimError('');
    setIsClaimOpen(true);
  };

  const onSubmitClaim = async ({ requestorEmail }) => {
    setClaimSubmitting(true);
    setClaimError('');
    try {
      const { error: invokeError } = await supabase.functions.invoke('request-claim', {
        body: { itemId: item.id, requestorEmail },
      });

      if (invokeError) {
        throw invokeError;
      }

      setIsClaimOpen(false);
      alert('Claim request sent!');
    } catch (e) {
      console.error(e);
      setClaimError(e?.message || 'Unable to send claim request. Please try again.');
    } finally {
      setClaimSubmitting(false);
    }
  };


  return (
    <main className="container item-detail">
      <button className="back-btn" onClick={() => navigate(-1)}>
        {'<- Back'}
      </button>
      <div className="item-detail-card">
        <div className="item-detail-image">
          <img
            src={item.image || ITEM_IMAGE_PLACEHOLDER}
            alt={item.title}
            onError={(event) => {
              event.currentTarget.src = ITEM_IMAGE_PLACEHOLDER;
            }}
          />
        </div>
        <ClaimItemModal
          isOpen={isClaimOpen}
          itemTitle={item.title}
          onClose={() => setIsClaimOpen(false)}
          onSubmit={onSubmitClaim}
          submitting={claimSubmitting}
          errorMessage={claimError}
        />

        <div className="item-detail-content">
          <h1>{item.title}</h1>
          <p><strong>Type:</strong> {item.type}</p>
          <p><strong>Description:</strong> {item.description}</p>
          <p><strong>Current Location:</strong> {item.currentLocation}</p>
          <p><strong>Date Found:</strong> {item.dateEvent}</p>
          <p><strong>Location Lost:</strong> {item.eventLocation}</p>
          <p><strong>Status:</strong> {item.status}</p>
          {item.status === "open" && (
            <button className="claim-btn" onClick={onClaimItem}>Claim Item</button>
          )}
        </div>
      </div>
    </main>
  );
}

export default ItemDetailPage;
