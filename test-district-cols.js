import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const tables = [
    "district_launches",
    "district_launch_areas",
    "district_partner_assignments",
    "district_shop_readiness",
    "district_daily_reports",
    "district_launch_incidents"
  ];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      console.log(`Table ${table}: ERROR (${error.message})`);
    } else {
      console.log(`Table ${table}: EXISTS`);
      if (data.length > 0) {
        console.log(`Columns: ${Object.keys(data[0]).join(', ')}`);
      } else {
        // Can't see columns if no data, but let's insert a fake row then rollback? Not possible with REST.
        // I can just try to insert an empty object to see the error message which says "column X does not exist" or "null value in column Y".
        const { error: err2 } = await supabase.from(table).insert({ id: "00000000-0000-0000-0000-000000000000" });
        if (err2) {
          console.log(`Insert error: ${err2.message}, details: ${err2.details || ''}`);
        }
      }
    }
  }
}
test();
