import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const rpcs = [
    { name: "admin_get_district_launch_summary", params: { p_launch_id: "00000000-0000-0000-0000-000000000000" } },
    { name: "admin_create_district_launch", params: { p_district_name: "test", p_state_name: "test", p_target_pilot_shops: 1, p_target_pilot_partners: 1, p_target_pilot_customers: 1 } },
    { name: "admin_add_district_launch_area", params: { p_launch_id: "00000000-0000-0000-0000-000000000000", p_area_name: "test", p_display_order: 1, p_target_shops: 1 } },
    { name: "admin_update_district_shop_readiness", params: { p_readiness_id: "00000000-0000-0000-0000-000000000000", p_status: "test", p_owner_login_ok: false, p_shop_profile_complete: false, p_services_prices_complete: false, p_bank_verified: false, p_menu_digitized: false, p_staff_trained: false, p_owner_qr_deployed: false, p_is_scale_ready: false } },
    { name: "admin_upsert_district_daily_report", params: { p_launch_id: "00000000-0000-0000-0000-000000000000", p_report_day: 1, p_report_date: "2026-07-05", p_status: "test", p_active_areas: 0, p_visited_shops: 0, p_ready_shops: 0, p_qrs_deployed: 0, p_owner_logins: 0, p_bookings_created: 0, p_bookings_completed: 0, p_payments_captured: 0, p_payment_failures: 0, p_p0_issues: 0, p_p1_issues: 0, p_owner_feedback: "" } }
  ];
  for (const rpc of rpcs) {
    const { data, error } = await supabase.rpc(rpc.name, rpc.params);
    if (error) {
      console.log(`RPC ${rpc.name}: ERROR (${error.message})`);
    } else {
      console.log(`RPC ${rpc.name}: EXISTS`);
    }
  }
}
test();
