import { NextResponse } from 'next/server';

const IDENTITY_TTL = 60 * 60 * 24 * 30; // 30 Days

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');

  if (!country) {
    return NextResponse.json({ error: 'Missing country name' }, { status: 400 });
  }

  try {
      // 1. RestCountries
      const res = await fetch(`https://restcountries.com/v3.1/name/${country}?fields=name,cca2,population,currencies,languages,idd,flags`, { next: { revalidate: IDENTITY_TTL } });

      if (!res.ok) {
          return NextResponse.json({ error: 'Country not found' }, { status: 404 });
      }

      const data = await res.json();
      if (!data || data.length === 0) {
          return NextResponse.json({ error: 'Country not found' }, { status: 404 });
      }

      const countryData = data[0];
      const cca2 = countryData.cca2;

      // 2. Holidays (Nager.Date) - Optional enrichment
      let holidays = [];
      try {
          const year = new Date().getFullYear();
          const holRes = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${cca2}`, { next: { revalidate: IDENTITY_TTL } });
          if (holRes.ok) {
              holidays = await holRes.json();
          }
      } catch (e) {
          console.warn("Holiday fetch failed", e);
      }

      // Merge
      return NextResponse.json({
          ...countryData,
          holidays: holidays.slice(0, 3) // Return top 3 next holidays? Or all? Just returning list.
      });

  } catch (e) {
      console.error("Identity Fetch Error", e);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
