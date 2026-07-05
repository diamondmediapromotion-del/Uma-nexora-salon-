import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const rpcs = ["exec_sql", "run_sql", "execute_sql", "sql"];
  for (const rpc of rpcs) {
    const { data, error } = await supabase.rpc(rpc, { query: "SELECT 1;" });
    if (error) {
      console.log(`RPC ${rpc}: ${error.message}`);
    } else {
      console.log(`RPC ${rpc}: EXISTS (Data: ${JSON.stringify(data)})`);
      return;
    }
  }
}
test();
