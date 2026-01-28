import { NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/kv';
import { calculateDistance } from '@/lib/distance';
import axios from 'axios';

// Cache TTLs
const AIRPORT_TTL = 60 * 60 * 24 * 7; // 7 Days
const OSRM_TTL = 60 * 60 * 24 * 7; // 7 Days

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const compareLat = searchParams.get('compareLat');
  const compareLng = searchParams.get('compareLng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  // 1. Fetch Airports (Overpass)
  // Query: Nodes with aeroway=aerodrome AND iata tag within 100km
  const overpassQuery = `[out:json];node(around:100000,${latitude},${longitude})[aeroway=aerodrome][iata];out;`;
  const airportsKey = `travel:airports:${latitude.toFixed(2)},${longitude.toFixed(2)}`;

  const airportsData = await fetchWithCache(
    airportsKey,
    async () => {
        try {
            const res = await axios.get('https://overpass-api.de/api/interpreter', {
                params: { data: overpassQuery }
            });
            if (res.data && res.data.elements) {
                return res.data.elements.map((el: any) => ({
                    name: el.tags.name || 'Unknown Airport',
                    iata: el.tags.iata,
                    distance: calculateDistance(latitude, longitude, el.lat, el.lon)
                })).sort((a: any, b: any) => a.distance - b.distance).slice(0, 5);
            }
            return [];
        } catch (e) {
            console.error('Overpass Airport Fetch Error', e);
            return [];
        }
    },
    { ttlSeconds: AIRPORT_TTL }
  );

  // 2. Comparison Metrics (if requested)
  let metrics = null;
  if (compareLat && compareLng) {
      const cLat = parseFloat(compareLat);
      const cLng = parseFloat(compareLng);
      const routeKey = `travel:route:${latitude.toFixed(2)},${longitude.toFixed(2)}-${cLat.toFixed(2)},${cLng.toFixed(2)}`;

      metrics = await fetchWithCache(
          routeKey,
          async () => {
             // Air Distance
             const airDist = calculateDistance(latitude, longitude, cLat, cLng);

             // OSRM Driving, Walking, Cycling
             // Format: lon,lat;lon,lat
             let driveTime = null;
             let walkTime = null;
             let cycleTime = null;
             let driveDist = null;

             try {
                 const [driveRes, walkRes, cycleRes] = await Promise.allSettled([
                     axios.get(`https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${cLng},${cLat}?overview=false`),
                     axios.get(`https://router.project-osrm.org/route/v1/foot/${longitude},${latitude};${cLng},${cLat}?overview=false`),
                     axios.get(`https://router.project-osrm.org/route/v1/bike/${longitude},${latitude};${cLng},${cLat}?overview=false`)
                 ]);

                 if (driveRes.status === 'fulfilled' && driveRes.value.data.routes?.length > 0) {
                     const route = driveRes.value.data.routes[0];
                     driveDist = route.distance / 1000;
                     driveTime = route.duration / 3600;
                 }
                 if (walkRes.status === 'fulfilled' && walkRes.value.data.routes?.length > 0) {
                     walkTime = walkRes.value.data.routes[0].duration / 3600;
                 }
                 if (cycleRes.status === 'fulfilled' && cycleRes.value.data.routes?.length > 0) {
                     cycleTime = cycleRes.value.data.routes[0].duration / 3600;
                 }
             } catch (e) {
                 // OSRM might fail
             }

             return {
                 airDistance: airDist,
                 driveDistance: driveDist,
                 driveTime: driveTime ? `${driveTime.toFixed(1)}h` : null,
                 walkTime: walkTime ? `${walkTime.toFixed(1)}h` : null,
                 cycleTime: cycleTime ? `${cycleTime.toFixed(1)}h` : null,
                 flightTime: `${(airDist / 850).toFixed(1)}h` // 850km/h
             };
          },
          { ttlSeconds: OSRM_TTL }
      );
  }

  return NextResponse.json({
      airports: airportsData,
      metrics: metrics
  });
}
