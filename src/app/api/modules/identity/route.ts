import { NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/kv';
import axios from 'axios';

const IDENTITY_TTL = 60 * 60 * 24 * 7; // 7 Days

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');

  if (!country) {
    return NextResponse.json({ error: 'Missing country name' }, { status: 400 });
  }

  const cacheKey = `identity:${country.toLowerCase()}`;

  const data = await fetchWithCache(
      cacheKey,
      async () => {
          // 1. Fetch RestCountries (Population, CCA2, etc.)
          let countryData: any = {};
          let cca2 = '';

          try {
              const res = await axios.get(`https://restcountries.com/v3.1/name/${country}?fullText=true`);
              if (res.data && res.data.length > 0) {
                  const c = res.data[0];
                  countryData = {
                      population: c.population,
                      region: c.region,
                      subregion: c.subregion,
                      languages: c.languages,
                      flags: c.flags,
                      cca2: c.cca2,
                      currencies: c.currencies,
                      idd: c.idd
                  };
                  cca2 = c.cca2;
              }
          } catch (e) {
             // Try fuzzy search if full text fails
             try {
                const res = await axios.get(`https://restcountries.com/v3.1/name/${country}`);
                if (res.data && res.data.length > 0) {
                    const c = res.data[0];
                    countryData = {
                        population: c.population,
                        region: c.region,
                        subregion: c.subregion,
                        languages: c.languages,
                        flags: c.flags,
                        cca2: c.cca2
                    };
                    cca2 = c.cca2;
                }
             } catch (e2) {
                 console.warn("RestCountries Fetch Error", e2);
             }
          }

          // 2. Fetch Holidays (Nager.Date)
          let holidays = [];
          if (cca2) {
              try {
                  const year = new Date().getFullYear();
                  const holidayRes = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/${cca2}`);
                  holidays = holidayRes.data || [];
              } catch (e) {
                  console.warn("Nager.Date Fetch Error", e);
              }
          }

          return {
              ...countryData,
              holidays: holidays.slice(0, 5) // Top 5 next holidays? Or just list? Nager returns sorted by date usually.
          };
      },
      { ttlSeconds: IDENTITY_TTL }
  );

  return NextResponse.json(data || {});
}
