import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const rpcs = [
    { name: "admin_approve_partner_application", args: { p_application_id: "00000000-0000-0000-0000-000000000000" } },
    { name: "admin_assign_shop_to_partner", args: { p_partner_id: "00000000-0000-0000-0000-000000000000", p_shop_id: "00000000-0000-0000-0000-000000000000" } },
    { name: "process_partner_commission_for_payment", args: { p_razorpay_payment_id: "pay_123" } },
    { name: "create_default_partner_milestones", args: { p_partner_id: "00000000-0000-0000-0000-000000000000" } }
  ];
  
  console.log("Checking RPCs with exact argument names...");
  for (const rpc of rpcs) {
    const { data, error } = await supabase.rpc(rpc.name, rpc.args);
    if (error) {
      if (error.message.includes("does not exist") || error.message.includes("Could not find the function")) {
        console.log(`RPC ${rpc.name}: NOT FOUND (${error.message})`);
      } else {
        console.log(`RPC ${rpc.name}: EXISTS! (But failed with runtime error: ${error.message})`);
      }
    } else {
      console.log(`RPC ${rpc.name}: EXISTS and ran successfully! (Data: ${JSON.stringify(data)})`);
    }
  }
}
test();
