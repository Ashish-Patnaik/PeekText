import React, { useState, useEffect, useCallback } from 'react';
import CanvasPreview from './CanvasPreview';
import TextControlsPanel from './TextControlsPanel';
import './../styles/EditorSection.css';

// Default properties for a new text layer
const defaultLayerProps = {
    text: 'Your Text', font: 'Poppins', weight: '700', size: 100, color: '#FFFFFF',
    xOffset: 0, yOffset: 0, rotation: 0, opacity: 1, blur: false,
    enableGradient: false, gradientColor: '#EC4899', enableShadow: false,
    shadowColor: '#000000', shadowBlur: 5, shadowOffset: 5,
};

// Accept blob props
function EditorSection({ originalImageBlob, processedImageBlob, onReset, originalFileName }) {
  const [textLayers, setTextLayers] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

   // Add initial layer and set visibility
   useEffect(() => {
      console.log("EDITOR: Mounting. Initializing layers.");
      // Ensure initial layer is added only once using functional update
      setTextLayers(prev => {
          if (prev.length === 0) {
               console.log("EDITOR: Adding initial layer.");
               // Use a more reliable unique ID if possible (timestamp + random for demo)
               return [{ ...defaultLayerProps, id: Date.now() + Math.random() }];
          }
          return prev; // Keep existing if any (e.g., HMR)
      });
      // Set visibility for animation after mount
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
   }, []); // Run only once on mount

   // Function to add a new text layer
   const addTextLayer = useCallback(() => {
      setTextLayers(prevLayers => {
          const nextId = Date.now() + Math.random(); // Unique ID strategy
          const newLayer = { ...defaultLayerProps, id: nextId, text: `Your Text ${prevLayers.length + 1}` };
          console.log("EDITOR: Adding text layer:", newLayer.id);
          return [...prevLayers, newLayer];
      });
   }, []);

   // Function to update a specific text layer property
   const updateTextLayer = useCallback((id, updates) => {
      // console.log("EDITOR: Updating layer:", id, updates); // Log if needed
      setTextLayers(prevLayers =>
          prevLayers.map(layer =>
              layer.id === id ? { ...layer, ...updates } : layer
          )
      );
   }, []);

   // Function to delete a text layer
   const deleteTextLayer = useCallback((id) => {
      console.log("EDITOR: Deleting layer:", id);
      setTextLayers(prevLayers => prevLayers.filter(layer => layer.id !== id));
   }, []);

   // Reset handler passed down from App
   const handleResetClick = () => {
       console.log("EDITOR: Reset button clicked, calling onReset.");
       onReset(); // Call parent reset (triggers unmount and key change)
   };


   // --- NO URL Revocation useEffect needed here ---


   useEffect(() => {
       // Log mount/prop changes for debugging if needed
       console.log("EDITOR: Component mounted or blob props updated.");
       return () => console.log("EDITOR: Unmounting.");
   }, [originalImageBlob, processedImageBlob]);


  // Render null if not yet visible for animation
  if (!isVisible) {
    return null;
  }

  console.log("EDITOR: Rendering UI.");
  return (
    <section id="editor-section" className={`editor-section animate-fadeIn`}>
      <div className="container editor-container">
        <h2 className="editor-main-heading">Customize Your Image</h2>
        <div className="editor-layout">
          {/* Pass blobs to CanvasPreview */}
          <CanvasPreview
            originalImageBlob={originalImageBlob}
            processedImageBlob={processedImageBlob}
            textLayers={textLayers}
            onUpdateText={updateTextLayer}
            onReset={handleResetClick} // Use the local handler that calls the prop
            originalFileName={originalFileName}
          />
          {/* Text Controls Panel */}
          <TextControlsPanel
            textLayers={textLayers}
            onAddText={addTextLayer}
            onUpdateText={updateTextLayer}
            onDeleteText={deleteTextLayer}
          />
        </div>
      </div>
    </section>
  );
}

export default EditorSection;