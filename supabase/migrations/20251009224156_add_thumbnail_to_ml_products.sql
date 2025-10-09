-- Migration: Add thumbnail column to ml_products
-- Date: 2025-10-09 22:41:56
-- Description: Adds thumbnail column to store ML product image URLs

-- Add thumbnail column to ml_products table
ALTER TABLE public.ml_products 
ADD COLUMN IF NOT EXISTS thumbnail TEXT;

-- Add index for thumbnail lookups
CREATE INDEX IF NOT EXISTS ml_products_thumbnail_idx 
  ON public.ml_products(thumbnail);

-- Add picture column as well for backward compatibility
ALTER TABLE public.ml_products 
ADD COLUMN IF NOT EXISTS picture TEXT;

-- Add condition and listing_type_id columns if they don't exist
ALTER TABLE public.ml_products 
ADD COLUMN IF NOT EXISTS condition TEXT,
ADD COLUMN IF NOT EXISTS listing_type_id TEXT;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS ml_products_condition_idx 
  ON public.ml_products(condition);

CREATE INDEX IF NOT EXISTS ml_products_listing_type_idx 
  ON public.ml_products(listing_type_id);
