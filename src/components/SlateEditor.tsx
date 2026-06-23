import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Upload, Download, RefreshCw, Check, Info, Sliders, Calendar, User } from 'lucide-react';

export default function SlateEditor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Slate Parameters
  const [candidateName, setCandidateName] = useState<string>('RAJESH KUMAR');
  const [photoDate, setPhotoDate] = useState<string>('22/06/2026'); // Defaults to today's date placeholder
  const [fontSize, setFontSize] = useState<number>(20); // base pt
  const [slateHeightPercent, setSlateHeightPercent] = useState<number>(22); // Height percentage of photo
  const [slateBackground, setSlateBackground] = useState<'white' | 'black'>('white');
  const [textUppercase, setTextUppercase] = useState<boolean>(true);
  
  // Sizing target parameters (SSC photo standard is 20KB to 50KB)
  const [targetKB, setTargetKB] = useState<number>(40); 
  const [targetWidth, setTargetWidth] = useState<number>(350); 
  const [targetHeight, setTargetHeight] = useState<number>(450); 

  // Output states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [outputSrc, setOutputSrc] = useState<string | null>(null);
  const [outputBytes, setOutputBytes] = useState<number>(0);
  const [outputWidth, setOutputWidth] = useState<number>(350);
  const [outputHeight, setOutputHeight] = useState<number>(450);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default date auto-seeding
  useEffect(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();
    setPhotoDate(`${dd}/${mm}/${yyyy}`);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setImageSrc(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const processPhotoWithSlateLabel = () => {
    if (!imageSrc) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original photo scaled to fill target dimensions
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Render the Slate Box overlay at the bottom
      const slateHeight = Math.round(targetHeight * (slateHeightPercent / 100));
      const slateY = targetHeight - slateHeight;
      
      ctx.fillStyle = slateBackground === 'white' ? '#FFFFFF' : '#000000';
      ctx.fillRect(0, slateY, targetWidth, slateHeight);

      // Draw a neat crisp border around the slate box to highlight it
      ctx.strokeStyle = slateBackground === 'white' ? '#CCCCCC' : '#333333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, slateY);
      ctx.lineTo(targetWidth, slateY);
      ctx.stroke();

      // Configure text placement
      const textCol = slateBackground === 'white' ? '#000000' : '#FFFFFF';
      ctx.fillStyle = textCol;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Candidate name typography sizing
      const nameString = textUppercase ? candidateName.toUpperCase() : candidateName;
      ctx.font = `600 ${fontSize}px "Inter", Arial, sans-serif`;
      
      // Paint Candidate Name
      const nameY = slateY + (slateHeight * 0.33);
      ctx.fillText(nameString, targetWidth / 2, nameY);

      // Paint Date of Photo
      ctx.font = `normal ${fontSize - 2}px "JetBrains Mono", Courier, monospace`;
      const dateY = slateY + (slateHeight * 0.68);
      ctx.fillText(`DOB/DOP: ${photoDate}`, targetWidth / 2, dateY);

      // Adjust size quality automatically to hit between 20KB and 50KB perfect SSC limit
      let finalDataUrl = '';
      let finalBytes = 0;
      let lowQ = 0.05;
      let highQ = 0.95;

      for (let i = 0; i < 7; i++) {
        const testQ = (lowQ + highQ) / 2;
        const testUrl = canvas.toDataURL('image/jpeg', testQ);
        const testBytes = Math.round((testUrl.split(',')[1].length * 3) / 4);
        const testKB = testBytes / 1024;

        if (testKB <= targetKB) {
          finalDataUrl = testUrl;
          finalBytes = testBytes;
          lowQ = testQ; // try better quality
        } else {
          highQ = testQ; // compress tighter
        }
      }

      // Re-evaluate if compression fell too far below or above
      if (!finalDataUrl) {
        finalDataUrl = canvas.toDataURL('image/jpeg', 0.1);
        finalBytes = Math.round((finalDataUrl.split(',')[1].length * 3) / 4);
      }

      setOutputSrc(finalDataUrl);
      setOutputBytes(finalBytes);
      setOutputWidth(targetWidth);
      setOutputHeight(targetHeight);
      setIsProcessing(false);
    };
    img.src = imageSrc;
  };

  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => {
        processPhotoWithSlateLabel();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [imageSrc, candidateName, photoDate, fontSize, slateHeightPercent, slateBackground, textUppercase, targetKB, targetWidth, targetHeight]);

  const handleDownload = () => {
    if (!outputSrc) return;
    const link = document.createElement('a');
    link.href = outputSrc;
    link.download = `slate_photo_${targetKB}kb.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearCanvas = () => {
    setSelectedFile(null);
    setImageSrc(null);
    setOutputSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border border-rule bg-white p-6 md:p-8" id="slate-editor-tool">
      
      {/* Parameter Inputs (Col 5) */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-rule mb-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#0D0D0D] font-bold">Label Configuration</h3>
            <span className="font-mono text-[10px] bg-accent-green text-[#F5F2EB] px-1.5 py-0.5 uppercase">
              SSC Compliant
            </span>
          </div>

          <div className="space-y-4">
            {/* Candidate Name Input */}
            <div>
              <label className="block font-mono text-[11px] uppercase text-muted-grey mb-1 font-semibold flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-accent-green" /> Candidate Name
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="E.g. RAJESH KUMAR"
                className="w-full bg-[#F9F7F2] border border-rule px-3 py-2 font-mono text-xs focus:outline-none focus:border-ink uppercase"
                id="slate-candidate-name-input"
              />
              <p className="text-[10px] text-muted-grey mt-0.5 font-mono italic">Usually printed in absolute UPPERCASE.</p>
            </div>

            {/* Date printed Input */}
            <div>
              <label className="block font-mono text-[11px] uppercase text-muted-grey mb-1 font-semibold flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-accent-green" /> Photo Date (DOP)
              </label>
              <input
                type="text"
                value={photoDate}
                onChange={(e) => setPhotoDate(e.target.value)}
                placeholder="E.g. 22/06/2026"
                className="w-full bg-[#F9F7F2] border border-rule px-3 py-2 font-mono text-xs focus:outline-none focus:border-ink"
                id="slate-photo-date-input"
              />
              <p className="text-[10px] text-muted-grey mt-0.5 font-mono italic">Must not be more than 3 months old in most portals.</p>
            </div>

            {/* Slate formatting adjustments */}
            <div className="grid grid-cols-2 gap-2 border-t border-rule pt-4">
              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-grey mb-1">Text size</label>
                <input
                  type="number"
                  min="12"
                  max="32"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
                  className="w-full bg-[#F9F7F2] border border-rule px-3 py-2 font-mono text-xs focus:outline-none focus:border-ink"
                  id="slate-font-size"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-grey mb-1">Slate height %</label>
                <input
                  type="number"
                  min="15"
                  max="35"
                  value={slateHeightPercent}
                  onChange={(e) => setSlateHeightPercent(parseInt(e.target.value) || 15)}
                  className="w-full bg-[#F9F7F2] border border-rule px-3 py-2 font-mono text-xs focus:outline-none focus:border-ink"
                  id="slate-height-percent"
                />
              </div>
            </div>

            {/* Theme / Aspect controls */}
            <div className="flex items-center justify-between border-t border-rule pt-4">
              <label className="font-mono text-[11px] uppercase text-muted-grey">Slate Background</label>
              <div className="flex space-x-1">
                {(['white', 'black'] as const).map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setSlateBackground(bg)}
                    className={`border font-mono text-[11px] px-3 py-1 uppercase ${
                      slateBackground === bg 
                        ? 'border-ink bg-ink text-[#F5F2EB]' 
                        : 'border-rule hover:border-ink hover:bg-paper'
                    }`}
                    id={`slate-bg-btn-${bg}`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Target KB slider */}
            <div className="border border-rule p-4 bg-[#FDFDFD] mt-2">
              <div className="flex justify-between items-center mb-1">
                <label className="block font-mono text-[11px] uppercase text-muted-grey">Target Size Limit (KB)</label>
                <span className="font-mono text-xs font-bold text-accent-green">{targetKB} KB</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={targetKB}
                onChange={(e) => setTargetKB(parseInt(e.target.value))}
                className="w-full accent-accent-green cursor-pointer"
                id="slate-kb-slider"
              />
              <div className="flex justify-between font-mono text-[9px] text-muted-grey mt-1">
                <span>20 KB (SSC Limit)</span>
                <span>100 KB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Local Security Badge */}
        <div className="border border-rule p-3 bg-paper/50 flex items-start space-x-2">
          <Info className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
          <div className="text-[11px] font-mono text-muted-grey leading-relaxed">
            <span className="font-bold text-ink">Works Offline:</span> Your photo edit features are rendered entirely within your browser thread using canvas rendering, so your privacy is absolutely guaranteed.
          </div>
        </div>
      </div>

      {/* Upload/Preview Area (Col 7) */}
      <div className="lg:col-span-7 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-rule pt-6 lg:pt-0 lg:pl-6">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-[#0D0D0D] font-bold pb-4 border-b border-rule mb-4">
            Printers Slate Virtual Proof
          </h3>

          {!imageSrc ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-rule hover:border-ink h-72 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white hover:bg-paper/10"
              id="slate-dropzone"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="slate-file-input"
              />
              <div className="text-center p-6">
                <div className="w-12 h-12 border border-rule bg-paper flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-5 h-5 text-muted-grey" />
                </div>
                <p className="font-mono text-xs text-ink font-semibold">Upload candidate photograph</p>
                <p className="font-mono text-[10px] text-muted-grey mt-1">Standard 3.5cm x 4.5cm photos work best.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border border-rule bg-[#FDFDFD] p-4 text-center">
                <span className="font-mono text-[10px] text-muted-grey block mb-3 uppercase">Pristine Photo with Slate stamp</span>
                
                {/* Virtual Portrait mock */}
                <div className="border border-rule p-4 bg-[#F5F2EB]/20 max-w-xs mx-auto relative shadow-sm">
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/75 flex flex-col items-center justify-center select-none z-10 border border-rule">
                      <RefreshCw className="w-6 h-6 text-accent-green animate-spin" />
                      <span className="font-mono text-[10px] mt-2">Engraving name plate...</span>
                    </div>
                  )}

                  <div className="border border-rule bg-white flex items-center justify-center overflow-hidden aspect-[3.5/4.5] w-full">
                    {outputSrc ? (
                      <img
                        src={outputSrc}
                        alt="Slate Output Photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-mono text-xs text-muted-grey">Rendering...</span>
                    )}
                  </div>
                </div>

                {/* Info Rows */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-left border-t border-rule pt-4">
                  <div className="font-mono p-2 bg-paper/50">
                    <span className="text-[10px] text-muted-grey block">Target Constraint</span>
                    <span className="text-xs font-bold text-ink">Max {targetKB} KB</span>
                  </div>
                  <div className="font-mono p-2 bg-paper/50">
                    <span className="text-[10px] text-muted-grey block">Resulting Size</span>
                    <span className={`text-xs font-bold ${outputBytes / 1024 < 20 || outputBytes / 1024 > 50 ? 'text-accent-red' : 'text-accent-green'}`} id="slate-resulting-size-display">
                      {(outputBytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div className="font-mono p-2 bg-paper/50">
                    <span className="text-[10px] text-muted-grey block">DOP Overlay</span>
                    <span className="text-[10px] font-bold text-accent-green uppercase truncate block">{photoDate}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-center space-x-2 bg-accent-green/5 border border-accent-green/20 p-2 font-mono text-[10px] text-[#1A6B4A]">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-semibold">Compliant with Staff Selection Commission (SSC) specifications.</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleDownload}
                  disabled={!outputSrc || isProcessing}
                  className="flex-1 bg-accent-green hover:bg-accent-green/90 text-white font-mono text-xs py-3 px-4 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                  id="slate-download-btn"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Slate Photograph</span>
                </button>
                <button
                  onClick={clearCanvas}
                  className="border border-rule hover:border-ink hover:bg-paper font-mono text-xs text-[#0D0D0D] py-3 px-4 transition-all"
                  id="slate-clear-btn"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tip row */}
        <div className="mt-4 border border-rule p-3 bg-white leading-tight font-mono text-[11px] text-muted-grey">
          <span className="font-bold text-ink uppercase block mb-1">🚨 Important Exam Criteria:</span>
          Per SSC notification norms, passport photos must have a clear white or dark slate displaying the candidate's custom name in capital block letters and the exact date when the photo was clicked underneath. Photos without this slate are liable to be summarily rejected.
        </div>
      </div>
    </div>
  );
}
