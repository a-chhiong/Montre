# 📽️ Montre
> **Modern Marp-Superset Presentation Engine & Slide Viewer**  
> *100% Client-Side Pure Web Architecture • Zero-Backend Offline Sharing (#data/blah) • Zero-Crop Responsive Stage • Dual Vector Engines (Mermaid + Pure In-Browser PlantUML)*

[![CI/CD & Deploy to GitHub Pages](https://github.com/a-chhiong/Montre/actions/workflows/deploy.yml/badge.svg)](https://github.com/a-chhiong/Montre/actions/workflows/deploy.yml)
[![Version: v1.0.0](https://img.shields.io/badge/version-v1.0.0-emerald.svg)](./web/package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

---

## 🌟 What is Montre?

**Montre** (French for *to show / exhibit / watch*) is a modern, high-performance, client-side presentation engine designed to decouple Markdown slide **Authoring (DX)** from **Presentation Runtime (UX)**.

While standard Marp Markdown slides are written in familiar tools (such as VS Code), Montre replaces the rigid SVG runtime with a **Cinema-Grade interactive Web experience**:

* 🔗 **Zero-Backend Offline Slide Sharing (`#data/<payload>`)**: Instantly exchange and present slide decks without hosting Markdown files or running a backend server. Uses browser-native W3C `CompressionStream('deflate-raw')` and URL-safe Base64URL encoding (achieving **30%–70% compression**).
* 📱 **Full Mobile RWD & Touch Gestures**: Complete Responsive Web Design (RWD) with horizontal touch-swipe slide flipping, two-finger diagram pinch-to-zoom, fluid typography, and compact bottom pagination pill.
* 🧭 **Slide-Over Right Drawer Navigation**: A unified, spacious header bar across all viewports (desktop, laptop, tablet, mobile) with a sleek slide-over drawer from the right edge for theme switching, file loading, zoom presets, and keyboard shortcuts.
* 🚀 **Zero-Crop Responsive Viewport**: Automatically centers dense tables, multi-column cards, and diagrams without truncation.
* 📊 **Dual In-Browser Vector Engines**: On-demand rendering for **Mermaid.js** and **PlantUML** (via `@plantuml/core`, 100% in-browser with zero server or Java dependencies).
* 🖐️ **Frosted-Glass Vector Lightbox Inspector**: Click any diagram to inspect it with trackpad 1:1 two-finger pan, mobile touch gestures, and pinch-to-zoom (`0.4x` to `6.0x`).
* 🔍 **3-Level Projector Scaling (<kbd>Z</kbd> Toggle)**: Instantly cycle scale (`100%` $\rightarrow$ `115%` $\rightarrow$ `130%`) to adapt to meeting rooms, projectors, or 4K auditorium screens.
* 📂 **5-Tier Zero-Friction Ingestion**:
  1. Offline shared URL hash (`#data/<payload>`)
  2. Remote URL query parameter (`?url=...`)
  3. Native File Picker (`📂 開啟檔案`)
  4. Drag & drop `.md` overlay
  5. LocalStorage cached deck / Bundled default showcase deck

---

## 🏛️ Frontend 3-Layer Clean Architecture

Montre strictly adheres to **Clean Architecture** principles with inward dependency rules:

```mermaid
flowchart TB
    subgraph UI_Layer ["1. UI & Viewport Layer (Lit 3.x + Shadow DOM + Web Components)"]
        App["<montre-app><br/>Shell Root"]
        TopNav["<montre-top-nav><br/>Header Bar + Right Drawer"]
        Viewport["<montre-viewport><br/>Zero-Crop Stage"]
        Slide["<montre-slide><br/>On-Demand Slide"]
        Pill["<montre-floating-pill><br/>Bottom Progress Pill"]
        Lightbox["<montre-svg-lightbox><br/>Frosted Modal Inspector"]
        ShareModal["<montre-share-modal><br/>Offline #data/ URL Generator"]
        Controllers["Lit ReactiveControllers<br/>ShareController • TouchSwipeController • LightboxGesturesController"]
    end

    subgraph Domain_Layer ["2. Pure Domain Layer (Pure TS — Zero DOM & Zero I/O)"]
        Models["Domain Models & Value Objects<br/>SlideDeck • SlideNode • ThemeConfig • ZoomLevel • LightboxTransform"]
        UseCases["Pure Domain Use-Cases<br/>compressDeck() • decompressDeck() • parseDeck()<br/>navigateSlide() • switchTheme() • cycleZoom() • transformLightbox()"]
    end

    subgraph Data_Layer ["3. Data Layer (Repositories & Multi-Source Adapters)"]
        Repo["ISlideRepository Contract & Facade"]
        Sources["Data Sources<br/>• HashDataSource (#data/ payload)<br/>• Native File Picker (0ms)<br/>• Drag & Drop Overlay<br/>• Remote ?url= HTTP Fetch<br/>• LocalStorage Cache"]
    end

    UI_Layer -->|"Observe & Dispatch"| Domain_Layer
    UI_Layer -->|"Load & Persist"| Data_Layer
    Domain_Layer -->|"Contracts & Entities"| Data_Layer
```

---

## ⌨️ Presenter Keyboard & Gesture Shortcuts

| Key / Gesture | Action | Note |
| :--- | :--- | :--- |
| <kbd>→</kbd> / <kbd>Space</kbd> / <kbd>PageDown</kbd> / <kbd>Enter</kbd> | **Next Slide** | Fully compatible with wireless presenter clickers |
| <kbd>←</kbd> / <kbd>PageUp</kbd> / <kbd>Backspace</kbd> | **Previous Slide** | Reverse slide navigation |
| <kbd>Swipe Left</kbd> / <kbd>Swipe Right</kbd> | **Next / Prev Slide** | Touch gesture on mobile phones and tablets |
| <kbd>Home</kbd> / <kbd>End</kbd> | **First / Last Slide** | Jump directly to boundaries |
| <kbd>F</kbd> | **Toggle Fullscreen** | Immersive theater presentation mode |
| <kbd>T</kbd> | **Toggle Theme** | ☀️ Radiant Light $\leftrightarrow$ 🌙 Sleek Dark |
| <kbd>Z</kbd> | **Cycle Projector Scale** | 100% $\rightarrow$ 115% $\rightarrow$ 130% |
| <kbd>Esc</kbd> | **Close Lightbox / Drawer / Modal** | Dismiss any active inspector, drawer, or share dialog |
| <kbd>Pinch</kbd> / <kbd>Drag</kbd> | **Pan & Zoom Diagram** | 1:1 trackpad or touch inspection in Lightbox mode |

---

## 🛠️ Quick Start & Local Development

### Prerequisites
* Node.js $\ge 20.0.0$ (Node.js 24 LTS recommended)
* npm $\ge 10.0.0$

### Setup & Run
```bash
# Navigate to web application directory
cd web

# Install dependencies
npm install

# Run pure TypeScript domain and router unit tests (27 tests)
npm run test

# Start local development server (with HMR)
npm run dev

# Build production static bundle
npm run build
```

---

## 🚀 Automated CI/CD & Deployment

This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically:
1. Installs dependencies and runs Vitest unit tests.
2. Compiles TypeScript and builds the optimized production static bundle.
3. Deploys directly to **GitHub Pages** on every push to the `main` branch.

---

## 📄 License

MIT License © 2026 [T.C. Lee (a-chhiong)](https://github.com/a-chhiong)
