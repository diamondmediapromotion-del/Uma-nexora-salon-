import dotenv from "dotenv";
dotenv.config();

console.log("ENV Keys:", Object.keys(process.env).filter(k => k.includes("DB") || k.includes("SQL") || k.includes("CONN") || k.includes("PASS") || k.includes("PORT") || k.includes("USER") || k.includes("KEY") || k.includes("URL")));
