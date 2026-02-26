import React from 'react';
import icon1 from '../assets/tag-icon.jpg';
import icon2 from '../assets/location-icon.jpg';
import icon3 from '../assets/date-icon.jpg';

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
        <div className="item-card-label">
          <img src={icon1} alt="Nothing" height={12} width={12} />
          <p className="item-card-location">{currentLocation}</p>
        </div>
        <div className="item-card-label">
          <img src={icon3} alt="Nothing" height={12} width={10} />
          <p className="item-card-date">Date Found: {dateFound}</p>
        </div>
        <div className="item-card-label">
          <img src={icon2} alt="Nothing" height={12} width={9} />
          <p className="item-card-found">Location Lost: {locationLost}</p>
        </div>
        <div className="btns">
          <button className="read-more-btn" onClick={onReadMore}>
            Read More
          </button>
          <button className="claim-btn" onClick={onReadMore}>
            Claim Item
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItemCard;
