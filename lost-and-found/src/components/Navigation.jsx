import React from 'react';
import { Link, NavLink } from 'react-router-dom';

// Main Navbar with EMU logo and Sign In button
function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img 
            src="https://emu.edu/_resources/images/emu-lettermark-logo-color-white.png" 
            alt="EMU Logo" 
            width="120" 
            height="35"
          />
        </Link>
      </div>
      <div className="navbar-actions">
        <Link to="/login" className="sign-in-btn">SIGN IN</Link>
      </div>
    </header>
  );
}

// Sub-navigation with page links
function SubNavbar() {
  return (
    <nav className="sub-navbar">
      <ul className="sub-nav-links">
        <li><NavLink to="/" end>HOME</NavLink></li>
        <li><NavLink to="/lost-items">LOST ITEMS</NavLink></li>
        <li><NavLink to="/lost-submit-form">LOST SUBMIT FORM</NavLink></li>
      </ul>
    </nav>
  );
}

// Combined Navigation component
function Navigation() {
  return (
    <>
      <Navbar />
      <SubNavbar />
    </>
  );
}

export default Navigation;
