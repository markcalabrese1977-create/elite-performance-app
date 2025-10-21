require("dotenv").config({ path: ".env.local" });

const http = require("http");
const { neon } = require("@neondatabase/serverless");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not loaded from .env.local");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const requestHandler = async (_req, res) => {
  try {
    const result = await sql`SELECT version()`;
    const { version } = result[0];
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`Connected to Postgres: ${version}\n`);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(`DB error: ${err.message}\n`);
  }
};

http.createServer(requestHandler).listen(4000, () => {
  console.log("✅ DB test server running at http://localhost:4000");
});