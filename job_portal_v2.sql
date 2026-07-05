-- ========================================================
-- NEXORA JOB PORTAL - SCHEMA & LOGIC V2 (11C COMPLIANT)
-- ========================================================

-- 1. TABLES ENHANCEMENTS (If not already present)
ALTER TABLE IF EXISTS public.job_posts 
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS salon_name TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS openings INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. JOB POST VIEWS (For Analytics)
CREATE TABLE IF NOT EXISTS public.job_post_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.job_posts(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    viewed_at TIMESTAMPTZ DEFAULT now(),
    page_source TEXT,
    idempotency_key TEXT UNIQUE -- view_jobid_date
);

-- 3. SAVED JOBS
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.job_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, job_id)
);

-- 4. RPC: TRACK JOB VIEW (Idempotent)
CREATE OR REPLACE FUNCTION public.track_job_post_view(
    p_job_id UUID,
    p_page_source TEXT DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.job_post_views (job_id, viewer_id, page_source, idempotency_key)
    VALUES (p_job_id, auth.uid(), p_page_source, p_idempotency_key)
    ON CONFLICT (idempotency_key) DO NOTHING;
    
    IF FOUND THEN
        UPDATE public.job_posts 
        SET views_count = views_count + 1
        WHERE id = p_job_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC: TOGGLE SAVED JOB
CREATE OR REPLACE FUNCTION public.toggle_saved_job(p_job_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM public.saved_jobs WHERE user_id = auth.uid() AND job_id = p_job_id) INTO v_exists;
    
    IF v_exists THEN
        DELETE FROM public.saved_jobs WHERE user_id = auth.uid() AND job_id = p_job_id;
        RETURN FALSE;
    ELSE
        INSERT INTO public.saved_jobs (user_id, job_id) VALUES (auth.uid(), p_job_id);
        RETURN TRUE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC: APPLY TO JOB (With Validation)
CREATE OR REPLACE FUNCTION public.apply_to_job(
    p_job_id UUID,
    p_resume_asset_id UUID DEFAULT NULL,
    p_cover_message TEXT DEFAULT NULL,
    p_candidate_skills TEXT[] DEFAULT '{}',
    p_experience_years INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
    v_application_id UUID;
    v_owner_id UUID;
    v_seeker_exists BOOLEAN;
BEGIN
    -- Check if seeker profile exists
    SELECT EXISTS(SELECT 1 FROM public.job_seeker_profiles WHERE id = auth.uid()) INTO v_seeker_exists;
    IF NOT v_seeker_exists THEN
        RAISE EXCEPTION 'Please complete your Job Seeker profile before applying.';
    END IF;

    -- Get owner
    SELECT owner_id INTO v_owner_id FROM public.job_posts WHERE id = p_job_id;
    
    -- Insert application
    INSERT INTO public.job_applications (
        job_id, candidate_id, resume_asset_id, cover_message, candidate_skills, experience_years, status
    ) VALUES (
        p_job_id, auth.uid(), p_resume_asset_id, p_cover_message, p_candidate_skills, p_experience_years, 'applied'
    )
    ON CONFLICT (job_id, candidate_id) DO UPDATE SET
        resume_asset_id = EXCLUDED.resume_asset_id,
        cover_message = EXCLUDED.cover_message,
        candidate_skills = EXCLUDED.candidate_skills,
        experience_years = EXCLUDED.experience_years,
        status = 'applied',
        created_at = now()
    RETURNING id INTO v_application_id;

    -- Update count
    UPDATE public.job_posts SET applications_count = (
        SELECT count(*) FROM public.job_applications WHERE job_id = p_job_id
    ) WHERE id = p_job_id;

    -- Event
    INSERT INTO public.job_application_events (application_id, status, note)
    VALUES (v_application_id, 'applied', 'Application submitted by candidate');

    -- Notifications
    INSERT INTO public.job_notifications (user_id, application_id, type, message)
    VALUES (auth.uid(), v_application_id, 'application_status', 'Your application for ' || (SELECT title FROM public.job_posts WHERE id = p_job_id) || ' has been submitted.');
    
    INSERT INTO public.job_notifications (user_id, application_id, type, message)
    VALUES (v_owner_id, v_application_id, 'new_application', 'New applicant for ' || (SELECT title FROM public.job_posts WHERE id = p_job_id));

    RETURN v_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RPC: GET JOB SEEKER DASHBOARD SUMMARY
CREATE OR REPLACE FUNCTION public.get_job_seeker_dashboard_summary()
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'total_applications', count(id),
        'shortlisted', count(id) FILTER (WHERE status = 'shortlisted'),
        'interviews', count(id) FILTER (WHERE status = 'interview_scheduled'),
        'selected', count(id) FILTER (WHERE status = 'selected'),
        'saved_jobs', (SELECT count(*) FROM public.saved_jobs WHERE user_id = auth.uid()),
        'unread_notifications', (SELECT count(*) FROM public.job_notifications WHERE user_id = auth.uid() AND is_read = false)
    ) INTO v_result
    FROM public.job_applications
    WHERE candidate_id = auth.uid();
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RPC: GET OWNER JOB DASHBOARD SUMMARY
CREATE OR REPLACE FUNCTION public.get_owner_job_dashboard_summary()
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'total_posts', count(id),
        'pending_jobs', count(id) FILTER (WHERE status = 'pending_review'),
        'active_jobs', count(id) FILTER (WHERE status = 'active'),
        'total_applications', (SELECT count(*) FROM public.job_applications WHERE job_id IN (SELECT id FROM public.job_posts WHERE owner_id = auth.uid())),
        'new_applications', (SELECT count(*) FROM public.job_applications WHERE status = 'applied' AND job_id IN (SELECT id FROM public.job_posts WHERE owner_id = auth.uid())),
        'shortlisted', (SELECT count(*) FROM public.job_applications WHERE status = 'shortlisted' AND job_id IN (SELECT id FROM public.job_posts WHERE owner_id = auth.uid())),
        'interviews_scheduled', (SELECT count(*) FROM public.job_applications WHERE status = 'interview_scheduled' AND job_id IN (SELECT id FROM public.job_posts WHERE owner_id = auth.uid()))
    ) INTO v_result
    FROM public.job_posts
    WHERE owner_id = auth.uid();
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. RPC: OWNER UPDATE APPLICATION STATUS
CREATE OR REPLACE FUNCTION public.owner_update_job_application_status(
    p_application_id UUID,
    p_new_status TEXT,
    p_owner_note TEXT DEFAULT NULL,
    p_interview_at TIMESTAMPTZ DEFAULT NULL,
    p_interview_location TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_candidate_id UUID;
    v_job_title TEXT;
BEGIN
    -- Verify ownership
    IF NOT EXISTS (
        SELECT 1 FROM public.job_applications a 
        JOIN public.job_posts j ON a.job_id = j.id 
        WHERE a.id = p_application_id AND j.owner_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    UPDATE public.job_applications SET status = p_new_status, owner_note = p_owner_note WHERE id = p_application_id
    RETURNING candidate_id INTO v_candidate_id;

    -- Get job title
    SELECT j.title INTO v_job_title FROM public.job_posts j 
    JOIN public.job_applications a ON a.job_id = j.id WHERE a.id = p_application_id;

    -- Event
    INSERT INTO public.job_application_events (application_id, status, note)
    VALUES (p_application_id, p_new_status, p_owner_note);

    -- Interview record if scheduled
    IF p_new_status = 'interview_scheduled' AND p_interview_at IS NOT NULL THEN
        INSERT INTO public.job_interviews (application_id, interview_at, location, note, status)
        VALUES (p_application_id, p_interview_at, p_interview_location, p_owner_note, 'scheduled');
    END IF;

    -- Notification for candidate
    INSERT INTO public.job_notifications (user_id, application_id, type, message)
    VALUES (v_candidate_id, p_application_id, 'status_update', 'Your application for ' || v_job_title || ' has been updated to: ' || p_new_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. RLS POLICIES (Safety First)

-- Job Posts: Anyone can read active, owners/admins see all
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can see active jobs" ON public.job_posts;
CREATE POLICY "Public can see active jobs" ON public.job_posts FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Owners can see own jobs" ON public.job_posts;
CREATE POLICY "Owners can see own jobs" ON public.job_posts FOR SELECT USING (owner_id = auth.uid() OR (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin');

-- Job Applications: Private
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Candidates see own apps" ON public.job_applications;
CREATE POLICY "Candidates see own apps" ON public.job_applications FOR SELECT USING (candidate_id = auth.uid());
DROP POLICY IF EXISTS "Owners see apps for own jobs" ON public.job_applications;
CREATE POLICY "Owners see apps for own jobs" ON public.job_applications FOR SELECT USING (
    job_id IN (SELECT id FROM public.job_posts WHERE owner_id = auth.uid()) OR 
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'
);

-- Saved Jobs: Strictly Private
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own saved jobs" ON public.saved_jobs FOR ALL USING (user_id = auth.uid());

-- Job Document Assets: Private but visible to owner of job applied to
ALTER TABLE public.job_document_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own docs" ON public.job_document_assets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Owners see applicant docs" ON public.job_document_assets FOR SELECT USING (
    id IN (SELECT resume_asset_id FROM public.job_applications WHERE job_id IN (SELECT id FROM public.job_posts WHERE owner_id = auth.uid()))
);

-- Storage Policies for 'job-documents' bucket
-- These are usually done in the Supabase UI but here for reference:
-- SELECT: auth.uid() = user_id OR auth.uid() IN (SELECT owner_id FROM job_posts WHERE id IN (SELECT job_id FROM job_applications WHERE resume_asset_id = doc_id))
