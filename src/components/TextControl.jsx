import React, { useState, useEffect, useRef } from 'react';
import './../styles/TextControl.css';
import './../styles/utilities.css'; // For toggle switch

// SVGs for icons
const ChevronIcon = ({ collapsed }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`icon chevron-icon ${collapsed ? 'collapsed' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

// Available Fonts (Match with WebFontLoader)
const availableFonts = [ 'Poppins', 'Montserrat', 'Roboto', 'Open Sans', 'Lato', 'Oswald', 'Raleway', 'Merriweather', 'Playfair Display', 'Anton', 'Amatic SC' ];
const fontWeights = [
    { value: '300', label: 'Light' },
    { value: '400', label: 'Normal' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi-Bold' },
    { value: '700', label: 'Bold' },
    { value: '900', label: 'Black' },
];

const referenceWidth = 1200;
const referenceHeight = 900;


function TextControl({ layerData, onUpdate, onDelete }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const contentRef = useRef(null);

  // Local state for controlled inputs that need live feedback on display span
  const [sizeValue, setSizeValue] = useState(layerData.size);
  const [xOffsetValue, setXOffsetValue] = useState(layerData.xOffset);
  const [yOffsetValue, setYOffsetValue] = useState(layerData.yOffset);
  const [rotationValue, setRotationValue] = useState(layerData.rotation);
  const [opacityValue, setOpacityValue] = useState(layerData.opacity);
  const [shadowBlurValue, setShadowBlurValue] = useState(layerData.shadowBlur);
  const [shadowOffsetValue, setShadowOffsetValue] = useState(layerData.shadowOffset);


  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    const field = id.replace(layerData.id, ''); // Extract field name (e.g., 'textInput', 'fontSelect')
    let updateValue = type === 'checkbox' ? checked : value;

    // Handle specific input types
    if (field === 'textSize') { setSizeValue(value); updateValue = parseFloat(value);}
    else if (field === 'textXOffset') { setXOffsetValue(value); updateValue = parseFloat(value);}
    else if (field === 'textYOffset') { setYOffsetValue(value); updateValue = parseFloat(value);}
    else if (field === 'textRotation') { setRotationValue(value); updateValue = parseFloat(value);}
    else if (field === 'textOpacity') { setOpacityValue(value); updateValue = parseFloat(value);}
    else if (field === 'blur') updateValue = checked; // Checkbox
    else if (field === 'enableGradient') updateValue = checked; // Checkbox
    else if (field === 'enableShadow') updateValue = checked; // Checkbox
    else if (field === 'shadowBlur') { setShadowBlurValue(value); updateValue = parseFloat(value); }
    else if (field === 'shadowOffset') { setShadowOffsetValue(value); updateValue = parseFloat(value); }
    else if (type === 'color') { /* Value is already correct */ }
    else if (type === 'select-one') { /* Value is already correct */ }
    else if (type === 'text') { /* Value is already correct */ }

    // Map input field name to layerData property name
    let propertyName = '';
    switch(field) {
        case 'textInput': propertyName = 'text'; break;
        case 'fontSelect': propertyName = 'font'; break;
        case 'fontWeight': propertyName = 'weight'; break;
        case 'textSize': propertyName = 'size'; break;
        case 'textColor': propertyName = 'color'; break;
        case 'textXOffset': propertyName = 'xOffset'; break;
        case 'textYOffset': propertyName = 'yOffset'; break;
        case 'textRotation': propertyName = 'rotation'; break;
        case 'textOpacity': propertyName = 'opacity'; break;
        case 'blur': propertyName = 'blur'; break;
        case 'enableGradient': propertyName = 'enableGradient'; break;
        case 'gradientColor': propertyName = 'gradientColor'; break;
        case 'enableShadow': propertyName = 'enableShadow'; break;
        case 'shadowColor': propertyName = 'shadowColor'; break;
        case 'shadowBlur': propertyName = 'shadowBlur'; break;
        case 'shadowOffset': propertyName = 'shadowOffset'; break;
        default: console.warn("Unhandled control change:", field); return;
    }

    onUpdate(layerData.id, { [propertyName]: updateValue });
  };


  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="text-control animate-scaleIn">
      {/* Header */}
      <div className="text-control-header">
        <h4 className="text-control-title">Text Layer {layerData.displayId || layerData.id}</h4>
        <div className="text-control-actions">
          <button
            type="button"
            title={isCollapsed ? "Expand" : "Collapse"}
            onClick={toggleCollapse}
            className="text-control-button toggle"
            aria-expanded={!isCollapsed}
          >
            <ChevronIcon collapsed={isCollapsed} />
          </button>
          <button
            type="button"
            title="Delete Layer"
            onClick={() => onDelete(layerData.id)}
            className="text-control-button delete"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div ref={contentRef} className={`text-control-set ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Text Content */}
        <div>
          <label htmlFor={`textInput${layerData.id}`} className="control-label">Text Content</label>
          <input
            type="text"
            id={`textInput${layerData.id}`}
            value={layerData.text}
            onChange={handleChange}
            placeholder="Enter text"
            className="control-input"
          />
        </div>

        {/* Font Family & Weight */}
        <div className="control-grid-2">
          <div>
            <label htmlFor={`fontSelect${layerData.id}`} className="control-label">Font Family</label>
            <select
              id={`fontSelect${layerData.id}`}
              value={layerData.font}
              onChange={handleChange}
              className="control-select"
            >
              {availableFonts.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`fontWeight${layerData.id}`} className="control-label">Font Weight</label>
            <select
              id={`fontWeight${layerData.id}`}
              value={layerData.weight}
              onChange={handleChange}
              className="control-select"
            >
              {fontWeights.map(fw => (
                 <option key={fw.value} value={fw.value}>{fw.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Size & Color */}
        <div className="control-grid-2">
           <div>
             <label htmlFor={`textSize${layerData.id}`} className="control-label">Size</label>
             <input
               type="range"
               id={`textSize${layerData.id}`}
               min="10" max="350"
               value={sizeValue} // Use local state for display
               onChange={handleChange}
               className="control-range"
             />
             <span className="control-range-value">{parseFloat(sizeValue).toFixed(0)}px</span>
           </div>
           <div>
             <label htmlFor={`textColor${layerData.id}`} className="control-label">Color</label>
             <input
               type="color"
               id={`textColor${layerData.id}`}
               value={layerData.color}
               onChange={handleChange}
               className="control-color"
             />
           </div>
        </div>

        {/* Position */}
         <div className="control-grid-2">
             <div>
                 <label htmlFor={`textXOffset${layerData.id}`} className="control-label">X Offset</label>
                 <input
                     type="range"
                     id={`textXOffset${layerData.id}`}
                     min={-referenceWidth / 1.5} max={referenceWidth / 1.5} // Wider range
                     value={xOffsetValue}
                     onChange={handleChange}
                     className="control-range"
                  />
                 <span className="control-range-value">{parseFloat(xOffsetValue).toFixed(0)}px</span>
             </div>
             <div>
                 <label htmlFor={`textYOffset${layerData.id}`} className="control-label">Y Offset</label>
                 <input
                     type="range"
                     id={`textYOffset${layerData.id}`}
                     min={-referenceHeight / 1.5} max={referenceHeight / 1.5} // Wider range
                     value={yOffsetValue}
                     onChange={handleChange}
                     className="control-range"
                  />
                 <span className="control-range-value">{parseFloat(yOffsetValue).toFixed(0)}px</span>
             </div>
         </div>

        {/* Rotation & Opacity */}
         <div className="control-grid-2">
             <div>
                 <label htmlFor={`textRotation${layerData.id}`} className="control-label">Rotation</label>
                 <input
                     type="range"
                     id={`textRotation${layerData.id}`}
                     min="-45" max="45" step="1"
                     value={rotationValue}
                     onChange={handleChange}
                     className="control-range"
                  />
                 <span className="control-range-value">{parseFloat(rotationValue).toFixed(0)}°</span>
             </div>
             <div>
                 <label htmlFor={`textOpacity${layerData.id}`} className="control-label">Opacity</label>
                 <input
                     type="range"
                     id={`textOpacity${layerData.id}`}
                     min="0" max="1" step="0.05"
                     value={opacityValue}
                     onChange={handleChange}
                     className="control-range"
                  />
                 <span className="control-range-value">{parseFloat(opacityValue).toFixed(1)}</span>
             </div>
         </div>

        {/* --- Effects --- */}
        <div className="effects-divider">
            <h5 className="effects-heading">Effects</h5>

            {/* Blur Toggle */}
            <div className="effect-toggle-row">
                <span className="effect-toggle-label">Text Blur</span>
                <label className="toggle-switch">
                    <input
                        type="checkbox"
                        id={`blur${layerData.id}`}
                        checked={layerData.blur}
                        onChange={handleChange}
                        className="toggle-checkbox"
                    />
                    <span className="toggle-label">
                        <span className="toggle-dot"></span>
                    </span>
                </label>
            </div>

            {/* Gradient Toggle & Controls */}
            <div className="mb-3"> {/* Add margin like original */}
                <div className="effect-toggle-row">
                    <span className="effect-toggle-label">Color Gradient</span>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            id={`enableGradient${layerData.id}`}
                            checked={layerData.enableGradient}
                            onChange={handleChange}
                            className="toggle-checkbox"
                        />
                         <span className="toggle-label">
                            <span className="toggle-dot"></span>
                         </span>
                    </label>
                </div>
                <div className={`sub-controls ${!layerData.enableGradient ? 'hidden' : ''}`}>
                    <label htmlFor={`gradientColor${layerData.id}`} className="control-label control-label-xs">Gradient End Color</label>
                    <input
                        type="color"
                        id={`gradientColor${layerData.id}`}
                        value={layerData.gradientColor}
                        onChange={handleChange}
                        className="control-color"
                        disabled={!layerData.enableGradient}
                    />
                </div>
            </div>

            {/* Shadow Toggle & Controls */}
             <div>
                <div className="effect-toggle-row">
                    <span className="effect-toggle-label">Text Shadow</span>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            id={`enableShadow${layerData.id}`}
                            checked={layerData.enableShadow}
                            onChange={handleChange}
                            className="toggle-checkbox"
                         />
                        <span className="toggle-label">
                           <span className="toggle-dot"></span>
                        </span>
                    </label>
                </div>
                <div className={`sub-controls ${!layerData.enableShadow ? 'hidden' : ''}`}>
                    <div>
                        <label htmlFor={`shadowColor${layerData.id}`} className="control-label control-label-xs">Shadow Color</label>
                        <input
                            type="color"
                            id={`shadowColor${layerData.id}`}
                            value={layerData.shadowColor}
                            onChange={handleChange}
                            className="control-color"
                            disabled={!layerData.enableShadow}
                         />
                    </div>
                    <div className="control-grid-2">
                        <div>
                            <label htmlFor={`shadowBlur${layerData.id}`} className="control-label control-label-xs">Shadow Blur</label>
                            <input
                                type="range"
                                id={`shadowBlur${layerData.id}`}
                                min="0" max="50"
                                value={shadowBlurValue}
                                onChange={handleChange}
                                className="control-range"
                                disabled={!layerData.enableShadow}
                             />
                             <span className="control-range-value">{parseFloat(shadowBlurValue).toFixed(0)}px</span>
                        </div>
                        <div>
                            <label htmlFor={`shadowOffset${layerData.id}`} className="control-label control-label-xs">Shadow Offset</label>
                            <input
                                type="range"
                                id={`shadowOffset${layerData.id}`}
                                min="-25" max="25"
                                value={shadowOffsetValue}
                                onChange={handleChange}
                                className="control-range"
                                disabled={!layerData.enableShadow}
                             />
                             <span className="control-range-value">{parseFloat(shadowOffsetValue).toFixed(0)}px</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(TextControl); // Memoize as controls can be numerous