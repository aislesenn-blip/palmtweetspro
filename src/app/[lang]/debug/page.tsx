"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ApiStatus {
  name: string;
  status: string;
  latency: string;
}

export default function DebugPage() {
  const [results, setResults] = useState<ApiStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const apis = [
    { name: 'RestCountries (US Check)', url: 'https://restcountries.com/v3.1/alpha/us' },
    { name: 'OpenExchangeRates (Free)', url: 'https://open.er-api.com/v6/latest/USD' },
    { name: 'WorldTimeAPI (UTC)', url: 'https://worldtimeapi.org/api/timezone/Etc/UTC' },
    { name: 'OpenMeteo (0,0)', url: 'https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&current=temperature_2m' },
  ];

  useEffect(() => {
    async function checkApis() {
      const statusList: ApiStatus[] = [];

      for (const api of apis) {
        const start = performance.now();
        let status = 'Error';
        try {
          // 5s timeout
          await axios.get(api.url, { timeout: 5000 });
          status = '200 OK';
        } catch (e: any) {
          if (axios.isAxiosError(e) && e.response) {
            status = `${e.response.status} ${e.response.statusText}`;
          } else if (e.code === 'ECONNABORTED') {
             status = 'Timeout';
          } else {
            status = 'Failed';
          }
        }
        const end = performance.now();
        statusList.push({
          name: api.name,
          status: status,
          latency: `${(end - start).toFixed(2)} ms`
        });
      }

      setResults(statusList);
      setLoading(false);
    }

    checkApis();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Black Box Diagnostics</h1>

      {loading ? (
        <div className="text-gray-500 animate-pulse">Running system diagnostics...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {results.map((res, idx) => (
                <tr key={idx} className={res.status.startsWith('200') ? 'bg-green-50' : 'bg-red-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{res.name}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${res.status.startsWith('200') ? 'text-green-700' : 'text-red-700'}`}>
                    {res.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{res.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 text-xs text-gray-400">
         Note: This tool runs client-side checks to verify browser connectivity to critical services.
      </div>
    </div>
  );
}
