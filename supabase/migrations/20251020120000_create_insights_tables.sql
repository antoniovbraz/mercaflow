-- Migration: Create Insights Tables for Intelligence Module
-- Created: 2025-10-20
-- Description: Tables for storing AI-generated business insights with RLS policies

-- ============================================================================
-- INSIGHTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.insights (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Multi-tenancy
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Insight classification
    category TEXT NOT NULL CHECK (category IN (
        'PRICE_OPTIMIZATION',
        'AUTOMATION_OPPORTUNITY',
        'MARKET_TREND',
        'PERFORMANCE_WARNING',
        'QUALITY_IMPROVEMENT',
        'COMPETITOR_ALERT'
    )),
    priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),
    confidence INTEGER NOT NULL CHECK (confidence BETWEEN 0 AND 100),
    
    -- Content
    title TEXT NOT NULL CHECK (char_length(title) <= 100),
    description TEXT NOT NULL,
    roi_estimate DECIMAL(12, 2), -- Estimated monthly ROI in BRL
    action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING',
        'DISMISSED',
        'COMPLETED',
        'EXPIRED'
    )),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Multi-tenancy index (most important)
CREATE INDEX idx_insights_tenant_id ON public.insights(tenant_id);

-- Status and priority queries
CREATE INDEX idx_insights_status_priority ON public.insights(status, priority) WHERE status = 'PENDING';

-- Category filtering
CREATE INDEX idx_insights_category ON public.insights(category);

-- Expiration cleanup
CREATE INDEX idx_insights_expires_at ON public.insights(expires_at) WHERE expires_at IS NOT NULL AND status = 'PENDING';

-- User-specific insights
CREATE INDEX idx_insights_user_id ON public.insights(user_id) WHERE user_id IS NOT NULL;

-- GIN index for metadata JSONB queries
CREATE INDEX idx_insights_metadata ON public.insights USING GIN(metadata);

-- Composite index for dashboard queries (tenant + status + priority)
CREATE INDEX idx_insights_dashboard ON public.insights(tenant_id, status, priority, created_at DESC) WHERE status = 'PENDING';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view insights from their tenant
CREATE POLICY "Users can view their tenant insights"
    ON public.insights
    FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Policy: Users can insert insights to their tenant
CREATE POLICY "Users can create insights for their tenant"
    ON public.insights
    FOR INSERT
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Policy: Users can update insights from their tenant
CREATE POLICY "Users can update their tenant insights"
    ON public.insights
    FOR UPDATE
    USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Policy: Users can delete insights from their tenant (soft delete via status)
CREATE POLICY "Users can delete their tenant insights"
    ON public.insights
    FOR DELETE
    USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_insights_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_insights_updated_at
    BEFORE UPDATE ON public.insights
    FOR EACH ROW
    EXECUTE FUNCTION public.update_insights_updated_at();

-- Trigger: Auto-expire insights
-- This trigger automatically sets status to 'EXPIRED' for insights past their expiration date
CREATE OR REPLACE FUNCTION public.expire_old_insights()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.insights
    SET status = 'EXPIRED',
        updated_at = NOW()
    WHERE status = 'PENDING'
      AND expires_at IS NOT NULL
      AND expires_at < NOW();
END;
$$;

-- Note: To run this periodically, you would need to set up a cron job
-- For example, using pg_cron extension:
-- SELECT cron.schedule('expire-insights', '0 * * * *', 'SELECT public.expire_old_insights();');

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE public.insights IS 'AI-generated business insights for intelligence module';
COMMENT ON COLUMN public.insights.id IS 'Unique identifier for insight';
COMMENT ON COLUMN public.insights.tenant_id IS 'Reference to tenant (multi-tenancy)';
COMMENT ON COLUMN public.insights.user_id IS 'Optional: User who generated the insight';
COMMENT ON COLUMN public.insights.category IS 'Type of insight (PRICE_OPTIMIZATION, AUTOMATION_OPPORTUNITY, etc)';
COMMENT ON COLUMN public.insights.priority IS 'Urgency level: 1 (highest) to 5 (lowest)';
COMMENT ON COLUMN public.insights.confidence IS 'Confidence score: 0-100%';
COMMENT ON COLUMN public.insights.title IS 'Short insight title (max 100 chars)';
COMMENT ON COLUMN public.insights.description IS 'Detailed explanation of the insight';
COMMENT ON COLUMN public.insights.roi_estimate IS 'Estimated monthly ROI in BRL (can be negative for losses)';
COMMENT ON COLUMN public.insights.action_items IS 'Array of specific actions to take';
COMMENT ON COLUMN public.insights.metadata IS 'Category-specific metadata (item_id, prices, etc)';
COMMENT ON COLUMN public.insights.status IS 'Current status: PENDING, DISMISSED, COMPLETED, or EXPIRED';
COMMENT ON COLUMN public.insights.created_at IS 'When insight was generated';
COMMENT ON COLUMN public.insights.expires_at IS 'When insight becomes irrelevant (auto-expires)';
COMMENT ON COLUMN public.insights.dismissed_at IS 'When user dismissed the insight';
COMMENT ON COLUMN public.insights.completed_at IS 'When user completed the action';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant authenticated users access to insights table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insights TO authenticated;
-- Note: No sequence needed - using UUID with gen_random_uuid()

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment to insert sample insights for testing
/*
INSERT INTO public.insights (
    tenant_id,
    category,
    priority,
    confidence,
    title,
    description,
    roi_estimate,
    action_items,
    metadata,
    expires_at
) VALUES (
    (SELECT id FROM public.tenants LIMIT 1), -- Get first tenant
    'PRICE_OPTIMIZATION',
    1,
    95,
    'Preço 15% acima do ideal',
    'Este item está R$ 30.00 acima do preço sugerido pelo ML. Você pode estar perdendo vendas para concorrentes.',
    1500.00,
    '["Ajustar preço para R$ 170.00", "Monitorar conversão nas próximas 48h"]'::jsonb,
    '{"item_id": "MLB123456789", "current_price": 200.00, "suggested_price": 170.00}'::jsonb,
    NOW() + INTERVAL '1 day'
);
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify table was created
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'insights'
    ) THEN
        RAISE NOTICE '✓ Table public.insights created successfully';
    ELSE
        RAISE EXCEPTION '✗ Failed to create table public.insights';
    END IF;
END $$;

-- Verify RLS is enabled
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'insights'
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✓ RLS enabled on public.insights';
    ELSE
        RAISE WARNING '✗ RLS not enabled on public.insights';
    END IF;
END $$;

-- Count policies
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'insights';
    
    RAISE NOTICE '✓ Created % RLS policies on public.insights', policy_count;
END $$;

-- Count indexes
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = 'insights';
    
    RAISE NOTICE '✓ Created % indexes on public.insights', index_count;
END $$;
