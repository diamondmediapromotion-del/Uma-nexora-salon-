import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: launches } = await supabase.from('district_launches').select('*').eq('district_name', 'Ajmer');
  const launch = launches?.[0];
  if (!launch) {
    console.log("No Ajmer launch found.");
    return;
  }
  console.log("Launch Status:", launch.launch_status);
  
  const { data: incidents } = await supabase.from('district_incidents').select('*').eq('launch_id', launch.id);
  const p0Open = incidents?.filter(i => i.priority === 'P0' && i.status === 'open') || [];
  console.log("P0 Open Incidents:", p0Open.length);
  
  if (p0Open.length === 0) {
    console.log("Updating to scale_active...");
    await supabase.from('district_launches').update({ launch_status: 'scale_active' }).eq('id', launch.id);
    console.log("Updated to scale_active");
  }
}
check();
