import { NextResponse } from 'next/server';

const FORECAST_TTL = 60 * 60 * 24; // 24 Hours
const NORMALS_TTL = 60 * 60 * 24 * 30; // 30 Days

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const lang = searchParams.get('lang') || 'en';

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  // 1. Forecast
  let forecastData = null;
  try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;
      const res = await fetch(url, { next: { revalidate: FORECAST_TTL } });
      if (res.ok) {
          forecastData = await res.json();
      }
  } catch (e) {
      console.error("Climate Forecast Fetch Error", e);
  }

  // 2. Normals (Historical Aggregated)
  let normals = null;
  try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 3)).toISOString().split('T')[0];

      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_mean,precipitation_sum&timezone=auto`;

      const res = await fetch(url, { next: { revalidate: NORMALS_TTL } });

      if (res.ok) {
        const data = await res.json();
        const daily = data.daily;

        if (daily && daily.time) {
            // Aggregate by month (0-11)
            const monthStats = Array(12).fill(0).map(() => ({ tempSum: 0, precipSum: 0, count: 0 }));

            daily.time.forEach((t: string, i: number) => {
                const date = new Date(t);
                const m = date.getMonth();
                const temp = daily.temperature_2m_mean[i];
                const rain = daily.precipitation_sum[i];

                if (temp !== null && rain !== null) {
                    monthStats[m].tempSum += temp;
                    monthStats[m].precipSum += rain;
                    monthStats[m].count++;
                }
            });

            // Calculate Averages
            normals = monthStats.map(stat => {
                if (stat.count === 0) return { avgTemp: 0, monthlyPrecip: 0 };
                const avgTemp = (stat.tempSum / stat.count).toFixed(1);
                const monthlyPrecip = ((stat.precipSum / stat.count) * 30).toFixed(1);
                return { avgTemp, monthlyPrecip };
            });
        }
      }
  } catch (e) {
      console.error("Climate Normals Fetch Error", e);
  }

  return NextResponse.json({
      forecast: forecastData?.daily,
      current: forecastData?.current,
      timezone: forecastData?.timezone,
      normals
  });
}
