import React, { useState, useRef } from 'react';
import { Upload, Download, RefreshCw, FileText, Check, Info, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface QueuedPDF {
  id: string;
  name: string;
  sizeBytes: number;
  dataUrl: string;
}

export default function PDFMerger() {
  const [queuedPDFs, setQueuedPDFs] = useState<QueuedPDF[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [mergedPdfSize, setMergedPdfSize] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(fileObj => {
        const file = fileObj as File;
        if (file.type === 'application/pdf') {
          addPdfToQueue(file);
        }
      });
    }
  };

  const addPdfToQueue = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        const newPDF: QueuedPDF = {
          id: Math.random().toString(36).substring(3),
          name: file.name,
          sizeBytes: file.size,
          dataUrl: event.target.result
        };
        setQueuedPDFs(prev => [...prev, newPDF]);
      }
    };
    reader.readAsDataURL(file);
  };

  const removePdf = (id: string) => {
    setQueuedPDFs(prev => prev.filter(p => p.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setQueuedPDFs(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === queuedPDFs.length - 1) return;
    setQueuedPDFs(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  // Merge the PDFs using pdf-lib client-side
  const mergePDFs = async () => {
    if (queuedPDFs.length < 2) return;
    setIsProcessing(true);
    setMergedPdfUrl(null);

    try {
      const { PDFDocument } = await import('pdf-lib');
      const mergedDoc = await PDFDocument.create();

      for (const item of queuedPDFs) {
        const donorBytes = await fetch(item.dataUrl).then(res => res.arrayBuffer());
        const donorDoc = await PDFDocument.load(donorBytes);
        const pageCount = donorDoc.getPageCount();
        const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
        const copiedPages = await mergedDoc.copyPages(donorDoc, pageIndices);
        
        copiedPages.forEach(page => {
          mergedDoc.addPage(page);
        });
      }

      const mergedBytes = await mergedDoc.save();
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      
      setMergedPdfUrl(downloadUrl);
      setMergedPdfSize(mergedBytes.length);
    } catch (err) {
      console.error("PDF Merge failure: ", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!mergedPdfUrl) return;
    const link = document.createElement('a');
    link.href = mergedPdfUrl;
    link.download = `getdocready_merged_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearQueue = () => {
    setQueuedPDFs([]);
    setMergedPdfUrl(null);
    setMergedPdfSize(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border border-rule bg-white p-6 md:p-8" id="pdf-merger-tool">
      
      {/* Settings Info Pane (Col 4) */}
      <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-rule">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#0D0D0D] font-bold">Merge Engine</h3>
            <span className="font-mono text-[10px] bg-accent-green text-[#F5F2EB] px-1.5 py-0.5 uppercase">
              100% Private
            </span>
          </div>

          <div className="mt-4 space-y-4">
            <p className="font-mono text-xs text-muted-grey leading-relaxed">
              Combine multiple files (like an application form, mark sheet, transcripts, or identity proofs) into a single, perfectly structured PDF document.
            </p>

            <div className="border border-rule p-4 bg-paper/30 space-y-2 font-mono text-[11px] leading-relaxed text-muted-grey">
              <span className="font-bold text-ink block uppercase">Why use GetDocReady?</span>
              <ul className="list-disc list-inside space-y-1">
                <li>No upload files: Files never touch any network.</li>
                <li>No watermarks or paywalls ever.</li>
                <li>Unlimited page compilations.</li>
                <li>Guaranteed vector clarity preservation.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Trigger */}
        <div className="pt-4 border-t border-rule">
          <button
            onClick={mergePDFs}
            disabled={queuedPDFs.length < 2 || isProcessing}
            className="w-full bg-ink hover:bg-ink/90 text-[#F5F2EB] font-mono text-xs py-3 px-4 flex items-center justify-center space-x-2 transition-all disabled:opacity-40"
            id="merge-pdf-btn"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-accent-green" />
                <span>Intertwining PDFs...</span>
              </>
            ) : (
              <>
                <span>Combine PDF Documents →</span>
              </>
            )}
          </button>
          {queuedPDFs.length < 2 && (
            <p className="font-mono text-[10px] text-muted-grey text-center mt-2 italic">
              Please stage at least 2 PDF documents to combine.
            </p>
          )}
        </div>
      </div>

      {/* Files Zone (Col 8) */}
      <div className="lg:col-span-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-rule pt-6 lg:pt-0 lg:pl-6">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-[#0D0D0D] font-bold pb-4 border-b border-rule mb-4">
            Queue of PDF Files to Merge ({queuedPDFs.length})
          </h3>

          {queuedPDFs.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-rule hover:border-ink h-60 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white"
              id="merger-dropzone"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                multiple
                className="hidden"
                id="merger-file-input"
              />
              <div className="text-center p-6">
                <div className="w-12 h-12 border border-rule bg-paper flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-5 h-5 text-muted-grey" />
                </div>
                <p className="font-mono text-xs text-ink font-semibold">Select PDF files to combine</p>
                <p className="font-mono text-[10px] text-muted-grey mt-1">Accepts PDF files only. Orders are adjustable.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* PDF item listings */}
              <div className="border border-rule divide-y divide-rule divide-dashed max-h-60 overflow-y-auto bg-[#FDFDFD]">
                {queuedPDFs.map((pdf, idx) => (
                  <div key={pdf.id} className="flex items-center justify-between p-3" id={`merge-queue-item-${pdf.id}`}>
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-7 h-7 border border-[#C0392B]/10 bg-[#C0392B]/5 text-accent-red flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                        {idx + 1}
                      </div>
                      <div className="truncate">
                        <p className="font-mono text-xs font-semibold text-ink truncate">{pdf.name}</p>
                        <p className="font-mono text-[10px] text-muted-grey">Size: {(pdf.sizeBytes / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 ml-4">
                      <button
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        className="text-muted-grey hover:text-ink disabled:opacity-20 p-1"
                        id={`merge-up-${pdf.id}`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveDown(idx)}
                        disabled={idx === queuedPDFs.length - 1}
                        className="text-muted-grey hover:text-ink disabled:opacity-20 p-1"
                        id={`merge-down-${pdf.id}`}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removePdf(pdf.id)}
                        className="text-accent-red hover:bg-accent-red/10 p-1.5 transition-all"
                        id={`merge-remove-${pdf.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload additions buttons */}
              <div className="flex justify-between items-center bg-[#F9F7F2] border border-rule px-3 py-2">
                <span className="font-mono text-[10px] text-muted-grey">Add another PDF:</span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white hover:bg-paper border border-rule font-mono text-[10px] text-[#0D0D0D] px-2.5 py-1 font-semibold transition-all"
                  id="merger-add-more-btn"
                >
                  + Add PDF Document
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Output Area */}
        {mergedPdfUrl && (
          <div className="mt-6 border border-accent-green p-4 bg-accent-green/[0.02]" id="merge-output-success">
            <div className="flex flex-col md:flex-row md:items-center justify-between md:space-x-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 border border-accent-green/30 bg-accent-green/5 text-accent-green shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-mono text-xs font-bold text-ink">Merged Document Ready</h4>
                  <p className="font-mono text-[10px] text-muted-grey mt-0.5 leading-relaxed">
                    Successfully merged <span className="font-bold text-ink">{queuedPDFs.length} documents</span> into a single combined file of size <span className="font-bold text-accent-green">{(mergedPdfSize / 1024 / 1024).toFixed(2)} MB</span>.
                  </p>
                </div>
              </div>

              <div className="mt-3 md:mt-0 flex space-x-2 shrink-0">
                <button
                  onClick={handleDownload}
                  className="flex-1 md:flex-none bg-accent-green hover:bg-accent-green/90 text-white font-mono text-xs py-2 px-4 flex items-center justify-center space-x-1 transition-all"
                  id="download-merged-pdf-btn"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Combined PDF</span>
                </button>
                <button
                  onClick={clearQueue}
                  className="border border-rule hover:border-ink hover:bg-white font-mono text-xs py-2 px-3 transition-all"
                  id="reset-merged-btn"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
