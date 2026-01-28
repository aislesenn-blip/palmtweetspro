"use client";

import React, { useState } from 'react';
import { Shield, Siren, Car, FileCheck, X, Briefcase, GraduationCap, Plane, Heart, Stamp } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';
import { getEmergencyNumbers } from '@/lib/emergency';

interface VisaDetails {
    tourist: string;
    student: string;
    business: string;
    work: string;
    transit: string;
    volunteer: string;
}

interface GovernmentCardProps {
  countryCode: string; // ISO 2 char
  visa?: string | VisaDetails; // Support Legacy String or New Object
  driving?: {
      side: string;
      minAge: number;
      license: string;
  };
  carSide?: string | null;
  loading?: boolean;
}

export default function GovernmentCard({ countryCode, visa, driving, carSide, loading }: GovernmentCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'tourist' | 'student' | 'business' | 'work' | 'transit' | 'volunteer'>('tourist');

  if (loading) {
    return <SkeletonLoader className="h-64 w-full" />;
  }

  const emergency = getEmergencyNumbers(countryCode);
  const isVisaObject = typeof visa === 'object' && visa !== null;

  // Safe extraction of main text
  let mainVisaText = "Check Embassy";
  if (isVisaObject) {
      const v = visa as any; // Cast to allow safe access
      if (v.tourist && typeof v.tourist === 'string') {
          mainVisaText = v.tourist;
      }
  } else if (typeof visa === 'string') {
      mainVisaText = visa;
  }

  const tabs = [
      { id: 'tourist', label: 'Tourist', icon: Stamp },
      { id: 'business', label: 'Business', icon: Briefcase },
      { id: 'student', label: 'Student', icon: GraduationCap },
      { id: 'work', label: 'Work', icon: Briefcase },
      { id: 'transit', label: 'Transit', icon: Plane },
      { id: 'volunteer', label: 'Volunteer', icon: Heart },
  ];

  const getModalContent = () => {
      if (!isVisaObject) return "Information unavailable.";
      const detail = (visa as any)[activeTab];
      return (typeof detail === 'string' && detail) ? detail : "Specific requirements unavailable. Please check with the embassy.";
  };

  return (
    <>
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md relative">
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
           <p className="text-sm font-bold text-gray-900 line-clamp-2">{mainVisaText}</p>

           {isVisaObject && (
               <button
                onClick={() => setShowModal(true)}
                className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 underline"
               >
                   View Full Requirements
               </button>
           )}
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

    {/* Visa Modal */}
    {showModal && isVisaObject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-red-600" />
                        Visa Requirements
                    </h3>
                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 min-w-[80px] py-3 text-xs font-medium flex flex-col items-center gap-1 transition-colors border-b-2 ${activeTab === tab.id ? 'border-red-600 text-red-600 bg-red-50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="p-6 min-h-[200px] flex items-center justify-center text-center">
                    <div>
                         <p className="text-xl font-bold text-gray-900 mb-2">
                             {getModalContent()}
                         </p>
                         <p className="text-sm text-gray-500">
                             Requirements for {activeTab} travelers. Always verify with the official embassy before booking.
                         </p>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                    <a href="#" className="text-sm font-semibold text-blue-600 hover:underline">
                        Visit Official Government Portal &rarr;
                    </a>
                </div>
            </div>
        </div>
    )}
    </>
  );
}
