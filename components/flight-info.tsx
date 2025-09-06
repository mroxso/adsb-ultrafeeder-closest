"use client";

import { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types for flight data
interface Aircraft {
  hex: string;
  flight?: string;
  alt_baro?: number;
  alt_geom?: number;
  gs?: number;
  track?: number;
  baro_rate?: number;
  nav_qnh?: number;
  nav_altitude_mcp?: number;
  nav_heading?: number;
  lat?: number;
  lon?: number;
  squawk?: string;
  category?: string;
  nic?: number;
  rc?: number;
  version?: number;
  nac_p?: number;
  nac_v?: number;
  sil?: number;
  sil_type?: string;
  mlat?: string[];
  tisb?: string[];
  messages?: number;
  seen?: number;
  rssi?: number;
  distance?: number; // We'll calculate this
}

interface AircraftData {
  now: number;
  messages: number;
  aircraft: Aircraft[];
}

// Helper function to calculate distance between two coordinates (haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

export function ClosestFlight() {
  const [closestAircraft, setClosestAircraft] = useState<Aircraft | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [homeLat, setHomeLat] = useState<number | null>(null);
  const [homeLon, setHomeLon] = useState<number | null>(null);

  // Get the home coordinates from environment variables
  useEffect(() => {
    // Check for environment variables
    const envLat = process.env.NEXT_PUBLIC_HOME_LAT;
    const envLon = process.env.NEXT_PUBLIC_HOME_LON;
    
    if (envLat && envLon) {
      setHomeLat(parseFloat(envLat));
      setHomeLon(parseFloat(envLon));
    } else {
      setError("Home coordinates not set. Please set NEXT_PUBLIC_HOME_LAT and NEXT_PUBLIC_HOME_LON environment variables.");
    }
  }, []);

  useEffect(() => {
    if (!homeLat || !homeLon) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch from ADSB ultrafeeder - adjust URL as needed
        const response = await fetch('/api/aircraft');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const data: AircraftData = await response.json();
        
        // Filter for aircraft with valid coordinates
        const validAircraft = data.aircraft.filter(
          aircraft => typeof aircraft.lat === 'number' && 
                     typeof aircraft.lon === 'number'
        );
        
        // Calculate distance for each aircraft
        const aircraftWithDistance = validAircraft.map(aircraft => {
          if (aircraft.lat && aircraft.lon && homeLat && homeLon) {
            return {
              ...aircraft,
              distance: calculateDistance(homeLat, homeLon, aircraft.lat, aircraft.lon)
            };
          }
          return aircraft;
        });
        
        // Sort by distance and get the closest
        const sorted = aircraftWithDistance.sort((a, b) => 
          (a.distance || Infinity) - (b.distance || Infinity)
        );
        
        if (sorted.length > 0) {
          setClosestAircraft(sorted[0]);
        } else {
          setError("No aircraft with valid coordinates found");
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up polling interval (every 5 seconds)
    const intervalId = setInterval(fetchData, 5000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [homeLat, homeLon]);
  
  if (error) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      {loading && !closestAircraft ? (
        <FlightSkeleton />
      ) : (
        <FlightCard aircraft={closestAircraft} homeLat={homeLat} homeLon={homeLon} />
      )}
    </div>
  );
}

function FlightCard({ aircraft, homeLat, homeLon }: { 
  aircraft: Aircraft | null;
  homeLat: number | null;
  homeLon: number | null;
}) {
  if (!aircraft) {
    return (
      <Alert className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Flight Data</AlertTitle>
        <AlertDescription>
          No aircraft are currently being tracked by the ADSB receiver.
        </AlertDescription>
      </Alert>
    );
  }

  // Format distance
  const distance = aircraft.distance !== undefined 
    ? aircraft.distance < 1 
      ? `${(aircraft.distance * 1000).toFixed(0)} m` 
      : `${aircraft.distance.toFixed(1)} km`
    : 'Unknown';

  // Format altitude
  const altitude = aircraft.alt_baro !== undefined 
    ? `${aircraft.alt_baro} ft`
    : 'Unknown';

  // Format speed
  const speed = aircraft.gs !== undefined 
    ? `${aircraft.gs} knots`
    : 'Unknown';

  // Format heading as cardinal direction
  const getCardinalDirection = (angle: number | undefined) => {
    if (angle === undefined) return 'Unknown';
    
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 22.5) % 16;
    return `${directions[index]} (${angle.toFixed(0)}°)`;
  };
  
  const heading = getCardinalDirection(aircraft.track);

  return (
    <Card className="w-full h-full shadow-lg">
      <CardHeader className="bg-card border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-3xl md:text-4xl">
              {aircraft.flight 
                ? aircraft.flight.trim() 
                : `Unknown (${aircraft.hex})`}
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Closest Aircraft
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm md:text-base px-3 py-1">
            {distance}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Altitude</h3>
            <p className="text-2xl font-semibold">{altitude}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Speed</h3>
            <p className="text-2xl font-semibold">{speed}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Heading</h3>
            <p className="text-2xl font-semibold">{heading}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Coordinates</h3>
            <p className="text-xl font-medium">
              {aircraft.lat !== undefined && aircraft.lon !== undefined 
                ? `${aircraft.lat.toFixed(5)}, ${aircraft.lon.toFixed(5)}`
                : 'Unknown'}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Squawk</h3>
            <p className="text-xl font-medium">{aircraft.squawk || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">ICAO</h3>
            <p className="text-xl font-medium">{aircraft.hex.toUpperCase()}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Last seen: {aircraft.seen !== undefined ? `${aircraft.seen.toFixed(0)} seconds ago` : 'Unknown'}
        </div>
        <div className="text-sm text-muted-foreground">
          Signal: {aircraft.rssi !== undefined ? `${aircraft.rssi.toFixed(1)} dBFS` : 'Unknown'}
        </div>
      </CardFooter>
    </Card>
  );
}

function FlightSkeleton() {
  return (
    <Card className="w-full h-full shadow-lg">
      <CardHeader className="bg-primary/5">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={`skeleton-left-${i}`}>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={`skeleton-right-${i}`}>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-36" />
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-32" />
      </CardFooter>
    </Card>
  );
}
