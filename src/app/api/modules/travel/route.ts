import { NextResponse } from 'next/server';
import { calculateDistance } from '@/lib/distance';

const TRAVEL_TTL = 60 * 60 * 24 * 7; // 7 Days

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  // 1. Airports (Overpass)
  const query = `
    [out:json][timeout:25];
    (
      node["aeroway"="aerodrome"]["iata"](around:200000,${latitude},${longitude});
    );
    out body;
  `;

  let airports: any[] = [];

  try {
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, { next: { revalidate: TRAVEL_TTL } });
      if (res.ok) {
          const data = await res.json();
          const elements = data.elements || [];
          airports = elements.map((el: any) => ({
              name: el.tags.name,
              iata: el.tags.iata,
              distance: calculateDistance(latitude, longitude, el.lat, el.lon)
          })).sort((a: any, b: any) => a.distance - b.distance).slice(0, 3);
      }
  } catch (e) {
      console.error("Travel Airports Error", e);
  }

  // 2. Metrics (OSRM) - Optional / Dynamic (Client usually handles interactive, but we can do a baseline "City Center to Airport" or similar if we had a target)
  // For the dashboard card, we show Airports.
  // The 'metrics' part was originally for comparison or specific routes.
  // We'll return null for metrics here as OSRM is usually real-time or point-to-point.

  return NextResponse.json({ airports, metrics: null });
}
