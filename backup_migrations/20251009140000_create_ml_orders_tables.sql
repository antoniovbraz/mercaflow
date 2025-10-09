-- Create ML Orders tables for sales analytics and performance tracking
-- 
-- This migration creates the comprehensive database structure for MercadoLivre Orders management,
-- enabling complete sales history tracking, analytics, and performance monitoring.

-- Create ml_orders table for storing order information
CREATE TABLE IF NOT EXISTS ml_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES ml_integrations(id) ON DELETE CASCADE,
    
    -- ML API order data
    ml_order_id TEXT NOT NULL,
    ml_pack_id TEXT,
    ml_item_id TEXT,
    
    -- Order status and timing
    status TEXT NOT NULL,
    status_detail TEXT,
    date_created TIMESTAMP WITH TIME ZONE,
    date_closed TIMESTAMP WITH TIME ZONE,
    date_last_updated TIMESTAMP WITH TIME ZONE,
    
    -- Financial information
    total_amount DECIMAL(15,2),
    currency_id TEXT DEFAULT 'BRL',
    paid_amount DECIMAL(15,2),
    
    -- Buyer information
    buyer_id TEXT,
    buyer_nickname TEXT,
    buyer_email TEXT,
    buyer_first_name TEXT,
    buyer_last_name TEXT,
    buyer_phone TEXT,
    
    -- Seller information
    seller_id TEXT,
    seller_nickname TEXT,
    
    -- Product information
    quantity INTEGER,
    unit_price DECIMAL(15,2),
    item_title TEXT,
    item_category_id TEXT,
    item_variation_id TEXT,
    item_variation_attributes JSONB,
    
    -- Shipping information
    shipping_id TEXT,
    shipping_status TEXT,
    shipping_mode TEXT,
    shipping_cost DECIMAL(15,2),
    shipping_method TEXT,
    shipping_address JSONB,
    tracking_number TEXT,
    tracking_method TEXT,
    
    -- Payment information
    payment_id TEXT,
    payment_method TEXT,
    payment_type TEXT,
    payment_status TEXT,
    installments INTEGER,
    
    -- Fees and costs
    mercadolibre_fee DECIMAL(15,2),
    shipping_fee DECIMAL(15,2),
    financing_fee DECIMAL(15,2),
    
    -- Order context
    context JSONB,
    tags TEXT[],
    
    -- Feedback and ratings
    feedback_rating INTEGER,
    feedback_message TEXT,
    feedback_date TIMESTAMP WITH TIME ZONE,
    
    -- Local management and analytics
    profit_margin DECIMAL(15,2),
    cost_of_goods DECIMAL(15,2),
    net_profit DECIMAL(15,2),
    
    -- Sync metadata
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    sync_error_count INTEGER DEFAULT 0,
    sync_error_message TEXT,
    
    -- Standard fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Ensure unique ML order per integration
    UNIQUE(integration_id, ml_order_id)
);

-- Create ml_order_items table for detailed order items (in case of multiple items per order)
CREATE TABLE IF NOT EXISTS ml_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES ml_orders(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES ml_integrations(id) ON DELETE CASCADE,
    
    -- ML API item data
    ml_item_id TEXT NOT NULL,
    item_title TEXT,
    item_category_id TEXT,
    item_variation_id TEXT,
    item_variation_attributes JSONB,
    
    -- Pricing and quantity
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    
    -- Item specifics
    item_condition TEXT,
    item_warranty TEXT,
    item_listing_type TEXT,
    
    -- Local cost tracking
    cost_per_unit DECIMAL(15,2),
    total_cost DECIMAL(15,2),
    profit_per_unit DECIMAL(15,2),
    total_profit DECIMAL(15,2),
    
    -- Standard fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ml_order_analytics table for aggregated analytics data
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ml_orders_integration_id ON ml_orders(integration_id);
CREATE INDEX IF NOT EXISTS idx_ml_orders_ml_order_id ON ml_orders(ml_order_id);
CREATE INDEX IF NOT EXISTS idx_ml_orders_status ON ml_orders(status);
CREATE INDEX IF NOT EXISTS idx_ml_orders_date_created ON ml_orders(date_created);
CREATE INDEX IF NOT EXISTS idx_ml_orders_date_closed ON ml_orders(date_closed);
CREATE INDEX IF NOT EXISTS idx_ml_orders_buyer_id ON ml_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_ml_orders_ml_item_id ON ml_orders(ml_item_id);
CREATE INDEX IF NOT EXISTS idx_ml_orders_total_amount ON ml_orders(total_amount);
CREATE INDEX IF NOT EXISTS idx_ml_orders_last_synced ON ml_orders(last_synced_at);

CREATE INDEX IF NOT EXISTS idx_ml_order_items_order_id ON ml_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_ml_order_items_integration_id ON ml_order_items(integration_id);
CREATE INDEX IF NOT EXISTS idx_ml_order_items_ml_item_id ON ml_order_items(ml_item_id);

CREATE INDEX IF NOT EXISTS idx_ml_order_analytics_integration_id ON ml_order_analytics(integration_id);
CREATE INDEX IF NOT EXISTS idx_ml_order_analytics_period ON ml_order_analytics(period_type, period_date);
CREATE INDEX IF NOT EXISTS idx_ml_order_analytics_calculated_at ON ml_order_analytics(calculated_at);

-- Enable RLS (Row Level Security)
ALTER TABLE ml_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_order_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ml_orders
CREATE POLICY "Users can view orders from their integrations"
    ON ml_orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_orders.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

CREATE POLICY "Users can insert orders to their integrations"
    ON ml_orders FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_orders.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

CREATE POLICY "Users can update orders in their integrations"
    ON ml_orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_orders.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

CREATE POLICY "Users can delete orders from their integrations"
    ON ml_orders FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_orders.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

-- Create RLS policies for ml_order_items
CREATE POLICY "Users can view order items from their integrations"
    ON ml_order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_order_items.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

CREATE POLICY "Users can insert order items to their integrations"
    ON ml_order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_order_items.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

CREATE POLICY "Users can update order items in their integrations"
    ON ml_order_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_order_items.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

CREATE POLICY "Users can delete order items from their integrations"
    ON ml_order_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_order_items.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

-- Create RLS policies for ml_order_analytics
CREATE POLICY "Users can view analytics from their integrations"
    ON ml_order_analytics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_order_analytics.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

CREATE POLICY "Users can insert analytics to their integrations"
    ON ml_order_analytics FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_order_analytics.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

CREATE POLICY "Users can update analytics in their integrations"
    ON ml_order_analytics FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_order_analytics.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

CREATE POLICY "Users can delete analytics from their integrations"
    ON ml_order_analytics FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_order_analytics.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

-- Add comments for documentation
COMMENT ON TABLE ml_orders IS 'Complete MercadoLivre orders with comprehensive sales tracking and analytics support';
COMMENT ON TABLE ml_order_items IS 'Detailed breakdown of items within ML orders for complex multi-item purchases';
COMMENT ON TABLE ml_order_analytics IS 'Pre-calculated analytics data for performance dashboards and reporting';

COMMENT ON COLUMN ml_orders.ml_order_id IS 'MercadoLivre order ID from the API';
COMMENT ON COLUMN ml_orders.ml_pack_id IS 'MercadoLivre pack ID that groups related order items';
COMMENT ON COLUMN ml_orders.status IS 'Order status: confirmed, payment_required, payment_in_process, paid, shipped, delivered, cancelled, etc.';
COMMENT ON COLUMN ml_orders.total_amount IS 'Total order value including all fees and shipping';
COMMENT ON COLUMN ml_orders.profit_margin IS 'Calculated profit margin percentage for this order';
COMMENT ON COLUMN ml_orders.shipping_address IS 'JSON object with complete shipping address details';
COMMENT ON COLUMN ml_orders.item_variation_attributes IS 'JSON object with item variation details (color, size, etc.)';

COMMENT ON COLUMN ml_order_analytics.period_type IS 'Analytics aggregation period: daily, weekly, monthly, or yearly';
COMMENT ON COLUMN ml_order_analytics.avg_profit_margin IS 'Average profit margin as decimal (0.15 = 15%)';
COMMENT ON COLUMN ml_order_analytics.repeat_customers IS 'Number of customers with multiple orders in this period';