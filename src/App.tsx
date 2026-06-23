import React, { useState, useEffect, useRef } from 'react';
import { ActiveTool, ProcessStep } from './types';
import PhotoResizer from './components/PhotoResizer';
import SignatureResizer from './components/SignatureResizer';
import PDFCompressor from './components/PDFCompressor';
import PDFMerger from './components/PDFMerger';
import SlateEditor from './components/SlateEditor';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Image as ImageIcon, 
  PenTool, 
  Layers, 
  Tag, 
  HelpCircle, 
  ShieldCheck, 
  WifiOff, 
  Coins, 
  FileCheck,
  ChevronDown,
  ArrowRight,
  ArrowDown,
  Upload,
  Sliders,
  Download,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [activeToolId, setActiveToolId] = useState<string>('pdf-compressor');
  
  // Custom SPA page view: 'home' | 'privacy'
  const [activeView, setActiveView] = useState<'home' | 'privacy'>('home');
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [cookieConsentGranted, setCookieConsentGranted] = useState<boolean>(() => {
    return localStorage.getItem('gdpr_consent_granted') === 'true';
  });

  // Stamp animation states: 'REJECTED' or 'READY'
  const [stampState, setStampState] = useState<'REJECTED' | 'READY'>('REJECTED');

  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Expanded FAQ state
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Auto flip stamp badge every 3 seconds for demo action
  useEffect(() => {
    const interval = setInterval(() => {
      setStampState(prev => prev === 'REJECTED' ? 'READY' : 'REJECTED');
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tools: ActiveTool[] = [
    {
      id: "pdf-compressor",
      icon: "📄",
      title: "PDF Compressor",
      description: "Target any KB limit"
    },
    {
      id: "photo-resizer",
      icon: "🖼️",
      title: "Photo Resizer",
      description: "Exact pixels + KB target"
    },
    {
      id: "signature-resizer",
      icon: "✍️",
      title: "Signature Resizer",
      description: "UPSC/SSC spec ready"
    },
    {
      id: "pdf-merger",
      icon: "🗂️",
      title: "PDF Merger",
      description: "Combine docs into one"
    },
    {
      id: "slate-editor",
      icon: "🏷️",
      title: "Slate Editor",
      description: "Add name + date overlay"
    }
  ];

  const processSteps: ProcessStep[] = [
    {
      number: "01",
      title: "Upload your file",
      body: "Stays in your browser. Never touches our servers."
    },
    {
      number: "02",
      title: "Set your target",
      body: "Enter the exact KB or pixel size required."
    },
    {
      number: "03",
      title: "Download. Done.",
      body: "Compressed. Compliant. Ready to upload anywhere."
    }
  ];

  const faqData = [
    {
      id: "rejection-reasons",
      category: "Compliance & Rejections",
      question: "Why do exam portals reject my photo, signature, or certificates?",
      answer: "Portals like UPSC, SSC, NTA, and State PSCs use automatic validators. Rejections usually happen because:\n\n1. UNDER-SIZING & OVER-SIZING: File constraints are strictly guarded (e.g., JPEG files must be strictly between 20 KB and 50 KB; signatures must be between 10 KB and 20 KB). Files outside these bounds fail the form field scanner.\n2. INCORRECT PIXEL DIMENSIONS: Aspect ratios or width-to-height bounds are not exact (e.g., SSC standard of 3.5 cm x 4.5 cm with strict proportional aspect scaling).\n3. LOW CONTRAST SIGNATURES: Signature ink is scanned using faint pencil/blue gel pens, or containing background table shadows, causing automated visual screening systems to discard submissions."
    },
    {
      id: "format-limitations",
      category: "File Formats",
      question: "Why do portals strictly enforce JPEG or PDF formats instead of PNG or WEBP?",
      answer: "Most government databases run on legacy web servers optimized for traditional standard MIME types (.jpg, .jpeg, and .pdf) and flat compression configurations. PNG support is restricted because transparency alpha channels degrade the backdrop coloring during flat image merges, while WebP is too modern for legacy parser frameworks. PDF remains default for multi-page educational certificates (e.g. Matriculation, Caste Certificates) to prevent multiple fragmented raw image uploads."
    },
    {
      id: "online-vs-local",
      category: "Local Browser Privacy",
      question: "What is the meaning of 'All rights reserved locally on client browser'?",
      answer: "It means that GetDocReady is an entirely client-side application. Instead of uploading your photos or sensitive identification documents to a remote cloud database, your browser loads all processing engines (HTML5 Canvas, PDF-lib, JSZip, and local image compressors) into your computer's temporary RAM. Every pixel transformation, size lowering, and PDF merger executes 100% locally on your own CPU. No telemetry or server-side logs are saved, ensuring absolute safety against security data breaches."
    },
    {
      id: "offline-test",
      category: "Privacy Verification",
      question: "How can I verify that my files are processed 100% offline?",
      answer: "You can verify the local-first execution in 3 quick steps:\n\n1. Load GetDocReady on your browser.\n2. Turn off your machine's Wi-Fi, Ethernet, and mobile data completely (or switch your device to Airplane Mode).\n3. Drag in a 5 MB photo, adjust the slider to 40 KB, and trigger compression. You will notice that it processes in milliseconds and saves directly to your downloads. Since there is zero internet access, no remote server could have possibly received your documents!"
    },
    {
      id: "slate-rule",
      category: "Aspirant Guide",
      question: "What is the 'Slate Photo' requirement for government applications?",
      answer: "Certain notification rules (such as Staff Selection Commission / SSC or state board exams) require a clear, readable overlay printed over the applicant's chest area in the passport photo showing details like:\n\n- The APPLICANT'S FULL NAME (in clean bold font)\n- The DATE OF PHOTOGRAPH (stating the exact date on which the photo was captured, matching notification timelines).\n\nYou can satisfy this rule instantly by using our integrated local Slate Editor overlay tool."
    }
  ];

  const toolsRef = useRef<HTMLDivElement>(null);

  const scrollToTools = () => {
    setActiveView('home');
    setTimeout(() => {
      toolsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleToolSelect = (id: string) => {
    setActiveView('home');
    setActiveToolId(id);
    setTimeout(() => {
      toolsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#0D0D0D] selection:bg-[#1A6B4A] selection:text-white flex flex-col font-sans">
      
      {/* 1. Header (Headroom Navigation Theme) */}
      <nav className="sticky top-0 z-50 bg-[#F5F2EB]/95 backdrop-blur-md border-b border-[#DDDAD3] transition-all duration-300">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-18 flex items-center justify-between">
          
          {/* Logo Brand Custom wordmark styling */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-2 group cursor-pointer focus:outline-none"
          >
            {/* Custom SVG logo symbol */}
            <div className="w-8 h-8 border border-[#0D0D0D] bg-white flex items-center justify-center relative shrink-0 transition-transform group-hover:rotate-6">
              <span className="font-mono text-xs font-bold leading-none select-none">gDR</span>
              {/* Corner Fold design detail */}
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#F5F2EB] border-l border-b border-[#0D0D0D]" />
            </div>
            
            {/* Lowercase Monospaced wordmark */}
            <div className="font-mono tracking-tight text-lg">
              <span className="font-light text-[#0D0D0D]">get</span>
              <span className="font-bold text-[#0D0D0D]">doc</span>
              <span className="font-light text-[#1A6B4A]">ready</span>
            </div>
          </button>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center space-x-8 font-mono text-xs">
            <div className="flex space-x-5">
              {tools.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleToolSelect(t.id)}
                  className={`py-1 transition-all uppercase cursor-pointer ${
                    activeToolId === t.id 
                      ? 'text-[#1A6B4A] border-b border-[#1A6B4A] font-semibold' 
                      : 'text-[#6B6862] hover:text-[#0D0D0D]'
                  }`}
                  id={`nav-link-${t.id}`}
                >
                  {t.title}
                </button>
              ))}
            </div>
            
            <button
              onClick={scrollToTools}
              className="px-4 py-2 border border-[#0D0D0D] bg-[#0D0D0D] text-white hover:bg-[#F5F2EB] hover:text-[#0D0D0D] transition-all cursor-pointer font-semibold uppercase text-[11px]"
              id="nav-cta-btn"
            >
              Fix Document Now
            </button>
          </div>

          {/* Mobile Hamburguer */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 border border-[#DDDAD3] bg-white text-[#0D0D0D]"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile slide drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#DDDAD3] bg-[#F5F2EB]/95 px-4 py-6 space-y-4 font-mono text-xs" id="mobile-drawer">
            <div className="flex flex-col space-y-3">
              {tools.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    handleToolSelect(t.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left py-2 uppercase border-b border-[#DDDAD3]/50 ${
                    activeToolId === t.id ? 'text-[#1A6B4A] font-bold' : 'text-[#6B6862]'
                  }`}
                  id={`mobile-nav-link-${t.id}`}
                >
                  <span className="mr-2">{t.icon}</span>{t.title}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                scrollToTools();
                setMobileMenuOpen(false);
              }}
              className="w-full text-center py-3 bg-[#0D0D0D] text-white uppercase text-[11px] font-bold tracking-wider"
              id="mobile-nav-cta"
            >
              Launch Workbench
            </button>
          </div>
        )}
      </nav>

      {activeView === 'home' ? (
        <>
          {/* 2. Brand Trust Marquee Banner (Background Ink #0D0D0D, Foreground Paper #F5F2EB) */}
          <div className="bg-[#0D0D0D] text-[#F5F2EB] py-3.5 border-b border-[#0D0D0D]" id="trust-banner">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 text-center sm:text-left">
          
          {/* Main highlights */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-1 font-mono text-[11px] uppercase tracking-wider font-semibold">
            <span className="flex items-center text-[#1A6B4A]"><ShieldCheck className="w-4.5 h-4.5 mr-1" /> 100% Private</span>
            <span className="flex items-center text-[#F5F2EB]/80"><WifiOff className="w-4.5 h-4.5 mr-1 text-[#F5F2EB]/50" /> Works Offline</span>
            <span className="flex items-center text-[#F5F2EB]"><Coins className="w-4.5 h-4.5 mr-1" /> ₹0 Forever</span>
          </div>

          {/* Subtext tagline details */}
          <div className="font-mono text-[10px] text-[#DDDAD3]/60 tracking-tight">
            No accounts required · Stays on your hardware · No watermarks · No corporate walls
          </div>
        </div>
      </div>

      {/* 3. Hero Section (Atelier Zero aesthetic) */}
      <header className="max-w-[1280px] mx-auto px-4 md:px-8 pt-12 pb-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Texts Column */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Eyebrow */}
          <span className="inline-block font-mono text-xs uppercase tracking-widest text-[#1A6B4A] border border-[#1A6B4A]/30 px-3 py-1 bg-[#1A6B4A]/5">
            Free · No upload · Works offline
          </span>

          {/* Display Heading Playfair */}
          <h1 className="font-display font-black tracking-tight text-[#0D0D0D] text-4xl sm:text-5xl lg:text-6.5xl leading-tight">
            Stop getting <br className="hidden sm:inline" />
            <span className="text-[#C0392B] line-through decoration-thickness-2 select-none">rejected</span> on portals.
          </h1>

          {/* Description */}
          <p className="font-sans text-[#6B6862] text-sm sm:text-base leading-relaxed max-w-xl">
            Indian government systems (like UPSC, SSC, state PSCs, and passport portals) reject applications instantly due to file sizes being slightly off. We optimize, crop, label, and mold your files into target constraints directly inside your browser—keeping your data safe and private.
          </p>

          {/* Dual CTAs in rectangular borders */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <button
              onClick={scrollToTools}
              className="px-8 py-4 bg-[#1A6B4A] hover:bg-[#124f35] text-white text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center space-x-2"
              id="hero-cta-primary"
            >
              <span>Build compliant document now →</span>
            </button>
            <button
              onClick={scrollToTools}
              className="px-6 py-4 border border-[#DDDAD3] hover:border-[#0D0D0D] hover:bg-paper bg-white text-[#0D0D0D] text-xs font-mono transition-all text-center flex items-center justify-center space-x-1"
              id="hero-cta-secondary"
            >
              <span>Check available modules</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Targets stats indicators row */}
          <div className="pt-6 border-t border-[#DDDAD3] max-w-lg">
            <span className="font-mono text-[10px] text-[#6B6862] uppercase tracking-wider block mb-2">Popular Portal Limits Supported:</span>
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-[#DDDAD3] bg-white p-2.5 text-center font-mono">
                <span className="text-xs text-[#6B6862] block">SSC Size</span>
                <span className="text-sm font-bold text-[#0D0D0D]" id="stat-label-ssc">20KB - 50KB</span>
              </div>
              <div className="border border-[#DDDAD3] bg-white p-2.5 text-center font-mono">
                <span className="text-xs text-[#6B6862] block">UPSC Size</span>
                <span className="text-sm font-bold text-[#0D0D0D]" id="stat-label-upsc">Under 300KB</span>
              </div>
              <div className="border border-[#DDDAD3] bg-white p-2.5 text-center font-mono">
                <span className="text-xs text-[#6B6862] block">PAN Cards</span>
                <span className="text-sm font-bold text-[#0D0D0D]" id="stat-label-pan">Max 20KB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Brand stamp-flip animation visual card column (Col 5) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[340px] border border-[#DDDAD3] bg-white p-6 relative">
            
            {/* Visual background details */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-[#F5F2EB] border-l border-b border-[#DDDAD3]" />
            <div className="text-[10px] font-mono text-[#6B6862] uppercase border-b border-[#DDDAD3] pb-2 mb-4">
              Portal Engine Sandbox
            </div>

            {/* Document Frame */}
            <div className="aspect-[4/5] border border-[#DDDAD3] bg-[#FDFDFD] p-4 flex flex-col justify-between relative overflow-hidden">
              
              {/* Lines simulating mock document format */}
              <div className="space-y-2">
                <div className="h-3 bg-[#E7E5DF] w-1/3" />
                <div className="h-2 bg-[#F2F1EC] w-5/6" />
                <div className="h-2 bg-[#F2F1EC] w-4/6" />
                <div className="h-2 bg-[#F2F1EC] w-full" />
              </div>

              {/* Box container for photo alignment */}
              <div className="border border-[#DDDAD3] h-28 flex flex-col items-center justify-center bg-[#F9F8F5] relative p-1 font-mono">
                <div className="w-10 h-10 border border-[#DDDAD3] bg-[#EBE9E3] flex items-center justify-center rounded-sm">
                  <span className="text-[10px]">📷</span>
                </div>
                <div className="w-full mt-2 h-4 bg-white border border-[#EBE9E3] text-center text-[7px] flex items-center justify-center">
                  CANDIDATE: RAJESH KUMAR
                </div>
              </div>

              {/* Bottom detail row */}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#F2F1EC] font-mono text-[9px] text-[#6B6862]">
                <span>FILE_SIZE:</span>
                <span id="demo-byte-indicator">{stampState === 'REJECTED' ? "1,200 KB" : "38.2 KB"}</span>
              </div>

              {/* STAMP BOX FLIP ANIMATION BLOCK WITH MOTION SPRING */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center flex-col items-center z-20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={stampState}
                    initial={{ scale: 2.2, opacity: 0, rotate: stampState === 'REJECTED' ? -25 : 15 }}
                    animate={{ scale: 1, opacity: 1, rotate: stampState === 'REJECTED' ? -12 : -8 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", damping: 14 }}
                    id="demo-stamp-wrapper"
                  >
                    {stampState === 'REJECTED' ? (
                      <div className="border-4 border-[#C0392B] bg-white text-[#C0392B] font-mono font-black text-lg px-4 py-1.5 uppercase leading-none tracking-widest text-center shadow-lg select-none">
                        REJECTED
                        <span className="block text-[8px] tracking-tight font-normal text-center mt-0.5">FILE TOO LARGE (LIMIT 50KB)</span>
                      </div>
                    ) : (
                      <div className="border-4 border-[#1A6B4A] bg-white text-[#1A6B4A] font-mono font-black text-xl px-4 py-1.5 uppercase leading-none tracking-widest text-center shadow-lg select-none">
                        READY
                        <span className="block text-[8px] tracking-tight font-normal text-center mt-0.5">COMPRESSED & COMPLIANT</span>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>

            <div className="mt-4 flex items-center space-x-1 justify-center text-[10px] font-mono text-[#6B6862]">
              <span className="w-2 h-2 rounded-full bg-[#1A6B4A] animate-ping" />
              <span>Realtime browser optimization validation active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Ad Unit 1: Below Hero / Above Workbench */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 my-6 text-center" id="adsense-unit-hero-bottom">
        <div className="text-[10px] font-mono text-[#6B6862]/50 tracking-wider mb-2 uppercase">Advertisement</div>
        <div className="bg-[#FAF9F5] border border-[#DDDAD3] p-4 min-h-[90px] flex items-center justify-center">
          <ins className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client="ca-pub-XXXXXXXXXXXXX"
            data-ad-slot="XXXXXXXXXX"
            data-ad-format="auto"
            data-full-width-responsive="true">
          </ins>
        </div>
      </div>

      {/* 4. Active Interactive Workbench (Col-12, Atelier Zero visual grid) */}
      <main ref={toolsRef} className="bg-white border-y border-[#DDDAD3] py-16 scroll-mt-20" id="main-workbench">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          
          {/* Section heading */}
          <div className="mb-10 text-center lg:text-left">
            <span className="font-mono text-xs text-[#1A6B4A] uppercase tracking-wider block mb-1">Interactive Sandbox Toolsets</span>
            <h2 className="font-display font-bold text-[#0D0D0D] text-3xl md:text-4xl">
              Upload karo. Reject mat ho.
            </h2>
            <p className="font-mono text-xs text-[#6B6862] mt-1">
              Select an offline-running tool below to mold your documents in real-time.
            </p>
          </div>

          {/* Tools switch tabs list */}
          <div className="grid grid-cols-2 md:grid-cols-5 border-t border-[#DDDAD3] mb-8" id="tools-selector-grid">
            {tools.map((t) => {
              const isActive = activeToolId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveToolId(t.id)}
                  className={`py-5 px-4 font-mono text-xs text-center border-b border-[#DDDAD3] cursor-pointer transition-all ${
                    t.id === 'slate-editor' && 'col-span-2 md:col-span-1'
                  } ${
                    isActive 
                      ? 'bg-[#F2F0EA] text-[#0D0D0D] font-bold border-l border-r md:first:border-l-0 border-[#DDDAD3]' 
                      : 'bg-white hover:bg-neutral-50 text-[#6B6862] border-r md:last:border-r-0 border-[#DDDAD3]'
                  }`}
                  id={`sandbox-tab-btn-${t.id}`}
                >
                  <span className="text-xl block mb-1.5">{t.icon}</span>
                  <p className="font-semibold">{t.title}</p>
                  <p className="text-[10px] text-[#6B6862] mt-0.5">{t.description}</p>
                </button>
              );
            })}
          </div>

          {/* Active Tool Loader Panel rendering selected module wrapper */}
          <div className="p-1 md:p-3 bg-[#FBFBFA]" id="active-tool-renderer-box">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeToolId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {activeToolId === 'pdf-compressor' && <PDFCompressor />}
                {activeToolId === 'photo-resizer' && <PhotoResizer />}
                {activeToolId === 'signature-resizer' && <SignatureResizer />}
                {activeToolId === 'pdf-merger' && <PDFMerger />}
                {activeToolId === 'slate-editor' && <SlateEditor />}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* Ad Unit 2: Between Workbench and Process Roadmap */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 my-6 text-center" id="adsense-unit-workbench-bottom">
        <div className="text-[10px] font-mono text-[#6B6862]/50 tracking-wider mb-2 uppercase">Advertisement</div>
        <div className="bg-[#FAF9F5] border border-[#DDDAD3] p-4 min-h-[90px] flex items-center justify-center">
          <ins className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client="ca-pub-XXXXXXXXXXXXX"
            data-ad-slot="XXXXXXXXXX"
            data-ad-format="auto"
            data-full-width-responsive="true">
          </ins>
        </div>
      </div>

      {/* 5. Process Roadmap Steps */}
      <section className="bg-[#F5F2EB]/50 py-16 border-b border-[#DDDAD3]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          
          <div className="text-center md:text-left mb-10">
            <span className="font-mono text-xs text-[#1A6B4A] uppercase tracking-wider block">Simplified Pipeline</span>
            <h2 className="font-display font-medium text-2xl md:text-3xl text-[#0D0D0D] mt-1">
              How browser compliance works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {processSteps.map((step) => {
              const getStepIcon = () => {
                if (step.number === "01") return <Upload className="w-4 h-4 text-[#1A6B4A]" />;
                if (step.number === "02") return <Sliders className="w-4 h-4 text-[#1A6B4A]" />;
                return <Download className="w-4 h-4 text-[#1A6B4A]" />;
              };

              return (
                <div key={step.number} className="bg-white border border-[#DDDAD3] p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-mono text-3xl font-light text-[#1A6B4A]">
                      {step.number}
                    </div>
                    <div className="p-2 bg-[#F5F2EB] border border-[#DDDAD3] rounded-sm flex items-center justify-center">
                      {getStepIcon()}
                    </div>
                  </div>
                  <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-[#0D0D0D] mb-2">{step.title}</h3>
                  <p className="font-sans text-xs text-[#6B6862] leading-relaxed">{step.body}</p>

                  {/* Desktop flow connector line with arrow */}
                  {step.number !== "03" && (
                    <div className="hidden md:flex absolute top-1/2 left-full -translate-y-1/2 w-8 h-8 z-10 items-center justify-center pointer-events-none">
                      <div className="w-8 h-px border-t-2 border-dashed border-[#DDDAD3] absolute left-0" />
                      <div className="absolute w-6 h-6 rounded-full bg-white border border-[#DDDAD3] flex items-center justify-center shadow-sm">
                        <ArrowRight className="w-3 h-3 text-[#1A6B4A]" />
                      </div>
                    </div>
                  )}

                  {/* Mobile flow connector line with arrow */}
                  {step.number !== "03" && (
                    <div className="flex md:hidden absolute left-1/2 top-full -translate-x-1/2 w-8 h-8 z-10 items-center justify-center pointer-events-none">
                      <div className="h-8 w-px border-l-2 border-dashed border-[#DDDAD3] absolute top-0" />
                      <div className="absolute w-6 h-6 rounded-full bg-white border border-[#DDDAD3] flex items-center justify-center shadow-sm">
                        <ArrowDown className="w-3 h-3 text-[#1A6B4A]" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5.5. Frequently Asked Questions (FAQ) Section */}
      <section className="bg-white py-16 border-b border-[#DDDAD3]" id="frequently-asked-questions">
        <div className="max-w-[800px] mx-auto px-4 md:px-8">
          
          <div className="text-center mb-10">
            <span className="font-mono text-xs text-[#1A6B4A] uppercase tracking-wider block font-bold">Aspirant Education</span>
            <h2 className="font-display font-medium text-2xl md:text-3xl text-[#0D0D0D] mt-1 relative inline-block">
              Frequently Asked Questions
              <span className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#1A6B4A]" />
            </h2>
            <p className="text-xs text-[#6B6862] mt-4 font-sans max-w-lg mx-auto leading-relaxed">
              Understand visual rejection mechanics, official file standards, and how our client-side sandbox ensures absolute privacy.
            </p>
          </div>

          <div className="space-y-4 font-sans">
            {faqData.map((faq) => {
              const isOpen = expandedFaqId === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className={`border border-[#DDDAD3] transition-all duration-200 ${
                    isOpen ? 'bg-[#FBFBFA] ring-1 ring-[#1A6B4A]' : 'bg-white hover:bg-[#FBFBFA]/55'
                  }`}
                  id={`faq-item-${faq.id}`}
                >
                  <button
                    onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                    className="w-full text-left p-5 flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="space-y-1.5 pr-2">
                      <span className="inline-block font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 bg-[#F2F0EA] text-[#6B6862] font-bold">
                        {faq.category}
                      </span>
                      <h3 className="font-semibold text-[#0D0D0D] text-sm md:text-base leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                    <div className="mt-1 shrink-0 bg-[#F2F0EA] p-1 border border-[#DDDAD3]">
                      <ChevronDown 
                        className={`w-4 h-4 text-[#6B6862] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#1A6B4A]' : ''}`} 
                      />
                    </div>
                  </button>

                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-[500px] border-t border-[#DDDAD3]' : 'max-h-0'
                    }`}
                  >
                    <div className="p-5 bg-white text-xs text-[#6B6862] leading-relaxed whitespace-pre-line font-normal">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5.6 SEO Content Section (Major Indian Portal Requirements) */}
      <section className="bg-[#FAF9F5] py-16 border-b border-[#DDDAD3]" id="portal-document-sizes-seo">
        <div className="max-w-[1000px] mx-auto px-4 md:px-8 space-y-8 font-sans">
          
          <div className="text-center mb-10">
            <span className="font-mono text-xs text-[#1A6B4A] uppercase tracking-wider block font-bold">Portal Directives</span>
            <h2 className="font-display font-medium text-2xl md:text-3xl text-[#0D0D0D] mt-1 relative inline-block">
              Official Document Size Requirements — Major Indian Portals
              <span className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#1A6B4A]" />
            </h2>
          </div>

          <div className="overflow-x-auto border border-[#DDDAD3] bg-white font-mono text-[11px]" id="seo-requirements-table-wrapper">
            <table className="w-full text-left border-collapse" id="seo-requirements-table">
              <thead>
                <tr className="bg-[#EBE9E3] font-bold border-b border-[#DDDAD3] text-[#0D0D0D]">
                  <th className="p-4 border-r border-[#DDDAD3]">PORTAL / EXAM BODY</th>
                  <th className="p-4 border-r border-[#DDDAD3]">PASSPORT PHOTO LIMIT</th>
                  <th className="p-4 border-r border-[#DDDAD3]">SIGNATURE LIMIT</th>
                  <th className="p-4">ACADEMIC / SUPPORTING PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F1EC] text-[#6B6862]">
                <tr className="hover:bg-neutral-50 flex-col md:table-row">
                  <td className="p-4 border-r border-[#DDDAD3] font-bold text-[#0D0D0D]">UPSC (Union Public Service Commission)</td>
                  <td className="p-4 border-r border-[#DDDAD3]">20 KB to 50 KB (JPG, strict 350x350 - 1000x1000 pixels)</td>
                  <td className="p-4 border-r border-[#DDDAD3]">10 KB to 20 KB (JPG only)</td>
                  <td className="p-4">Under 1 MB (Certificates, PDF only)</td>
                </tr>
                <tr className="hover:bg-neutral-50 bg-[#FBFBFA] flex-col md:table-row">
                  <td className="p-4 border-r border-[#DDDAD3] font-bold text-[#0D0D0D]">SSC (Staff Selection Commission)</td>
                  <td className="p-4 border-r border-[#DDDAD3]">20 KB to 50 KB (JPEG, 3.5cm x 4.5cm, aspect ratio)</td>
                  <td className="p-4 border-r border-[#DDDAD3]">10 KB to 20 KB (JPEG, 4.0cm x 2.0cm)</td>
                  <td className="p-4">— (N/A on major entries)</td>
                </tr>
                <tr className="hover:bg-neutral-50 flex-col md:table-row">
                  <td className="p-4 border-r border-[#DDDAD3] font-bold text-[#0D0D0D]">IBPS (CWE Banking Exams PO/Clerk)</td>
                  <td className="p-4 border-r border-[#DDDAD3]">20 KB to 50 KB (JPG, 200 x 230 pixels)</td>
                  <td className="p-4 border-r border-[#DDDAD3]">10 KB to 20 KB (JPG, 140 x 60 pixels)</td>
                  <td className="p-4">Under 500 KB (Left thumb / Declaration PDF)</td>
                </tr>
                <tr className="hover:bg-neutral-50 bg-[#FBFBFA] flex-col md:table-row">
                  <td className="p-4 border-r border-[#DDDAD3] font-bold text-[#0D0D0D]">SBI PO / Clerk Applications</td>
                  <td className="p-4 border-r border-[#DDDAD3]">20 KB to 50 KB (JPG format)</td>
                  <td className="p-4 border-r border-[#DDDAD3]">15 KB to 20 KB (JPG format)</td>
                  <td className="p-4">Under 500 KB (Declaration PDFs)</td>
                </tr>
                <tr className="hover:bg-neutral-50 flex-col md:table-row">
                  <td className="p-4 border-r border-[#DDDAD3] font-bold text-[#0D0D0D]">NTA / NEET & JEE Entrances</td>
                  <td className="p-4 border-r border-[#DDDAD3]">10 KB to 200 KB (Postcard/Passport JPG)</td>
                  <td className="p-4 border-r border-[#DDDAD3]">4 KB to 30 KB (JPG only)</td>
                  <td className="p-4">10 KB to 300 KB (Caste/ID Category PDFs)</td>
                </tr>
                <tr className="hover:bg-neutral-50 bg-[#FBFBFA] flex-col md:table-row">
                  <td className="p-4 border-r border-[#DDDAD3] font-bold text-[#0D0D0D]">Indian Passport & Visa Services</td>
                  <td className="p-4 border-r border-[#DDDAD3]">Under 1 MB (350x350px min, JPG format)</td>
                  <td className="p-4 border-r border-[#DDDAD3]">Under 1 MB (JPG format)</td>
                  <td className="p-4">Under 1 MB (Supporting Certificates - Flat PDFs)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-xs text-[#6B6862] leading-relaxed space-y-4 font-normal font-sans">
            <p>
              Applying for central and state government jobs in India presents unique administrative friction, specifically during the initial online portal profile creation. Many candidate submissions are discarded because of document sizing errors. Automatic image parsers do not allow even a single-byte variation beyond the rigid thresholds set by organizations like the <strong>Staff Selection Commission (SSC)</strong> or the <strong>Union Public Service Commission (UPSC)</strong>. Often, candidates scan their photo only to realize that their pristine 4.5 MB mobile phone photograph is strictly blocked by the 50 KB file payload limit.
            </p>
            <p>
              This is where <strong>GetDocReady</strong> rescues your registration timeline. Traditional resizing applications are bloated with tracking algorithms, ads, and require files to be uploaded to remote cloud processing endpoints. GetDocReady utilizes native, client-side, browser-based mathematical processors to calculate optimal compression weights in real-time. By applying local binary-search canvas compression algorithms, our system iterates image parameters within milliseconds to compress your passport photograph to strictly under 50 KB while preserving structural legibility and pixel counts.
            </p>
            <p>
              In addition, complex requirements like signature pen-scale levels, the UPSC/SSC name-and-date overlay (often referred to as the "Slate Photo rule"), and multi-page matriculation scroll mergers can be resolved directly inside our tool workspace. Every operation completes inside the secure sandbox of your local browser RAM. By operating without remote servers, your sensitive Aadhaar cards, passbooks, and identification certificates are kept completely private and protected against database breaches or third-party tracking.
            </p>
            <p>
              We provide the highest possible standards of speed and modern web design, packaged inside an open-source, non-custodial utility platform. Whether you are navigating bank recruitments, defense entrances, or higher educational allocations, GetDocReady formats your paperwork efficiently so you can focus entirely on your syllabus.
            </p>
          </div>

        </div>
      </section>

      {/* Ad Unit 3: Above Footer */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 my-10 text-center" id="adsense-unit-footer-top">
        <div className="text-[10px] font-mono text-[#6B6862]/50 tracking-wider mb-2 uppercase">Advertisement</div>
        <div className="bg-[#FAF9F5] border border-[#DDDAD3] p-4 min-h-[90px] flex items-center justify-center">
          <ins className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client="ca-pub-XXXXXXXXXXXXX"
            data-ad-slot="XXXXXXXXXX"
            data-ad-format="auto"
            data-full-width-responsive="true">
          </ins>
        </div>
      </div>
      </>
    ) : (
      /* Privacy Policy View Component */
      <div className="max-w-[800px] mx-auto px-4 md:px-8 py-12 md:py-16 font-sans" id="privacy-policy-view">
        <button 
          onClick={() => {
            setActiveView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
          className="mb-8 px-4 py-2 border border-[#0D0D0D] bg-white text-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white transition-all text-xs font-mono uppercase tracking-wider cursor-pointer font-bold inline-flex items-center"
        >
          ← Back to Workbench
        </button>
        
        <div className="bg-white border border-[#DDDAD3] p-6 md:p-10 space-y-8 shadow-sm">
          <div className="space-y-3">
            <span className="font-mono text-xs text-[#1A6B4A] uppercase tracking-wider block font-bold">Trust & Integrity Statement</span>
            <h1 className="font-display font-medium text-3xl md:text-4xl text-[#0D0D0D] leading-tight">Privacy Policy</h1>
            <div className="w-16 h-0.5 bg-[#1A6B4A]" />
            <p className="text-xs font-mono text-[#6B6862]">Last updated: June 2026</p>
          </div>

          <div className="p-4 bg-[#FAF9F5] border border-[#E1DEC9] font-mono text-xs text-[#1A6B4A] font-semibold">
            🔒 SUMMARY STATEMENT: GetDocReady is built with an uncompromising local-first focus. We do not transmit, read, inspect, store, or sell any document, photograph, or signature file that you process. Every computation happens strictly in your browser.
          </div>

          <article className="space-y-6 text-xs text-[#6B6862] leading-relaxed font-normal">
            <section className="space-y-2">
              <h2 className="font-display font-semibold text-lg text-[#0D0D0D] uppercase tracking-tight">1. What Data We Collect</h2>
              <p>
                We do not collect any personal identity information. Because all photo resizing, cropping, signature pen scaling, and PDF document compression execute entirely inside your local device's temporary memory (RAM), no files are ever sent to a remote cloud or persistent server. 
              </p>
              <p>
                We do check standard anonymous usage tracking (via web page impressions) and performance metrics, but your submitted files never touch our infrastructure.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display font-semibold text-lg text-[#0D0D0D] uppercase tracking-tight">2. How Documents Are Processed</h2>
              <p>
                All operations are completed 100% client-side:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Image compression and scaling:</strong> Implemented via HTML5 Canvas rendering logic directly on your viewport processor.</li>
                <li><strong>PDF compressing and merging:</strong> Handles in-memory array manipulation using local scripts (dynamic compilation of modern local WASM/JS structures), avoiding any secondary backend endpoints.</li>
                <li><strong>Text and slate printing:</strong> Completed totally locally over client-side font engines.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-display font-semibold text-lg text-[#0D0D0D] uppercase tracking-tight">3. Cookies & Analytics</h2>
              <p>
                We employ standard web performance markers and Google AdSense advertisement codes which serve relevant ad campaigns on this portal. These advertisements help us run the hosting services free of charge forever without requiring gatekeeping paywalls.
              </p>
              <p>
                These networks use third-party cookies to track anonymous traffic trends. Our site does not leverage cookies to log your private transactions, files, or demographic profiles.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display font-semibold text-lg text-[#0D0D0D] uppercase tracking-tight">4. Third-Party Services</h2>
              <p>
                This website serves Google AdSense advertisement blocks. Google's use of advertising cookies enables it and its partners to serve ads based on your visits to this and other sites on the internet. You may opt out of personalized advertising by visiting the Google Ads Settings page or relative network authorities.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display font-semibold text-lg text-[#0D0D0D] uppercase tracking-tight">5. Contact and Operational Office</h2>
              <p>
                If you have further inquiries about the local sandbox mechanics or developer credentials, you may contact the operational team via email at: 
                <strong> <a href="mailto:support@getdocready.in" className="text-[#1A6B4A] underline font-mono">support@getdocready.in</a></strong>.
              </p>
            </section>
          </article>
        </div>
      </div>
    )}

      {/* 6. Footer section (Minimalist architectural specifications specs) */}
      <footer className="bg-[#0D0D0D] text-[#F5F2EB] pt-14 pb-12 font-mono text-xs">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#DDDAD3]/10">
            
            {/* Col 1 */}
            <div className="space-y-4">
              <div className="tracking-tight text-base">
                <span className="font-light">get</span>
                <span className="font-bold">doc</span>
                <span className="font-light text-[#1A6B4A]">ready</span>
              </div>
              <p className="text-[11px] text-[#DDDAD3]/60 leading-relaxed font-sans font-normal">
                An essential candidate utility to format candidate documents and photographs for error-free Indian exam registration submission. Stays private on customer hardware.
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase text-[#1A6B4A] font-bold block mb-1.5">Offline Tools</span>
              <ul className="space-y-1 text-[#DDDAD3]/70 font-sans font-medium">
                <li>
                  <button onClick={() => handleToolSelect('pdf-compressor')} className="hover:text-white cursor-pointer transition-all">
                    📄 PDF Size Compressor
                  </button>
                </li>
                <li>
                  <button onClick={() => handleToolSelect('photo-resizer')} className="hover:text-white cursor-pointer transition-all">
                    🖼️ Photo Resizer & Customizer
                  </button>
                </li>
                <li>
                  <button onClick={() => handleToolSelect('signature-resizer')} className="hover:text-white cursor-pointer transition-all">
                    ✍️ Signature Pen Scale Resizer
                  </button>
                </li>
                <li>
                  <button onClick={() => handleToolSelect('pdf-merger')} className="hover:text-white cursor-pointer transition-all">
                    🗂️ Academic Credentials Merger
                  </button>
                </li>
                <li>
                  <button onClick={() => handleToolSelect('slate-editor')} className="hover:text-white cursor-pointer transition-all">
                    🏷️ Candidate Name Slate Overlay
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase text-[#1A6B4A] font-bold block mb-1.5">Privacy Parameters</span>
              <div className="space-y-1.5 font-sans font-medium text-[#DDDAD3]/70 text-[11px] leading-relaxed">
                <p>No storage registers: All files processed strictly inside temporary browser memories.</p>
                <button 
                  onClick={() => alert("This engine operates 100% locally on your computer. You can turn off your internet completely and all resizer and compressor functions will continue to run flawlessly because zero backend servers are reached!")}
                  className="text-[#1A6B4A] hover:underline font-mono text-[10px]"
                >
                  Verify Offline Mechanics →
                </button>
              </div>
            </div>

            {/* Col 4 */}
            <div className="space-y-3 font-sans">
              <span className="text-[11px] font-mono uppercase text-[#1A6B4A] font-bold block">Developer Notice</span>
              <p className="text-[11px] text-[#DDDAD3]/50 leading-relaxed font-normal">
                Designed to rescue national sarkari aspirants from portal constraints. Handcrafted following Atelier Zero design frameworks.
              </p>
              <div className="text-[10px] font-mono text-[#DDDAD3]/30">
                Lat: 28.6139° N, Lon: 77.2090° E (New Delhi, IN)
              </div>
            </div>
          </div>

          {/* Symmetrical Footnote */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[#DDDAD3]/40 text-[10px] font-mono leading-none">
            <p>© 2026 GetDocReady Inc. All rights reserved locally on client browser.</p>
            <div className="mt-2 md:mt-0 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <button 
                onClick={() => {
                  setActiveView('privacy');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className="hover:text-white underline cursor-pointer focus:outline-none"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => setIsAboutOpen(true)} 
                className="hover:text-white underline cursor-pointer focus:outline-none"
              >
                About Us
              </button>
              <button 
                onClick={() => setIsContactOpen(true)} 
                className="hover:text-white underline cursor-pointer focus:outline-none"
              >
                Contact Us
              </button>
              <span>Works best on Chrome/Firefox with high contrast layouts.</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Cookie Consent Banner */}
      {!cookieConsentGranted && (
        <div className="fixed bottom-0 inset-x-0 z-[100] bg-[#0d0d0d] text-[#F5F2EB] border-t border-[#DDDAD3]/20 py-4 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_-10px_25px_rgba(0,0,0,0.15)] font-mono text-[11px]" id="cookie-consent-banner">
          <div className="flex items-center space-x-2">
            <span className="text-[#1A6B4A] shrink-0 text-base">🍪</span>
            <p className="leading-normal font-sans font-normal text-[#DDDAD3]">
              We use essential Google AdSense cookies to support this free exam utility. Every file operation executes 100% locally in your secure sandboxed browser RAM. No personal identifiers are stored.
            </p>
          </div>
          <div className="flex items-center space-x-4 shrink-0">
            <button 
              onClick={() => {
                setActiveView('privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[#DDDAD3]/70 hover:text-white underline cursor-pointer"
            >
              Read Privacy Policy
            </button>
            <button 
              onClick={() => {
                localStorage.setItem('gdpr_consent_granted', 'true');
                setCookieConsentGranted(true);
              }}
              className="px-4 py-2 bg-[#1A6B4A] hover:bg-[#124f35] text-white font-bold uppercase transition-all whitespace-nowrap cursor-pointer rounded-sm"
            >
              Accept & Close
            </button>
          </div>
        </div>
      )}

      {/* About Modal */}
      <AnimatePresence>
        {isAboutOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans" id="about-us-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white border border-[#0D0D0D] w-full max-w-lg p-6 md:p-8 text-[#0D0D0D] shadow-2xl rounded-sm"
            >
              <button 
                onClick={() => setIsAboutOpen(false)}
                className="absolute top-4 right-4 p-1.5 border border-[#DDDAD3] hover:border-[#0D0D0D] hover:bg-neutral-100 transition-all cursor-pointer font-mono text-xs"
                id="close-about-modal"
              >
                ✕
              </button>
              <div className="space-y-4">
                <span className="font-mono text-xs text-[#1A6B4A] uppercase tracking-wider block font-bold">GetDocReady Mission</span>
                <h2 className="font-display font-medium text-2xl md:text-3xl text-[#0D0D0D]">
                  Empowering Exam Aspirants
                </h2>
                <div className="w-12 h-0.5 bg-[#1A6B4A]" />
                
                <div className="text-xs text-[#6B6862] leading-relaxed space-y-3 font-normal">
                  <p>
                    GetDocReady is built specifically to address the file rejection struggles faced by millions of Indian competitive exam aspirants every year.
                  </p>
                  <p>
                    Whether you are applying for <strong>UPSC IAS/IFS, SSC CGL/CHSL, IBPS Bank Clerk/PO, NTA NEET/JEE, SBI, or foreign visa applications</strong>, registration portals strictly enforce size limits and exact pixel resolutions that are highly frustrating to satisfy.
                  </p>
                  <p>
                    We solve this with a <strong>100% free, 100% private, client-side editor</strong> built entirely in New Delhi, India. No account setup required, no paywalls, no watermark stains, and absolutely <strong>zero file uploads</strong> to secure your private identity profile.
                  </p>
                </div>
                <button 
                  onClick={() => setIsAboutOpen(false)}
                  className="w-full text-center py-3 bg-[#0D0D0D] hover:bg-neutral-800 text-white font-mono text-xs uppercase tracking-wider font-semibold border border-[#0D0D0D] cursor-pointer"
                >
                  Back to Workbench
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <AnimatePresence>
        {isContactOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans" id="contact-us-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white border border-[#0D0D0D] w-full max-w-lg p-6 md:p-8 text-[#0D0D0D] shadow-2xl rounded-sm"
            >
              <button 
                onClick={() => setIsContactOpen(false)}
                className="absolute top-4 right-4 p-1.5 border border-[#DDDAD3] hover:border-[#0D0D0D] hover:bg-neutral-100 transition-all cursor-pointer font-mono text-xs"
                id="close-contact-modal"
              >
                ✕
              </button>
              <div className="space-y-4">
                <span className="font-mono text-xs text-[#1A6B4A] uppercase tracking-wider block font-bold">Support Desk</span>
                <h2 className="font-display font-medium text-2xl md:text-3xl text-[#0D0D0D]">
                  Get In Touch
                </h2>
                <div className="w-12 h-0.5 bg-[#1A6B4A]" />
                
                <p className="text-xs text-[#6B6862] leading-relaxed font-normal">
                  Have questions, feedback, or portal update requests? Drop us a line. We typically reply within 24 hours.
                </p>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const name = formData.get('userName');
                    const email = formData.get('userEmail');
                    const message = formData.get('userMessage');
                    window.location.href = `mailto:support@getdocready.in?subject=GetDocReady Support Query from ${name}&body=From: ${name} (${email})%0D%0A%0D%0A${message}`;
                    setIsContactOpen(false);
                  }}
                  className="space-y-3 font-mono text-[11px]"
                >
                  <div>
                    <label className="block mb-1 text-[#6B6862] uppercase tracking-tight">Full Name</label>
                    <input 
                      required 
                      type="text" 
                      name="userName" 
                      placeholder="Rajesh Kumar" 
                      className="w-full p-2.5 bg-neutral-50 border border-[#DDDAD3] focus:border-[#1A6B4A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[#6B6862] uppercase tracking-tight">Email Address</label>
                    <input 
                      required 
                      type="email" 
                      name="userEmail" 
                      placeholder="rajesh@gmail.com" 
                      className="w-full p-2.5 bg-neutral-50 border border-[#DDDAD3] focus:border-[#1A6B4A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[#6B6862] uppercase tracking-tight">Your Message</label>
                    <textarea 
                      required 
                      rows={3} 
                      name="userMessage" 
                      placeholder="How can we help you prepare your document?" 
                      className="w-full p-2.5 bg-neutral-50 border border-[#DDDAD3] focus:border-[#1A6B4A] focus:outline-none font-sans text-xs"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      type="submit"
                      className="w-full text-center py-3 bg-[#1A6B4A] hover:bg-[#124f35] text-white uppercase text-xs font-bold tracking-wider cursor-pointer border border-[#1A6B4A]"
                    >
                      Send Message via Mail App
                    </button>
                  </div>
                  
                  <div className="text-center text-[10px] text-[#6B6862] font-sans">
                    Direct support mailbox: <a href="mailto:support@getdocready.in" className="text-[#1A6B4A] underline">support@getdocready.in</a>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
