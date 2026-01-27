import React from 'react';
import { Clock } from 'lucide-react';

export default function TimeCard({
  loading = false,
  time,
  timezone
}: {
  loading?: boolean,
  time?: string,
  timezone?: string
}) {
  if (loading) {
    return <div className="h-48 w-full animate-pulse rounded-3xl bg-gray-200"></div>;
  }

  // Format time if provided (assuming ISO string or similar)
  const displayTime = time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-orange-500" />
        <h3 className="font-medium text-gray-500">Local Time</h3>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-gray-900">{displayTime}</div>
        <p className="text-gray-500">{timezone || 'GMT'}</p>
      </div>
    </div>
  );
}
