import React from 'react';
import Button from './Button';
import GlassCard from './GlassCard';
import './../styles/Hero.css';
import './../styles/utilities.css'; // For floating, glass-card

function Hero() {
  return (
    <section id="hero" className="container hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          <span>Place Text</span>
          <span className="hero-title-highlight">Behind Your Images</span>
        </h1>
        <p className="hero-description">
          Upload your image, add custom text, and create stunning visuals with text appearing behind your subject. Easy and free!
        </p>
        <div className="hero-actions">
          <Button href="#upload" variant="primary" shine className="hero-button-primary">
             Try It Now
          </Button>
          {/* Link as a button */}
          <a href="#learn-more" className="button button-secondary hero-button-secondary" role="button">
            Learn More
          </a>
        </div>
      </div>

      <div className="hero-image-container">
        <div className="floating hero-image-wrapper">
          <GlassCard className="hero-image-card">
            <div className="hero-image-inner">
              <div className="hero-image-text-overlay">
                VIBES
              </div>
              <img
                src="/images p/PeekText_dream.png" // Path from public folder
                alt="Example portrait with text behind"
                className="hero-image"
              />
            </div>
            {/* Optional: <div className="mt-3 text-center"></div> */}
          </GlassCard>
        </div>
        <div className="hero-blob hero-blob-pink"></div>
        <div className="hero-blob hero-blob-purple"></div>
      </div>
    </section>
  );
}

export default Hero;