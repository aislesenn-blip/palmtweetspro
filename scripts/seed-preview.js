const { createClient } = require('@libsql/client');
// If you are running this locally without dotenv, ensure TURSO_URL and TURSO_TOKEN are set in your shell
// or install dotenv and require it here.

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_TOKEN;

if (!url) {
  console.error('Missing TURSO_URL. Please set TURSO_URL and TURSO_TOKEN environment variables.');
  process.exit(1);
}

const db = createClient({
  url,
  authToken,
});

const places = [
  {
    slug: 'nakilongosi',
    name: 'Nakilongosi',
    country: 'Tanzania',
    latitude: -3.3,
    longitude: 36.7,
    description: 'A village in Arusha Region.',
  },
  {
    slug: 'arusha',
    name: 'Arusha',
    country: 'Tanzania',
    latitude: -3.3869,
    longitude: 36.6830,
    description: 'A city in East Africa\'s Great Rift Valley.',
  },
  {
    slug: 'new-york',
    name: 'New York',
    country: 'United States',
    latitude: 40.7128,
    longitude: -74.0060,
    description: 'The Big Apple.',
  },
  {
    slug: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    description: 'Capital of Japan.',
  },
  {
    slug: 'london',
    name: 'London',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    description: 'Capital of England.',
  },
];

async function seed() {
  console.log('Seeding database...');

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS places (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE,
        name TEXT,
        country TEXT,
        latitude REAL,
        longitude REAL,
        description TEXT
      );
    `);

    for (const place of places) {
      await db.execute({
        sql: `INSERT INTO places (slug, name, country, latitude, longitude, description)
              VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT(slug) DO UPDATE SET
              name=excluded.name,
              country=excluded.country,
              latitude=excluded.latitude,
              longitude=excluded.longitude,
              description=excluded.description`,
        args: [place.slug, place.name, place.country, place.latitude, place.longitude, place.description],
      });
      console.log(`Seeded ${place.name}`);
    }
  } catch (e) {
    console.error('Error seeding database:', e);
  }

  console.log('Done.');
}

seed();
