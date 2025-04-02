import React, { useEffect, useState, useRef, useCallback } from 'react';
import WebFont from 'webfontloader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import UploadSection from './components/UploadSection';
import HowItWorks from './components/HowItWorks';
import Gallery from './components/Gallery';
import EditorSection from './components/EditorSection';
import Footer from './components/Footer';
import useSmoothScroll from './hooks/useSmoothScroll';

// Styles
import './styles/global.css';
import './styles/utilities.css';

function App() {
  const [editorData, setEditorData] = useState(null); // { originalBlob, processedBlob, file }
  const [uploadResetKey, setUploadResetKey] = useState(Date.now()); // State for reset key
  const editorAnchorRef = useRef(null);

  // Load Fonts
  useEffect(() => {
    WebFont.load({
      google: {
        families: [ /* ... font families ... */
            'Poppins:300,400,500,600,700', 'Montserrat:400,700', 'Roboto:100,300,400,500,700,900',
            'Open Sans:300,400,600,700,800', 'Lato:300,400,700,900', 'Oswald:400,700',
            'Raleway:300,400,500,600,700', 'Merriweather:300,400,700,900',
            'Playfair Display:400,700', 'Anton:400', 'Amatic SC:400,700'
        ]
      }
    });
  }, []);

  // Initialize smooth scrolling hook
  useSmoothScroll();

  // Handler receives blob data from UploadSection
  const handleImageProcessed = useCallback((data) => {
    console.log("APP: Received image blob data. Setting editorData.");
    setEditorData(data); // Set data (contains blobs)
    // Scroll to editor after state update
    setTimeout(() => {
      editorAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }, []);


  // Handler for "Start Over" from EditorSection
  const handleReset = useCallback(() => {
    console.log("APP: Reset triggered. Setting editorData to null and changing upload key.");
    setEditorData(null); // Unmounts EditorSection
    setUploadResetKey(Date.now()); // Change the key to force UploadSection remount

    // Scroll back to upload section
     requestAnimationFrame(() => { // Ensure DOM updates before scrolling
         const uploadSection = document.getElementById('upload');
         if (uploadSection) {
            uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
         } else {
             // Fallback scroll to top if section isn't rendered yet somehow
             window.scrollTo({ top: 0, behavior: 'smooth' });
         }
     });
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />

        {/* Render UploadSection conditionally AND use the key */}
        {/* When editorData is null, this section renders */}
        {/* When key changes, this section remounts */}
        {!editorData && (
          <UploadSection
            key={uploadResetKey} // Use the state variable as the key
            onImageProcessed={handleImageProcessed}
            // resetKey prop itself isn't needed inside UploadSection anymore
            // The remount is triggered by the key prop changing
          />
        )}

        <HowItWorks />
        <Gallery />

        {/* Editor Section - Renders when editorData is truthy */}
        <div ref={editorAnchorRef} id="editor-anchor" style={{scrollMarginTop: '80px'}}>
            {editorData && (
                <EditorSection
                    // Pass blobs down
                    originalImageBlob={editorData.originalBlob}
                    processedImageBlob={editorData.processedBlob}
                    originalFileName={editorData.file?.name}
                    onReset={handleReset} // Pass reset handler down
                />
            )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default App;