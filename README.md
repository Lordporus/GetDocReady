# GetDocReady — Free Indian Document Compliance Suite

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Status: Live](https://img.shields.io/badge/Status-Live-brightgreen)
![Made in India](https://img.shields.io/badge/Made%20in-India-orange)
![Privacy: 100% Local](https://img.shields.io/badge/Privacy-100%25%20Local-blue)

---

## About

GetDocReady is a free, privacy-first document compliance tool built for Indian exam aspirants. Helps UPSC, SSC, IBPS, NTA, and visa applicants compress PDFs, resize photos, and format signatures to exact portal requirements — 100% client-side, zero server uploads.

---

## Live Demo

🌐 [getdocready.in](https://getdocready.in)

---

## Screenshots

![Hero Section](./screenshots/hero.png)
![Tools Section](./screenshots/tools.png)

---

## Features

- 📄 PDF Compressor — Target any KB limit (100KB, 300KB, 500KB)
- 🖼️ Photo Resizer — Exact pixel + KB targeting with aspect lock
- ✍️ Signature Resizer — UPSC, SSC, IBPS spec presets built-in
- 🗂️ PDF Merger — Combine multiple docs client-side
- 🏷️ SSC Slate Editor — Name + date overlay for exam photos
- ✅ Compliant Stamp — Live PASS/FAIL indicator on every output

---

## Why GetDocReady?

| Problem | GetDocReady Solution |
|---------|---------------------|
| Govt portals reject photos | Exact KB + pixel targeting |
| PDF too large to upload | Binary-search compression engine |
| Signature too faint | Contrast accelerator filter |
| Multiple docs to combine | Client-side PDF merger |
| SSC slate requirement | Auto slate generator |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS |
| PDF Processing | pdf-lib.js (client-side) |
| Image Processing | HTML5 Canvas API |
| Hosting | Cloudflare Pages |
| Domain | getdocready.in |

---

## Privacy & Security

All document processing happens entirely inside the user's browser using HTML5 Canvas and pdf-lib.
No files are ever uploaded to any server.
No user data is collected or stored.
Works 100% offline after initial page load.

---

## Local Development

```bash
git clone https://github.com/YOUR_USERNAME/getdocready.git
cd getdocready
npm install
npm run dev
```

---

## Deployment

Hosted on Cloudflare Pages.
Build command: `npm run build`
Output directory: `dist`

---

## License

MIT License — Free to use and modify.

---

## Author

Built with ♥ in India.
For support: support@getdocready.in
