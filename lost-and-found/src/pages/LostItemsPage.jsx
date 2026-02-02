import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import ItemCard from '../components/ItemCard';
import { sampleItems } from '../data/sampleItems';

function LostItemsPage() {
  const navigate = useNavigate();

  const handleReadMore = (itemId) => {
    navigate(`/lost-items/${itemId}`);
  };

  return (
    <>
      <HeroBanner title="Lost Items" />
      <main className="container">
        <div className="items-grid">
          {sampleItems.map((item) => (
            <ItemCard
              key={item.id}
              image={item.image}
              title={item.title}
              currentLocation={item.location}
              dateFound={item.dateFound}
              locationLost={item.locationFound}
              onReadMore={() => handleReadMore(item.id)}
            />
          ))}
        </div>
      </main>
    </>
  );
}

export default LostItemsPage;
