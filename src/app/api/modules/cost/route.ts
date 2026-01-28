import { NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/kv';
import axios from 'axios';
import { getBankingInfo, getCountryCostFallback } from '@/lib/banking';

const COST_TTL = 60 * 60 * 24 * 7; // 7 Days

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  let countryCode = searchParams.get('countryCode');
  const countryName = searchParams.get('countryName');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const cacheKey = `cost_v2:${latitude.toFixed(2)},${longitude.toFixed(2)}`;

  const data = await fetchWithCache(
      cacheKey,
      async () => {
          let costs = null;
          let source = 'Teleport';

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

                costs = {
                    "Lunch": findCost('COST-OF-LIVING', 'COST-RESTAURANT-MEAL'),
                    "Cappuccino": findCost('COST-OF-LIVING', 'COST-CAPPUCCINO'),
                    "Apartment (Month)": findCost('HOUSING', 'APARTMENT-RENT-SMALL'),
                    "Beer": findCost('COST-OF-LIVING', 'COST-IMPORT-BEER')
                };

                // Validate: If all null, Teleport failed effectively
                if (Object.values(costs).every(v => v === null)) {
                    costs = null;
                }
            }
          } catch (e) {
              console.warn("Teleport Fetch Error", e);
          }

          // 2. Fallback: National Average
          if (!costs) {
              // Try to resolve code from name if needed (Simplified mapping for common ones or use external)
              // For now, if we don't have code, we might fail to get fallback.
              // However, we can try a reverse geocode if really desperate, or just rely on passed name if we map it.

              if (countryCode) {
                  costs = getCountryCostFallback(countryCode);
                  source = 'National Average Estimate';
              } else if (countryName) {
                  // Very basic name->code for top fallback countries to ensure "No Blank"
                  const nameMap: Record<string, string> = {
                      "United States": "US", "United Kingdom": "GB", "Japan": "JP", "China": "CN",
                      "Germany": "DE", "France": "FR", "Brazil": "BR", "India": "IN"
                  };
                  const mapped = nameMap[countryName] || nameMap[Object.keys(nameMap).find(k => countryName.includes(k)) || ''];
                  if (mapped) {
                      costs = getCountryCostFallback(mapped);
                      source = 'National Average Estimate';
                  } else {
                       // Absolute last resort: Global Average
                       costs = getCountryCostFallback("DEFAULT");
                       source = 'Global Average Estimate';
                  }
              }
          }

          // 3. IBAN / Banking
          const banking = countryCode ? getBankingInfo(countryCode) : "Unavailable";

          return { costs, source, banking };
      },
      { ttlSeconds: COST_TTL }
  );

  return NextResponse.json(data || {});
}
