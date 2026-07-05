import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const commonNames = ["admin_execute_sql", "execute_sql", "run_sql", "exec_sql", "sql_query", "db_query"];
  for (const name of commonNames) {
    console.log(`\nTesting RPC: ${name}`);
    const { data, error } = await supabase.rpc(name, {});
    if (error) {
       console.log(`  Error: ${error.message}`);
       if (error.details) console.log(`  Details: ${error.details}`);
    } else {
       console.log(`  Found! (Result: ${JSON.stringify(data)})`);
    }
  }
}
test();
