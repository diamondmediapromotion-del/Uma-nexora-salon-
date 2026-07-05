-- Migrations 0004: Growth Partner Module Foundation

-- 1. Helper function to create default milestones for a partner
CREATE OR REPLACE FUNCTION public.create_default_partner_milestones(p_partner_id uuid)
RETURNS void as $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get partner user ID
  SELECT user_id INTO v_user_id FROM public.partner_profiles WHERE id = p_partner_id;
  
  -- Insert 25 shops milestone
  INSERT INTO public.partner_milestone_rewards (partner_id, partner_user_id, milestone_shops, reward_title, reward_description, status)
  VALUES (p_partner_id, v_user_id, 25, 'Welcome Kit', 'Official Nexora Growth Partner Welcome Kit with customized notebook, premium pen, ID card, and sticker set.', 'locked')
  ON CONFLICT DO NOTHING;

  -- Insert 50 shops milestone
  INSERT INTO public.partner_milestone_rewards (partner_id, partner_user_id, milestone_shops, reward_title, reward_description, status)
  VALUES (p_partner_id, v_user_id, 50, 'Official T-Shirt', 'Premium Nexora Branded Polo T-Shirt for field visits and professional branding.', 'locked')
  ON CONFLICT DO NOTHING;

  -- Insert 100 shops milestone
  INSERT INTO public.partner_milestone_rewards (partner_id, partner_user_id, milestone_shops, reward_title, reward_description, status)
  VALUES (p_partner_id, v_user_id, 100, 'Tablet & Growth Builder Badge', '8-inch Android tablet for smooth shop presentations + digital Growth Builder badge on profile.', 'locked')
  ON CONFLICT DO NOTHING;

  -- Insert 500 shops milestone
  INSERT INTO public.partner_milestone_rewards (partner_id, partner_user_id, milestone_shops, reward_title, reward_description, status)
  VALUES (p_partner_id, v_user_id, 500, 'Branded Laptop & Platinum Partner', 'High-performance laptop for team management + upgrade to Platinum Growth Partner level.', 'locked')
  ON CONFLICT DO NOTHING;

  -- Insert 1000 shops milestone
  INSERT INTO public.partner_milestone_rewards (partner_id, partner_user_id, milestone_shops, reward_title, reward_description, status)
  VALUES (p_partner_id, v_user_id, 1000, 'District Business Partner & Car Reward', 'Promotion to District Business Partner + leadership circle access + eligibility for Nexora regional car reward program.', 'locked')
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Function to approve a partner application
CREATE OR REPLACE FUNCTION public.admin_approve_partner_application(p_application_id uuid)
RETURNS void as $$
DECLARE
  v_app record;
  v_partner_id uuid;
  v_code_num integer;
  v_partner_code text;
BEGIN
  -- Get application
  SELECT * INTO v_app FROM public.partner_applications WHERE id = p_application_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_app.status = 'approved' THEN
    RETURN; -- Already approved
  END IF;

  -- Update application status
  UPDATE public.partner_applications
  SET status = 'approved',
      approved_at = now(),
      approved_by = auth.uid()
  WHERE id = p_application_id;

  -- Generate unique partner code
  SELECT COALESCE(count(*), 0) + 1001 INTO v_code_num FROM public.partner_profiles;
  v_partner_code := 'NXGP-' || v_code_num;

  -- Create partner profile
  v_partner_id := gen_random_uuid();
  INSERT INTO public.partner_profiles (
    id,
    user_id,
    application_id,
    partner_code,
    full_name,
    mobile,
    email,
    city,
    district,
    state,
    partner_level,
    status,
    total_shops_onboarded,
    active_shops,
    lifetime_nexora_commission,
    lifetime_partner_earning,
    pending_partner_earning,
    paid_partner_earning,
    joined_at
  ) VALUES (
    v_partner_id,
    v_app.user_id,
    v_app.id,
    v_partner_code,
    v_app.full_name,
    v_app.mobile,
    v_app.email,
    v_app.city,
    v_app.district,
    v_app.state,
    'Partner',
    'approved',
    0,
    0,
    0,
    0,
    0,
    0,
    now()
  );

  -- Give user the growth_partner role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_app.user_id, 'growth_partner')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Update primary role in profile if appropriate (optional)
  UPDATE public.profiles
  SET role = 'growth_partner'
  WHERE id = v_app.user_id;

  -- Generate default milestones
  PERFORM public.create_default_partner_milestones(v_partner_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Function to assign a shop to a partner
CREATE OR REPLACE FUNCTION public.admin_assign_shop_to_partner(p_partner_id uuid, p_shop_id uuid)
RETURNS void as $$
DECLARE
  v_partner record;
  v_shop record;
  v_existing_assignment record;
BEGIN
  -- Verify partner profile
  SELECT * INTO v_partner FROM public.partner_profiles WHERE id = p_partner_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Partner profile not found';
  END IF;

  -- Verify shop
  SELECT * INTO v_shop FROM public.shops WHERE id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Shop not found';
  END IF;

  -- Check if already assigned
  SELECT * INTO v_existing_assignment 
  FROM public.partner_shop_assignments 
  WHERE shop_id = p_shop_id AND is_active = true;
  
  IF FOUND THEN
    -- Deactivate current active assignment
    UPDATE public.partner_shop_assignments
    SET is_active = false,
        updated_at = now()
    WHERE id = v_existing_assignment.id;
  END IF;

  -- Insert new assignment
  INSERT INTO public.partner_shop_assignments (
    partner_id,
    partner_user_id,
    shop_id,
    owner_id,
    assigned_by,
    commission_start_date,
    commission_end_date,
    is_active
  ) VALUES (
    p_partner_id,
    v_partner.user_id,
    p_shop_id,
    v_shop.owner_id,
    auth.uid(),
    current_date,
    current_date + interval '12 months',
    true
  );

  -- Increment total shops onboarded for partner
  UPDATE public.partner_profiles
  SET total_shops_onboarded = total_shops_onboarded + 1,
      active_shops = active_shops + 1,
      updated_at = now()
  WHERE id = p_partner_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Function to process partner commission after a captured payment
CREATE OR REPLACE FUNCTION public.process_partner_commission_for_payment(p_razorpay_payment_id text)
RETURNS void as $$
DECLARE
  v_payment record;
  v_order record;
  v_assignment record;
  v_months_diff integer;
  v_commission_rate numeric;
  v_nexora_commission numeric;
  v_partner_commission numeric;
  v_existing_ledger record;
  v_milestones_count integer;
BEGIN
  -- Get payment
  SELECT * INTO v_payment FROM public.razorpay_payments WHERE razorpay_payment_id = p_razorpay_payment_id;
  IF NOT FOUND THEN
    -- If payment row doesn't exist yet, we can do nothing or log (this is safe)
    RETURN;
  END IF;

  -- Get order
  SELECT * INTO v_order FROM public.razorpay_orders WHERE id = v_payment.order_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Check duplicate ledger row to prevent double credit
  SELECT * INTO v_existing_ledger 
  FROM public.partner_commission_ledger 
  WHERE razorpay_payment_row_id = v_payment.id;
  
  IF FOUND THEN
    RETURN; -- Already processed
  END IF;

  -- Find active shop partner assignment
  SELECT * INTO v_assignment 
  FROM public.partner_shop_assignments 
  WHERE shop_id = v_order.shop_id 
    AND is_active = true 
    AND commission_start_date <= current_date
    AND (commission_end_date IS NULL OR commission_end_date >= current_date);

  IF NOT FOUND THEN
    RETURN; -- No partner assigned, safe exit
  END IF;

  -- Calculate Nexora Commission (10% of order/payment amount)
  v_nexora_commission := v_payment.gross_amount * 0.10;

  -- Calculate months difference since assignment to determine ladder tier
  -- Month 1-6: 10%
  -- Month 7-12: 5%
  -- After 12 months: 2%
  v_months_diff := EXTRACT(year from age(current_date, v_assignment.commission_start_date)) * 12 
                   + EXTRACT(month from age(current_date, v_assignment.commission_start_date)) + 1;

  IF v_months_diff <= 6 THEN
    v_commission_rate := 0.10;
  ELSIF v_months_diff <= 12 THEN
    v_commission_rate := 0.05;
  ELSE
    v_commission_rate := 0.02;
  END IF;

  -- Calculate partner commission amount
  v_partner_commission := v_nexora_commission * v_commission_rate;

  -- Create ledger entry
  INSERT INTO public.partner_commission_ledger (
    partner_id,
    partner_user_id,
    shop_id,
    owner_id,
    booking_id,
    razorpay_payment_row_id,
    nexora_commission_amount,
    partner_commission_rate,
    partner_commission_amount,
    commission_month_number,
    status,
    note
  ) VALUES (
    v_assignment.partner_id,
    v_assignment.partner_user_id,
    v_assignment.shop_id,
    v_assignment.owner_id,
    v_order.booking_id,
    v_payment.id,
    v_nexora_commission,
    v_commission_rate,
    v_partner_commission,
    v_months_diff,
    'unpaid',
    'Commission earned from booking payment ' || p_razorpay_payment_id
  );

  -- Update partner profile earnings metrics
  UPDATE public.partner_profiles
  SET lifetime_nexora_commission = lifetime_nexora_commission + v_nexora_commission,
      lifetime_partner_earning = lifetime_partner_earning + v_partner_commission,
      pending_partner_earning = pending_partner_earning + v_partner_commission,
      updated_at = now()
  WHERE id = v_assignment.partner_id;

  -- Check and update milestone progression
  SELECT COALESCE(total_shops_onboarded, 0) INTO v_milestones_count 
  FROM public.partner_profiles 
  WHERE id = v_assignment.partner_id;

  -- Unlock milestones if they meet thresholds
  UPDATE public.partner_milestone_rewards
  SET status = 'achieved',
      achieved_at = now(),
      updated_at = now()
  WHERE partner_id = v_assignment.partner_id 
    AND status = 'locked' 
    AND milestone_shops <= v_milestones_count;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
