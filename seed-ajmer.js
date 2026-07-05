import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  const { data, error } = await supabase.rpc('admin_create_district_launch', {
    p_district_name: 'Ajmer',
    p_state_name: 'Rajasthan',
    p_target_pilot_shops: 25,
    p_target_pilot_partners: 3,
    p_target_pilot_customers: 100
  });
  
  if (error) {
    console.error("Error creating district:", error);
    return;
  }
  
  const launchId = data;
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
    await supabase.rpc('admin_add_district_launch_area', {
      p_launch_id: launchId,
      p_area_name: area,
      p_display_order: order++,
      p_target_shops: 5
    });
  }
  console.log("Added areas.");
}
seed();
