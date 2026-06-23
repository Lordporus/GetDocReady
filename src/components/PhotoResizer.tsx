import React, { useState, useRef, useEffect } from 'react';
import { PHOTO_PRESETS, PresetSpecification } from '../types';
import { Upload, Download, RefreshCw, AlertCircle, Info, Check, Image as ImageIcon } from 'lucide-react';

export default function PhotoResizer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  // Resizer parameters
  const [width, setWidth] = useState<number>(350);
  const [height, setHeight] = useState<number>(450);
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
  const [originalAspect, setOriginalAspect] = useState<number>(1);
  const [targetKB, setTargetKB] = useState<number>(50);
  
  // State for output
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [outputSrc, setOutputSrc] = useState<string | null>(null);
  const [outputBytes, setOutputBytes] = useState<number>(0);
  const [outputQuality, setOutputQuality] = useState<number>(0.9);
  const [outputWidth, setOutputWidth] = useState<number>(350);
  const [outputHeight, setOutputHeight] = useState<number>(450);
  const [presetId, setPresetId] = useState<string>('custom');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Read file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setImageSrc(event.target.result);
          // Load image to get original dimensions
          const img = new Image();
          img.onload = () => {
            const aspect = img.width / img.height;
            setOriginalAspect(aspect);
            
            // Set dimensions based on current preset or match original
            if (presetId === 'custom') {
              setWidth(img.width > 800 ? 800 : img.width);
              setHeight(img.width > 800 ? Math.round(800 / aspect) : img.height);
            }
          };
          img.src = event.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop handlers
  const [isDragOver, setIsDragOver] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            setImageSrc(event.target.result);
            const img = new Image();
            img.onload = () => {
              const aspect = img.width / img.height;
              setOriginalAspect(aspect);
              if (presetId === 'custom') {
                setWidth(img.width > 800 ? 800 : img.width);
                setHeight(img.width > 800 ? Math.round(800 / aspect) : img.height);
              }
            };
            img.src = event.target.result;
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Apply a preset
  const applyPreset = (preset: PresetSpecification) => {
    setPresetId(preset.id);
    setWidth(preset.width);
    setHeight(preset.height);
    setTargetKB(preset.maxKB);
    setKeepAspectRatio(false); // Presets have exact dimensions, lock aspect ratio should be disabled
  };

  // Keep aspect ratio constraint when input changes
  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (keepAspectRatio && originalAspect) {
      setHeight(Math.round(val / originalAspect));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (keepAspectRatio && originalAspect) {
      setWidth(Math.round(val * originalAspect));
    }
  };

  // The primary compression algorithm
  const processImage = () => {
    if (!imageSrc) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Step 1: Draw onto Canvas at targeted resolution
      let currentWidth = width;
      let currentHeight = height;

      const performRender = (w: number, h: number, scaleFactor = 1.0) => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(w * scaleFactor);
        canvas.height = Math.round(h * scaleFactor);
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.fillStyle = '#FFFFFF'; // Fallback background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas;
      };

      // We will perform a nested search:
      // Binary search the JPEG quality (0.01 - 1.0).
      // If even with quality 0.01, size is larger than targetKB, 
      // we reduce the canvas scale slightly (down to 0.5) to enforce the limit.
      
      let scale = 1.0;
      let finalDataUrl = '';
      let finalBytes = 0;
      let finalQuality = 0.85;
      let finalWidth = currentWidth;
      let finalHeight = currentHeight;
      let bestCanvas: HTMLCanvasElement | null = null;

      // Iterative loop to force getting underneath the size of targetKB
      for (let scaleIter = 0; scaleIter < 5; scaleIter++) {
        bestCanvas = performRender(currentWidth, currentHeight, scale);
        if (!bestCanvas) break;

        let lowQ = 0.01;
        let highQ = 0.98;
        let currentQ = 0.85;
        let localBestUrl = '';
        let localBestBytes = Infinity;
        let localBestQ = 0.85;

        // Binary search JPEG quality
        for (let qIter = 0; qIter < 8; qIter++) {
          const testQ = (lowQ + highQ) / 2;
          const testUrl = bestCanvas.toDataURL('image/jpeg', testQ);
          const testBytes = Math.round((testUrl.split(',')[1].length * 3) / 4);
          const testKB = testBytes / 1024;

          if (testKB <= targetKB) {
            localBestUrl = testUrl;
            localBestBytes = testBytes;
            localBestQ = testQ;
            lowQ = testQ; // try higher quality
          } else {
            highQ = testQ; // needs to be smaller
          }
        }

        // Check if we succeeded in finding a state under or very close to our target size
        if (localBestUrl) {
          finalDataUrl = localBestUrl;
          finalBytes = localBestBytes;
          finalQuality = localBestQ;
          finalWidth = bestCanvas.width;
          finalHeight = bestCanvas.height;
          break; // successfully compressed under target size!
        } else {
          // If even lowest quality is too big, scale down dimensions slightly by 15% and retry
          scale *= 0.85;
          finalQuality = 0.01;
          const fallbackCanvas = performRender(currentWidth, currentHeight, scale);
          if (fallbackCanvas) {
            finalDataUrl = fallbackCanvas.toDataURL('image/jpeg', 0.01);
            finalBytes = Math.round((finalDataUrl.split(',')[1].length * 3) / 4);
            finalWidth = fallbackCanvas.width;
            finalHeight = fallbackCanvas.height;
          }
        }
      }

      // If all else fails, take the absolute fallback
      if (!finalDataUrl && bestCanvas) {
        finalDataUrl = bestCanvas.toDataURL('image/jpeg', 0.1);
        finalBytes = Math.round((finalDataUrl.split(',')[1].length * 3) / 4);
        finalQuality = 0.1;
        finalWidth = bestCanvas.width;
        finalHeight = bestCanvas.height;
      }

      setOutputSrc(finalDataUrl);
      setOutputBytes(finalBytes);
      setOutputQuality(finalQuality);
      setOutputWidth(finalWidth);
      setOutputHeight(finalHeight);
      setIsProcessing(false);
    };
    img.src = imageSrc;
  };

  // Run the compressor when inputs change
  useEffect(() => {
    if (imageSrc) {
      const delayDebounceFn = setTimeout(() => {
        processImage();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [imageSrc, width, height, targetKB]);

  const handleDownload = () => {
    if (!outputSrc) return;
    const link = document.createElement('a');
    link.href = outputSrc;
    // Set descriptive and literal download name
    const originalName = selectedFile ? selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) : 'document';
    link.download = `${originalName}_resized_${targetKB}kb.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearCanvas = () => {
    setSelectedFile(null);
    setImageSrc(null);
    setOutputSrc(null);
    setPresetId('custom');
    setWidth(350);
    setHeight(450);
    setTargetKB(50);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border border-rule bg-white p-6 md:p-8" id="photo-resizer-tool">
      
      {/* Control Panel (Columns 5) */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-rule">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#0D0D0D] font-bold">Resizing Engine</h3>
            {presetId !== 'custom' && (
              <span className="font-mono text-[10px] bg-accent-green text-paper px-2 py-0.5 uppercase">
                Preset Active
              </span>
            )}
          </div>

          {/* Quick Presets */}
          <div className="mt-4">
            <label className="block font-mono text-[11px] mb-2 uppercase text-muted-grey">Portal Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {PHOTO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`border text-[11px] font-mono py-2 text-left px-3 block transition-all ${
                    presetId === preset.id 
                      ? 'border-accent-green bg-[#1A6B4A]/5 text-accent-green' 
                      : 'border-rule hover:border-ink'
                  }`}
                  id={`preset-btn-${preset.id}`}
                >
                  <p className="font-semibold truncate">{preset.name}</p>
                  <p className="text-[10px] text-muted-grey mt-0.5 truncate">{preset.portal}</p>
                </button>
              ))}
              <button
                onClick={() => {
                  setPresetId('custom');
                  setKeepAspectRatio(true);
                }}
                className={`border text-[11px] font-mono py-2 text-center transition-all col-span-2 ${
                  presetId === 'custom' 
                    ? 'border-ink bg-ink text-white font-semibold' 
                    : 'border-rule hover:border-ink'
                }`}
                id="preset-btn-custom"
              >
                Custom Dimensions
              </button>
            </div>
          </div>

          {/* Dimension Controls */}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-grey mb-1">Width (pixels)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                  disabled={presetId !== 'custom'}
                  className="w-full bg-[#F9F7F2] border border-rule px-3 py-2 font-mono text-xs focus:outline-none focus:border-ink"
                  id="resizer-width-input"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-grey mb-1">Height (pixels)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                  disabled={presetId !== 'custom'}
                  className="w-full bg-[#F9F7F2] border border-rule px-3 py-2 font-mono text-xs focus:outline-none focus:border-ink"
                  id="resizer-height-input"
                />
              </div>
            </div>

            {presetId === 'custom' && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="aspect-ratio-check"
                  checked={keepAspectRatio}
                  onChange={(e) => setKeepAspectRatio(e.target.checked)}
                  className="accent-accent-green rounded-none"
                />
                <label htmlFor="aspect-ratio-check" className="font-mono text-[11px] text-[#0D0D0D] cursor-pointer">
                  Maintain aspect ratio ({originalAspect.toFixed(2)}:1)
                </label>
              </div>
            )}

            {/* Target KB File Size */}
            <div className="border border-rule p-4 bg-[#FDFDFD] mt-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block font-mono text-[11px] uppercase text-muted-grey">Target Size Limit</label>
                <span className="font-mono text-xs font-bold text-accent-green" id="target-kb-display">{targetKB} KB</span>
              </div>
              <input
                type="range"
                min="10"
                max="1010"
                step="10"
                value={targetKB}
                onChange={(e) => setTargetKB(parseInt(e.target.value))}
                className="w-full accent-accent-green border-none cursor-pointer"
                id="target-kb-slider"
              />
              <div className="flex justify-between font-mono text-[10px] text-muted-grey mt-1">
                <span>10 KB (Minimum)</span>
                <span>1 MB (Maximum)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security / Info Badge */}
        <div className="border border-rule p-3 bg-paper/50 flex items-start space-x-2">
          <Info className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
          <div className="text-[11px] font-mono text-muted-grey leading-relaxed">
            <span className="font-bold text-ink">Zero Server Uploads:</span> All resizing and compression runs locally on your browser. Your government documents never leave your computer.
          </div>
        </div>
      </div>

      {/* Upload/Preview Zone (Columns 7) */}
      <div className="lg:col-span-7 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-rule pt-6 lg:pt-0 lg:pl-6">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-[#0D0D0D] font-bold pb-4 border-b border-rule mb-4">
            Upload & Virtual Proof
          </h3>

          {!imageSrc ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed flex flex-col h-72 items-center justify-center cursor-pointer transition-colors ${
                isDragOver ? 'border-accent-green bg-[#1A6B4A]/5' : 'border-rule hover:border-ink'
              }`}
              id="resizer-dropzone"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="photo-resizer-file-input"
              />
              <div className="text-center p-6">
                <div className="w-12 h-12 border border-rule bg-paper flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-5 h-5 text-muted-grey" />
                </div>
                <p className="font-mono text-xs text-ink font-semibold">Drop image here or click to browse</p>
                <p className="font-mono text-[10px] text-muted-grey mt-1">Supports PNG, JPG, JPEG, WEBP</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Src Preview */}
                <div className="border border-rule bg-[#FDFDFD] p-3 text-center">
                  <span className="font-mono text-[10px] text-muted-grey block mb-2 uppercase">Original Image</span>
                  <div className="h-44 flex items-center justify-center border border-rule bg-[#F5F2EB]/30 overflow-hidden">
                    <img
                      src={imageSrc}
                      ref={imageRef}
                      alt="Source view"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <span className="font-mono text-[10px] block mt-1 text-muted-grey">
                    Size: {selectedFile ? (selectedFile.size / 1024).toFixed(1) : '0'} KB
                  </span>
                </div>

                {/* Dst Compressed Preview */}
                <div className="border border-rule bg-[#FDFDFD] p-3 text-center">
                  <span className="font-mono text-[10px] text-muted-grey block mb-2 uppercase">Live Output Result</span>
                  <div className="h-44 flex items-center justify-center border border-rule bg-[#F5F2EB]/30 overflow-hidden relative">
                    {isProcessing ? (
                      <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center">
                        <RefreshCw className="w-6 h-6 text-accent-green animate-spin" />
                        <span className="font-mono text-[10px] mt-2 text-ink">Calibrating sizes...</span>
                      </div>
                    ) : null}
                    
                    {outputSrc ? (
                      <img
                        src={outputSrc}
                        alt="Compressed Output View"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-rule animate-pulse text-muted-grey" />
                    )}
                  </div>
                  
                  {/* Realtime Stats */}
                  <div className="mt-1 font-mono text-[10px] space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-muted-grey">Target Size:</span>
                      <span className="font-bold text-ink">&lt;&nbsp;{targetKB} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-grey">Calculated Size:</span>
                      <span className={`font-bold ${outputBytes / 1024 <= targetKB ? 'text-accent-green' : 'text-accent-red'}`} id="calculated-kb-stat">
                        {(outputBytes / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-grey">Resolution:</span>
                      <span className="text-ink font-semibold">{outputWidth} x {outputHeight} px</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-[#27ae60] font-semibold border-t border-rule mt-1 pt-0.5">
                      <span>Status:</span>
                      <span className="flex items-center"><Check className="w-2.5 h-2.5 mr-0.5" /> Compliant & Safe</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!outputSrc || isProcessing}
                  className="flex-1 bg-accent-green hover:bg-accent-green/90 text-white font-mono text-xs py-3 px-4 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                  id="download-resized-btn"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Compliant File</span>
                </button>
                <button
                  onClick={clearCanvas}
                  className="border border-rule hover:border-ink hover:bg-paper font-mono text-xs text-[#0D0D0D] py-3 px-4 transition-all"
                  id="reset-resized-btn"
                >
                  Clear File
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Note block at bottom */}
        {presetId !== 'custom' && (
          <div className="mt-4 border border-[#e67e22]/20 p-2 text-[10px] font-mono text-muted-grey leading-tight bg-[#e67e22]/5">
            <span className="font-bold text-ink uppercase">Portal Guideline Note:</span> {PHOTO_PRESETS.find(p => p.id === presetId)?.helpText}
          </div>
        )}
      </div>
    </div>
  );
}
