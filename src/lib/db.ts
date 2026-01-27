import { createClient } from '@libsql/client';

const url = process.env.TURSO_URL || 'file:local.db';
const authToken = process.env.TURSO_TOKEN;

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

export async function getPlaceBySlug(slug: string): Promise<Place | null> {
  try {
    const rs = await db.execute({
      sql: "SELECT * FROM places WHERE slug = ?",
      args: [slug],
    });

    if (rs.rows.length === 0) return null;
    return rs.rows[0] as unknown as Place;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getNearbyPlaces(lat: number, lng: number, limit = 5): Promise<Place[]> {
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
