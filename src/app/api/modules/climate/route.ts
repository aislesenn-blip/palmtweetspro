import { NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/kv';
import axios from 'axios';

const NORMALS_TTL = 60 * 60 * 24 * 30; // 30 Days
const FORECAST_TTL = 60 * 60 * 24; // 24 Hours

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  // 1. Forecast
  const forecastKey = `climate:forecast:${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const forecastData = await fetchWithCache(
      forecastKey,
      async () => {
          const res = await axios.get('https://api.open-meteo.com/v1/forecast', {
              params: {
                  latitude,
                  longitude,
                  current: 'temperature_2m,weather_code',
                  daily: 'temperature_2m_max,temperature_2m_min',
                  timezone: 'auto'
              }
          });
          return res.data;
      },
      { ttlSeconds: FORECAST_TTL }
  );

  // 2. Normals (Historical)
  // We calculate normals for the current month
  const currentMonth = new Date().getMonth(); // 0-11
  const normalsKey = `climate:normals:${latitude.toFixed(2)},${longitude.toFixed(2)}:month${currentMonth}`;

  const normals = await fetchWithCache(
      normalsKey,
      async () => {
          // Fetch last 10 years of data for this location
          // To save bandwidth, we could just fetch aggregated data if available, but Open-Meteo Archive is raw daily.
          // We will fetch a representative sample or just the full 10 years.
          // Full 10 years daily data is ~3650 points. Light enough for JSON.

          const endDate = new Date().toISOString().split('T')[0];
          const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 10)).toISOString().split('T')[0];

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

            // Filter for current month
            let tempSum = 0;
            let precipSum = 0;
            let count = 0;

            daily.time.forEach((t: string, i: number) => {
                const date = new Date(t);
                if (date.getMonth() === currentMonth) {
                    const temp = daily.temperature_2m_mean[i];
                    const rain = daily.precipitation_sum[i];
                    if (temp !== null && rain !== null) {
                        tempSum += temp;
                        precipSum += rain;
                        count++;
                    }
                }
            });

            if (count === 0) return null;

            return {
                avgTemp: (tempSum / count).toFixed(1),
                avgPrecip: (precipSum / count).toFixed(1), // Average daily precip? Or total?
                // Usually normals are "Average Daily High" or "Average Monthly Rainfall".
                // Here we summed daily rain for the month occurrences.
                // We want "Average Rainfall for the Month".
                // We have ~10 years of data. `precipSum` is total rain in all those June days.
                // Divide by 10 (years) roughly? Or divide by count * 30?
                // `count` is total days.
                // Avg Daily Precip = precipSum / count.
                // Avg Monthly Precip = Avg Daily * 30.
                monthlyPrecip: ((precipSum / count) * 30).toFixed(1)
            };
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
      normals
  });
}
