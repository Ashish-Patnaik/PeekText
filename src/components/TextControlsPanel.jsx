import React from 'react';
import TextControl from './TextControl';
import Button from './Button';
import './../styles/EditorSection.css'; // Styles for panel are within EditorSection.css

// SVG Icon
const AddIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

function TextControlsPanel({ textLayers, onAddText, onUpdateText, onDeleteText }) {
  return (
    <div className="controls-panel glass-card"> {/* Use GlassCard */}
      <h3 className="controls-panel-heading">Text Controls</h3>

      <div className="controls-panel-body">
            <div className="controls-scroll-container">
                {textLayers.length === 0 ? (
                <div className="controls-placeholder">
                    Your text controls will appear here... Add a layer below!
                </div>
                ) : (
                textLayers.map((layer, index) => (
                    <TextControl
                        key={layer.id} // Use unique ID for key
                        layerData={{ ...layer, displayId: index + 1 }} // Pass data for one layer
                        onUpdate={onUpdateText}
                        onDelete={onDeleteText}
                    />
                ))
                )}
            </div>

            <Button
                variant="gradient"
                shine
                className="controls-add-button"
                onClick={onAddText}
                iconLeft={<AddIcon />}
            >
                Add Text Layer
            </Button>
      </div>
    </div>
  );
}

export default TextControlsPanel;