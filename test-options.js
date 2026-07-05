import dotenv from "dotenv";
dotenv.config();

async function test() {
  const url = process.env.VITE_SUPABASE_URL + '/rest/v1/shops?limit=1';
  const res = await fetch(url, {
    headers: {
      'apikey': process.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + process.env.VITE_SUPABASE_ANON_KEY
    }
  });
  const text = await res.text();
  console.log(text);
}
test();
