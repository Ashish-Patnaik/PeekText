import React, { useRef, useEffect, useState, useCallback } from 'react';
import Button from './Button';
import Loader from './Loader';
import './../styles/EditorSection.css'; // Contains styles for canvas-area, canvas-wrapper, #editorCanvas

// --- Constants ---
const REFERENCE_WIDTH = 1200;
const REFERENCE_HEIGHT = 900;
const ASPECT_RATIO = REFERENCE_WIDTH / REFERENCE_HEIGHT;

// --- Helper Functions ---
function getMousePos(canvas, evt) {
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // Handle potential zero dimensions for rect
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
    };
}

function getTextAABB(ctx, text, font, fontWeight, size, rotation, translateX, translateY) {
    if (!ctx || !text) return { left: 0, right: 0, top: 0, bottom: 0 };
    try {
        ctx.save();
        ctx.font = `${fontWeight} ${size}px "${font}"`;
        const metrics = ctx.measureText(text);
        ctx.restore();

        const textHeight = size * 1.2; // Approximation
        const textWidth = metrics.width;
        const halfW = textWidth / 2;
        const halfH = textHeight / 2;

        const corners = [ { x: -halfW, y: -halfH }, { x: halfW, y: -halfH }, { x: halfW, y: halfH }, { x: -halfW, y: halfH } ];
        const rad = rotation * Math.PI / 180; const cos = Math.cos(rad); const sin = Math.sin(rad);

        const transformedCorners = corners.map(corner => ({
            x: (corner.x * cos - corner.y * sin) + translateX,
            y: (corner.x * sin + corner.y * cos) + translateY
        }));

        return {
            left: Math.min(...transformedCorners.map(c => c.x)), right: Math.max(...transformedCorners.map(c => c.x)),
            top: Math.min(...transformedCorners.map(c => c.y)), bottom: Math.max(...transformedCorners.map(c => c.y))
        };
    } catch (e) {
        console.error("Error in getTextAABB:", e);
        return { left: 0, right: 0, top: 0, bottom: 0 };
    }
}

// SVGs for Buttons
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const ResetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0015.357 2M9 15h4.581" /></svg>;

// Accept blob props
function CanvasPreview({ originalImageBlob, processedImageBlob, textLayers, onUpdateText, onReset, originalFileName }) {
    const canvasRef = useRef(null);
    const bgImageRef = useRef(null);
    const subjectImageRef = useRef(null);
    const canvasWrapperRef = useRef(null); // Use ref for the immediate wrapper for size calc

    const [bgLoadSuccess, setBgLoadSuccess] = useState(false);
    const [subjectLoadSuccess, setSubjectLoadSuccess] = useState(false);
    const [loadError, setLoadError] = useState(null);

    // Dragging state refs
    const isDraggingRef = useRef(false);
    const draggingTextIdRef = useRef(null);
    const dragStartPosRef = useRef({ x: 0, y: 0 });
    const dragStartOffsetRef = useRef({ x: 0, y: 0 });
    const textBoundingBoxesRef = useRef([]);
    const [hoveringTextId, setHoveringTextId] = useState(null);

    // --- Image Loading Effect (using Blobs) ---
    useEffect(() => {
        console.log("CANVAS: Image loading effect START");
        setBgLoadSuccess(false); setSubjectLoadSuccess(false); setLoadError(null);
        bgImageRef.current = new Image(); subjectImageRef.current = new Image();

        let currentOriginalUrl = null; let currentProcessedUrl = null;
        let proceedLoading = true;

        if (!(originalImageBlob instanceof Blob) || originalImageBlob.size === 0) {
             console.error("CANVAS: Invalid originalImageBlob."); setLoadError("Invalid original image data."); proceedLoading = false;
        }
        if (!(processedImageBlob instanceof Blob) || processedImageBlob.size === 0) {
             console.error("CANVAS: Invalid processedImageBlob."); setLoadError("Invalid processed image data."); proceedLoading = false;
        }

        if (proceedLoading) {
            try {
                currentOriginalUrl = URL.createObjectURL(originalImageBlob);
                currentProcessedUrl = URL.createObjectURL(processedImageBlob);
                console.log("CANVAS: Created Blob URLs:", { original: currentOriginalUrl, processed: currentProcessedUrl });
            } catch (urlError) {
                console.error("CANVAS: Error creating Blob URLs:", urlError); setLoadError("Could not create image URLs."); proceedLoading = false;
            }
        }

        if (proceedLoading && currentOriginalUrl && currentProcessedUrl) {
            const handleLoad = (isBg) => () => {
                if (isBg) setBgLoadSuccess(true); else setSubjectLoadSuccess(true);
                console.log(`CANVAS: ${isBg ? 'Background' : 'Subject'} loaded OK.`);
            };
            const handleError = (isBg) => (e) => {
                 const type = isBg ? 'Background' : 'Subject';
                 console.error(`CANVAS: ${type} load failed.`, e);
                 setLoadError(`Failed loading ${type.toLowerCase()} image.`);
            };

            bgImageRef.current.onload = handleLoad(true); bgImageRef.current.onerror = handleError(true);
            subjectImageRef.current.onload = handleLoad(false); subjectImageRef.current.onerror = handleError(false);

            console.log("CANVAS: Setting image sources...");
            bgImageRef.current.src = currentOriginalUrl;
            subjectImageRef.current.src = currentProcessedUrl;
        } else {
             console.log("CANVAS: Image loading skipped.");
        }

        // --- Cleanup: Revoke URLs ---
        return () => {
            console.log("CANVAS: Cleaning up image effect. Revoking URLs:", currentOriginalUrl, currentProcessedUrl);
            if (bgImageRef.current) { bgImageRef.current.onload = null; bgImageRef.current.onerror = null; bgImageRef.current.src = '';}
            if (subjectImageRef.current) { subjectImageRef.current.onload = null; subjectImageRef.current.onerror = null; subjectImageRef.current.src = '';}
            if (currentOriginalUrl) URL.revokeObjectURL(currentOriginalUrl);
            if (currentProcessedUrl) URL.revokeObjectURL(currentProcessedUrl);
        };
    }, [originalImageBlob, processedImageBlob]);

    const imagesAreReady = bgLoadSuccess && subjectLoadSuccess;

    // --- Canvas Drawing Logic ---
    const drawCanvas = useCallback(() => {
        // console.log("drawCanvas called. imagesAreReady:", imagesAreReady); // Debug draw calls
        const canvas = canvasRef.current;
        const bgImage = bgImageRef.current;
        const subjectImage = subjectImageRef.current;

        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!imagesAreReady || !bgImage?.complete || !subjectImage?.complete || bgImage.naturalWidth === 0 || subjectImage.naturalWidth === 0) {
            return; // Don't draw if not ready
        }

        // Calculate drawing dimensions (letterbox/pillarbox within logical size)
        const bgAspect = bgImage.naturalWidth / bgImage.naturalHeight;
        const canvasAspect = canvas.width / canvas.height; // Should match ASPECT_RATIO
        let drawWidth, drawHeight, drawX, drawY;
        if (bgAspect > canvasAspect) { // Image wider than canvas aspect
            drawWidth = canvas.width; drawHeight = drawWidth / bgAspect; drawX = 0; drawY = (canvas.height - drawHeight) / 2;
        } else { // Image taller or same aspect
            drawHeight = canvas.height; drawWidth = drawHeight * bgAspect; drawY = 0; drawX = (canvas.width - drawWidth) / 2;
        }

        try {
            // Draw Background
            ctx.drawImage(bgImage, drawX, drawY, drawWidth, drawHeight);

            // Draw Text Layers
            const currentBoundingBoxes = [];
            textLayers.forEach(layer => {
                if (!layer) return;
                ctx.save();
                const translateX = canvas.width / 2 + layer.xOffset;
                const translateY = canvas.height / 2 + layer.yOffset;
                ctx.translate(translateX, translateY);
                ctx.rotate(layer.rotation * Math.PI / 180);

                ctx.globalAlpha = layer.opacity;
                ctx.font = `${layer.weight} ${layer.size}px "${layer.font}"`;
                ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.filter = layer.blur ? `blur(2px)` : 'none';

                // Shadow
                if (layer.enableShadow) {
                    ctx.shadowColor = layer.shadowColor; ctx.shadowBlur = layer.shadowBlur;
                    ctx.shadowOffsetX = layer.shadowOffset; ctx.shadowOffsetY = layer.shadowOffset;
                } else {
                    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
                }
                // Fill Style
                if (layer.enableGradient) {
                    const metrics = ctx.measureText(layer.text);
                    const gradWidth = Math.max(metrics.width, 1);
                    const gradient = ctx.createLinearGradient(-gradWidth / 2, 0, gradWidth / 2, 0);
                    gradient.addColorStop(0, layer.color); gradient.addColorStop(1, layer.gradientColor);
                    ctx.fillStyle = gradient;
                } else {
                    ctx.fillStyle = layer.color;
                }

                // AABB Calculation (using current transforms relative to canvas)
                const aabb = getTextAABB(ctx, layer.text, layer.font, layer.weight, layer.size, layer.rotation, translateX, translateY);
                currentBoundingBoxes.push({ id: layer.id, aabb });

                // Draw Text at (0,0) relative to transformed context
                ctx.fillText(layer.text, 0, 0);
                ctx.restore();
            });
            textBoundingBoxesRef.current = currentBoundingBoxes;

            // Draw Subject (Foreground)
            ctx.drawImage(subjectImage, drawX, drawY, drawWidth, drawHeight);

        } catch (drawError) {
            console.error("CANVAS: Error during drawing:", drawError);
            // Avoid setting state here if it causes infinite loops, just log
            // setLoadError(`Drawing error: ${drawError.message}`);
        }

    }, [imagesAreReady, textLayers]); // Dependency: redraw when images ready or text changes


    // --- Resize Logic (Refined) ---
    const resizeCanvas = useCallback(() => {
        // console.log("resizeCanvas called"); // Debug resize calls
        const canvas = canvasRef.current;
        // Use the immediate parent (.canvas-wrapper) for sizing reference
        const wrapper = canvasWrapperRef.current;
        if (!canvas || !wrapper) {
             console.warn("resizeCanvas: Missing canvas or wrapper ref.");
             return;
        }

        // Set logical drawing size (fixed) - DO THIS FIRST
        canvas.width = REFERENCE_WIDTH;
        canvas.height = REFERENCE_HEIGHT;

        // Calculate available width inside the wrapper (respecting padding if any)
        const wrapperStyle = window.getComputedStyle(wrapper);
        const paddingX = parseFloat(wrapperStyle.paddingLeft) + parseFloat(wrapperStyle.paddingRight);
        // Use clientWidth which excludes scrollbars, includes padding
        const availableWidth = wrapper.clientWidth - paddingX;

        if (availableWidth <= 0) {
             console.warn("resizeCanvas: Available width is zero or negative.");
             return; // Avoid calculation with invalid width
        }

        // Determine display size based primarily on width and aspect ratio
        let displayWidth = availableWidth;
        let displayHeight = displayWidth / ASPECT_RATIO;

        // --- Optional Height Constraint Check ---
        // Uncomment this section if you strictly need to fit within vertical space
        // const container = canvas?.closest('.canvas-area'); // Find the outer container
        // if (container) {
        //     const containerStyle = window.getComputedStyle(container);
        //     const paddingY = parseFloat(containerStyle.paddingTop) + parseFloat(containerStyle.paddingBottom);
        //     const buttonsHeight = container.querySelector('.canvas-actions')?.offsetHeight || 60;
        //     const availableHeight = container.clientHeight - paddingY - buttonsHeight;
        //     const safeAvailableHeight = Math.max(availableHeight, 100); // Min height
        //     if (displayHeight > safeAvailableHeight) {
        //         // If calculated height is too much, recalculate based on height constraint
        //         console.log("resizeCanvas: Height constrained. Recalculating based on height.");
        //         displayHeight = safeAvailableHeight;
        //         displayWidth = displayHeight * ASPECT_RATIO;
        //     }
        // }
        // --- End Optional Height Constraint Check ---


        // Apply calculated display size (never exceed logical size visually)
        canvas.style.width = `${Math.floor(Math.min(displayWidth, REFERENCE_WIDTH))}px`;
        canvas.style.height = `${Math.floor(Math.min(displayHeight, REFERENCE_HEIGHT))}px`;

        // console.log(`resizeCanvas: Set style to ${canvas.style.width} x ${canvas.style.height}`); // Debug sizes

        // Schedule drawing for the next frame
        requestAnimationFrame(drawCanvas);

    }, [drawCanvas]); // drawCanvas is the dependency here


    // --- Effect for Resize Listener Setup ---
    useEffect(() => {
        // We need resizeCanvas to run whenever the component might resize,
        // but only attach the window listener once images are ready for initial size.
        // Subsequent draws due to text changes will use the size set by the last resize.
        if (imagesAreReady) {
             console.log("CANVAS: Images ready. Performing initial resize and attaching listener.");
             const resizeTimeout = setTimeout(resizeCanvas, 50); // Initial resize after short delay
             window.addEventListener('resize', resizeCanvas);
             return () => {
                 clearTimeout(resizeTimeout);
                 window.removeEventListener('resize', resizeCanvas);
                 console.log("CANVAS: Resize listener removed.");
             };
        } else {
             // If images aren't ready, maybe still call resize once?
             // Or rely on the initial state before images load?
             // Let's call it once initially regardless, to set a default size.
             // But only attach the window listener when images are ready.
              const initialResizeTimeout = setTimeout(resizeCanvas, 50);
               return () => clearTimeout(initialResizeTimeout);
        }
    }, [imagesAreReady, resizeCanvas]); // Depend on imagesAreReady and the resize function itself

    // --- Effect to redraw when textLayers change ---
    useEffect(() => {
        // Only redraw if images are actually ready
        if (imagesAreReady) {
             // console.log("CANVAS: textLayers changed, scheduling redraw."); // Debug text changes
            requestAnimationFrame(drawCanvas);
        }
    }, [textLayers, imagesAreReady, drawCanvas]); // Add drawCanvas dependency


    // --- Dragging Logic (handleMouseDown, handleMouseMove, handleMouseUpOrLeave) ---
    // (Keep the versions from the previous correct answer - no changes needed here)
     const handleMouseDown = useCallback((e) => {
        if (!imagesAreReady) return;
        const canvas = canvasRef.current; if (!canvas) return;
        const mousePos = getMousePos(canvas, e);
        let foundTextId = null;
        for (let i = textBoundingBoxesRef.current.length - 1; i >= 0; i--) {
            const { id, aabb } = textBoundingBoxesRef.current[i];
            if (mousePos.x >= aabb.left && mousePos.x <= aabb.right && mousePos.y >= aabb.top && mousePos.y <= aabb.bottom) {
                foundTextId = id; break;
            }
        }
        if (foundTextId !== null) {
            const layer = textLayers.find(l => l.id === foundTextId);
            if (layer) {
                isDraggingRef.current = true; draggingTextIdRef.current = foundTextId;
                dragStartPosRef.current = mousePos; dragStartOffsetRef.current = { x: layer.xOffset, y: layer.yOffset };
                canvas.classList.add('dragging'); canvas.classList.remove('hovering');
                // console.log("CANVAS: Start dragging layer", foundTextId);
            }
        }
    }, [textLayers, imagesAreReady]);

    const handleMouseMove = useCallback((e) => {
        if (!imagesAreReady) return;
        const canvas = canvasRef.current; if (!canvas) return;
        const mousePos = getMousePos(canvas, e);

        if (isDraggingRef.current && draggingTextIdRef.current !== null) {
            const dx = mousePos.x - dragStartPosRef.current.x;
            const dy = mousePos.y - dragStartPosRef.current.y;
            onUpdateText(draggingTextIdRef.current, {
                xOffset: dragStartOffsetRef.current.x + dx,
                yOffset: dragStartOffsetRef.current.y + dy
            });
        } else { // Check hover
            let foundHoverId = null;
            for (let i = textBoundingBoxesRef.current.length - 1; i >= 0; i--) {
                const { id, aabb } = textBoundingBoxesRef.current[i];
                 if (mousePos.x >= aabb.left && mousePos.x <= aabb.right && mousePos.y >= aabb.top && mousePos.y <= aabb.bottom) {
                    foundHoverId = id; break;
                }
            }
            if (foundHoverId !== hoveringTextId) {
                setHoveringTextId(foundHoverId);
            }
        }
    }, [onUpdateText, imagesAreReady, hoveringTextId]);

    const handleMouseUpOrLeave = useCallback(() => {
        if (isDraggingRef.current) {
            // console.log("CANVAS: End dragging layer", draggingTextIdRef.current);
            isDraggingRef.current = false; draggingTextIdRef.current = null;
            const canvas = canvasRef.current;
            if(canvas) canvas.classList.remove('dragging');
        }
    }, []);


    // Effect for Drag Listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        // Attach listeners only when canvas exists and images are ready
        if (!canvas || !imagesAreReady) return;

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUpOrLeave);
        canvas.addEventListener('mouseleave', handleMouseUpOrLeave);
        console.log("CANVAS: Drag listeners added.");
        return () => {
            if (canvas) { // Check canvas exists on cleanup
                canvas.removeEventListener('mousedown', handleMouseDown);
                canvas.removeEventListener('mousemove', handleMouseMove);
                canvas.removeEventListener('mouseup', handleMouseUpOrLeave);
                canvas.removeEventListener('mouseleave', handleMouseUpOrLeave);
                console.log("CANVAS: Drag listeners removed.");
            }
        };
    }, [handleMouseDown, handleMouseMove, handleMouseUpOrLeave, imagesAreReady]); // Need imagesAreReady here


    // Effect for cursor style
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        if (isDraggingRef.current) {
            canvas.classList.add('dragging'); canvas.classList.remove('hovering');
        } else if (hoveringTextId !== null) {
            canvas.classList.add('hovering'); canvas.classList.remove('dragging');
        } else {
            canvas.classList.remove('hovering'); canvas.classList.remove('dragging');
        }
    }, [hoveringTextId]);


    // --- Save Canvas Function ---
    const saveCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || !imagesAreReady) { alert("Canvas is not ready to save."); return; }
        console.log("CANVAS: Save requested.");
        // Use rAF to ensure drawing is complete before getting data URL
        requestAnimationFrame(() => {
            // Explicitly redraw before saving to ensure latest state
            drawCanvas();
            // Add another rAF to ensure the redraw has flushed
            requestAnimationFrame(() => {
                const link = document.createElement('a');
                let filenamePrefix = 'peektext_output';
                // Simplified filename generation
                if (originalFileName) {
                    const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;
                    filenamePrefix = `PeekText_${baseName.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
                } else if (textLayers.length > 0 && textLayers[0].text) {
                    const safeText = textLayers[0].text.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    if (safeText) filenamePrefix = `PeekText_${safeText}`;
                }

                link.download = `${filenamePrefix}.png`;
                try {
                    const dataUrl = canvas.toDataURL('image/png', 1.0);
                    if (!dataUrl || dataUrl === 'data:,') { throw new Error("Canvas generated empty image data."); }
                    link.href = dataUrl;
                    link.click();
                    console.log("CANVAS: Image download triggered.");
                } catch (e) {
                    console.error("CANVAS: Error saving canvas:", e);
                    alert(`Could not save image: ${e.message}`);
                }
            });
        });
    };

    // --- Render Logic ---
    return (
        <div className="canvas-area glass-card">
             <h3 className="canvas-area-heading">Preview</h3>
             {/* Use the wrapper ref here */}
             <div ref={canvasWrapperRef} className="canvas-wrapper">
                {/* Conditional Rendering */}
                {!originalImageBlob || !processedImageBlob ? (
                    <p style={{color: 'rgba(255,255,255,0.7)'}}>Waiting for images...</p>
                ) : loadError ? (
                     <p style={{ color: '#fecaca', padding: '1rem', textAlign: 'center', wordBreak: 'break-word' }}>Error: {loadError}</p>
                ) : !imagesAreReady ? (
                     <div style={{textAlign: 'center', color: 'rgba(255,255,255,0.7)'}}>
                         <Loader />
                         <p style={{marginTop: '0.5rem'}}>Loading preview...</p>
                     </div>
                ) : (
                     <canvas id="editorCanvas" ref={canvasRef} />
                )}
             </div>
             {/* Canvas Actions */}
             <div className="canvas-actions">
                <Button onClick={saveCanvas} disabled={!imagesAreReady || !!loadError} className="canvas-button canvas-save-button" shine iconLeft={<SaveIcon />}>
                    Save Image
                </Button>
                <Button onClick={onReset} className="canvas-button canvas-reset-button" iconLeft={<ResetIcon />}>
                    Start Over
                </Button>
             </div>
        </div>
    );
}

export default CanvasPreview;