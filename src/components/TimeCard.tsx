"use client";

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimeCardProps {
  lat: number;
  lng: number;
}

export default function TimeCard({ lat, lng }: TimeCardProps) {
  const [time, setTime] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Timezone (we can use OpenMeteo for this too as it returns timezone info)
    // Or we can just use the coords to guess, but API is better.
    let mounted = true;
    let timer: NodeJS.Timeout;

    async function init() {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&timezone=auto&current=time`);
        const data = await response.json();

        if (mounted && data.timezone) {
          setTimezone(data.timezone);

          // Start clock
          const updateClock = () => {
            const now = new Date();
            const timeStr = new Intl.DateTimeFormat('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: data.timezone
            }).format(now);
            setTime(timeStr);
          };

          updateClock();
          timer = setInterval(updateClock, 1000);
        }
      } catch (e) {
        console.error("Client Time Fetch Error", e);
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
    return <div className="h-48 w-full animate-pulse rounded-3xl bg-gray-200"></div>;
  }

  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-orange-500" />
        <h3 className="font-medium text-gray-500">Local Time</h3>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-gray-900">{time || '--:--'}</div>
        <p className="text-gray-500">{timezone || 'GMT'}</p>
      </div>
    </div>
  );
}
