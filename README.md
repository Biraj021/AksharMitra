# ✨ AksharMitra (अक्षर मित्र)

> **Gamified, Non-Stigmatizing Early Dyslexia Risk-Screening & Adaptive Multilingual Phonics Learning Companion**  
> *Built for Hacksynthesis UEM 30-Hour Hackathon*

---

## 🌟 Overview

**AksharMitra** is an offline-first, student-centric Progressive Web App (PWA) designed to provide early, playful, and non-stigmatizing literacy screening alongside targeted phonics and graphomotor remediation across **English**, **Bengali (বাংলা)**, and **Hindi (हिन्दी)**.

Instead of stressful clinical assessment sheets that cause anxiety in young learners, AksharMitra embeds formative learning signals directly into joyful mini-quests guided by **Mitra**, an interactive companion mascot.

---

## 🏗️ System Architecture

### 📊 Data Architecture

```
                    CHILD / PARENT UI (React 19 PWA)
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       Local Cache (localStorage)         Supabase Client
      (Instant sub-50ms hydrate)        (@supabase/supabase-js)
                  │                               │
                  │ (Offline queue fallback)      ▼
                  └─────────────────────► Supabase PostgreSQL Database
                                          • Row Level Security (RLS)
                                          • Strictly Isolated User Context
```

### 🔄 Closed-Loop Learning Architecture

```
            Child Activity Data  +  Parent Observation
                                 │
                                 ▼
                     Cross-Signal Intelligence
                   (crossSignalIntelligence.js)
                                 │
                                 ▼
                          Learning Profile
                       (Non-clinical pattern)
                                 │
                                 ▼
                     Adaptive Learning Strategy
                    (adaptiveLearningStrategy.js)
                                 │
                                 ▼
                       Personalized Practice
                (Dynamic Scaffolding & Missions)
                                 │
                                 ▼
                            Reassessment
                          (Adapt Again)
```

### 💾 Storage & Data Flow
- **PostgreSQL Database**: Persistent source of truth hosted via Supabase.
- **Row Level Security (RLS)**: Strictly isolates data per account (`auth.uid() = user_id`). No learner record or parent observation can ever be accessed by another account.
- **Offline Cache**: Browser `localStorage` serves as a high-speed cache and offline fallback. Mutations made offline are queued and replayed upon reconnection.
- **Demo Profile Isolation**: Benchmark judge profiles (`Aarav` and `Priya`) are strictly held in memory and never pollute user database tables.

---

## 🌐 Multilingual Support

AksharMitra natively supports three major languages:
- 🇬🇧 **English** (`en`)
- 🇮🇳 **Bengali (বাংলা)** (`bn`)
- 🇮🇳 **Hindi (हिन्दी)** (`hi`)

The database records store the learner's ISO language preference code (`en`, `bn`, `hi`) alongside activity attempts, enabling multi-language progress tracking without duplicating UI translation strings.

---

## 🔒 Privacy & Non-Clinical Transparency

> [!NOTE]
> **Important Privacy Notice**:
> AksharMitra is an educational support and early risk-screening tool. It **does not provide clinical or medical diagnoses of dyslexia**.
> - Collects only the minimal information needed for personalized learning (first name/nickname, grade level, avatar, and language preference).
> - Parent observations remain categorical (`needs_support`, `developing`, `comfortable`, `null`).
> - Microphone unavailability is treated as `null` and **never fabricated as a 0% score**.
> - Cross-signal reasoning uses a deterministic rule-based keyword classifier. (The @xenova/transformers package is imported experimentally but its output is not used in scoring).

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | **React 19 + Vite 6** | Modern component-driven UI with instant HMR and lightweight bundle |
| **Database** | **Supabase (PostgreSQL 15+)** | Cloud-native relational database with Row Level Security |
| **Client ORM** | **@supabase/supabase-js** | Official JavaScript client for authentication and PostgreSQL access |
| **Styling** | **Modern Vanilla CSS** | Custom design tokens, glassmorphism, sensory color palette |
| **Audio Engine** | **Web Audio API** | Zero-latency on-device oscillator chimes, pops, and fanfares |
| **Speech Engine** | **Web Speech API & TTS** | Multilingual continuous streaming speech recognition & narration |
| **Canvas** | **HTML5 Canvas 2D** | Real-time stroke vector analysis & magnetic waypoint tracing |
| **PWA & Offline** | **Service Worker & Manifest** | Fullscreen mobile/tablet installability and offline caching |
| **Particles** | **Canvas Confetti** | Hardware-accelerated celebratory confetti bursts |
| **Icons** | **Lucide React** | Clean, accessible SVG iconography |

---

## 🗄️ Database Tables (Supabase PostgreSQL)

1. `learners` — Student profile records (avatar, grade, language, stars, streak).
2. `parent_observations` — 4-axis categorical observations (reading, sounds, writing, understanding).
3. `activity_attempts` — Summary records of completed game and quest attempts.
4. `reading_results` — Granular reading cadence (WPM, words completed, hesitation).
5. `speech_results` — Auditory rhyme and phonological scores (strict null preservation).
6. `tracing_results` — Letter stroke accuracy and reversal index (*b/d/p/q*).
7. `game_results` — In-game mistakes, accuracy, and hints used.
8. `learning_profiles` — Synthesized developmental patterns and actionable practice recommendations.
9. `learner_progress` — Activity completion milestones and cumulative stars.
10. `language_preferences` — Language selection per learner.

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later)
- `npm`

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Biraj021/AksharMitra.git
cd AksharMitra

# Install dependencies
npm install
```

### 3. Configure Supabase (Optional for offline/demo use)
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. In your [Supabase Dashboard](https://supabase.com):
   - Go to **Project Settings** → **API**.
   - Copy **Project URL** to `VITE_SUPABASE_URL`.
   - Copy **anon public key** to `VITE_SUPABASE_ANON_KEY`.
   - Run the SQL migration located at `supabase/migrations/001_initial_schema.sql` in the **SQL Editor**.

*(Note: If Supabase credentials are not provided, AksharMitra automatically falls back to local cache mode seamlessly).*

### 4. Run Development Server
```bash
npm run dev
```
Open https:https://akshar-mitra-17wqhq5jn-biraj021s-projects.vercel.app in Google Chrome or Microsoft Edge.


### 5. Production Build
```bash
npm run build
```

---

## 👥 Team
*Developed with ❤️ for Hacksynthesis UEM 30-Hour Hackathon.*
