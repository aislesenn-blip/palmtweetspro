"use client";

import React from 'react';
import { Shield, Siren, Car } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';
import { getVisaInfo } from '@/lib/visaData';
import { getEmergencyNumbers } from '@/lib/emergency';

interface GovernmentCardProps {
  countryCode: string; // ISO 2 char
  carSide: string; // 'right' or 'left'
  loading?: boolean;
}

export default function GovernmentCard({ countryCode, carSide, loading }: GovernmentCardProps) {
  if (loading) {
    return <SkeletonLoader className="h-64 w-full" />;
  }

  const visa = getVisaInfo(countryCode);
  const emergency = getEmergencyNumbers(countryCode);

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-red-600" />
        <h3 className="font-medium text-gray-500">Government & Legal</h3>
      </div>

      <div className="space-y-6">
        {/* Visa */}
        <div>
           <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Visa Policy (General)</p>
           <p className="text-sm font-medium text-gray-900">{visa}</p>
        </div>

        {/* Emergency */}
        <div>
           <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Emergency Numbers</p>
           <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-red-50 rounded-lg p-2">
                 <Siren className="h-4 w-4 text-red-500 mx-auto mb-1" />
                 <span className="text-xs font-bold text-gray-900">{emergency.police}</span>
                 <p className="text-[10px] text-gray-500">Police</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-2">
                 <Siren className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                 <span className="text-xs font-bold text-gray-900">{emergency.fire}</span>
                 <p className="text-[10px] text-gray-500">Fire</p>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                 <Siren className="h-4 w-4 text-green-500 mx-auto mb-1" />
                 <span className="text-xs font-bold text-gray-900">{emergency.ambulance}</span>
                 <p className="text-[10px] text-gray-500">Medical</p>
              </div>
           </div>
        </div>

        {/* Driving */}
        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
           <Car className="h-5 w-5 text-gray-600" />
           <div>
              <p className="text-xs text-gray-500">Driving Side</p>
              <p className="text-sm font-bold text-gray-900 capitalize">{carSide || 'Right'}</p>
           </div>
        </div>
      </div>
    </div>
  );
}
