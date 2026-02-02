import React from 'react';

function ItemCard({ 
  image, 
  title, 
  currentLocation, 
  dateFound, 
  locationLost,
  onReadMore 
}) {
  return (
    <div className="item-card">
      <div className="item-card-image">
        <img src={image} alt={title} />
      </div>
      <div className="item-card-content">
        <h3 className="item-card-title">{title}</h3>
        <p className="item-card-location">{currentLocation}</p>
        <p className="item-card-date">Date Found: {dateFound}</p>
        <p className="item-card-found">Location Lost: {locationLost}</p>
        <button className="read-more-btn" onClick={onReadMore}>
          Read More
        </button>
      </div>
    </div>
  );
}

export default ItemCard;
