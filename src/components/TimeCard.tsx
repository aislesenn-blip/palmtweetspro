"use client";

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

interface TimeCardProps {
  data?: { timezone: string } | null;
  loading?: boolean;
}

export default function TimeCard({ data, loading }: TimeCardProps) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (data?.timezone) {
      const updateClock = () => {
        try {
          const now = new Date();
          const timeStr = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: data.timezone
          }).format(now);
          setTime(timeStr);
        } catch (e) {
          setTime("Invalid TZ");
        }
      };
      updateClock();
      timer = setInterval(updateClock, 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [data]);

  if (loading) {
    return <SkeletonLoader className="h-48 w-full" />;
  }

  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-orange-500" />
        <h3 className="font-medium text-gray-500">Local Time</h3>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-gray-900">{time || '--:--'}</div>
        <p className="text-gray-500">{data?.timezone || 'GMT'}</p>
      </div>
    </div>
  );
}
