import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const tables = [
    "district_launches",
    "district_areas",
    "district_partner_assignments",
    "district_shop_readiness",
    "district_daily_reports",
    "district_incidents"
  ];
  console.log("Checking district tables...");
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
