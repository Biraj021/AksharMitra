# AKSHARMITRA — DATABASE MIGRATION AUDIT (LOCALSTORAGE → SUPABASE)

## 1. Executive Summary & Context
AksharMitra is a multilingual adaptive literacy platform for children learning in English, Bengali, and Hindi. It features a closed-loop adaptive cycle:
`Parent Observation + Child Activity Data → Cross-Signal Intelligence → Learning Profile → Adaptive Strategy & Scaffolding → Child Practice → Reassessment & Adaptation`.

Currently, learner profiles, parent feedback, screening results, and accessibility preferences reside inside browser `localStorage`. To support multi-device persistence, institutional/educator workflows, data durability, and enterprise-grade privacy, this audit outlines the architectural blueprint to migrate persistent learner data to a **Supabase PostgreSQL database** with **Row Level Security (RLS)**, preserving `localStorage` strictly as an offline/cache fallback.

---

## 2. Current Storage Architecture & Key Inventory

### 2.1 Storage Keys
| Key | Storage Medium | Purpose & Data Payload |
|---|---|---|
| `aksharmitra_active_profile` | Browser `localStorage` | Currently selected learner profile JSON (`id`, `name`, `avatar`, `grade`, `language`, `stars`, `streak`, `screeningCompleted`, `screeningMetrics`, `parentFeedback`, `learningProfile`, `createdAt`). |
| `aksharmitra_all_profiles_v2` | Browser `localStorage` | Array of all learner profile JSON objects on the current device (excluding in-memory demo profiles `demo_aarav` and `demo_priya`). |
| `aksharmitra_dyslexia_settings_v1` | Browser `localStorage` | UI accessibility configurations (`fontFamily`, `colorTint`, `readingRulerEnabled`, `rulerHeight`, `rulerOpacity`, `letterSpacing`, `lineHeight`, `fontSizeScale`, `reversalHighlighting`, `soundEffects`). |
| `aksharmitra_storage_version` | (Proposed migration key) | Tracks schema migration state (`1` = legacy localStorage, `2` = Supabase synchronized). |

### 2.2 Data Relationships in Current Codebase
```
Profile (Learner)
  ├── Basic Info (id, name, avatar, grade, language, stars, streak)
  ├── Screening State (screeningCompleted, riskLevel, riskScore, learningPathway)
  ├── Screening Metrics (wpm, reversalIndex, phonologicalScore, tracingAccuracy, confusionsDetected)
  ├── Parent Feedback (reading, sounds, writing, understanding, parentObservation text)
  └── Learning Profile (observedPattern, recommendedPractice, recommendedActivityId, confidence, agreementStatus, evidence)
```

---

## 3. Data Entities & Structures

### 3.1 Learner Object
- **Primary Identifier**: `student_${timestamp}` (currently client-generated) → `UUID` in PostgreSQL.
- **Fields**:
  - `name`: string (e.g. "Diya", "তন্ময়", "अमित")
  - `avatar`: string key ('sheru', 'mayur', 'gaja', etc.)
  - `avatarEmoji`: unicode emoji character ('🦁', '🦚', etc.)
  - `grade`: 'kg' | 'grade1' | 'grade2' | 'grade3' | 'grade4' | 'grade5'
  - `gradeLabel`: string ('Class 2', etc.)
  - `preferred_language`: 'english' | 'bengali' | 'hindi' (or 'en', 'bn', 'hi')
  - `stars`: integer (cumulative gamification tokens)
  - `streak`: integer (day streak count)
  - `screeningCompleted`: boolean

### 3.2 Parent Feedback Structure
Categorical 4-axis assessment with strict `null` preservation (never convert missing answers to zero):
- `reading`:
  - `comfort`: `'comfortably'` | `'slowly'` | `'needs_help'` | `'struggles_independently'` | `null`
  - `wordSkipping`: `'rarely'` | `'sometimes'` | `'often'` | `'not_sure'` | `null`
- `sounds`:
  - `letterSounds`: `'comfortable'` | `'sometimes_help'` | `'often_help'` | `'not_sure'` | `null`
  - `blendingSounds`: `'usually'` | `'sometimes'` | `'needs_help'` | `'not_sure'` | `null`
- `writing`:
  - `tracing`: `'comfortable'` | `'developing'` | `'needs_help'` | `'not_sure'` | `null`
  - `letterShapeConfusion`: `'rarely'` | `'sometimes'` | `'often'` | `'not_sure'` | `null`
- `understanding`:
  - `understandsInstructions`: `'usually'` | `'sometimes'` | `'needs_help'` | `'not_sure'` | `null`
  - `handlesChallenge`: `'keeps_trying'` | `'needs_encouragement'` | `'needs_help'` | `'not_sure'` | `null`
- `parentObservation`: string (free text evaluated on-device by local AI engine).
- `lastUpdatedAt`: ISO timestamp.

### 3.3 Activity Data & Metrics
Triggered by `recordActivityCompletion({ activityId, starsEarned, metricUpdates })`:
- **Reading Results**: `wpm` (words per minute), `fluencyHesitation` (ms lag), `wordsCompleted`.
- **Speech Results**: `phonologicalScore` (percentage, or `null` if microphone unavailable/declined; NEVER fake 0).
- **Tracing Results**: `tracingAccuracy` (stroke proximity %), `reversalIndex` (b/d, p/q error rate), `confusionsDetected` (array).
- **Game Results**: `starsEarned`, `accuracyRate`, `mistakes`, `hintsUsed`.

### 3.4 Learning Profile & Adaptive Recommendations
Computed dynamically on-device by `src/utils/crossSignalIntelligence.js`:
- `observedPattern`: non-clinical descriptive synthesis (e.g. "Both app activity and parent observation suggest independent reading may need additional practice.")
- `recommendedPractice`: actionable guidance (e.g. "Guided reading and word-building practice.")
- `recommendedActivityId`: 'word-snapper' | 'letter-tracing' | 'spelling-traps' | 'abc-fill-in' | 'spelling-clinic' | 'screening'
- `confidence`: 60% – 90%
- `agreementStatus`: 'agreement' | 'divergence' | 'parent_focused' | 'app_only' | 'parent_only' | 'insufficient_data'
- `evidence`: `{ appActivity: string[], parentObservation: string[] }`

---

## 4. Proposed PostgreSQL Database Schema

To prevent unnecessary relational over-engineering while upholding 3rd Normal Form and child data privacy, we design a clean 6-table relational schema:

```
[auth.users] (Supabase Auth User)
     │
     └── 1:N ──► [learners]
                    │
                    ├── 1:1 ──► [parent_observations]
                    ├── 1:N ──► [activity_attempts]
                    │              ├── 1:1 (optional) ──► [reading_results]
                    │              ├── 1:1 (optional) ──► [speech_results]
                    │              ├── 1:1 (optional) ──► [tracing_results]
                    │              └── 1:1 (optional) ──► [game_results]
                    ├── 1:1 ──► [learning_profiles]
                    └── 1:N ──► [learner_progress]
```

### Table Specifications:

#### 1. `learners`
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `user_id`: `UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- `name`: `TEXT NOT NULL`
- `avatar`: `TEXT DEFAULT 'sheru'`
- `avatar_emoji`: `TEXT DEFAULT '🦁'`
- `grade`: `TEXT DEFAULT 'grade2'`
- `preferred_language`: `TEXT DEFAULT 'en'` ('en' | 'bn' | 'hi')
- `stars`: `INTEGER DEFAULT 15`
- `streak`: `INTEGER DEFAULT 1`
- `screening_completed`: `BOOLEAN DEFAULT FALSE`
- `risk_level`: `TEXT DEFAULT 'typical'`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`
- `updated_at`: `TIMESTAMPTZ DEFAULT now()`

#### 2. `parent_observations`
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `learner_id`: `UUID NOT NULL UNIQUE REFERENCES learners(id) ON DELETE CASCADE`
- `user_id`: `UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- `reading`: `JSONB DEFAULT '{}'::jsonb` (contains `{ comfort, wordSkipping }`)
- `sounds`: `JSONB DEFAULT '{}'::jsonb` (contains `{ letterSounds, blendingSounds }`)
- `writing`: `JSONB DEFAULT '{}'::jsonb` (contains `{ tracing, letterShapeConfusion }`)
- `understanding`: `JSONB DEFAULT '{}'::jsonb` (contains `{ understandsInstructions, handlesChallenge }`)
- `optional_note`: `TEXT DEFAULT ''`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`
- `updated_at`: `TIMESTAMPTZ DEFAULT now()`

#### 3. `activity_attempts`
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `learner_id`: `UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE`
- `user_id`: `UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- `activity_id`: `TEXT NOT NULL` ('word-snapper', 'letter-hunter', 'letter-tracing', etc.)
- `activity_type`: `TEXT NOT NULL` ('reading' | 'phonics' | 'tracing' | 'spelling' | 'screening')
- `language`: `TEXT NOT NULL DEFAULT 'en'`
- `score`: `INTEGER DEFAULT 0`
- `stars_earned`: `INTEGER DEFAULT 0`
- `duration_seconds`: `INTEGER DEFAULT 0`
- `completed`: `BOOLEAN DEFAULT TRUE`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`

#### 4. `activity_metric_details` (Unified granular results: reading, speech, tracing, game)
*(Simplification note: Rather than 4 separate 1-line tables that increase join overhead, we provide specialized detail columns or clean foreign-keyed sub-tables for reading/speech/tracing/game results)*
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `activity_attempt_id`: `UUID NOT NULL UNIQUE REFERENCES activity_attempts(id) ON DELETE CASCADE`
- `learner_id`: `UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE`
- `wpm`: `INTEGER` (null if not reading)
- `phonological_score`: `INTEGER` (null if speech unavailable or not phonics)
- `speech_available`: `BOOLEAN DEFAULT TRUE`
- `reversal_index`: `INTEGER` (null if not tracing/discrimination)
- `tracing_accuracy`: `INTEGER`
- `game_mistakes`: `INTEGER DEFAULT 0`
- `hints_used`: `INTEGER DEFAULT 0`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`

#### 5. `learning_profiles`
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `learner_id`: `UUID NOT NULL UNIQUE REFERENCES learners(id) ON DELETE CASCADE`
- `user_id`: `UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- `observed_pattern`: `TEXT NOT NULL`
- `recommended_practice`: `TEXT NOT NULL`
- `recommended_activity_id`: `TEXT NOT NULL`
- `recommended_activity_title`: `TEXT NOT NULL`
- `confidence`: `INTEGER DEFAULT 0`
- `agreement_status`: `TEXT DEFAULT 'insufficient_data'`
- `signal_scores`: `JSONB DEFAULT '{}'::jsonb`
- `evidence`: `JSONB DEFAULT '{"appActivity":[], "parentObservation":[]}'::jsonb`
- `updated_at`: `TIMESTAMPTZ DEFAULT now()`

#### 6. `learner_progress`
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `learner_id`: `UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE`
- `user_id`: `UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- `activity_id`: `TEXT NOT NULL`
- `completed`: `BOOLEAN DEFAULT FALSE`
- `best_score`: `INTEGER DEFAULT 0`
- `stars`: `INTEGER DEFAULT 0`
- `last_played_at`: `TIMESTAMPTZ DEFAULT now()`
- `updated_at`: `TIMESTAMPTZ DEFAULT now()`
- `CONSTRAINT unique_learner_activity UNIQUE (learner_id, activity_id)`

---

## 5. Security & Row Level Security (RLS) Strategy

1. **Authentication Context**:
   - Supabase Auth identifies the parent/educator account (`auth.uid()`).
   - Guest / Initial access: Supabase anonymous authentication can seamlessly provision a guest `auth.uid()` without requiring immediate email verification, enabling frictionless child access while maintaining 100% RLS coverage.
2. **Strict Isolation**:
   - Every single table (`learners`, `parent_observations`, `activity_attempts`, `learning_profiles`, `learner_progress`) has `ENABLE ROW LEVEL SECURITY`.
   - Policy: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`.
   - Cross-tenant data leakage is structurally impossible at the PostgreSQL query planner level.
3. **No Service-Role Key**:
   - The frontend Vite client bundle will ONLY use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   - Service-role secret is never exposed.
4. **COPPA / Child Privacy Compliance**:
   - No personally identifiable information (PII) beyond a first name or nickname and age/grade.
   - Non-clinical: zero medical labels or clinical diagnoses stored in the DB.

---

## 6. Migration Risks & Mitigation Plan

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **Network latency / Supabase downtime on startup** | Child UI could freeze or display blank page | Keep initial state hydration resilient: load from `localStorage` cache immediately for sub-50ms render, then sync with Supabase in background. |
| **Demo profile pollution** | Demo profiles (`Aarav`, `Priya`) getting saved into real DB or user profiles | Explicit guard in all services: `if (profileId.startsWith('demo_') || isDemoProfile(profileId)) return;`. Demo profiles run strictly in-memory. |
| **Duplicate local-to-remote sync** | Multiple submissions on reload | Use `aksharmitra_storage_version` flag and idempotency check based on `learner_id`. |
| **Null vs. Zero metric distortion** | Microphone unavailability treated as 0% speech score | Database columns `phonological_score` and `wpm` are nullable (`INTEGER NULL`), never defaulted to 0. |
| **Offline PWA usage** | Progress lost when child plays offline | Local caching via `localStorage` writes immediately; queue pending database sync tasks to replay upon `window.addEventListener('online')`. |

---

## 7. Files Impact Assessment

### 7.1 Files That Need Modification
1. `.gitignore` — Add `.env`, `.env.local`, `.env.*.local` to prevent committing secrets.
2. `src/context/ProfileContext.jsx` — Upgrade to hybrid architecture: React state ↔ Supabase (source of truth) ↔ localStorage (cache/offline).
3. `package.json` — Add `@supabase/supabase-js`.
4. `README.md` — Document data architecture, Supabase PostgreSQL setup, RLS, offline resilience, and multilingual support.

### 7.2 New Files to Create
1. `src/lib/supabaseClient.js` — Supabase client initialization using `import.meta.env.VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`.
2. `.env.example` — Public template with placeholder values.
3. `supabase/migrations/001_initial_schema.sql` — Complete DDL migration script with tables, UUIDs, foreign keys, indexes, and RLS policies.
4. `src/services/learnerService.js` — Learner CRUD and active profile sync.
5. `src/services/parentObservationService.js` — Parent observation save/fetch.
6. `src/services/activityService.js` — Activity attempt and granular metrics recording.
7. `src/services/learningProfileService.js` — Learning profile persistence.
8. `src/services/progressService.js` — Stars and milestone tracking.
9. `src/services/offlineSyncService.js` — Local caching and offline write queue.
10. `test_database_integration.js` — Verification test suite covering items A through T.

### 7.3 Files That Must Remain Unchanged
- `src/utils/crossSignalIntelligence.js` — Deterministic intelligence and cross-signal evaluation remain on-device.
- `src/utils/adaptiveLearningStrategy.js` — Child personalization and scaffolding engine remain unchanged.
- `src/utils/parentFeedbackModel.js` — Categorical 4-axis model definition remains unchanged.
- `src/games/*` — All 6 learning games (`WordSnapper`, `LetterHunter`, `LetterTracingQuest`, `SpellingClinic`, `SpellingTrapChallenge`, `AbcFillIn`) continue calling `recordActivityCompletion` without component rewrites.
- `src/data/demoProfiles.js` & `src/data/languages.js` — Reference assets remain untouched.

---

## 8. Offline & Cache Architecture

```
                       User Action (Child or Parent)
                                    │
                                    ▼
                         React Context State
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
          localStorage Cache                 Supabase API
          (Immediate read/write)             (Persistent DB)
                  │                                   │
                  │ (Offline)                         │ (Online)
                  ▼                                   ▼
             Pending Queue                      PostgreSQL
                  │                                   ▲
                  └────── Replay on Reconnect ────────┘
```
- **Read Path**: Instant local hydrate from `localStorage` cache (`aksharmitra_active_profile`), followed by background fresh fetch from Supabase to update state if newer.
- **Write Path**: Optimistic state update + immediate localStorage cache update + asynchronous Supabase API call. If offline, the write is registered in a pending sync queue (`aksharmitra_pending_sync_v1`) and flushed upon network reconnection.

---
*Audit completed without modifying source files. Ready for implementation approval.*
