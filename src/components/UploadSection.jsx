import React, { useState, useRef, useCallback, useEffect } from 'react';
import Loader from './Loader';
import Button from './Button';
import GlassCard from './GlassCard';
import './../styles/UploadSection.css';
import './../styles/utilities.css';

// SVG Icon
const UploadIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
     </svg>
);

// Add resetKey prop
function UploadSection({ onImageProcessed, resetKey }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("Select your image file");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState("Processing your image...");
  const fileInputRef = useRef(null);

  // --- Effect to log mount/reset ---
  useEffect(() => {
    console.log(`UPLOAD: Component mounted/reset (key: ${resetKey}). Initializing state.`);
    // Internal state is automatically reset on remount due to key change.
    // No need to manually set state here.
  }, [resetKey]); // Depend on the key

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPG, PNG, WEBP).');
        if (fileInputRef.current) fileInputRef.current.value = ''; // Clear visual input on error
        setSelectedFile(null); setFileName("Select your image file"); // Reset state
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB Limit
        alert('File size exceeds 10MB limit.');
         if (fileInputRef.current) fileInputRef.current.value = ''; // Clear visual input on error
         setSelectedFile(null); setFileName("Select your image file"); // Reset state
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
      console.log("UPLOAD: File selected:", file.name, file.type, file.size);
    } else {
      // If user cancels file selection
      setSelectedFile(null);
      setFileName("Select your image file");
    }
  };

  // Only used now for explicit resets like validation failure
  const resetInputVisuals = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSelectedFile(null);
    setFileName("Select your image file");
    console.log("UPLOAD: Input visuals reset (e.g., on validation failure)");
  };


  const handleProcessClick = useCallback(async () => {
    if (!selectedFile) {
      alert("Please select an image file first.");
      return;
    }
    console.log("UPLOAD: Processing started for:", selectedFile.name);
    setIsLoading(true);
    setLoadingProgress('Preparing image...');

    let success = false;
    let finalProcessedBlob = null;

    try {
      console.log("UPLOAD: Dynamically importing removeBackground...");
      const { removeBackground } = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.8/+esm');
      console.log("UPLOAD: removeBackground imported.");

      const config = {
        progress: (key, current, total) => {
          const progressPercentage = Math.round((current / total) * 100);
          let stage = "Processing";
          if (key.includes("fetch")) stage = "Downloading Model";
          else if (key.includes("init")) stage = "Initializing";
          setLoadingProgress(`${stage}... (${progressPercentage}%)`);
        },
      };

      setLoadingProgress('Removing background...');
      console.time("backgroundRemoval");
      const processedBlobResult = await removeBackground(selectedFile, config);
      console.timeEnd("backgroundRemoval");
      console.log("UPLOAD: Background removal complete. Result Blob:", processedBlobResult);

      if (!processedBlobResult || !(processedBlobResult instanceof Blob) || processedBlobResult.size === 0) {
          throw new Error("Background removal result was invalid or empty.");
      }

      finalProcessedBlob = processedBlobResult.type.startsWith('image/')
          ? processedBlobResult
          : new Blob([processedBlobResult], { type: 'image/png' });
      console.log("UPLOAD: Final Processed Blob:", finalProcessedBlob);

      setLoadingProgress('Finalizing...'); // Keep message consistent
      console.log("UPLOAD: Passing Blobs up to App.");
      onImageProcessed({
          originalBlob: selectedFile,
          processedBlob: finalProcessedBlob,
          file: selectedFile
      });
      success = true;
      // Let App.jsx handle hiding this component by changing editorData state

    } catch (error) {
      console.error('UPLOAD: Image processing failed:', error);
      alert(`Failed to process image: ${error.message || 'Unknown error'}.`);
      setIsLoading(false); // Stop loading ONLY on error
      // Keep selected file so user doesn't have to re-select immediately
    } finally {
      console.log("UPLOAD: handleProcessClick finally block. Success:", success);
      if (!success) {
          setIsLoading(false); // Ensure loading stops if error occurred before catch maybe
      }
    }
  }, [selectedFile, onImageProcessed]);

  // --- Render Logic ---
  // Component is only rendered by App when !editorData, no need for isEditorActive prop check
   console.log(`UPLOAD: Rendering UI (key: ${resetKey}). isLoading: ${isLoading}`);
  return (
    <section id="upload" className="upload-section">
      <div className="container upload-container">
        <GlassCard className="upload-card">
          <h2 className="upload-title">Create Your PeekText</h2>
          {isLoading ? (
            <div className="upload-loading-area">
              <Loader />
              <p className="upload-progress-text">{loadingProgress}</p>
              <p className="upload-progress-hint">
                This might take a few seconds...
              </p>
            </div>
          ) : (
            <div className="upload-input-area">
              <div className="upload-dropzone">
                <input type="file" accept="image/jpeg,image/png,image/webp" id="imageUploadInput" className="upload-input" ref={fileInputRef} onChange={handleFileChange} aria-labelledby="upload-heading"/>
                <label htmlFor="imageUploadInput" className="upload-label">
                  <UploadIcon />
                  <h3 id="upload-heading" className="upload-heading">Drag & Drop or Click</h3>
                  <p className={`upload-file-name ${selectedFile ? 'selected' : ''}`}>{fileName}</p>
                  <p className="upload-hint">Supports JPG, PNG, WEBP (Max 10MB)</p>
                </label>
              </div>
            </div>
          )}
          <div className="upload-action-button">
            <Button variant="gradient" shine className="upload-start-button" onClick={handleProcessClick} disabled={!selectedFile || isLoading}>Start Editing</Button>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

export default UploadSection;