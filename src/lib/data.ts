import { getPlaceBySlug, getWeather, Place, WeatherData } from './db';
import axios from 'axios';

export interface LocationData {
  place: Place | null;
  weather: WeatherData | null;
  currency: any | null;
  idd: any | null;
  wiki: string | null;
}

export async function fetchLocationData(slug: string): Promise<LocationData> {
  const place = await getPlaceBySlug(slug);

  let weather = null;
  let currency = null;
  let idd = null;
  let wiki = null;

  if (place) {
    // Parallel fetch for efficiency
    const [weatherRes, countryRes, wikiRes] = await Promise.allSettled([
      getWeather(place.latitude, place.longitude),
      axios.get(`https://restcountries.com/v3.1/name/${place.country}?fields=currencies,idd`),
      axios.get(`https://en.wikipedia.org/w/api.php`, {
        params: {
          action: 'query',
          format: 'json',
          prop: 'extracts',
          exintro: true,
          explaintext: true,
          titles: place.name
        }
      })
    ]);

    if (weatherRes.status === 'fulfilled') weather = weatherRes.value;

    if (countryRes.status === 'fulfilled' && countryRes.value.data.length > 0) {
      currency = countryRes.value.data[0].currencies;
      idd = countryRes.value.data[0].idd;
    }

    if (wikiRes.status === 'fulfilled') {
      const pages = wikiRes.value.data.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        if (pageId !== '-1') {
          wiki = pages[pageId].extract;
        }
      }
    }
  }

  return { place, weather, currency, idd, wiki };
}
