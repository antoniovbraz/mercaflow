-- Migration: ML Questions Table
-- Date: 2025-10-09
-- Description: Creates table to store ML questions/answers for automation

-- ==========================================
-- ML Questions Table (Q&A System)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.ml_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.ml_integrations(id) ON DELETE CASCADE,
  
  -- ML Question Data
  ml_question_id BIGINT NOT NULL,
  ml_item_id TEXT NOT NULL,
  from_user_id BIGINT NOT NULL,
  from_user_nickname TEXT,
  
  -- Question Content
  question_text TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('UNANSWERED', 'ANSWERED', 'DELETED', 'BANNED')),
  date_created TIMESTAMPTZ NOT NULL,
  
  -- Answer Content
  answer_text TEXT,
  answer_date TIMESTAMPTZ,
  auto_answered BOOLEAN DEFAULT FALSE,
  answer_source TEXT CHECK (answer_source IN ('manual', 'ai_template', 'ai_custom')),
  
  -- Metadata
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(integration_id, ml_question_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS ml_questions_integration_id_idx 
  ON public.ml_questions(integration_id);
CREATE INDEX IF NOT EXISTS ml_questions_ml_item_id_idx 
  ON public.ml_questions(ml_item_id);
CREATE INDEX IF NOT EXISTS ml_questions_status_idx 
  ON public.ml_questions(status);
CREATE INDEX IF NOT EXISTS ml_questions_date_created_idx 
  ON public.ml_questions(date_created DESC);
CREATE INDEX IF NOT EXISTS ml_questions_unanswered_idx 
  ON public.ml_questions(status, date_created DESC) 
  WHERE status = 'UNANSWERED';

-- RLS Policies
ALTER TABLE public.ml_questions ENABLE ROW LEVEL SECURITY;

-- Users can view own questions
CREATE POLICY "Users can view own ML questions" ON public.ml_questions
  FOR SELECT USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations 
      WHERE tenant_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Users can manage own questions
CREATE POLICY "Users can manage own ML questions" ON public.ml_questions
  FOR ALL USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations 
      WHERE tenant_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Super admins can manage all questions
CREATE POLICY "super_admins_can_manage_all_ml_questions" ON public.ml_questions
  FOR ALL 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id 
      FROM auth.users au 
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- ==========================================
-- Auto-Answer Templates Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.ml_question_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.ml_integrations(id) ON DELETE CASCADE,
  
  -- Template Configuration
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL, -- Array of keywords to match
  template_text TEXT NOT NULL,
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0, -- Higher priority = checked first
  match_type TEXT DEFAULT 'contains' CHECK (match_type IN ('contains', 'exact', 'starts_with', 'regex')),
  
  -- Usage Statistics
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for auto-answer performance
CREATE INDEX IF NOT EXISTS ml_question_templates_integration_id_idx 
  ON public.ml_question_templates(integration_id);
CREATE INDEX IF NOT EXISTS ml_question_templates_active_priority_idx 
  ON public.ml_question_templates(is_active, priority DESC) 
  WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS ml_question_templates_keywords_idx 
  ON public.ml_question_templates USING GIN(keywords);

-- RLS for templates
ALTER TABLE public.ml_question_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own question templates" ON public.ml_question_templates
  FOR ALL USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations 
      WHERE tenant_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

-- ==========================================
-- Comments and Documentation
-- ==========================================
COMMENT ON TABLE public.ml_questions IS 'Stores ML questions/answers for automation and tracking';
COMMENT ON TABLE public.ml_question_templates IS 'Auto-answer templates for common questions';

COMMENT ON COLUMN public.ml_questions.ml_question_id IS 'Original question ID from Mercado Livre API';
COMMENT ON COLUMN public.ml_questions.auto_answered IS 'TRUE if answered automatically by template or AI';
COMMENT ON COLUMN public.ml_question_templates.keywords IS 'Array of keywords to match in questions';
COMMENT ON COLUMN public.ml_question_templates.priority IS 'Template matching priority (higher = first)';