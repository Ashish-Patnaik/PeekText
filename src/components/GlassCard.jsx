import React from 'react';
import './../styles/utilities.css'; // Make sure glass-card styles are here

function GlassCard({ children, className = '', ...props }) {
  return (
    <div className={`glass-card ${className}`} {...props}>
      {children}
    </div>
  );
}
export default GlassCard;