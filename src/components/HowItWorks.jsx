import React from 'react';
import GlassCard from './GlassCard';
import './../styles/HowItWorks.css';

function HowItWorks() {
  const steps = [
    { id: 1, title: "Upload Image", description: "Choose your photo. Our AI automatically removes the background.", iconBg: "step-1" },
    { id: 2, title: "Add Text", description: "Customize text with fonts, colors, size, effects & position it.", iconBg: "step-2" },
    { id: 3, title: "Download", description: "Instantly save your high-quality creation and share it anywhere.", iconBg: "step-3" },
  ];

  return (
    <section id="learn-more" className="how-it-works-section">
      <div className="container how-it-works-header">
        <h2 className="how-it-works-title">How It Works</h2>
        <p className="how-it-works-subtitle">Create stunning visuals in three simple steps:</p>
      </div>
      <div className="container how-it-works-grid">
        {steps.map(step => (
          <GlassCard key={step.id} className="how-it-works-step">
            <div className={`step-icon-wrapper ${step.iconBg}`}>
              <span className="step-number">{step.id}</span>
            </div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-description">{step.description}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;