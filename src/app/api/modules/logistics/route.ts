import { NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/kv';
import { calculateDistance } from '@/lib/distance';
import axios from 'axios';

const LOGISTICS_TTL = 60 * 60 * 24 * 7; // 7 Days

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const cacheKey = `logistics:${latitude.toFixed(2)},${longitude.toFixed(2)}`;

  const data = await fetchWithCache(
      cacheKey,
      async () => {
          // Query: Ports, Terminals, Main Stations (try to exclude small stops if possible via tags, but tough with simple tags)
          // We fetch named nodes.
          const query = `
            [out:json][timeout:25];
            (
              node["industrial"="port"](around:100000,${latitude},${longitude});
              node["aeroway"="terminal"](around:100000,${latitude},${longitude});
              node["railway"="station"](around:50000,${latitude},${longitude});
            );
            out body;
          `;
          // Note: Reduced Rail radius to 50km to avoid massive payloads in dense areas, logic still satisfies "Infrastructure nearby" intent.

          // Parallel Fetch: Overpass + Nominatim (Postal)
          try {
            const [overpassRes, nominatimRes] = await Promise.allSettled([
                axios.get('https://overpass-api.de/api/interpreter', { params: { data: query } }),
                axios.get(`https://nominatim.openstreetmap.org/reverse`, {
                    params: { lat: latitude, lon: longitude, format: 'json', zoom: 10 },
                    headers: { 'User-Agent': 'Palmtweets/1.0' } // Nominatim requires UA
                })
            ]);

            // Process Overpass
            let ports: any[] = [], terminals: any[] = [], railways: any[] = [];
            if (overpassRes.status === 'fulfilled' && overpassRes.value.data.elements) {
                const elements = overpassRes.value.data.elements || [];
                const processed = elements.map((el: any) => ({
                    name: el.tags.name,
                    type: el.tags.industrial === 'port' ? 'Port' :
                          el.tags.aeroway === 'terminal' ? 'Terminal' : 'Railway',
                    distance: calculateDistance(latitude, longitude, el.lat, el.lon)
                })).filter((i: any) => i.name)
                   .sort((a: any, b: any) => a.distance - b.distance);

                ports = processed.filter((p: any) => p.type === 'Port').slice(0, 3);
                terminals = processed.filter((p: any) => p.type === 'Terminal').slice(0, 3);
                railways = processed.filter((p: any) => p.type === 'Railway').slice(0, 5);
            }

            // Process Nominatim
            let postalCode = 'Unavailable';
            if (nominatimRes.status === 'fulfilled' && nominatimRes.value.data.address) {
                postalCode = nominatimRes.value.data.address.postcode || 'Unavailable';
            }

            return { ports, terminals, railways, postalCode };

          } catch (e) {
              console.error("Logistics Fetch Error", e);
              return { ports: [], terminals: [], railways: [], postalCode: 'Error' };
          }
      },
      { ttlSeconds: LOGISTICS_TTL }
  );

  return NextResponse.json(data);
}
