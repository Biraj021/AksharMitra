# AksharMitra — Affordable Assistive Tech for Dyslexia
### Hacksynthesis UEM 30-Hour Hackathon — Project Brief

---

## 1. Problem Statement

Many children in India with learning disabilities like dyslexia remain undiagnosed. India is estimated to have around 90 million people with varying degrees of learning disabilities, and an average classroom has about five students with such disabilities — most go unrecognized because screening requires trained specialists who are scarce, especially in rural areas, and diagnosis carries stigma that keeps parents from seeking help.

**Goal**: Build a low-cost, gamified mobile app that helps identify at-risk children early and teaches reading/writing skills in multiple Indian languages, using NLP for interactive language learning and reward-based gamification.

---

## 2. Existing Solutions (and their gaps)

| Solution | What it does | Gap |
|---|---|---|
| **AACDD (IIT Kanpur)** | Assistive app for dyslexia/dysgraphia, Classes 1-5 | Hindi only, not gamified, limited scale |
| **DALI** | First indigenous dyslexia screening tool for Indian languages | Needs a trained professional to administer — not self-serve or child-facing |
| **PRASHAST App** | Govt. app for early disability detection, tied to NEP 2020 | Administrative/diagnostic tool, not a learning app |
| **DIKSHA** | National platform, 36 languages, AI-powered content | General curriculum content, not dyslexia-specific |
| **Avaz AAC** | Indian AAC app, 6 regional languages | Built for communication support, not reading/writing remediation |
| **Global apps (Ghotit, Speechify, etc.)** | Multisensory reading/writing support | English-first, Latin-script phonics, usually paid |

**The open gap**: nothing combines (a) child-facing, gamified, self-triggered screening, (b) script-native error modeling for Indian scripts (not translated English pedagogy), and (c) genuinely offline, low-cost deployment.

---

## 3. Our Differentiation

1. **Screening built into play** — the child plays a game; they aren't sat down for a diagnostic test. This removes the stigma and specialist-gatekeeping bottleneck.
2. **Script-native error detection** — reversal and phonetic-confusion patterns in Devanagari, Tamil, Bengali etc. are treated on their own terms, not mapped from English dyslexia research.
3. **Complements, doesn't compete with, government infrastructure** — designed to plug into NIPUN Bharat / DIKSHA-style rollouts rather than build a rival platform.
4. **Offline-first, low-end-device friendly** — built to survive patchy data and shared family Android phones.
5. **Non-clinical, ungated access** — no appointment, no specialist, no cost barrier to get a first read on risk.

**Important guardrail**: the app never claims to diagnose. It flags risk and recommends follow-up with a teacher, ASHA worker, or professional.

---

## 4. Solution Architecture (What We're Building)

**A. Screening layer** (disguised as a game, ~5-7 min)
- Letter/number reversal tracing task
- Read-aloud passage → speech-to-text comparison → fluency/error scoring
- Rhyme/syllable clapping → phonological awareness check
- Rule-based risk score (not ML for MVP): thresholds on reversal count, reading speed vs. age norm, phonological accuracy

**B. Adaptive learning layer**
- Phonics/word-building game with difficulty levels
- TTS-driven pronunciation modeling and instructions
- Adaptive difficulty based on rolling accuracy

**C. Gamification layer**
- Streaks, stars, a companion character/mascot, story-driven levels
- No harsh "wrong answer" states — gentle failure design

**D. Dashboard (teacher/parent)**
- Progress trends over time, not raw scores
- Flags risk areas without diagnosing

**E. Tech choices for a 30-hour build**
- App: Flutter or React Native
- Speech-to-text/TTS: Google Cloud Speech API or AI4Bharat hosted APIs (don't train models from scratch)
- Backend: Firebase (Auth + Firestore) — zero setup time
- Charts: any lightweight chart library

---

## 5. What to Actually Build in 30 Hours

Pick **one language, one screening flow, one learning game.** A demo needs to look complete, not be complete.

- Screening: 2 mini-games max (reversal tracing + read-aloud/rhyme task)
- Learning: 1 gamified phonics/reading game with levels
- Dashboard: real flow + some mocked example profiles to show scale
- NLP: via existing APIs only, no custom model training

**What to fake without shame:**
- Risk scoring: rule-based if/else, framed as "MVP uses rule-based scoring; roadmap includes a trained classifier"
- Multi-language: architecture supports it, but only one language is actually built
- Dashboard: mix real session data with a couple of hardcoded example profiles

---

## 6. Hour-by-Hour Build Plan

**Hours 0–3: Scope lock + setup**
- Finalize exact feature list, no scope creep after this
- Split team: 1-2 frontend/app, 1-2 backend/NLP, 1 design/pitch
- Repo, Firebase, navigation shell

**Hours 3–10: Core screening game**
- Letter-reversal tracing (canvas draw + direction comparison)
- Read-aloud game: record → speech-to-text → compare to expected text → flag errors
- Rule-based risk score

**Hours 10–18: Gamified learning module**
- One phonics/word-building game, 3-4 difficulty levels
- TTS feedback for pronunciation
- Stars, progress bar, mascot reactions

**Hours 18–24: Dashboard + polish**
- Parent/teacher view: session history, flagged risk areas
- Visual polish — icon, splash screen, consistent theming (judges notice this more than backend depth)

**Hours 24–28: Testing + bug fixes**
- Full flow test on a real phone, not just emulator
- Fix crashes only, no new features after hour 24

**Hours 28–30: Pitch prep**
- 3-minute demo script: problem → screening demo → learning game demo → dashboard → roadmap slide
- One slide on competitive differentiation
- Rehearse twice, have a backup demo recording ready

---

## 7. Longer-Term Roadmap (post-hackathon, for pitch/roadmap slide only)

- **Phase 0**: Research validation with educators, SLPs, parents; pick pilot languages
- **Phase 1-2**: MVP screening + learning loop (what we're building now)
- **Phase 3**: Pilot with real children through a school/NGO partner, validate risk-flagging against real assessments
- **Phase 4**: Add second language, build out dashboard fully
- **Phase 5**: Offline hardening, model quantization for low-end devices
- **Phase 6**: Partnerships with NGOs/state education departments, NIPUN Bharat alignment, DPDP Act-compliant privacy policy

---

## 8. Key Talking Points for Judges

- We're not claiming clinical diagnosis — we're removing the specialist bottleneck for the *first* flag
- Multilingual Indian script support is a genuine technical gap nobody else is solving well
- Low-cost and offline-first is core to reaching the population that actually needs this
- We know the existing landscape (DALI, PRASHAST, DIKSHA, AACDD) and are positioned to complement it, not duplicate it
