import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  try {
    console.log("Calling admin_get_partner_summary...");
    const { data, error } = await supabaseAdmin.rpc("admin_get_partner_summary");
    if (error) throw error;
    console.log("SUCCESS! ADMIN SUMMARY RESULT:");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Test failed:", err);
  }
}

run();
