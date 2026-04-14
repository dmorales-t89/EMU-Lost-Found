import React from 'react';
import { Link } from 'react-router-dom';
import campusImage from '../assets/campus-aerial.png';

function HeroBannerOptions({ OptionOne = "Lost Items", OptionTwo = "Found Items" }) {
  return (
    <section 
      className="hero-banner"
      style={{ backgroundImage: `url(${campusImage})` }}
    >
      <div className="hero-overlay">
        <div className="btns">
          <div>
            <Link to="/lost-items" className="hero-title">
              {OptionOne}
            </Link>
          </div>
          <div>
            <Link to="/lost-items" className="hero-title">
              {OptionTwo}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBannerOptions;
