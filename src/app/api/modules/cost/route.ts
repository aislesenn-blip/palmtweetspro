import { NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/kv';
import axios from 'axios';

const COST_TTL = 60 * 60 * 24 * 7; // 7 Days

// Fallback data for specific problem cities (The Tokyo Fix)
// Keys could be based on approximate lat/lng or name if passed.
// Since we only get lat/lng, we check proximity to known missing cities.
const FALLBACKS = [
    {
        name: "Tokyo",
        lat: 35.6762,
        lng: 139.6503,
        data: {
            "Lunch": "$11.50",
            "Cappuccino": "$3.80",
            "Apartment (Month)": "$1300.00",
            "Beer": "$5.00"
        }
    }
];

function getFallback(lat: number, lng: number) {
    for (const city of FALLBACKS) {
        const dist = Math.sqrt(Math.pow(city.lat - lat, 2) + Math.pow(city.lng - lng, 2));
        if (dist < 0.5) { // Roughly 50km
            return city.data;
        }
    }
    return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const cacheKey = `cost:${latitude.toFixed(2)},${longitude.toFixed(2)}`;

  const data = await fetchWithCache(
      cacheKey,
      async () => {
          // 1. Try Teleport
          try {
            const locRes = await axios.get(`https://api.teleport.org/api/locations/${latitude},${longitude}/`);
            const uaUrl = locRes.data?._embedded?.['location:nearest-urban-areas']?.[0]?.['_links']?.['location:nearest-urban-area']?.href;

            if (uaUrl) {
                const detailsRes = await axios.get(`${uaUrl}details/`);
                const categories = detailsRes.data.categories;

                const findCost = (catId: string, itemId: string) => {
                    const cat = categories.find((c: any) => c.id === catId);
                    const item = cat?.data.find((i: any) => i.id === itemId);
                    return item ? `$${item.currency_dollar_value.toFixed(2)}` : null;
                };

                const costs = {
                    "Lunch": findCost('COST-OF-LIVING', 'COST-RESTAURANT-MEAL'),
                    "Cappuccino": findCost('COST-OF-LIVING', 'COST-CAPPUCCINO'),
                    "Apartment (Month)": findCost('HOUSING', 'APARTMENT-RENT-SMALL'),
                    "Beer": findCost('COST-OF-LIVING', 'COST-IMPORT-BEER')
                };

                // Validate: If all null, Teleport failed effectively
                if (Object.values(costs).some(v => v !== null)) {
                    return costs;
                }
            }
          } catch (e) {
              console.warn("Teleport Fetch Error", e);
          }

          // 2. Fallback
          return getFallback(latitude, longitude);
      },
      { ttlSeconds: COST_TTL }
  );

  return NextResponse.json(data || {});
}
