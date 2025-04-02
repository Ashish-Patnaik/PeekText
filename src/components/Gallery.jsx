import React from 'react';
import './../styles/Gallery.css';

function Gallery() {
  const images = [
    { id: 1, src: "/images p/PeekText_broken.png", alt: "Example 1" },
    { id: 2, src: "/images p/PeekText_colourfull.png", alt: "Example 2" },
    { id: 3, src: "/images p/PeekText_dreams.png", alt: "Example 3" },
    { id: 4, src: "/images p/PeekText_spring.png", alt: "Example 4" },
  ];

  return (
    <section id="gallery" className="gallery-section">
      <div className="container gallery-header">
        <h2 className="gallery-title">Gallery</h2>
        <p className="gallery-subtitle">Check out what others have created with PeekText</p>
      </div>
      <div className="container gallery-grid">
        {images.map(image => (
          <div key={image.id} className="gallery-item">
            <img src={image.src} alt={image.alt} className="gallery-image" loading="lazy" />
          </div>
        ))}
      </div>
      {/* <div className="text-center mt-12"></div> Optional button */}
    </section>
  );
}

export default Gallery;