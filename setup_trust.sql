-- public.legal_pages
CREATE TABLE IF NOT EXISTS public.legal_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    content_markdown TEXT,
    version TEXT DEFAULT '1.0.0',
    status TEXT DEFAULT 'draft', -- 'published', 'draft', 'archived'
    effective_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- public.user_policy_consents
CREATE TABLE IF NOT EXISTS public.user_policy_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    policy_slug TEXT NOT NULL,
    version TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    consented_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, policy_slug, version)
);

-- public.contact_inquiries
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    mobile TEXT,
    email TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'resolved', 'spam'
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- public.support_tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL, -- e.g. NX-10293
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    category TEXT NOT NULL,
    priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'waiting_user', 'resolved', 'closed', 'spam'
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    related_booking_id UUID,
    related_shop_id UUID,
    related_job_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- public.support_ticket_messages
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    message TEXT NOT NULL,
    is_internal_note BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RPCs
CREATE OR REPLACE FUNCTION get_public_legal_page(p_slug TEXT)
RETURNS JSON AS $$
DECLARE
    v_page JSON;
BEGIN
    SELECT row_to_json(lp) INTO v_page
    FROM public.legal_pages lp
    WHERE slug = p_slug AND status = 'published';
    
    RETURN v_page;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION accept_policy_consent(p_policy_slug TEXT, p_version TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO public.user_policy_consents (user_id, policy_slug, version)
    VALUES (auth.uid(), p_policy_slug, p_version)
    ON CONFLICT (user_id, policy_slug, version) DO NOTHING;
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION submit_contact_inquiry(p_name TEXT, p_mobile TEXT, p_email TEXT, p_subject TEXT, p_message TEXT)
RETURNS TEXT AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.contact_inquiries (name, mobile, email, subject, message)
    VALUES (p_name, p_mobile, p_email, p_subject, p_message)
    RETURNING id INTO v_id;
    RETURN substr(v_id::text, 1, 8); -- Short ID
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_support_ticket(
    p_category TEXT, 
    p_priority TEXT, 
    p_subject TEXT, 
    p_description TEXT, 
    p_related_booking_id UUID DEFAULT NULL,
    p_related_shop_id UUID DEFAULT NULL,
    p_related_job_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    v_ticket_number TEXT;
    v_ticket_id UUID;
BEGIN
    -- Generate unique ticket number
    v_ticket_number := 'NX-' || floor(random() * 90000 + 10000)::text;
    
    INSERT INTO public.support_tickets (
        ticket_number, user_id, category, priority, subject, description, 
        related_booking_id, related_shop_id, related_job_id
    ) VALUES (
        v_ticket_number, auth.uid(), p_category, p_priority, p_subject, p_description,
        p_related_booking_id, p_related_shop_id, p_related_job_id
    ) RETURNING id INTO v_ticket_id;
    
    RETURN v_ticket_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_support_ticket_message(
    p_ticket_id UUID,
    p_message TEXT,
    p_is_internal_note BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
DECLARE
    v_ticket_owner UUID;
    v_is_admin BOOLEAN;
BEGIN
    -- Security check
    SELECT user_id INTO v_ticket_owner FROM public.support_tickets WHERE id = p_ticket_id;
    
    -- Admin check
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'super_admin'
    ) INTO v_is_admin;
    
    IF v_ticket_owner != auth.uid() AND NOT v_is_admin THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;
    
    INSERT INTO public.support_ticket_messages (ticket_id, sender_id, message, is_internal_note)
    VALUES (p_ticket_id, auth.uid(), p_message, p_is_internal_note);
    
    UPDATE public.support_tickets SET updated_at = now() WHERE id = p_ticket_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_update_support_ticket_status(
    p_ticket_id UUID,
    p_status TEXT,
    p_priority TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_admin BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'super_admin'
    ) INTO v_is_admin;
    
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;
    
    IF p_priority IS NOT NULL THEN
        UPDATE public.support_tickets SET status = p_status, priority = p_priority, updated_at = now() WHERE id = p_ticket_id;
    ELSE
        UPDATE public.support_tickets SET status = p_status, updated_at = now() WHERE id = p_ticket_id;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_get_support_summary()
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_open INT;
    v_in_progress INT;
    v_waiting INT;
    v_resolved INT;
    v_urgent INT;
    v_inquiries INT;
    v_pages INT;
    v_consents INT;
BEGIN
    -- Admin check
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin') THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    SELECT count(*) INTO v_open FROM public.support_tickets WHERE status = 'open';
    SELECT count(*) INTO v_in_progress FROM public.support_tickets WHERE status = 'in_progress';
    SELECT count(*) INTO v_waiting FROM public.support_tickets WHERE status = 'waiting_user';
    SELECT count(*) INTO v_resolved FROM public.support_tickets WHERE status = 'resolved';
    SELECT count(*) INTO v_urgent FROM public.support_tickets WHERE priority = 'urgent' AND status NOT IN ('resolved', 'closed', 'spam');
    
    SELECT count(*) INTO v_inquiries FROM public.contact_inquiries WHERE status = 'open';
    SELECT count(*) INTO v_pages FROM public.legal_pages WHERE status = 'published';
    SELECT count(*) INTO v_consents FROM public.user_policy_consents;
    
    v_result := json_build_object(
        'open_tickets', v_open,
        'in_progress_tickets', v_in_progress,
        'waiting_tickets', v_waiting,
        'resolved_tickets', v_resolved,
        'urgent_tickets', v_urgent,
        'open_inquiries', v_inquiries,
        'published_pages', v_pages,
        'total_consents', v_consents
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
