import React from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';

function HomePage() {
  return (
    <>
      <HeroBanner title="EMU Lost & Found" />
      <main className="container">
        <p className="home-intro">
          Welcome to Eastern Mennonite University&apos;s Lost & Found. Report lost items or browse found items below.
        </p>
        <div className="home-actions">
          <Link to="/lost-items" className="btn-primary">Browse Lost Items</Link>
          <Link to="/lost-submit-form" className="btn-secondary">Report a Lost Item</Link>
        </div>
      </main>
    </>
  );
}

export default HomePage;
