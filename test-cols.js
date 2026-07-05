import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.rpc('get_schema');
  console.log("Error:", error);
  // Just try to get one row
  const res = await supabase.from('shops').select('*').limit(1);
  if (res.error) console.error(res.error);
  // We can query information_schema.columns but anon key might not have access. Let's try.
  const { data: cols } = await supabase.from('information_schema.columns').select('*').limit(1);
  console.log("cols error?", !cols);
}
test();
