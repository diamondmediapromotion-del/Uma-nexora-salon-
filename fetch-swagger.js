import dotenv from "dotenv";
dotenv.config();

async function test() {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.error("Missing Supabase URL or Key");
    return;
  }
  
  console.log("Fetching OpenAPI spec from:", `${url}/rest/v1/`);
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        "apikey": anonKey,
        "Authorization": `Bearer ${anonKey}`
      }
    });
    
    if (!res.ok) {
      console.error(`Failed with status: ${res.status}`);
      return;
    }
    
    const data = await res.json();
    console.log("OpenAPI Title:", data.info?.title);
    
    const partnerTables = Object.keys(data.definitions || {}).filter(k => k.startsWith("partner_"));
    console.log("Found Partner Tables:", partnerTables);
    
    for (const table of partnerTables) {
      const def = data.definitions[table];
      console.log(`\nTable: ${table}`);
      console.log("Columns:");
      for (const [col, colInfo] of Object.entries(def.properties || {})) {
        console.log(`  - ${col}: ${colInfo.type} (${colInfo.format || ""})`);
      }
    }
  } catch (err) {
    console.error("Error fetching OpenAPI:", err);
  }
}
test();
