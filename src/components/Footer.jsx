import React from 'react';
import './../styles/Footer.css';

// SVG Icon

const FooterLogoIcon = () => (
  <img
      src="/logo.png"  
      alt="Your Company Logo"       
      className="icon logo-icon"     
  />
);

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <div className="footer-logo-container">
            <FooterLogoIcon />
            <span className="footer-brand-name">PeekText</span>
          </div>
          <p className="footer-tagline">Create stunning text-behind-image effects</p>
        </div>

        <div className="footer-links-container">
          <div className="footer-link-group">
            <h4 className="footer-link-heading">Navigation</h4>
            <ul className="footer-link-list">
              <li><a href="#hero">Home</a></li>
              <li><a href="#learn-more">How It Works</a></li>
              <li><a href="#gallery">Gallery</a></li>
              <li><a href="#upload">Create</a></li>
            </ul>
          </div>
          <div className="footer-link-group">
            <h4 className="footer-link-heading">Connect</h4>
            <ul className="footer-link-list">
              <li><a href="#" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">Twitter</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-link-group">
            <h4 className="footer-link-heading">Tools</h4>
            <ul className="footer-link-list">
              <li><a href="https://compress-quick.vercel.app/">CompressQuick</a></li>
              <li><a href="https://peek-text.vercel.app/">PeekText</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container footer-copyright-container">
        <p>© {new Date().getFullYear()} PeekText. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
