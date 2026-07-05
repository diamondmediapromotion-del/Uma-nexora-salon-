import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const sources = [
    "pg_class",
    "pg_proc",
    "pg_namespace",
    "pg_tables",
    "information_schema.tables",
    "information_schema.columns"
  ];
  
  for (const src of sources) {
    const { data, error } = await supabase.from(src).select("*").limit(1);
    if (error) {
      console.log(`Source ${src}: ERROR (${error.message})`);
    } else {
      console.log(`Source ${src}: EXISTS (${JSON.stringify(data)})`);
    }
  }
}
test();
