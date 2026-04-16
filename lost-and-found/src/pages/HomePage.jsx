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
          <Link to="/lost-items" className="btn-secondary">Browse Found Items</Link>
          <Link to="/lost-submit-form" className="btn-tertiary">Report a Lost Item</Link>
        </div>
        <p>
          You can use our website to:
          <ul>
            <li>Browse posts of items people have lost or found</li>
            <li>Report items you have found or lost</li>
            <li>Connect with people through email to get items back to their owner</li>
          </ul>
        </p>
      </main>
    </>
  );
}

export default HomePage;
