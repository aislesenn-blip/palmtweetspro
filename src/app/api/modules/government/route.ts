import { NextResponse } from 'next/server';
import { getVisaInfo } from '@/lib/visaData';
import { getDrivingRules } from '@/lib/drivingData';

const GOV_TTL = 60 * 60 * 24 * 7; // 7 Days

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cca2Param = searchParams.get('cca2');
  const countryParam = searchParams.get('country');

  if (!cca2Param && !countryParam) {
    return NextResponse.json({ error: 'Missing country code or name' }, { status: 400 });
  }

  let code = cca2Param;

  // If we only have name, resolve to Code first
  if (!code && countryParam) {
      try {
          const res = await fetch(`https://restcountries.com/v3.1/name/${countryParam}?fields=cca2`, { next: { revalidate: GOV_TTL } });
          if (res.ok) {
              const data = await res.json();
              if (data && data.length > 0) {
                  code = data[0].cca2;
              }
          }
      } catch (e) {
          console.warn("Gov: Failed to resolve country code");
      }
  }

  if (!code) return NextResponse.json({ visa: null, driving: null });

  const visa = getVisaInfo(code);
  const driving = getDrivingRules(code);

  return NextResponse.json({
      visa,
      driving,
      cca2: code
  });
}
