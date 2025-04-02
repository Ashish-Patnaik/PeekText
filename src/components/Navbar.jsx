// src/components/Navbar.jsx
import React, { useState } from 'react';
import './../styles/Navbar.css'; // Import component-specific styles

// Inline SVGs or import them as components
const LogoIcon = () => (
  <img
      src="/logo.png"  
      alt="Your Company Logo"       
      className="icon logo-icon"     
  />
);

const HamburgerIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="icon menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
     </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
     setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="navbar-logo-container">
          <LogoIcon />
          <a href="#hero" className="navbar-brand" onClick={closeMobileMenu}>PeekText</a>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-menu-desktop">
          <a href="#hero" className="navbar-link">Home</a>
          <a href="#learn-more" className="navbar-link">How It Works</a>
          <a href="#gallery" className="navbar-link">Gallery</a>
          <a href="#upload" className="navbar-button-cta">Get Started</a>
        </div>

        {/* Mobile Menu Button */}
        <button className="navbar-mobile-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu" aria-expanded={isMobileMenuOpen}>
          {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>

        {/* Mobile Menu */}
        <div className={`navbar-menu-mobile ${isMobileMenuOpen ? 'open' : ''}`}>
           <div className="container navbar-mobile-links">
              {/* Add onClick={closeMobileMenu} to each link */}
              <a href="#hero" className="navbar-link-mobile" onClick={closeMobileMenu}>Home</a>
              <a href="#learn-more" className="navbar-link-mobile" onClick={closeMobileMenu}>How It Works</a>
              <a href="#gallery" className="navbar-link-mobile" onClick={closeMobileMenu}>Gallery</a>
              <a href="#upload" className="navbar-button-cta-mobile" onClick={closeMobileMenu}>Get Started</a>
           </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;