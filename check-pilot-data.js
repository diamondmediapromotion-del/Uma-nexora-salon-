import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: launches } = await supabase.from('district_launches').select('*');
  console.log('Launches:', launches?.length || 0);
  
  if (launches?.length > 0) {
    const { data: reports } = await supabase.from('district_daily_reports').select('*');
    console.log('Reports:', reports?.length || 0);
  }
}
check();
