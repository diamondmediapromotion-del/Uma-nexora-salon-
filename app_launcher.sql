-- 1. APP MODULES TABLE
CREATE TABLE IF NOT EXISTS public.nexora_app_modules (
    app_key TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    icon_name TEXT,
    route_path TEXT NOT NULL,
    required_roles TEXT[],
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0
);

-- Seed data
INSERT INTO public.nexora_app_modules (app_key, title, subtitle, description, icon_name, route_path, required_roles, display_order)
VALUES 
    ('customer_app', 'Customer App', 'Book Salons & Spa', 'Discover salons, book appointments, and earn rewards.', 'User', '/', ARRAY[]::TEXT[], 1),
    ('jobs_app', 'Jobs Portal', 'Find Beauty Jobs', 'Browse beauty industry jobs, apply, and manage your career.', 'Briefcase', '/jobs', ARRAY[]::TEXT[], 2),
    ('owner_app', 'Shop Owner App', 'Manage Your Salon', 'Manage bookings, staff, finances, and growth.', 'Store', ARRAY['shop_owner', 'super_admin'], '/owner-dashboard', 3),
    ('partner_app', 'Growth Partner App', 'Earn Commissions', 'Onboard salons, complete tasks, and earn payouts.', 'TrendingUp', ARRAY['growth_partner', 'super_admin'], '/partner-dashboard', 4),
    ('brand_app', 'Brand & Distributor App', 'B2B Supply Chain', 'Manage products, campaigns, and salon orders.', 'ShoppingBag', ARRAY['brand_partner', 'super_admin'], '/brand-dashboard', 5),
    ('admin_app', 'Super Admin App', 'System Control', 'Manage the entire Nexora ecosystem.', 'Shield', ARRAY['super_admin'], '/admin', 6)
ON CONFLICT (app_key) DO UPDATE SET 
    title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description, 
    icon_name = EXCLUDED.icon_name, route_path = EXCLUDED.route_path, required_roles = EXCLUDED.required_roles, 
    display_order = EXCLUDED.display_order;

-- 2. PWA INSTALL EVENTS
CREATE TABLE IF NOT EXISTS public.pwa_install_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    app_key TEXT,
    event_type TEXT NOT NULL, -- 'prompt_shown', 'installed', 'dismissed'
    platform TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. APP USAGE EVENTS
CREATE TABLE IF NOT EXISTS public.app_usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    app_key TEXT NOT NULL,
    route_path TEXT,
    event_name TEXT DEFAULT 'open',
    platform TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ONBOARDING CHECKLIST
CREATE TABLE IF NOT EXISTS public.user_app_onboarding_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    app_key TEXT NOT NULL,
    item_key TEXT NOT NULL,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    display_order INTEGER DEFAULT 0,
    UNIQUE(user_id, app_key, item_key)
);

-- RLS
ALTER TABLE public.nexora_app_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read app modules" ON public.nexora_app_modules FOR SELECT USING (true);

ALTER TABLE public.pwa_install_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own pwa events" ON public.pwa_install_events FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.uid() IS NULL);

ALTER TABLE public.app_usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own usage events" ON public.app_usage_events FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.uid() IS NULL);

ALTER TABLE public.user_app_onboarding_checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own checklist" ON public.user_app_onboarding_checklist FOR ALL USING (user_id = auth.uid());

-- RPCs
CREATE OR REPLACE FUNCTION public.get_my_app_launcher()
RETURNS JSON AS $$
DECLARE
    v_roles TEXT[];
    v_result JSON;
BEGIN
    SELECT array_agg(role) INTO v_roles FROM public.user_roles WHERE user_id = auth.uid();
    IF v_roles IS NULL THEN v_roles := ARRAY[]::TEXT[]; END IF;

    SELECT json_agg(
        json_build_object(
            'app_key', m.app_key,
            'title', m.title,
            'subtitle', m.subtitle,
            'description', m.description,
            'icon_name', m.icon_name,
            'route_path', m.route_path,
            'required_roles', m.required_roles,
            'has_access', (
                cardinality(m.required_roles) = 0 OR 
                v_roles && m.required_roles OR 
                'super_admin' = ANY(v_roles)
            )
        ) ORDER BY m.display_order
    ) INTO v_result
    FROM public.nexora_app_modules m
    WHERE m.is_active = true;

    RETURN COALESCE(v_result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.track_pwa_install_event(
    p_app_key TEXT,
    p_event_type TEXT,
    p_platform TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.pwa_install_events (user_id, app_key, event_type, platform, user_agent)
    VALUES (auth.uid(), p_app_key, p_event_type, p_platform, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.track_app_usage_event(
    p_app_key TEXT,
    p_route_path TEXT,
    p_event_name TEXT DEFAULT 'open',
    p_platform TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.app_usage_events (user_id, app_key, route_path, event_name, platform, user_agent)
    VALUES (auth.uid(), p_app_key, p_route_path, p_event_name, p_platform, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.ensure_app_onboarding_checklist(p_app_key TEXT)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Initialize if empty
    IF NOT EXISTS (SELECT 1 FROM public.user_app_onboarding_checklist WHERE user_id = auth.uid() AND app_key = p_app_key) THEN
        IF p_app_key = 'customer_app' THEN
            INSERT INTO public.user_app_onboarding_checklist (user_id, app_key, item_key, title, display_order) VALUES
            (auth.uid(), p_app_key, 'complete_profile', 'Complete Profile', 1),
            (auth.uid(), p_app_key, 'first_booking', 'Make First Booking', 2);
        ELSIF p_app_key = 'owner_app' THEN
            INSERT INTO public.user_app_onboarding_checklist (user_id, app_key, item_key, title, display_order) VALUES
            (auth.uid(), p_app_key, 'complete_shop', 'Complete Shop Profile', 1),
            (auth.uid(), p_app_key, 'add_services', 'Add Services', 2),
            (auth.uid(), p_app_key, 'add_payout', 'Add Payout Account', 3);
        ELSIF p_app_key = 'partner_app' THEN
            INSERT INTO public.user_app_onboarding_checklist (user_id, app_key, item_key, title, display_order) VALUES
            (auth.uid(), p_app_key, 'start_training', 'Start Training', 1),
            (auth.uid(), p_app_key, 'add_lead', 'Add First Lead', 2);
        ELSIF p_app_key = 'brand_app' THEN
            INSERT INTO public.user_app_onboarding_checklist (user_id, app_key, item_key, title, display_order) VALUES
            (auth.uid(), p_app_key, 'brand_profile', 'Complete Brand Profile', 1),
            (auth.uid(), p_app_key, 'add_product', 'Add First Product', 2);
        ELSIF p_app_key = 'jobs_app' THEN
            INSERT INTO public.user_app_onboarding_checklist (user_id, app_key, item_key, title, display_order) VALUES
            (auth.uid(), p_app_key, 'job_profile', 'Create Job Profile', 1),
            (auth.uid(), p_app_key, 'upload_resume', 'Upload Resume', 2);
        END IF;
    END IF;

    SELECT json_agg(
        json_build_object(
            'item_key', item_key,
            'title', title,
            'is_completed', is_completed
        ) ORDER BY display_order
    ) INTO v_result
    FROM public.user_app_onboarding_checklist
    WHERE user_id = auth.uid() AND app_key = p_app_key;

    RETURN COALESCE(v_result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.complete_app_checklist_item(p_app_key TEXT, p_item_key TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.user_app_onboarding_checklist
    SET is_completed = true, completed_at = now()
    WHERE user_id = auth.uid() AND app_key = p_app_key AND item_key = p_item_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
