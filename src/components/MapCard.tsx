"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import SkeletonLoader from './SkeletonLoader';

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface MapCardProps {
  lat?: number;
  lng?: number;
  loading?: boolean;
}

export default function MapCard({ lat, lng, loading }: MapCardProps) {
  if (loading || lat === undefined || lng === undefined) {
     return <SkeletonLoader className="h-96 w-full" />;
  }

  return (
    <div className="h-96 w-full overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-md relative z-0">
       <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]}>
            <Popup>
              Location Center
            </Popup>
          </Marker>
       </MapContainer>
       {/* Leaflet CSS needs to be imported globally or here. Assuming globals.css handles it or we inject a link */}
       <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
         integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
         crossOrigin=""/>
    </div>
  );
}
