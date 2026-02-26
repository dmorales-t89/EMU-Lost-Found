import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import ItemCard from '../components/ItemCard';
import { fetchItems } from '../lib/itemsApi';

function LostItemsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const fetchedItems = await fetchItems();
      setItems(fetchedItems);
    } catch (fetchError) {
      console.error('Error loading items:', fetchError);
      setError('Unable to load items right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleReadMore = (itemId) => {
    navigate(`/lost-items/${itemId}`);
  };

  return (
    <>
      <HeroBanner title="Search Items" />
      <main className="container">
        {loading && <p>Loading items...</p>}

        {!loading && error && (
          <div>
            <p>{error}</p>
            <button onClick={loadItems}>Retry</button>
          </div>
        )}

        {!loading && !error && items.length === 0 && <p>No items submitted yet.</p>}

        {!loading && !error && items.length > 0 && (
          <div className="items-grid">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                image={item.image}
                title={item.title}
                currentLocation={item.currentLocation}
                dateEvent={item.dateEvent}
                eventLocation={item.eventLocation}
                onReadMore={() => handleReadMore(item.id)}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default LostItemsPage;
