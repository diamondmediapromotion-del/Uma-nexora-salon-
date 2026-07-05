import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: partners, error } = await supabase.from("partner_profiles").select("*").limit(5);
  if (error) {
    console.error("Error fetching partners:", error);
  } else {
    console.log("Partners:", partners);
  }
}
test();
