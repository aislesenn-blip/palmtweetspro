import React from 'react';
import { getPlaceBySlug } from '@/lib/db';
import ComparisonDashboard from '@/components/ComparisonDashboard';

export default async function Page({ params }: { params: { lang: string; slugs: string } }) {
  const [slug1, slug2] = params.slugs.split('-vs-');

  const place1 = slug1 ? await getPlaceBySlug(slug1) : null;
  const place2 = slug2 ? await getPlaceBySlug(slug2) : null;

  if (!place1 || !place2) {
      return <div className="p-10 text-center">One or both locations not found.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-12 text-4xl font-bold text-center">Comparison Engine</h1>
      <ComparisonDashboard place1={place1} place2={place2} />
    </div>
  );
}
