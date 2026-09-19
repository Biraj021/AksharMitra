# ✨ AksharMitra (अक्षर मित्र)

> **Gamified, Non-Stigmatizing Early Dyslexia Risk-Screening & Adaptive Phonics Learning Companion**  
> *Built for Hacksynthesis UEM 30-Hour Hackathon*

---

## 🌟 Overview

**AksharMitra** is an offline-first, student-centric Progressive Web App (PWA) designed to provide early, playful, and non-stigmatizing dyslexia risk identification alongside targeted phonics remediation. 

Instead of clinical assessment sheets that cause anxiety in young children, AksharMitra embeds diagnostic markers directly into joyful mini-quests guided by **Mitra**, an interactive companion mascot.

---

## 🚀 Key Features

### 🔍 1. Stealth Screening Quests (Phase 2)
1. **🎨 Quest 1: Letter Tracing ("Akshar Rekha")**
   - Interactive HTML5 Canvas tracing with magnetic waypoint dots and uniform brush stroke mechanics.
   - Comprehensive A–Z letter carousel with special graphomotor tracking for mirror confusion letters (**b**, **d**, **p**, **q**).
   - Multi-stroke letter support (**i**, **j**, **t**, **x**, **f**).

2. **📖 Quest 2: Read Aloud Fluency ("Bol Mitra Bol")**
   - Real-time continuous speech-to-text recognition via native Web Speech API.
   - Real-time karaoke-style word-by-word highlighting as the child reads aloud.
   - Forgiving dual-path phonemic token matcher supporting child accents, speech approximations, and repetitions.
   - Tap-to-pronounce audio fallback and offline Sing-Along Auto Demo mode.

3. **🎵 Quest 3: Rhyme Magic ("Dhwani Shikaar")**
   - Auditory phonological awareness testing rhyming endings (*Cat/Hat*, *Frog/Dog*, *Star/Car*, *Bed/Red*).
   - Automated natural voice narration on start and puzzle transitions.

4. **🧭 Quest 4: Sound Safari (Phoneme Isolation)**
   - Initial letter-sound odd-one-out discrimination (*B, S, M, D*).
   - Tap-to-pronounce cards, celebratory star awards, and gentle phonetic hints.

---

### 🎮 2. Adaptive Remediation Games Zone (Phase 3)
1. **🧩 Word Snapper (Phonics & Matra Tile Builder)**
   - Drag-and-drop / tap-to-place magnetic letter tile builder for targeted words.
   - Visual confusion highlighting for *b/d/p/q* letters with friendly mnemonic cues.
   - Real-time speech blending as tiles snap into slots.

2. **🎯 Letter Hunter (Visual Discrimination Grid)**
   - Rapid spotting grid challenging deceptive letter orientations (*b vs d*, *p vs q*, *m vs w*, *n vs u*).
   - Combo multiplier badges, gentle mistake animations, and celebratory reward fanfares.

---

## 🧠 Dyslexia-Friendly Sensory Design System

- **Typography**: Google Fonts (*Lexend* & *Inter*) — wider apertures, heavier baselines, and distinct asymmetrical stems to reduce mirror confusion.
- **Sensory Color Palette**: Warm creams (`#FAF8F2`), soothing indigo (`#4F46E5`), joyful amber (`#F59E0B`), and soft emerald (`#10B981`) — eliminating harsh black-on-white contrast.
- **Gentle Failure UX**: Zero red crossbars, zero harsh penalty buzzers; positive reinforcement and scaffolding at all times.
- **Child-First Touch Targets**: 48px–72px touch boundaries tailored for small hands.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | **React 18 + Vite 6** | Component-driven UI with instant HMR and lightweight bundle |
| **Styling** | **Modern Vanilla CSS** | Custom design tokens, glassmorphism, responsive flex/grid |
| **Audio Synthesizer** | **Web Audio API** | Zero-latency on-device oscillator chimes, pops, and fanfares |
| **Speech Engine** | **Web Speech API & TTS** | On-device continuous streaming speech-to-text & narration |
| **Canvas Graphics** | **HTML5 Canvas 2D** | Real-time stroke vector analysis & magnetic tracing |
| **PWA & Offline** | **Service Worker & Manifest** | Fullscreen mobile/tablet installability and offline caching |
| **Particles** | **Canvas Confetti** | Hardware-accelerated reward confetti bursts |
| **Icons** | **Lucide React** | Clean, accessible SVG iconography |

---

## 💻 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- `npm` (comes with Node.js)

### Installation & Run
```bash
# 1. Clone the repository
git clone https://github.com/Biraj021/AksharMitra.git
cd AksharMitra

# 2. Install dependencies
npm install

# 3. Start the local development server
npm run dev
```

Open [http://localhost:3000/](http://localhost:3000/) in your browser (Google Chrome or Microsoft Edge recommended for Web Speech API).

### Production Build
```bash
npm run build
```

---

## 🏆 Hackathon Demo Highlights

1. **Zero External API Dependencies**: No paid cloud API keys or backend servers needed — runs 100% client-side with zero latency.
2. **Instant Judge Demo Flow**: Fast non-linear pill navigation allows judges to inspect any quest or game in seconds.
3. **Multi-Student Profiles**: Seamless 1-click child onboarding and profile switcher.

---

## 👥 Team
*Developed with ❤️ for Hacksynthesis UEM 30-Hour Hackathon.*