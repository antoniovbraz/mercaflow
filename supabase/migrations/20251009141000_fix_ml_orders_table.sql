-- Fix ML Orders table structure
-- Add missing columns to existing ml_orders table

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add ml_item_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ml_orders' AND column_name = 'ml_item_id') THEN
        ALTER TABLE ml_orders ADD COLUMN ml_item_id TEXT;
    END IF;
    
    -- Add other essential columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ml_orders' AND column_name = 'quantity') THEN
        ALTER TABLE ml_orders ADD COLUMN quantity INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ml_orders' AND column_name = 'unit_price') THEN
        ALTER TABLE ml_orders ADD COLUMN unit_price DECIMAL(15,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ml_orders' AND column_name = 'item_title') THEN
        ALTER TABLE ml_orders ADD COLUMN item_title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ml_orders' AND column_name = 'buyer_nickname') THEN
        ALTER TABLE ml_orders ADD COLUMN buyer_nickname TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ml_orders' AND column_name = 'buyer_email') THEN
        ALTER TABLE ml_orders ADD COLUMN buyer_email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ml_orders' AND column_name = 'shipping_status') THEN
        ALTER TABLE ml_orders ADD COLUMN shipping_status TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ml_orders' AND column_name = 'payment_status') THEN
        ALTER TABLE ml_orders ADD COLUMN payment_status TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ml_orders' AND column_name = 'payment_method') THEN
        ALTER TABLE ml_orders ADD COLUMN payment_method TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ml_orders' AND column_name = 'feedback_rating') THEN
        ALTER TABLE ml_orders ADD COLUMN feedback_rating INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ml_orders' AND column_name = 'last_synced_at') THEN
        ALTER TABLE ml_orders ADD COLUMN last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- Create indexes for missing columns
CREATE INDEX IF NOT EXISTS idx_ml_orders_ml_item_id ON ml_orders(ml_item_id);
CREATE INDEX IF NOT EXISTS idx_ml_orders_buyer_nickname ON ml_orders(buyer_nickname);
CREATE INDEX IF NOT EXISTS idx_ml_orders_last_synced ON ml_orders(last_synced_at);

-- Create ml_order_analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS ml_order_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES ml_integrations(id) ON DELETE CASCADE,
    
    -- Analytics period
    period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    period_date DATE NOT NULL,
    
    -- Sales metrics
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_profit DECIMAL(15,2) DEFAULT 0,
    total_units_sold INTEGER DEFAULT 0,
    
    -- Order status distribution
    orders_pending INTEGER DEFAULT 0,
    orders_paid INTEGER DEFAULT 0,
    orders_shipped INTEGER DEFAULT 0,
    orders_delivered INTEGER DEFAULT 0,
    orders_cancelled INTEGER DEFAULT 0,
    
    -- Financial metrics
    avg_order_value DECIMAL(15,2) DEFAULT 0,
    avg_profit_margin DECIMAL(10,4) DEFAULT 0,
    total_fees_paid DECIMAL(15,2) DEFAULT 0,
    
    -- Customer metrics
    unique_customers INTEGER DEFAULT 0,
    repeat_customers INTEGER DEFAULT 0,
    
    -- Product performance
    top_selling_category TEXT,
    top_selling_item_id TEXT,
    
    -- Calculated at
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Standard fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Ensure unique period per integration
    UNIQUE(integration_id, period_type, period_date)
);

-- Create indexes for analytics table
CREATE INDEX IF NOT EXISTS idx_ml_order_analytics_integration_id ON ml_order_analytics(integration_id);
CREATE INDEX IF NOT EXISTS idx_ml_order_analytics_period ON ml_order_analytics(period_type, period_date);
CREATE INDEX IF NOT EXISTS idx_ml_order_analytics_calculated_at ON ml_order_analytics(calculated_at);

-- Enable RLS for analytics table
ALTER TABLE ml_order_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ml_order_analytics if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ml_order_analytics' AND policyname = 'Users can view analytics from their integrations') THEN
        CREATE POLICY "Users can view analytics from their integrations"
            ON ml_order_analytics FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM ml_integrations mi
                    WHERE mi.id = ml_order_analytics.integration_id
                    AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
                )
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ml_order_analytics' AND policyname = 'Users can insert analytics to their integrations') THEN
        CREATE POLICY "Users can insert analytics to their integrations"
            ON ml_order_analytics FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM ml_integrations mi
                    WHERE mi.id = ml_order_analytics.integration_id
                    AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
                )
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ml_order_analytics' AND policyname = 'Users can update analytics in their integrations') THEN
        CREATE POLICY "Users can update analytics in their integrations"
            ON ml_order_analytics FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM ml_integrations mi
                    WHERE mi.id = ml_order_analytics.integration_id
                    AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
                )
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ml_order_analytics' AND policyname = 'Users can delete analytics from their integrations') THEN
        CREATE POLICY "Users can delete analytics from their integrations"
            ON ml_order_analytics FOR DELETE
            USING (
                EXISTS (
                    SELECT 1 FROM ml_integrations mi
                    WHERE mi.id = ml_order_analytics.integration_id
                    AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
                )
            );
    END IF;
END $$;