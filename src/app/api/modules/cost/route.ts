import { NextResponse } from 'next/server';
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

  let costs = null;
  let source = 'Teleport';

  // 1. Try Teleport
  try {
    // Note: Teleport API is HATEOAS based, heavily linked.
    // Fetching with strict Next.js caching might be tricky if URLs change, but locations endpoints are stable.

    const locRes = await fetch(`https://api.teleport.org/api/locations/${latitude},${longitude}/?embed=location:nearest-urban-areas/location:nearest-urban-area/ua:details`, { next: { revalidate: COST_TTL } });
    if (locRes.ok) {
        const locData = await locRes.json();
        const nearestUrbanArea = locData?._embedded?.['location:nearest-urban-areas']?.[0];
        const uaUrl = nearestUrbanArea?.['_links']?.['location:nearest-urban-area']?.href;
        let detailsData = nearestUrbanArea?.['_embedded']?.['location:nearest-urban-area']?.['_embedded']?.['ua:details'];

        if (!detailsData && uaUrl) {
             const detailsRes = await fetch(`${uaUrl}details/`, { next: { revalidate: COST_TTL } });
             if (detailsRes.ok) {
                 detailsData = await detailsRes.json();
             }
        }

        if (detailsData) {
                const categories = detailsData.categories;

                const findCost = (catId: string, itemId: string) => {
                    const cat = categories.find((c: any) => c.id === catId);
                    const item = cat?.data.find((i: any) => i.id === itemId);
                    return item ? `$${item.currency_dollar_value.toFixed(2)}` : null;
                };

                const foundCosts = {
                    "Lunch": findCost('COST-OF-LIVING', 'COST-RESTAURANT-MEAL'),
                    "Cappuccino": findCost('COST-OF-LIVING', 'COST-CAPPUCCINO'),
                    "Apartment (Month)": findCost('HOUSING', 'APARTMENT-RENT-SMALL'),
                    "Beer": findCost('COST-OF-LIVING', 'COST-IMPORT-BEER')
                };

                if (Object.values(foundCosts).some(v => v !== null)) {
                    costs = foundCosts;
                }
            }
        }
  } catch (e) {
      console.warn("Teleport Fetch Error", e);
  }

  // 2. Fallback
  if (!costs) {
      if (countryCode) {
          costs = getCountryCostFallback(countryCode);
          source = 'National Average Estimate';
      } else if (countryName) {
          const nameMap: Record<string, string> = {
              "United States": "US", "United Kingdom": "GB", "Japan": "JP", "China": "CN",
              "Germany": "DE", "France": "FR", "Brazil": "BR", "India": "IN"
          };
          const mapped = nameMap[countryName] || nameMap[Object.keys(nameMap).find(k => countryName.includes(k)) || ''];
          if (mapped) {
              costs = getCountryCostFallback(mapped);
              source = 'National Average Estimate';
          } else {
               costs = getCountryCostFallback("DEFAULT");
               source = 'Global Average Estimate';
          }
      }
  }

  // 3. IBAN / Banking
  const banking = countryCode ? getBankingInfo(countryCode) : "Unavailable";

  return NextResponse.json({ costs, source, banking });
}
