import { NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/kv';
import axios from 'axios';

const NORMALS_TTL = 60 * 60 * 24 * 30; // 30 Days
const FORECAST_TTL = 60 * 60 * 24; // 24 Hours

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const lang = searchParams.get('lang') || 'en'; // Support lang for weather codes if needed (Open-Meteo supports it?)

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  // 1. Forecast
  const forecastKey = `climate:forecast:${latitude.toFixed(2)},${longitude.toFixed(2)}:${lang}`;
  const forecastData = await fetchWithCache(
      forecastKey,
      async () => {
          const res = await axios.get('https://api.open-meteo.com/v1/forecast', {
              params: {
                  latitude,
                  longitude,
                  current: 'temperature_2m,weather_code,is_day',
                  daily: 'temperature_2m_max,temperature_2m_min,weather_code',
                  timezone: 'auto'
              }
          });
          return res.data;
      },
      { ttlSeconds: FORECAST_TTL }
  );

  // 2. Normals (Historical Aggregated by Month)
  const normalsKey = `climate:normals_v2:${latitude.toFixed(2)},${longitude.toFixed(2)}`;

  const normals = await fetchWithCache(
      normalsKey,
      async () => {
          // Fetch last 3 years of daily data (approx 1000 points) to generate typical profiles
          const endDate = new Date().toISOString().split('T')[0];
          const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 3)).toISOString().split('T')[0];

          try {
            const res = await axios.get('https://archive-api.open-meteo.com/v1/archive', {
                params: {
                    latitude,
                    longitude,
                    start_date: startDate,
                    end_date: endDate,
                    daily: 'temperature_2m_mean,precipitation_sum',
                    timezone: 'auto'
                }
            });

            const daily = res.data.daily;
            if (!daily || !daily.time) return null;

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
            return monthStats.map(stat => {
                if (stat.count === 0) return { avgTemp: 0, monthlyPrecip: 0 };
                // Avg Daily Temp
                const avgTemp = (stat.tempSum / stat.count).toFixed(1);
                // Avg Monthly Precip = (Total Precip / Total Days) * 30
                const monthlyPrecip = ((stat.precipSum / stat.count) * 30).toFixed(1);
                return { avgTemp, monthlyPrecip };
            });

          } catch (e) {
              console.error("Climate Normals Fetch Error", e);
              return null;
          }
      },
      { ttlSeconds: NORMALS_TTL }
  );

  return NextResponse.json({
      forecast: forecastData?.daily,
      current: forecastData?.current,
      timezone: forecastData?.timezone,
      normals // Array of 12 objects
  });
}
