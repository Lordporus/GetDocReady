/**
 * Types and presets for GetDocReady
 */

export interface ActiveTool {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  body: string;
}

export interface PresetSpecification {
  id: string;
  name: string;
  portal: string;
  width: number;
  height: number;
  minKB: number;
  maxKB: number;
  helpText: string;
}

export const SIGNATURE_PRESETS: PresetSpecification[] = [
  {
    id: "upsc-sig",
    name: "UPSC Standard Signature",
    portal: "UPSC Online Portal",
    width: 350,
    height: 350,
    minKB: 20,
    maxKB: 300,
    helpText: "350x350 pixels, size must be between 20KB and 300KB."
  },
  {
    id: "ssc-sig",
    name: "SSC Standard Signature",
    portal: "Staff Selection Commission",
    width: 280,
    height: 120,
    minKB: 10,
    maxKB: 20,
    helpText: "280x120 pixels, size must be between 10KB and 20KB. Extremely strict threshold."
  },
  {
    id: "ibps-sig",
    name: "IBPS Clerk/PO Signature",
    portal: "IBPS Portal",
    width: 140,
    height: 60,
    minKB: 10,
    maxKB: 20,
    helpText: "140x60 pixels, size must be between 10KB and 20KB."
  },
  {
    id: "passport-photo-sig",
    name: "General Passport Visa Signature",
    portal: "Sarkari/Visa Portals",
    width: 300,
    height: 100,
    minKB: 10,
    maxKB: 50,
    helpText: "300x100 pixels, standard signature resizing for general use."
  }
];

export const PHOTO_PRESETS: PresetSpecification[] = [
  {
    id: "upsc-photo",
    name: "UPSC Photo Spec",
    portal: "Union Public Service Commission",
    width: 350,
    height: 350,
    minKB: 20,
    maxKB: 300,
    helpText: "350x350 pixels, size 20KB-300KB. Ensure face covers 3/4th of space."
  },
  {
    id: "ssc-photo",
    name: "SSC Photo Spec (With Slate)",
    portal: "Staff Selection Commission",
    width: 350,
    height: 450,
    minKB: 20,
    maxKB: 50,
    helpText: "3.5cm x 4.5cm (350x450 px), size 20KB-50KB. Name and date printed at bottom highly recommended."
  },
  {
    id: "ibps-photo",
    name: "IBPS Photo Spec",
    portal: "Institute of Banking Personnel Selection",
    width: 350,
    height: 450,
    minKB: 20,
    maxKB: 50,
    helpText: "4.5cm x 3.5cm (350x450 px), file size 20KB to 50KB."
  },
  {
    id: "pancard-photo",
    name: "PAN Card / NSDL Photo Spec",
    portal: "Income Tax Dept / NSDL",
    width: 200,
    height: 200,
    minKB: 10,
    maxKB: 20,
    helpText: "211x211 pixels (or 200x200), max 20KB. Highly strict DPI restriction."
  }
];
