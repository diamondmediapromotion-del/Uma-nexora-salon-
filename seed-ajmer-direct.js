import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  const { data: launchData, error: launchErr } = await supabase.from('district_launches').insert({
    district_name: 'Ajmer',
    state_name: 'Rajasthan',
    launch_code: 'AJM' + new Date().toISOString().slice(2,8).replace(/-/g, ''),
    launch_status: 'pilot_active'
  }).select('id').single();
  
  if (launchErr) {
    console.error("Error creating district:", launchErr);
    return;
  }
  
  const launchId = launchData.id;
  console.log("Created launch:", launchId);
  
  const areas = [
    "Civil Lines",
    "Vaishali Nagar Ajmer",
    "Panchsheel Nagar",
    "Kesar Ganj",
    "Adarsh Nagar",
    "Ramganj",
    "Pushkar Road",
    "Beawar Road",
    "Naka Madar",
    "Dargah Bazar"
  ];
  
  let order = 1;
  for (const area of areas) {
    await supabase.from('district_launch_areas').insert({
      launch_id: launchId,
      area_name: area,
      display_order: order++,
      target_shops: 5
    });
  }
  console.log("Added areas.");
}
seed();
