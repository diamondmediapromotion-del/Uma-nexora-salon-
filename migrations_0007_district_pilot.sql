-- 7. District Admin RPCs (UPDATED SIGNATURES TO MATCH UI)

CREATE OR REPLACE FUNCTION admin_create_district_launch(
    p_district_name TEXT,
    p_state_name TEXT,
    p_target_pilot_shops INTEGER,
    p_target_pilot_partners INTEGER,
    p_target_pilot_customers INTEGER
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
    v_code TEXT;
BEGIN
    v_code := UPPER(SUBSTRING(p_district_name FROM 1 FOR 3)) || to_char(NOW(), 'YYMMDD');
    INSERT INTO public.district_launches (district_name, state_name, launch_code, launch_status)
    VALUES (p_district_name, p_state_name, v_code, 'planning')
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_add_district_launch_area(
    p_launch_id UUID,
    p_area_name TEXT,
    p_display_order INTEGER,
    p_target_shops INTEGER
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.district_launch_areas (launch_id, area_name, display_order, target_shops)
    VALUES (p_launch_id, p_area_name, p_display_order, p_target_shops)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_update_district_shop_readiness(
    p_readiness_id UUID,
    p_status TEXT,
    p_owner_login_ok BOOLEAN,
    p_shop_profile_complete BOOLEAN,
    p_services_prices_complete BOOLEAN,
    p_photos_gallery_complete BOOLEAN,
    p_booking_test_passed BOOLEAN,
    p_owner_booking_visible BOOLEAN,
    p_wallet_visible BOOLEAN,
    p_website_template_ok BOOLEAN,
    p_no_owner_qr_confirmed BOOLEAN,
    p_support_education_done BOOLEAN,
    p_admin_note TEXT,
    p_owner_feedback TEXT,
    p_technical_issue TEXT,
    p_staff_trained BOOLEAN DEFAULT false,
    p_menu_digitized BOOLEAN DEFAULT false,
    p_bank_verified BOOLEAN DEFAULT false,
    p_owner_qr_deployed BOOLEAN DEFAULT false,
    p_is_scale_ready BOOLEAN DEFAULT false,
    p_exit_score NUMERIC DEFAULT 0,
    p_exit_decision TEXT DEFAULT 'pending'
) RETURNS VOID AS $$
BEGIN
    UPDATE public.district_shop_readiness SET
        status = p_status,
        owner_login_ok = p_owner_login_ok,
        shop_profile_complete = p_shop_profile_complete,
        services_prices_complete = p_services_prices_complete,
        photos_gallery_complete = p_photos_gallery_complete,
        booking_test_passed = p_booking_test_passed,
        owner_booking_visible = p_owner_booking_visible,
        wallet_visible = p_wallet_visible,
        website_template_ok = p_website_template_ok,
        no_owner_qr_confirmed = p_no_owner_qr_confirmed,
        support_education_done = p_support_education_done,
        admin_note = p_admin_note,
        owner_feedback = p_owner_feedback,
        technical_issue = p_technical_issue,
        updated_at = NOW()
    WHERE id = p_readiness_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_upsert_district_daily_report(
    p_launch_id UUID,
    p_report_day INTEGER,
    p_report_date DATE,
    p_status TEXT,
    p_active_areas INTEGER,
    p_ready_shops INTEGER,
    p_incomplete_shops INTEGER,
    p_new_customers INTEGER,
    p_bookings_created INTEGER,
    p_bookings_completed INTEGER,
    p_payments_attempted INTEGER,
    p_payments_captured INTEGER,
    p_payment_failures INTEGER,
    p_refunds_count INTEGER,
    p_support_tickets_opened INTEGER,
    p_support_tickets_resolved INTEGER,
    p_p0_issues INTEGER,
    p_p1_issues INTEGER,
    p_fixed_today TEXT,
    p_open_bugs TEXT,
    p_owner_feedback TEXT,
    p_customer_feedback TEXT,
    p_next_day_actions TEXT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.district_daily_reports (
        launch_id, report_day, report_date, status, active_areas, ready_shops,
        incomplete_shops, new_customers, bookings_created, bookings_completed,
        payments_attempted, payments_captured, payment_failures, refunds_count,
        support_tickets_opened, support_tickets_resolved, p0_issues, p1_issues,
        fixed_today, open_bugs, owner_feedback, customer_feedback, next_day_actions
    ) VALUES (
        p_launch_id, p_report_day, p_report_date, p_status, p_active_areas, p_ready_shops,
        p_incomplete_shops, p_new_customers, p_bookings_created, p_bookings_completed,
        p_payments_attempted, p_payments_captured, p_payment_failures, p_refunds_count,
        p_support_tickets_opened, p_support_tickets_resolved, p_p0_issues, p_p1_issues,
        p_fixed_today, p_open_bugs, p_owner_feedback, p_customer_feedback, p_next_day_actions
    ) ON CONFLICT (launch_id, report_date) DO UPDATE SET
        status = EXCLUDED.status,
        active_areas = EXCLUDED.active_areas,
        ready_shops = EXCLUDED.ready_shops,
        incomplete_shops = EXCLUDED.incomplete_shops,
        new_customers = EXCLUDED.new_customers,
        bookings_created = EXCLUDED.bookings_created,
        bookings_completed = EXCLUDED.bookings_completed,
        payments_attempted = EXCLUDED.payments_attempted,
        payments_captured = EXCLUDED.payments_captured,
        payment_failures = EXCLUDED.payment_failures,
        refunds_count = EXCLUDED.refunds_count,
        support_tickets_opened = EXCLUDED.support_tickets_opened,
        support_tickets_resolved = EXCLUDED.support_tickets_resolved,
        p0_issues = EXCLUDED.p0_issues,
        p1_issues = EXCLUDED.p1_issues,
        fixed_today = EXCLUDED.fixed_today,
        open_bugs = EXCLUDED.open_bugs,
        owner_feedback = EXCLUDED.owner_feedback,
        customer_feedback = EXCLUDED.customer_feedback,
        next_day_actions = EXCLUDED.next_day_actions,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
