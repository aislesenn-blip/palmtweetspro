require('dotenv').config();
const { createClient } = require('@libsql/client');
const axios = require('axios');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// --- Configuration ---
const BATCH_SIZE = 1000;
const GEONAMES_BASE_URL = 'https://download.geonames.org/export/dump/';
const TEMP_DIR = path.join(__dirname, 'temp');

// --- Database Connection ---
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env');
  process.exit(1);
}

const client = createClient({
  url,
  authToken,
});

// --- Utilities ---

async function downloadFile(url, outputPath) {
  console.log(`Downloading from ${url}...`);
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

function ensureTempDir() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
  }
}

function cleanupTempDir() {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
}

// --- Schema Setup ---
async function setupSchema() {
  console.log('Setting up schema...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Split by semicolon to execute statements individually (LibSQL client usually takes one statement or a batch)
  // For schema setup, we can use batch but execute multiple is also fine.
  const statements = schemaSql.split(';').map(s => s.trim()).filter(s => s.length > 0);

  for (const stmt of statements) {
      try {
          await client.execute(stmt);
      } catch (e) {
          console.error(`Error executing schema statement: ${stmt.substring(0, 50)}...`);
          throw e;
      }
  }
  console.log('Schema setup complete.');
}

// --- Ingestion Logic: Locations ---
async function ingestLocations(countryFilter) {
  const fileName = 'allCountries.zip'; // Or specific country like US.zip if implemented later
  const url = `${GEONAMES_BASE_URL}${fileName}`;
  const zipPath = path.join(TEMP_DIR, fileName);

  await downloadFile(url, zipPath);

  console.log('Unzipping...');
  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();
  const textEntry = zipEntries.find(entry => entry.entryName.endsWith('.txt'));

  if (!textEntry) {
    throw new Error('No .txt file found in zip');
  }

  // Extract to stream processing
  // AdmZip extracting to disk is easier for readline
  zip.extractEntryTo(textEntry, TEMP_DIR, false, true);
  const txtPath = path.join(TEMP_DIR, textEntry.name);

  console.log('Processing lines...');
  const fileStream = fs.createReadStream(txtPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let batch = [];
  let count = 0;

  for await (const line of rl) {
    const cols = line.split('\t');
    // geonameid, name, asciiname, alternatenames, latitude, longitude, feature class, feature code, country code, cc2, admin1 code, admin2 code, admin3 code, admin4 code, population, elevation, dem, timezone, modification date

    const countryCode = cols[8];
    if (countryFilter && countryCode !== countryFilter) continue;

    const row = {
      geoname_id: parseInt(cols[0]),
      name: cols[1],
      asciiname: cols[2],
      alternatenames: cols[3],
      latitude: parseFloat(cols[4]),
      longitude: parseFloat(cols[5]),
      feature_class: cols[6],
      feature_code: cols[7],
      country_code: countryCode,
      admin1_code: cols[10],
      admin2_code: cols[11],
      population: parseInt(cols[14]) || 0,
      timezone: cols[17]
    };

    batch.push({
        sql: `INSERT OR REPLACE INTO locations (geoname_id, name, asciiname, alternatenames, latitude, longitude, feature_class, feature_code, country_code, admin1_code, admin2_code, population, timezone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [row.geoname_id, row.name, row.asciiname, row.alternatenames, row.latitude, row.longitude, row.feature_class, row.feature_code, row.country_code, row.admin1_code, row.admin2_code, row.population, row.timezone]
    });

    if (batch.length >= BATCH_SIZE) {
        await client.batch(batch, 'write');
        count += batch.length;
        console.log(`Ingested ${count} locations...`);
        batch = [];
    }
  }

  if (batch.length > 0) {
      await client.batch(batch, 'write');
      count += batch.length;
  }

  console.log(`Finished ingesting ${count} locations.`);
}

// --- Ingestion Logic: Postcodes ---
async function ingestPostcodes(countryFilter) {
  const fileName = 'allCountries.zip'; // Note: GeoNames uses the SAME filename for postal codes usually inside zip directory 'zip' or distinct?
  // Actually GeoNames has a separate dump for zipcodes: https://download.geonames.org/export/zip/allCountries.zip
  const url = `https://download.geonames.org/export/zip/${fileName}`;
  const zipPath = path.join(TEMP_DIR, `postcodes_${fileName}`);

  await downloadFile(url, zipPath);

  console.log('Unzipping...');
  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();
  const textEntry = zipEntries.find(entry => entry.entryName.endsWith('.txt')); // Usually allCountries.txt

  if (!textEntry) {
    throw new Error('No .txt file found in zip');
  }

  zip.extractEntryTo(textEntry, TEMP_DIR, false, true);
  const txtPath = path.join(TEMP_DIR, textEntry.name);

  console.log('Processing lines...');
  const fileStream = fs.createReadStream(txtPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let batch = [];
  let count = 0;

  for await (const line of rl) {
    const cols = line.split('\t');
    // country code, postal code, place name, admin name1, admin code1, admin name2, admin code2, admin name3, admin code3, latitude, longitude, accuracy

    const countryCode = cols[0];
    if (countryFilter && countryCode !== countryFilter) continue;

    const row = {
        country_code: countryCode,
        postal_code: cols[1],
        place_name: cols[2],
        admin_name1: cols[3],
        admin_name2: cols[5],
        latitude: parseFloat(cols[9]),
        longitude: parseFloat(cols[10])
    };

    batch.push({
        sql: `INSERT OR REPLACE INTO postcodes (country_code, postal_code, place_name, admin_name1, admin_name2, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [row.country_code, row.postal_code, row.place_name, row.admin_name1, row.admin_name2, row.latitude, row.longitude]
    });

    if (batch.length >= BATCH_SIZE) {
        await client.batch(batch, 'write');
        count += batch.length;
        console.log(`Ingested ${count} postcodes...`);
        batch = [];
    }
  }

  if (batch.length > 0) {
      await client.batch(batch, 'write');
      count += batch.length;
  }

  console.log(`Finished ingesting ${count} postcodes.`);
}

// --- Main Execution ---
async function main() {
  const args = process.argv.slice(2);
  const dataset = args[0]; // 'locations' or 'postcodes'
  const countryFilter = args[1]; // Optional 'US', 'GB', etc.

  ensureTempDir();

  try {
      await setupSchema();

      if (dataset === 'locations') {
          await ingestLocations(countryFilter);
      } else if (dataset === 'postcodes') {
          await ingestPostcodes(countryFilter);
      } else {
          console.log('Please specify dataset: "locations" or "postcodes"');
      }
  } catch (e) {
      console.error('Ingestion failed:', e);
      process.exit(1);
  } finally {
      cleanupTempDir();
      client.close();
  }
}

main();
