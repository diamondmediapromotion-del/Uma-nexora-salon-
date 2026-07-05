import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase
    .from("columns")
    .select("table_name, column_name, data_type")
    .eq("table_schema", "public")
    .order("table_name, ordinal_position");
    
  if (error) {
    console.log("Direct columns query failed, trying alternative...");
    // Let's try checking columns through pg_catalog or using our own SQL if available, or fetch a row that doesn't exist and get error or try direct tables.
    // Wait, let's select with custom postgrest query on info schema if postgrest has exposed it.
    // Sometimes 'information_schema' is not exposed. Let's try querying a dummy view or checking if we can query columns under postgrest.
    const { data: altCols, error: altErr } = await supabase
      .rpc("get_schema"); // Let's see if get_schema exists
    console.log("altErr:", altErr?.message);
    console.log("altCols:", altCols);
  } else {
    const filtered = data.filter(c => c.table_name.startsWith("partner_"));
    console.log("Columns:", filtered);
  }
}
test();
