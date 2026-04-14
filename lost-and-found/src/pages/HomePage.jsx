import React from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';

function HomePage() {
  return (
    <>
      <HeroBanner title="EMU Lost & Found" />
      <main className="container">
        <div className="home-card">
          <center>
            <p className="item-detail-content">Welcome to Eastern Mennonite University&apos;s Lost & Found!</p>
            <p className="item-detail-content" style={{ fontSize: '12px', paddingTop: '0px' }}>This tool will help you find lost items on campus</p>
          </center>
        </div>
        <div className="home-actions">
          <Link to="/lost-items" className="btn-primary">Browse Lost Items</Link>
          <Link to="/lost-submit-form" className="btn-secondary">Browse Found Items</Link>
          <Link to="/lost-submit-form" className="btn-tertiary">Report a Lost Item</Link>
        </div>
      </main>
    </>
  );
}

export default HomePage;
