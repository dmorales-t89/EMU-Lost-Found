import React from 'react';

// Main Navbar with EMU logo and Sign In button
function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-logo">
        <img 
          src="https://emu.edu/_resources/images/emu-lettermark-logo-color-white.png" 
          alt="EMU Logo" 
          width="120" 
          height="35"
        />
      </div>
      <div className="navbar-actions">
        <a href="/login" className="sign-in-btn">SIGN IN</a>
      </div>
    </header>
  );
}

// Sub-navigation with page links
function SubNavbar() {
  return (
    <nav className="sub-navbar">
      <ul className="sub-nav-links">
        <li><a href="/">HOME</a></li>
        <li><a href="/lost-items">LOST ITEMS</a></li>
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
