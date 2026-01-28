import { NextResponse } from 'next/server';
import { calculateDistance } from '@/lib/distance';

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

  // Query: Ports, Terminals, Main Stations
  const query = `
    [out:json][timeout:25];
    (
      node["industrial"="port"](around:100000,${latitude},${longitude});
      node["aeroway"="terminal"](around:100000,${latitude},${longitude});
      node["railway"="station"](around:50000,${latitude},${longitude});
    );
    out body;
  `;

  let ports: any[] = [], terminals: any[] = [], railways: any[] = [];
  let postalCode = 'Unavailable';

  try {
    const [overpassRes, nominatimRes] = await Promise.allSettled([
        fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, { next: { revalidate: LOGISTICS_TTL } }),
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`, {
            headers: { 'User-Agent': 'Palmtweets/1.0' },
            next: { revalidate: LOGISTICS_TTL }
        })
    ]);

    // Process Overpass
    if (overpassRes.status === 'fulfilled' && overpassRes.value.ok) {
        const data = await overpassRes.value.json();
        const elements = data.elements || [];
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
    if (nominatimRes.status === 'fulfilled' && nominatimRes.value.ok) {
        const data = await nominatimRes.value.json();
        const addr = data.address;

        if (addr && addr.postcode) {
            postalCode = addr.postcode;
        } else if (addr) {
            const neighborCity = addr.city || addr.town || addr.village || 'Nearby';
            postalCode = `Contact local post in ${neighborCity}`;
        }
    }

  } catch (e) {
      console.error("Logistics Fetch Error", e);
      postalCode = 'Error';
  }

  return NextResponse.json({ ports, terminals, railways, postalCode });
}
