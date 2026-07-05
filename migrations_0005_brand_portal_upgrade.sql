
-- 10B Distributor & Brand Portal Media + Product Review + Sponsored Analytics

-- NEW TABLES FOR 10B

-- 1. Brand Product Categories
CREATE TABLE IF NOT EXISTS public.brand_product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon_name TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Brand Media Assets
CREATE TABLE IF NOT EXISTS public.brand_media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES public.brand_profiles(id),
    asset_type TEXT NOT NULL, -- 'logo', 'banner', 'video', 'product_image'
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    file_name TEXT,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Sponsored Campaign Events (Analytics)
CREATE TABLE IF NOT EXISTS public.sponsored_campaign_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.sponsored_campaigns(id),
    brand_id UUID REFERENCES public.brand_profiles(id),
    event_type TEXT NOT NULL, -- 'impression', 'click', 'lead'
    page_url TEXT,
    idempotency_key TEXT, -- campaign_id + page + session/day
    user_id UUID, -- Optional
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure indexes for analytics
CREATE INDEX IF NOT EXISTS idx_sponsored_campaign_events_campaign_id ON public.sponsored_campaign_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_campaign_events_event_type ON public.sponsored_campaign_events(event_type);
CREATE INDEX IF NOT EXISTS idx_sponsored_campaign_events_idempotency ON public.sponsored_campaign_events(idempotency_key);

-- RPCs FOR 10B

-- 1. Get Public Brand By Code
CREATE OR REPLACE FUNCTION public.get_public_brand_by_code(p_brand_code TEXT)
RETURNS JSON AS $$
DECLARE
    v_brand JSON;
BEGIN
    SELECT json_build_object(
        'id', id,
        'brand_code', brand_code,
        'display_name', display_name,
        'logo_url', logo_url,
        'banner_url', banner_url,
        'intro_video_url', intro_video_url,
        'business_type', business_type,
        'city', city,
        'state', state,
        'about', about,
        'product_categories', product_categories,
        'website_url', website_url,
        'instagram_handle', instagram_handle,
        'whatsapp_number', whatsapp_number,
        'is_verified', is_verified,
        'is_featured', is_featured,
        'status', status
    ) INTO v_brand
    FROM public.brand_profiles
    WHERE brand_code = p_brand_code AND status = 'approved';
    
    RETURN v_brand;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Get My Brand Profile
CREATE OR REPLACE FUNCTION public.get_my_brand_profile()
RETURNS JSON AS $$
DECLARE
    v_brand JSON;
BEGIN
    SELECT json_build_object(
        'id', id,
        'user_id', user_id,
        'brand_code', brand_code,
        'display_name', display_name,
        'logo_url', logo_url,
        'banner_url', banner_url,
        'intro_video_url', intro_video_url,
        'business_type', business_type,
        'city', city,
        'state', state,
        'about', about,
        'product_categories', product_categories,
        'website_url', website_url,
        'instagram_handle', instagram_handle,
        'whatsapp_number', whatsapp_number,
        'is_verified', is_verified,
        'is_featured', is_featured,
        'status', status,
        'admin_note', admin_note
    ) INTO v_brand
    FROM public.brand_profiles
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    RETURN v_brand;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Submit Brand Product for Review
CREATE OR REPLACE FUNCTION public.submit_brand_product_for_review(p_product_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.brand_products
    SET status = 'pending_review',
        updated_at = now()
    WHERE id = p_product_id 
    AND brand_id IN (SELECT id FROM public.brand_profiles WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Admin Update Brand Product Status
CREATE OR REPLACE FUNCTION public.admin_update_brand_product_status(
    p_product_id UUID,
    p_status TEXT,
    p_rejection_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Check if caller is super_admin
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin') THEN
        RAISE EXCEPTION 'Only super_admin can update product status';
    END IF;

    UPDATE public.brand_products
    SET status = p_status,
        rejection_reason = p_rejection_reason,
        updated_at = now()
    WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Admin Update Brand Profile Admin Controls
CREATE OR REPLACE FUNCTION public.admin_update_brand_profile_admin_controls(
    p_brand_id UUID,
    p_status TEXT,
    p_is_verified BOOLEAN,
    p_is_featured BOOLEAN,
    p_admin_note TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Check if caller is super_admin
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin') THEN
        RAISE EXCEPTION 'Only super_admin can update brand controls';
    END IF;

    UPDATE public.brand_profiles
    SET status = p_status,
        is_verified = p_is_verified,
        is_featured = p_is_featured,
        admin_note = p_admin_note,
        updated_at = now()
    WHERE id = p_brand_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Register Brand Media Asset
CREATE OR REPLACE FUNCTION public.register_brand_media_asset(
    p_asset_type TEXT,
    p_storage_path TEXT,
    p_public_url TEXT,
    p_file_name TEXT DEFAULT NULL,
    p_file_size INTEGER DEFAULT NULL,
    p_mime_type TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_brand_id UUID;
    v_asset_id UUID;
BEGIN
    SELECT id INTO v_brand_id FROM public.brand_profiles WHERE user_id = auth.uid();
    
    IF v_brand_id IS NULL THEN
        RAISE EXCEPTION 'Brand profile not found for current user';
    END IF;

    INSERT INTO public.brand_media_assets (
        brand_id, asset_type, storage_path, public_url, file_name, file_size, mime_type
    ) VALUES (
        v_brand_id, p_asset_type, p_storage_path, p_public_url, p_file_name, p_file_size, p_mime_type
    ) RETURNING id INTO v_asset_id;

    RETURN v_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Track Sponsored Campaign Event
CREATE OR REPLACE FUNCTION public.track_sponsored_campaign_event(
    p_campaign_id UUID,
    p_event_type TEXT,
    p_page_url TEXT DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_brand_id UUID;
BEGIN
    -- Check idempotency
    IF p_idempotency_key IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.sponsored_campaign_events 
        WHERE idempotency_key = p_idempotency_key
    ) THEN
        RETURN;
    END IF;

    SELECT brand_id INTO v_brand_id FROM public.sponsored_campaigns WHERE id = p_campaign_id;

    INSERT INTO public.sponsored_campaign_events (
        campaign_id, brand_id, event_type, page_url, idempotency_key, user_id
    ) VALUES (
        p_campaign_id, v_brand_id, p_event_type, p_page_url, p_idempotency_key, auth.uid()
    );

    -- Update campaign aggregate counters (optional but good for performance)
    IF p_event_type = 'impression' THEN
        UPDATE public.sponsored_campaigns SET impressions = impressions + 1 WHERE id = p_campaign_id;
    ELSIF p_event_type = 'click' THEN
        UPDATE public.sponsored_campaigns SET clicks = clicks + 1 WHERE id = p_campaign_id;
    ELSIF p_event_type = 'lead' THEN
        UPDATE public.sponsored_campaigns SET leads = leads + 1 WHERE id = p_campaign_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SEEDING DATA
INSERT INTO public.brand_product_categories (name, slug, icon_name, display_order)
VALUES 
('Skin Care', 'skin-care', 'Sparkles', 1),
('Hair Care', 'hair-care', 'Zap', 2),
('Makeup', 'makeup', 'Heart', 3),
('Personal Care', 'personal-care', 'Smile', 4),
('Fragrance', 'fragrance', 'Wind', 5),
('Beauty Tools', 'beauty-tools', 'Scissors', 6)
ON CONFLICT (name) DO NOTHING;
