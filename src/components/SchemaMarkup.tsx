import React from 'react';

interface SchemaProps {
  place: any;
  weather: any;
  currency: any;
  idd: any;
  description: string;
}

export default function SchemaMarkup({ place, weather, currency, idd, description }: SchemaProps) {
  const currencyCode = currency ? Object.keys(currency)[0] : 'USD';
  const currencyName = currency ? currency[currencyCode].name : 'US Dollar';
  const iddCode = idd ? `${idd.root}${idd.suffixes?.[0] || ''}` : '';

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Place",
        "name": place.name,
        "description": description,
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": place.latitude,
          "longitude": place.longitude
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": place.country
        },
        "containsPlace": {
          "@type": "WeatherForecast",
          "name": `Weather in ${place.name}`,
          "description": weather ? `${weather.temperature}°C, Code: ${weather.weatherCode}` : "Weather data unavailable"
        }
      },
      {
        "@type": "ExchangeRateSpecification",
        "currency": currencyCode,
        "currentExchangeRate": {
          "@type": "UnitPriceSpecification",
          "priceCurrency": "USD", // Base currency assumption
          "price": "1.0" // Placeholder, real conversion needs an API
        },
        "name": `Currency: ${currencyName}`
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `What time is it in ${place.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `The current time in ${place.name} is ${weather?.time || 'unknown'}.`
            }
          },
          {
            "@type": "Question",
            "name": `What is the dialing code for ${place.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `The dialing code for ${place.country} is ${iddCode}.`
            }
          }
        ]
      },
      {
        "@type": "Dataset",
        "name": `${place.name} Location Data`,
        "description": `Comprehensive location data for ${place.name}, including coordinates, weather, and logistical info.`,
        "spatialCoverage": {
          "@type": "Place",
          "name": place.name
        },
        "creator": {
          "@type": "Organization",
          "name": "Palmtweets Global Location OS"
        },
        "license": "https://creativecommons.org/licenses/by-sa/4.0/"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "World",
            "item": "https://palmtweets.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": place.country,
            "item": `https://palmtweets.com/country/${place.country.replace(/\s+/g, '-').toLowerCase()}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": place.name,
            "item": `https://palmtweets.com/${place.slug}`
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
