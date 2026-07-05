import dotenv from "dotenv";
dotenv.config();

async function test() {
  const url = process.env.VITE_SUPABASE_URL + '/rest/v1/';
  const res = await fetch(url, {
    headers: {
      'apikey': process.env.VITE_SUPABASE_ANON_KEY
    }
  });
  const json = await res.json();
  console.log(Object.keys(json.definitions.shops.properties));
}
test();
