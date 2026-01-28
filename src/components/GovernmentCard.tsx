"use client";

import React from 'react';
import { Shield, Siren, Car, FileCheck } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';
import { getEmergencyNumbers } from '@/lib/emergency';

interface GovernmentCardProps {
  countryCode: string; // ISO 2 char
  visa?: string;
  driving?: {
      side: string;
      minAge: number;
      license: string;
  };
  carSide?: string | null;
  loading?: boolean;
}

export default function GovernmentCard({ countryCode, visa, driving, carSide, loading }: GovernmentCardProps) {
  if (loading) {
    return <SkeletonLoader className="h-64 w-full" />;
  }

  // Emergency still static/local for now as per previous implementation,
  // or could move to API. API `government` route didn't return emergency.
  // I'll keep local for Emergency to save API response size if it's static dictionary.
  const emergency = getEmergencyNumbers(countryCode);

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-red-600" />
        <h3 className="font-medium text-gray-500">Government & Legal</h3>
      </div>

      <div className="space-y-6">
        {/* Visa */}
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
           <div className="flex items-center gap-2 mb-1">
               <FileCheck className="h-4 w-4 text-red-600" />
               <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Visa Policy</p>
           </div>
           <p className="text-sm font-bold text-gray-900">{visa || 'Check Embassy'}</p>
        </div>

        {/* Driving */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
           <div className="flex items-center gap-2 mb-3">
               <Car className="h-4 w-4 text-gray-600" />
               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Driving Rules</p>
           </div>

           <div className="space-y-2">
               <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Side</span>
                   <span className="font-bold text-gray-900 capitalize">{carSide || driving?.side || 'Right'}</span>
               </div>
               <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Min. Age</span>
                   <span className="font-bold text-gray-900">{driving?.minAge || 18}+</span>
               </div>
               <div className="pt-2 border-t border-gray-200">
                   <span className="text-xs text-gray-400 block mb-1">License Requirement</span>
                   <p className="text-xs font-medium text-gray-800 leading-snug">{driving?.license || 'Valid National License'}</p>
               </div>
           </div>
        </div>

        {/* Emergency */}
        <div>
           <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Emergency Numbers</p>
           <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white border border-red-100 rounded-lg p-2 shadow-sm">
                 <Siren className="h-4 w-4 text-red-500 mx-auto mb-1" />
                 <span className="text-xs font-bold text-gray-900">{emergency.police}</span>
                 <p className="text-[10px] text-gray-500">Police</p>
              </div>
              <div className="bg-white border border-orange-100 rounded-lg p-2 shadow-sm">
                 <Siren className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                 <span className="text-xs font-bold text-gray-900">{emergency.fire}</span>
                 <p className="text-[10px] text-gray-500">Fire</p>
              </div>
              <div className="bg-white border border-green-100 rounded-lg p-2 shadow-sm">
                 <Siren className="h-4 w-4 text-green-500 mx-auto mb-1" />
                 <span className="text-xs font-bold text-gray-900">{emergency.ambulance}</span>
                 <p className="text-[10px] text-gray-500">Medical</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
