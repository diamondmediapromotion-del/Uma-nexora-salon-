import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: profiles } = await supabase.from("profiles").select("*").limit(1);
  const { data: shops } = await supabase.from("shops").select("*").limit(1);
  const { data: shop_services } = await supabase.from("shop_services").select("*").limit(1);
  console.log("profiles:", Object.keys(profiles[0] || {}));
  console.log("shops:", Object.keys(shops[0] || {}));
  console.log("shop_services:", Object.keys(shop_services[0] || {}));
}
test();
