-- Supabase Schema Initialization for AksharMitra

-- 1. Create the `learners` table
CREATE TABLE public.learners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    kid_code TEXT UNIQUE,
    name TEXT NOT NULL,
    avatar TEXT,
    avatar_emoji TEXT,
    grade TEXT,
    grade_label TEXT,
    preferred_language TEXT,
    stars INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 1,
    screening_completed BOOLEAN DEFAULT false,
    risk_level TEXT DEFAULT 'typical',
    learning_pathway TEXT DEFAULT 'accelerated_fluency',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.learners ENABLE ROW LEVEL SECURITY;

-- Create Policies (Only parents/educators can view/edit their own learners)
CREATE POLICY "Users can view their own learners"
    ON public.learners FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learners"
    ON public.learners FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learners"
    ON public.learners FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learners"
    ON public.learners FOR DELETE
    USING (auth.uid() = user_id);

-- 2. Create the `parent_observations` table
CREATE TABLE public.parent_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learner_id UUID REFERENCES public.learners(id) ON DELETE CASCADE UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    reading JSONB DEFAULT '{}',
    sounds JSONB DEFAULT '{}',
    writing JSONB DEFAULT '{}',
    understanding JSONB DEFAULT '{}',
    optional_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.parent_observations ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own observations"
    ON public.parent_observations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own observations"
    ON public.parent_observations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own observations"
    ON public.parent_observations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own observations"
    ON public.parent_observations FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Create the `teacher_student_links` table for Educator ID linking
CREATE TABLE public.teacher_student_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES auth.users(id) NOT NULL,
    learner_id UUID REFERENCES public.learners(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(teacher_id, learner_id)
);

ALTER TABLE public.teacher_student_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their linked students"
    ON public.teacher_student_links FOR SELECT
    USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert links"
    ON public.teacher_student_links FOR INSERT
    WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can remove links"
    ON public.teacher_student_links FOR DELETE
    USING (auth.uid() = teacher_id);

-- Set up Realtime for tables (Optional but good for multi-device sync)
alter publication supabase_realtime add table learners;
alter publication supabase_realtime add table parent_observations;
alter publication supabase_realtime add table teacher_student_links;
