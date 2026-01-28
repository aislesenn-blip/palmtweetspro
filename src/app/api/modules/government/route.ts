import { NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/kv';
import { getVisaInfo } from '@/lib/visaData';
import { getDrivingRules } from '@/lib/drivingData';
import axios from 'axios';

const GOV_TTL = 60 * 60 * 24 * 7; // 7 Days

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cca2Param = searchParams.get('cca2');
  const countryParam = searchParams.get('country');

  if (!cca2Param && !countryParam) {
    return NextResponse.json({ error: 'Missing country code or name' }, { status: 400 });
  }

  // Cache key depends on what we have. Prefer cca2 if possible, but for name we need a unique key.
  const cacheKey = `government_v2:${cca2Param || countryParam}`;

  const data = await fetchWithCache(
      cacheKey,
      async () => {
          let code = cca2Param;

          // If we only have name, resolve to Code first
          if (!code && countryParam) {
              try {
                  const res = await axios.get(`https://restcountries.com/v3.1/name/${countryParam}?fields=cca2`);
                  if (res.data && res.data.length > 0) {
                      code = res.data[0].cca2;
                  }
              } catch (e) {
                  console.warn("Gov: Failed to resolve country code");
              }
          }

          if (!code) return { visa: null, driving: null };

          const visa = getVisaInfo(code); // Now returns object
          const driving = getDrivingRules(code);

          return {
              visa,
              driving,
              cca2: code
          };
      },
      { ttlSeconds: GOV_TTL }
  );

  return NextResponse.json(data);
}
