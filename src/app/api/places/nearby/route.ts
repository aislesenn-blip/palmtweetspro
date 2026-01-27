import { NextRequest, NextResponse } from 'next/server';
import { getNearbyPlaces } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  const places = await getNearbyPlaces(lat, lng);
  return NextResponse.json(places);
}
