
-- 11B Job Portal Resume Upload + Interview + Notifications + Analytics

-- 1. Job Document Assets (Private Storage Reference)
CREATE TABLE IF NOT EXISTS public.job_document_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    asset_type TEXT NOT NULL, -- 'resume', 'portfolio', 'certificate', 'experience_letter', 'other'
    storage_path TEXT NOT NULL,
    file_name TEXT,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Job Post Views (Analytics)
CREATE TABLE IF NOT EXISTS public.job_post_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.job_posts(id),
    user_id UUID REFERENCES auth.users(id), -- Optional
    page_source TEXT,
    idempotency_key TEXT, -- job_id + session/day
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Job Application Events (Timeline)
CREATE TABLE IF NOT EXISTS public.job_application_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.job_applications(id),
    event_type TEXT NOT NULL, -- 'submitted', 'viewed', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'withdrawn'
    note TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Job Interviews
CREATE TABLE IF NOT EXISTS public.job_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.job_applications(id),
    job_id UUID REFERENCES public.job_posts(id),
    candidate_id UUID REFERENCES auth.users(id),
    owner_id UUID REFERENCES auth.users(id),
    interview_at TIMESTAMPTZ NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'rescheduled', 'completed', 'cancelled', 'no_show'
    owner_note TEXT,
    candidate_note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Job Notifications
CREATE TABLE IF NOT EXISTS public.job_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    related_id UUID, -- application_id or job_id
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Job Alert Preferences
CREATE TABLE IF NOT EXISTS public.job_alert_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    preferred_categories TEXT[],
    preferred_cities TEXT[],
    preferred_areas TEXT[],
    preferred_job_types TEXT[],
    min_salary INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Saved Jobs (Missing from 11A check)
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    job_id UUID REFERENCES public.job_posts(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, job_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_post_views_job_id ON public.job_post_views(job_id);
CREATE INDEX IF NOT EXISTS idx_job_post_views_idempotency ON public.job_post_views(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_job_application_events_application_id ON public.job_application_events(application_id);
CREATE INDEX IF NOT EXISTS idx_job_interviews_application_id ON public.job_interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_job_notifications_user_id ON public.job_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_notifications_is_read ON public.job_notifications(is_read);

-- RPCs

-- 1. Register Job Document Asset
CREATE OR REPLACE FUNCTION public.register_job_document_asset(
    p_asset_type TEXT,
    p_storage_path TEXT,
    p_file_name TEXT DEFAULT NULL,
    p_file_size INTEGER DEFAULT NULL,
    p_mime_type TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_asset_id UUID;
BEGIN
    INSERT INTO public.job_document_assets (
        user_id, asset_type, storage_path, file_name, file_size, mime_type
    ) VALUES (
        auth.uid(), p_asset_type, p_storage_path, p_file_name, p_file_size, p_mime_type
    ) RETURNING id INTO v_asset_id;

    RETURN v_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Track Job Post View
CREATE OR REPLACE FUNCTION public.track_job_post_view(
    p_job_id UUID,
    p_page_source TEXT DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Only track if job exists and is active
    IF NOT EXISTS (SELECT 1 FROM public.job_posts WHERE id = p_job_id AND status = 'active') THEN
        RETURN;
    END IF;

    -- Check idempotency
    IF p_idempotency_key IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.job_post_views 
        WHERE idempotency_key = p_idempotency_key
    ) THEN
        RETURN;
    END IF;

    INSERT INTO public.job_post_views (
        job_id, user_id, page_source, idempotency_key
    ) VALUES (
        p_job_id, auth.uid(), p_page_source, p_idempotency_key
    );

    -- Update job post aggregate counter
    UPDATE public.job_posts SET views_count = views_count + 1 WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Toggle Saved Job
CREATE OR REPLACE FUNCTION public.toggle_saved_job(p_job_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.saved_jobs 
        WHERE user_id = auth.uid() AND job_id = p_job_id
    ) INTO v_exists;

    IF v_exists THEN
        DELETE FROM public.saved_jobs WHERE user_id = auth.uid() AND job_id = p_job_id;
        RETURN false; -- Unsaved
    ELSE
        INSERT INTO public.saved_jobs (user_id, job_id) VALUES (auth.uid(), p_job_id);
        RETURN true; -- Saved
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Apply to Job (Enhanced with resume_asset_id)
CREATE OR REPLACE FUNCTION public.apply_to_job(
    p_job_id UUID,
    p_resume_asset_id UUID DEFAULT NULL,
    p_cover_message TEXT DEFAULT NULL,
    p_candidate_skills TEXT[] DEFAULT NULL,
    p_experience_years INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_application_id UUID;
    v_owner_id UUID;
    v_job_title TEXT;
BEGIN
    -- Get job details
    SELECT owner_id, title INTO v_owner_id, v_job_title FROM public.job_posts WHERE id = p_job_id;

    -- Create application
    INSERT INTO public.job_applications (
        job_id, user_id, resume_asset_id, cover_message, candidate_skills, experience_years, status
    ) VALUES (
        p_job_id, auth.uid(), p_resume_asset_id, p_cover_message, p_candidate_skills, p_experience_years, 'applied'
    ) RETURNING id INTO v_application_id;

    -- Create event
    INSERT INTO public.job_application_events (
        application_id, event_type, created_by
    ) VALUES (
        v_application_id, 'submitted', auth.uid()
    );

    -- Create notification for owner
    INSERT INTO public.job_notifications (
        user_id, title, message, notification_type, related_id
    ) VALUES (
        v_owner_id, 'New Application', 'You received a new application for ' || v_job_title, 'new_application', v_application_id
    );

    RETURN v_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Owner Update Job Application Status (Enhanced)
CREATE OR REPLACE FUNCTION public.owner_update_job_application_status(
    p_application_id UUID,
    p_status TEXT,
    p_note TEXT DEFAULT NULL,
    p_interview_at TIMESTAMPTZ DEFAULT NULL,
    p_interview_location TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_job_id UUID;
    v_candidate_id UUID;
    v_owner_id UUID;
    v_job_title TEXT;
BEGIN
    -- Check ownership
    SELECT jp.owner_id, jp.id, ja.user_id, jp.title 
    INTO v_owner_id, v_job_id, v_candidate_id, v_job_title
    FROM public.job_applications ja
    JOIN public.job_posts jp ON ja.job_id = jp.id
    WHERE ja.id = p_application_id;

    IF v_owner_id != auth.uid() THEN
        RAISE EXCEPTION 'Not authorized to update this application';
    END IF;

    -- Update status
    UPDATE public.job_applications SET status = p_status, updated_at = now() WHERE id = p_application_id;

    -- Create event
    INSERT INTO public.job_application_events (
        application_id, event_type, note, created_by
    ) VALUES (
        p_application_id, 
        CASE 
            WHEN p_status = 'shortlisted' THEN 'shortlisted'
            WHEN p_status = 'interview_scheduled' THEN 'interview_scheduled'
            WHEN p_status = 'selected' THEN 'selected'
            WHEN p_status = 'rejected' THEN 'rejected'
            WHEN p_status = 'viewed' THEN 'viewed'
            ELSE p_status
        END,
        p_note, auth.uid()
    );

    -- Create interview if scheduled
    IF p_status = 'interview_scheduled' AND p_interview_at IS NOT NULL THEN
        INSERT INTO public.job_interviews (
            application_id, job_id, candidate_id, owner_id, interview_at, location, owner_note
        ) VALUES (
            p_application_id, v_job_id, v_candidate_id, v_owner_id, p_interview_at, p_interview_location, p_note
        );
    END IF;

    -- Create notification for candidate
    INSERT INTO public.job_notifications (
        user_id, title, message, notification_type, related_id
    ) VALUES (
        v_candidate_id, 
        'Application Status Updated', 
        'Your application for ' || v_job_title || ' has been marked as ' || p_status, 
        p_status, p_application_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Job Seeker Withdraw Application
CREATE OR REPLACE FUNCTION public.job_seeker_withdraw_application(p_application_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.job_applications 
    SET status = 'withdrawn', updated_at = now() 
    WHERE id = p_application_id 
    AND user_id = auth.uid()
    AND status NOT IN ('selected', 'rejected', 'withdrawn');

    -- Create event
    INSERT INTO public.job_application_events (
        application_id, event_type, created_by
    ) VALUES (
        p_application_id, 'withdrawn', auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Mark Job Notification Read
CREATE OR REPLACE FUNCTION public.mark_job_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.job_notifications SET is_read = true WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Get Job Seeker Dashboard Summary
CREATE OR REPLACE FUNCTION public.get_job_seeker_dashboard_summary()
RETURNS JSON AS $$
DECLARE
    v_summary JSON;
BEGIN
    SELECT json_build_object(
        'total_applications', (SELECT count(*) FROM public.job_applications WHERE user_id = auth.uid()),
        'saved_jobs', (SELECT count(*) FROM public.saved_jobs WHERE user_id = auth.uid()),
        'shortlisted', (SELECT count(*) FROM public.job_applications WHERE user_id = auth.uid() AND status = 'shortlisted'),
        'interviews', (SELECT count(*) FROM public.job_interviews WHERE candidate_id = auth.uid() AND status = 'scheduled'),
        'selected', (SELECT count(*) FROM public.job_applications WHERE user_id = auth.uid() AND status = 'selected'),
        'unread_notifications', (SELECT count(*) FROM public.job_notifications WHERE user_id = auth.uid() AND is_read = false),
        'has_profile', EXISTS (SELECT 1 FROM public.job_seeker_profiles WHERE user_id = auth.uid())
    ) INTO v_summary;

    RETURN v_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Get Owner Job Dashboard Summary
CREATE OR REPLACE FUNCTION public.get_owner_job_dashboard_summary()
RETURNS JSON AS $$
DECLARE
    v_summary JSON;
BEGIN
    SELECT json_build_object(
        'total_posts', (SELECT count(*) FROM public.job_posts WHERE owner_id = auth.uid()),
        'pending_jobs', (SELECT count(*) FROM public.job_posts WHERE owner_id = auth.uid() AND status = 'pending'),
        'active_jobs', (SELECT count(*) FROM public.job_posts WHERE owner_id = auth.uid() AND status = 'active'),
        'closed_jobs', (SELECT count(*) FROM public.job_posts WHERE owner_id = auth.uid() AND status = 'closed'),
        'total_applications', (SELECT count(*) FROM public.job_applications ja JOIN public.job_posts jp ON ja.job_id = jp.id WHERE jp.owner_id = auth.uid()),
        'new_applications', (SELECT count(*) FROM public.job_applications ja JOIN public.job_posts jp ON ja.job_id = jp.id WHERE jp.owner_id = auth.uid() AND ja.status = 'applied'),
        'shortlisted', (SELECT count(*) FROM public.job_applications ja JOIN public.job_posts jp ON ja.job_id = jp.id WHERE jp.owner_id = auth.uid() AND ja.status = 'shortlisted'),
        'interviews_scheduled', (SELECT count(*) FROM public.job_interviews WHERE owner_id = auth.uid() AND status = 'scheduled')
    ) INTO v_summary;

    RETURN v_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Admin Get Job Portal Summary (Enhanced)
CREATE OR REPLACE FUNCTION public.admin_get_job_portal_summary()
RETURNS JSON AS $$
DECLARE
    v_summary JSON;
BEGIN
    -- Check if caller is super_admin
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin') THEN
        RAISE EXCEPTION 'Only super_admin can access admin summary';
    END IF;

    SELECT json_build_object(
        'total_jobs', (SELECT count(*) FROM public.job_posts),
        'pending_jobs', (SELECT count(*) FROM public.job_posts WHERE status = 'pending'),
        'active_jobs', (SELECT count(*) FROM public.job_posts WHERE status = 'active'),
        'total_applications', (SELECT count(*) FROM public.job_applications),
        'total_interviews', (SELECT count(*) FROM public.job_interviews),
        'total_seekers', (SELECT count(*) FROM public.job_seeker_profiles),
        'total_views', (SELECT sum(views_count) FROM public.job_posts)
    ) INTO v_summary;

    RETURN v_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
