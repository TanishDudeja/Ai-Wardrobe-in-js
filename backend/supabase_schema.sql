-- ========================================================
-- AI Wardrobe - Supabase PostgreSQL Schema
-- ========================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create items table (with user_id column)
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('tops', 'bottoms', 'outerwear', 'shoes', 'accessories')),
    color TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure user_id exists if the table was created earlier without it
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS user_id TEXT;

-- 2. Create saved outfits table (for lookbook history)
CREATE TABLE IF NOT EXISTS public.outfits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    occasion TEXT NOT NULL,
    style TEXT NOT NULL,
    styling_reason TEXT,
    item_ids UUID[] DEFAULT '{}',
    tryon_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure user_id exists on outfits table
ALTER TABLE public.outfits ADD COLUMN IF NOT EXISTS user_id TEXT;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;

-- 4. Create public access policies (allows reading and writing for the app)
CREATE POLICY "Public Read Items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Public Insert Items" ON public.items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Items" ON public.items FOR UPDATE USING (true);
CREATE POLICY "Public Delete Items" ON public.items FOR DELETE USING (true);

CREATE POLICY "Public Read Outfits" ON public.outfits FOR SELECT USING (true);
CREATE POLICY "Public Insert Outfits" ON public.outfits FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Outfits" ON public.outfits FOR DELETE USING (true);
