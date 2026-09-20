-- ==============================================================================
-- AKSHARMITRA — PostgreSQL Schema Migration 001
-- ==============================================================================
-- Description: Core relational schema for learners, parent observations,
--              activity attempts, reading/speech/tracing/game results,
--              learning profiles, and progress tracking.
-- Security:    Full Row Level Security (RLS) enforcing strict user isolation.
-- ==============================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Learners Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT 'sheru',
    avatar_emoji TEXT NOT NULL DEFAULT '🦁',
    grade TEXT NOT NULL DEFAULT 'grade2',
    grade_label TEXT DEFAULT 'Class 2',
    preferred_language TEXT NOT NULL DEFAULT 'en', -- 'en' | 'bn' | 'hi'
    stars INTEGER NOT NULL DEFAULT 15,
    streak INTEGER NOT NULL DEFAULT 1,
    screening_completed BOOLEAN NOT NULL DEFAULT FALSE,
    risk_level TEXT NOT NULL DEFAULT 'typical',
    learning_pathway TEXT DEFAULT 'accelerated_fluency',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learners_user_id ON public.learners(user_id);
CREATE INDEX IF NOT EXISTS idx_learners_created_at ON public.learners(created_at);

-- ------------------------------------------------------------------------------
-- 2. Parent Observations Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parent_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL UNIQUE REFERENCES public.learners(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reading JSONB NOT NULL DEFAULT '{}'::jsonb,
    sounds JSONB NOT NULL DEFAULT '{}'::jsonb,
    writing JSONB NOT NULL DEFAULT '{}'::jsonb,
    understanding JSONB NOT NULL DEFAULT '{}'::jsonb,
    optional_note TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parent_observations_learner_id ON public.parent_observations(learner_id);
CREATE INDEX IF NOT EXISTS idx_parent_observations_user_id ON public.parent_observations(user_id);

-- ------------------------------------------------------------------------------
-- 3. Activity Attempts Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_id TEXT NOT NULL, -- e.g. 'word-snapper', 'letter-hunter', 'letter-tracing'
    activity_type TEXT NOT NULL, -- 'reading', 'phonics', 'tracing', 'game', 'screening'
    language TEXT NOT NULL DEFAULT 'en', -- 'en', 'bn', 'hi'
    score INTEGER NOT NULL DEFAULT 0,
    stars_earned INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_attempts_learner_id ON public.activity_attempts(learner_id);
CREATE INDEX IF NOT EXISTS idx_activity_attempts_user_id ON public.activity_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_attempts_created_at ON public.activity_attempts(created_at);

-- ------------------------------------------------------------------------------
-- 4. Reading Results (Sub-table for reading-specific metrics)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reading_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_attempt_id UUID NOT NULL UNIQUE REFERENCES public.activity_attempts(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
    wpm INTEGER,
    accuracy INTEGER,
    words_completed INTEGER DEFAULT 0,
    fluency_hesitation INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reading_results_learner_id ON public.reading_results(learner_id);

-- ------------------------------------------------------------------------------
-- 5. Speech Results (Sub-table for phonological/speech metrics)
-- Note: Strict null preservation if microphone/speech is unavailable (never fake 0)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.speech_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_attempt_id UUID NOT NULL UNIQUE REFERENCES public.activity_attempts(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
    phonological_score INTEGER,
    accuracy INTEGER,
    availability BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_speech_results_learner_id ON public.speech_results(learner_id);

-- ------------------------------------------------------------------------------
-- 6. Tracing Results (Sub-table for letter tracing & motor metrics)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tracing_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_attempt_id UUID NOT NULL UNIQUE REFERENCES public.activity_attempts(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
    letter TEXT,
    accuracy INTEGER,
    reversal_index INTEGER,
    adherence INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracing_results_learner_id ON public.tracing_results(learner_id);

-- ------------------------------------------------------------------------------
-- 7. Game Results (Sub-table for game-specific metrics)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.game_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_attempt_id UUID NOT NULL UNIQUE REFERENCES public.activity_attempts(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    mistakes INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_results_learner_id ON public.game_results(learner_id);

-- ------------------------------------------------------------------------------
-- 8. Learning Profiles Table
-- Stores deterministic cross-signal outputs (never medical diagnoses)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL UNIQUE REFERENCES public.learners(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    observed_pattern TEXT NOT NULL,
    recommended_practice TEXT NOT NULL,
    recommended_activity_id TEXT NOT NULL,
    recommended_activity_title TEXT NOT NULL,
    confidence INTEGER NOT NULL DEFAULT 0,
    agreement_status TEXT NOT NULL DEFAULT 'insufficient_data',
    signal_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    parent_observation_signals JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence JSONB NOT NULL DEFAULT '{"appActivity":[], "parentObservation":[]}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_profiles_learner_id ON public.learning_profiles(learner_id);
CREATE INDEX IF NOT EXISTS idx_learning_profiles_user_id ON public.learning_profiles(user_id);

-- ------------------------------------------------------------------------------
-- 9. Learner Progress Table
-- Tracks milestones, best scores, and stars per activity
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learner_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_id TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    best_score INTEGER NOT NULL DEFAULT 0,
    stars INTEGER NOT NULL DEFAULT 0,
    last_played_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_learner_progress_activity UNIQUE (learner_id, activity_id)
);

CREATE INDEX IF NOT EXISTS idx_learner_progress_learner_id ON public.learner_progress(learner_id);
CREATE INDEX IF NOT EXISTS idx_learner_progress_user_id ON public.learner_progress(user_id);

-- ------------------------------------------------------------------------------
-- 10. Language Preferences Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.language_preferences (
    learner_id UUID PRIMARY KEY REFERENCES public.learners(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    language TEXT NOT NULL DEFAULT 'en', -- 'en', 'bn', 'hi'
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_language_preferences_learner_id ON public.language_preferences(learner_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Authenticated users can ONLY access their own records.
-- ==============================================================================

-- 1. Learners RLS
ALTER TABLE public.learners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own learners"
    ON public.learners FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learners"
    ON public.learners FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learners"
    ON public.learners FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learners"
    ON public.learners FOR DELETE
    USING (auth.uid() = user_id);

-- 2. Parent Observations RLS
ALTER TABLE public.parent_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their learners parent observations"
    ON public.parent_observations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their learners parent observations"
    ON public.parent_observations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their learners parent observations"
    ON public.parent_observations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their learners parent observations"
    ON public.parent_observations FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Activity Attempts RLS
ALTER TABLE public.activity_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their learners activity attempts"
    ON public.activity_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their learners activity attempts"
    ON public.activity_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 4. Reading Results RLS
ALTER TABLE public.reading_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their learners reading results"
    ON public.reading_results FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.learners
        WHERE public.learners.id = public.reading_results.learner_id
        AND public.learners.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their learners reading results"
    ON public.reading_results FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.learners
        WHERE public.learners.id = public.reading_results.learner_id
        AND public.learners.user_id = auth.uid()
    ));

-- 5. Speech Results RLS
ALTER TABLE public.speech_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their learners speech results"
    ON public.speech_results FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.learners
        WHERE public.learners.id = public.speech_results.learner_id
        AND public.learners.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their learners speech results"
    ON public.speech_results FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.learners
        WHERE public.learners.id = public.speech_results.learner_id
        AND public.learners.user_id = auth.uid()
    ));

-- 6. Tracing Results RLS
ALTER TABLE public.tracing_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their learners tracing results"
    ON public.tracing_results FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.learners
        WHERE public.learners.id = public.tracing_results.learner_id
        AND public.learners.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their learners tracing results"
    ON public.tracing_results FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.learners
        WHERE public.learners.id = public.tracing_results.learner_id
        AND public.learners.user_id = auth.uid()
    ));

-- 7. Game Results RLS
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their learners game results"
    ON public.game_results FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.learners
        WHERE public.learners.id = public.game_results.learner_id
        AND public.learners.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their learners game results"
    ON public.game_results FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.learners
        WHERE public.learners.id = public.game_results.learner_id
        AND public.learners.user_id = auth.uid()
    ));

-- 8. Learning Profiles RLS
ALTER TABLE public.learning_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their learners learning profiles"
    ON public.learning_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their learners learning profiles"
    ON public.learning_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their learners learning profiles"
    ON public.learning_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 9. Learner Progress RLS
ALTER TABLE public.learner_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their learners progress"
    ON public.learner_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their learners progress"
    ON public.learner_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their learners progress"
    ON public.learner_progress FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 10. Language Preferences RLS
ALTER TABLE public.language_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their learners language preferences"
    ON public.language_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their learners language preferences"
    ON public.language_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their learners language preferences"
    ON public.language_preferences FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- END OF MIGRATION 001
-- ==============================================================================
