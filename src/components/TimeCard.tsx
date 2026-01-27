"use client";

import React, { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

interface TimeCardProps {
  lat: number;
  lng: number;
}

export default function TimeCard({ lat, lng }: TimeCardProps) {
  const [time, setTime] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timer: NodeJS.Timeout;

    async function init() {
      try {
        setLoading(true);
        // Defensive: Check lat/lng
        if (lat === undefined || lng === undefined) throw new Error("Missing coordinates");

        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&timezone=auto&current=time`);

        if (!response.ok) throw new Error("API Network Error");

        const data = await response.json();

        if (mounted && data?.timezone) {
          const tz = data.timezone;
          setTimezone(tz);

          const updateClock = () => {
            try {
              const now = new Date();
              const timeStr = new Intl.DateTimeFormat('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: tz
              }).format(now);
              setTime(timeStr);
            } catch (formatError) {
              console.error("Time Formatting Error", formatError);
              setTime("Invalid TZ");
            }
          };

          updateClock();
          timer = setInterval(updateClock, 1000);
        } else {
           throw new Error("Invalid response format");
        }
      } catch (e) {
        console.error("Client Time Fetch Error", e);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [lat, lng]);

  if (loading) {
    return <SkeletonLoader className="h-48 w-full" />;
  }

  if (error) {
    return (
      <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm flex flex-col items-center justify-center text-red-500">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="text-sm font-medium">Time Unavailable</p>
      </div>
    );
  }

  const timeDisplay = time ?? '--:--';
  const tzDisplay = timezone ?? 'Unknown Zone';

  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-orange-500" />
        <h3 className="font-medium text-gray-500">Local Time</h3>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-gray-900">{timeDisplay}</div>
        <p className="text-gray-500">{tzDisplay}</p>
      </div>
    </div>
  );
}
