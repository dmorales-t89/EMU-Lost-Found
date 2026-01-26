import React from 'react';
import campusImage from '../assets/campus-aerial.png';

function HeroBanner({ title = "Lost Items" }) {
  return (
    <section 
      className="hero-banner"
      style={{ backgroundImage: `url(${campusImage})` }}
    >
      <div className="hero-overlay">
        <h1 className="hero-title">{title}</h1>
      </div>
    </section>
  );
}

export default HeroBanner;
