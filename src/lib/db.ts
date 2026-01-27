import { createClient } from '@libsql/client';
import axios from 'axios';

// Prioritize NEXT_PUBLIC_ vars if available (for Vercel), fallback to standard vars, then local file.
const url = process.env.NEXT_PUBLIC_TURSO_URL || process.env.TURSO_URL || 'file:local.db';
const authToken = process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN || process.env.TURSO_TOKEN;

export const db = createClient({
  url,
  authToken,
});

export interface Place {
  id: number;
  slug: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  description?: string;
}

export async function initDB() {
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
  } catch (e) {
    console.error("Failed to init DB:", e);
  }
}

async function fetchLocationFromAPI(slug: string): Promise<Omit<Place, 'id'> | null> {
  try {
    // Slug might be "new-york", "tokyo", etc. Try to make it search friendly.
    const query = slug.replace(/-/g, ' ');
    const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search`, {
      params: {
        name: query,
        count: 1,
        language: 'en',
        format: 'json'
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        slug: slug,
        name: result.name,
        country: result.country,
        latitude: result.latitude,
        longitude: result.longitude,
        description: `${result.name}, ${result.country} (Timezone: ${result.timezone})`
      };
    }
    return null;
  } catch (e) {
    console.error("API Fetch Error:", e);
    return null;
  }
}

export async function getPlaceBySlug(slug: string): Promise<Place | null> {
  await initDB(); // Ensure table exists

  try {
    const rs = await db.execute({
      sql: "SELECT * FROM places WHERE slug = ?",
      args: [slug],
    });

    if (rs.rows.length > 0) {
      return rs.rows[0] as unknown as Place;
    }

    // Not found in DB, try to fetch and cache
    const fetchedPlace = await fetchLocationFromAPI(slug);
    if (fetchedPlace) {
      try {
        await db.execute({
          sql: `INSERT INTO places (slug, name, country, latitude, longitude, description)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(slug) DO UPDATE SET
                latitude=excluded.latitude,
                longitude=excluded.longitude`,
          args: [
            fetchedPlace.slug,
            fetchedPlace.name,
            fetchedPlace.country,
            fetchedPlace.latitude,
            fetchedPlace.longitude,
            fetchedPlace.description || ''
          ],
        });

        // Fetch again to get the ID
        const rsNew = await db.execute({
          sql: "SELECT * FROM places WHERE slug = ?",
          args: [slug],
        });
        if (rsNew.rows.length > 0) {
          return rsNew.rows[0] as unknown as Place;
        }
      } catch (insertError) {
        console.error("Failed to cache place:", insertError);
      }
      return fetchedPlace as Place; // Return even if insert failed (temporary)
    }

    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getNearbyPlaces(lat: number, lng: number, limit = 5): Promise<Place[]> {
  await initDB();
  const range = 5.0; // +/- 5 degrees
  try {
    const rs = await db.execute({
      sql: `SELECT * FROM places
            WHERE latitude BETWEEN ? AND ?
            AND longitude BETWEEN ? AND ?
            LIMIT ?`,
      args: [lat - range, lat + range, lng - range, lng + range, limit],
    });

    return rs.rows as unknown as Place[];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  time: string;
}

export async function getWeather(lat: number, lng: number): Promise<WeatherData | null> {
  try {
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
      params: {
        latitude: lat,
        longitude: lng,
        current: 'temperature_2m,weather_code',
        timezone: 'auto'
      }
    });

    if (response.data.current) {
      return {
        temperature: response.data.current.temperature_2m,
        weatherCode: response.data.current.weather_code,
        time: response.data.current.time
      };
    }
    return null;
  } catch (e) {
    console.error("Weather API Error:", e);
    return null;
  }
}
