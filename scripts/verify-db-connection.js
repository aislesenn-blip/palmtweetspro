// Script to verify DB connection
require('dotenv').config(); // Ensure dotenv is loaded if testing locally without next dev
const { createClient } = require('@libsql/client');

const url = process.env.NEXT_PUBLIC_TURSO_URL || process.env.TURSO_URL || 'file:local.db';
const authToken = process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN || process.env.TURSO_TOKEN;

console.log(`Connecting to DB at: ${url}`);

const db = createClient({
  url,
  authToken,
});

async function testConnection() {
  try {
    const rs = await db.execute("SELECT 1 as val");
    console.log("Connection Successful! Result:", rs.rows);
  } catch (e) {
    console.error("Connection Failed:", e);
    process.exit(1);
  }
}

testConnection();
