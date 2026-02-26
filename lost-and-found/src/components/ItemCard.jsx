import React from 'react';
import icon1 from '../assets/tag-icon.jpg';
import icon2 from '../assets/location-icon.jpg';
import icon3 from '../assets/date-icon.jpg';
import { ITEM_IMAGE_PLACEHOLDER } from '../lib/itemsApi';

function ItemCard({
  image,
  title,
  currentLocation,
  dateEvent,
  eventLocation,
  onReadMore,
}) {
  return (
    <div className="item-card">
      <div className="item-card-image">
        <img
          src={image || ITEM_IMAGE_PLACEHOLDER}
          alt={title}
          onError={(event) => {
            event.currentTarget.src = ITEM_IMAGE_PLACEHOLDER;
          }}
        />
      </div>
      <div className="item-card-content">
        <h3 className="item-card-title">{title}</h3>
        <div className="item-card-label">
          <img src={icon1} alt="Tag" height={12} width={12} />
          <p className="item-card-location">{currentLocation}</p>
        </div>
        <div className="item-card-label">
          <img src={icon3} alt="Date" height={12} width={10} />
          <p className="item-card-date">Date Found: {dateEvent}</p>
        </div>
        <div className="item-card-label">
          <img src={icon2} alt="Location" height={12} width={9} />
          <p className="item-card-found">Location Lost: {eventLocation}</p>
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
