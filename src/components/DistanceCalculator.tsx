"use client";

import React, { useState } from 'react';
import { Map, Car, PersonStanding, Plane, Search, ArrowRight } from 'lucide-react';
import axios from 'axios';
import SkeletonLoader from './SkeletonLoader';

interface DistanceCalculatorProps {
  currentCity: string;
  currentLat: number;
  currentLng: number;
}

export default function DistanceCalculator({ currentCity, currentLat, currentLng }: DistanceCalculatorProps) {
  const [targetCity, setTargetCity] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCity.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
        // 1. Geocode Target
        const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: { q: targetCity, format: 'json', limit: 1 },
            headers: { 'User-Agent': 'Palmtweets/1.0' }
        });

        if (!geoRes.data || geoRes.data.length === 0) {
            throw new Error('City not found');
        }

        const target = geoRes.data[0];
        const tLat = parseFloat(target.lat);
        const tLng = parseFloat(target.lon);

        // 2. Calculate Distances
        // Air (Haversine) - simplified
        const R = 6371; // km
        const dLat = (tLat - currentLat) * Math.PI / 180;
        const dLon = (tLng - currentLng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(currentLat * Math.PI / 180) * Math.cos(tLat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const airDist = R * c;

        // Drive (OSRM)
        let driveDist = null;
        let driveTime = null;

        // Only fetch OSRM if within driving range (e.g. < 3000km) to save bandwidth/time
        if (airDist < 5000) {
             try {
                const osrmRes = await axios.get(`https://router.project-osrm.org/route/v1/driving/${currentLng},${currentLat};${tLng},${tLat}?overview=false`);
                if (osrmRes.data.routes && osrmRes.data.routes.length > 0) {
                    const route = osrmRes.data.routes[0];
                    driveDist = route.distance / 1000; // meters to km
                    driveTime = route.duration / 3600; // seconds to hours
                }
             } catch (err) {
                 console.warn("OSRM failed or no route", err);
             }
        }

        setResult({
            name: target.name || targetCity,
            airDist,
            driveDist,
            driveTime
        });

    } catch (err) {
        setError('Could not find city or calculate route.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Map className="h-5 w-5 text-indigo-500" />
        <h3 className="font-medium text-gray-500">Global Route Finder</h3>
      </div>

      <form onSubmit={handleCalculate} className="relative mb-6">
         <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
            <div className="px-3 py-2 bg-white rounded-lg shadow-sm text-xs font-bold text-gray-500 uppercase tracking-wide">
                From
            </div>
            <span className="text-sm font-semibold text-gray-700 truncate max-w-[100px]">{currentCity}</span>
            <ArrowRight className="h-4 w-4 text-gray-400 mx-1" />
            <input
                type="text"
                value={targetCity}
                onChange={(e) => setTargetCity(e.target.value)}
                placeholder="Enter City..."
                className="flex-1 bg-transparent outline-none text-sm font-semibold text-gray-900 placeholder-gray-400"
            />
            <button type="submit" disabled={loading} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
                <Search className="h-4 w-4" />
            </button>
         </div>
         {error && <p className="text-xs text-red-500 mt-2 ml-1">{error}</p>}
      </form>

      {loading ? (
          <SkeletonLoader className="h-24 w-full" />
      ) : result ? (
          <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                 <Plane className="h-5 w-5 text-indigo-500 mx-auto mb-1" />
                 <p className="text-lg font-bold text-gray-900">{Math.round(result.airDist)}<span className="text-xs font-normal text-gray-500">km</span></p>
                 <p className="text-[10px] text-indigo-400 uppercase tracking-wide">Air Line</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                 <Car className="h-5 w-5 text-indigo-500 mx-auto mb-1" />
                 <p className="text-lg font-bold text-gray-900">{result.driveDist ? Math.round(result.driveDist) : 'N/A'}<span className="text-xs font-normal text-gray-500">km</span></p>
                 <p className="text-[10px] text-indigo-400 uppercase tracking-wide">Driving</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                 <PersonStanding className="h-5 w-5 text-indigo-500 mx-auto mb-1" />
                 <p className="text-lg font-bold text-gray-900">{result.driveDist ? Math.round(result.driveDist / 5 / 24) : 'N/A'}<span className="text-xs font-normal text-gray-500">d</span></p>
                 <p className="text-[10px] text-indigo-400 uppercase tracking-wide">Walking</p>
              </div>
          </div>
      ) : (
          <div className="text-center py-8 text-gray-400 text-sm">
              Enter a destination to compare distances.
          </div>
      )}
    </div>
  );
}
