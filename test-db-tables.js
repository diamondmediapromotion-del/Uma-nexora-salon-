import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const tables = [
    "partner_applications",
    "partner_profiles",
    "partner_shop_assignments",
    "partner_commission_ledger",
    "partner_payout_accounts",
    "partner_weekly_payouts",
    "partner_milestone_rewards"
  ];
  
  console.log("Checking tables...");
  for (const table of tables) {
    const { error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      console.log(`Table ${table}: ERROR (${error.message})`);
    } else {
      console.log(`Table ${table}: EXISTS`);
    }
  }
}
test();
