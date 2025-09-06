import { NextRequest, NextResponse } from 'next/server';

// Configuration for the ADSB Ultrafeeder endpoint
// This will use the environment variable NEXT_PUBLIC_ADSB_ULTRAFEEDER_URL or default to localhost
const ADSB_ULTRAFEEDER_URL = process.env.NEXT_PUBLIC_ADSB_ULTRAFEEDER_URL || 'http://localhost:8080/data/aircraft.json';

export async function GET(request: NextRequest) {
  try {
    // Fetch data from ADSB Ultrafeeder
    const response = await fetch(ADSB_ULTRAFEEDER_URL, {
      next: { revalidate: 2 }, // Revalidate cache every 2 seconds
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch data from ADSB Ultrafeeder: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching aircraft data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aircraft data' },
      { status: 500 }
    );
  }
}
