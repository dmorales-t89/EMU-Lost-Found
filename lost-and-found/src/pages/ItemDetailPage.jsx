import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sampleItems } from '../data/sampleItems';

function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = sampleItems.find((i) => i.id === parseInt(id, 10));

  if (!item) {
    return (
      <main className="container">
        <p>Item not found.</p>
        <button onClick={() => navigate('/lost-items')}>Back to Lost Items</button>
      </main>
    );
  }

  return (
    <main className="container item-detail">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="item-detail-card">
        <div className="item-detail-image">
          <img src={item.image} alt={item.title} />
        </div>
        <div className="item-detail-content">
          <h1>{item.title}</h1>
          <p><strong>Current Location:</strong> {item.location}</p>
          <p><strong>Date Found:</strong> {item.dateFound}</p>
          <p><strong>Location Found:</strong> {item.locationFound}</p>
        </div>
      </div>
    </main>
  );
}

export default ItemDetailPage;
