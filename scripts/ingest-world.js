const fs = require('fs');
const readline = require('readline');
const { createClient } = require('@libsql/client');
const AdmZip = require('adm-zip');
const axios = require('axios');
const path = require('path');

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_TOKEN;

// Batch insert helper
async function batchInsert(db, rows) {
  if (!db || rows.length === 0) return;

  // Construct a large INSERT statement
  // Note: SQLite has a limit on variables number (usually 999 or 32766), so keep BATCH_SIZE moderate.
  const placeholders = rows.map(() => '(?, ?, ?, ?, ?, ?)').join(',');
  const flatArgs = rows.flat();

  const sql = `INSERT INTO places (slug, name, country, latitude, longitude, description) VALUES ${placeholders}
               ON CONFLICT(slug) DO NOTHING`;

  try {
      await db.execute({ sql, args: flatArgs });
  } catch(e) {
      console.error("Batch insert error:", e);
  }
}

async function ingest() {
  console.log("Starting World Ingestion Script...");

  // Template: Download & Unzip logic
  /*
  const zipUrl = "http://example.com/data.zip";
  const zipFile = "data.zip";
  const writer = fs.createWriteStream(zipFile);
  const response = await axios({
      method: "get",
      url: zipUrl,
      responseType: "stream"
  });
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
  });

  const zip = new AdmZip(zipFile);
  zip.extractAllTo("./data", true);
  */

  // Point this to your actual dataset
  const filePath = path.join(__dirname, '../data/world_cities.csv');

  if (!fs.existsSync(filePath)) {
      console.log(`File not found at ${filePath}. This is a template script.`);
      console.log("Please download the dataset and place it in the data directory.");
      return;
  }

  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const db = url ? createClient({ url, authToken }) : null;

  if (!db) {
      console.log("No DB connection. Skipping inserts.");
  }

  let batch = [];
  const BATCH_SIZE = 100; // Safe size for SQLite
  let count = 0;

  for await (const line of rl) {
    // Example parsing logic (adjust based on actual file format)
    const cols = line.split(',');
    if (cols.length < 5) continue;

    // validation and transformation
    const slug = cols[0];
    const name = cols[1];
    const country = cols[2];
    const lat = parseFloat(cols[3]);
    const lng = parseFloat(cols[4]);
    const desc = cols[5] || '';

    if (!slug || isNaN(lat)) continue;

    batch.push([slug, name, country, lat, lng, desc]);

    if (batch.length >= BATCH_SIZE) {
        if (db) {
            await batchInsert(db, batch);
        }
        count += batch.length;
        console.log(`Processed ${count} rows...`);
        batch = [];
    }
  }

  if (batch.length > 0 && db) {
      await batchInsert(db, batch);
      count += batch.length;
  }

  console.log(`Ingestion complete. Total processed: ${count}`);
}

ingest();
