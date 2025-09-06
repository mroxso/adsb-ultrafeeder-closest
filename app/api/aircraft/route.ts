import { NextRequest, NextResponse } from 'next/server';

// Configuration for the ADSB Ultrafeeder endpoint
// This will use the environment variable NEXT_PUBLIC_ADSB_ULTRAFEEDER_URL or default to localhost
const ADSB_ULTRAFEEDER_URL = process.env.NEXT_PUBLIC_ADSB_ULTRAFEEDER_URL || 'http://localhost:8080/data/aircraft.json';

// Simulated flight database for demonstration purposes
// In production, you would use a real API like FlightAware, FlightRadar24, or OpenSky Network
const flightDatabase: Record<string, {
  airline: string;
  flight_number: string;
  from_iata: string;
  to_iata: string;
  from_city: string;
  to_city: string;
  status: string;
}> = {
  // This is a sample database that maps ICAO hex codes to flight information
  // In a real application, you would fetch this from an external API
  "a1b2c3": {
    airline: "Lufthansa",
    flight_number: "LH400",
    from_iata: "FRA",
    to_iata: "JFK",
    from_city: "Frankfurt",
    to_city: "New York",
    status: "En Route"
  },
  // Add more entries as needed or generate dynamically
};

// Helper function to try to determine flight info based on callsign
function guessFlightInfo(callsign: string) {
  if (!callsign) return null;
  
  callsign = callsign.trim();
  
  // Try to extract airline code and flight number
  // Common format is 2-3 letter airline code followed by numbers (e.g., BA123, LH400)
  const airlineCodeMatch = callsign.match(/^([A-Z]{2,3})(\d+)$/i);
  
  if (airlineCodeMatch) {
    const [_, airlineCode, flightNum] = airlineCodeMatch;
    
    // Map common airline codes
    const airlines: Record<string, string> = {
      "LH": "Lufthansa",
      "BA": "British Airways",
      "AF": "Air France",
      "UA": "United Airlines",
      "AA": "American Airlines",
      "DL": "Delta Airlines",
      "EZY": "EasyJet",
      "FR": "Ryanair",
      "EK": "Emirates",
      "QF": "Qantas",
      "SQ": "Singapore Airlines",
      "TK": "Turkish Airlines",
      "LX": "Swiss",
      "OS": "Austrian",
      "KL": "KLM",
      // Add more as needed
    };
    
    return {
      airline: airlines[airlineCode.toUpperCase()] || airlineCode,
      flight_number: airlineCode + flightNum,
      // We don't have origin/destination without external API
      from_iata: "",
      to_iata: "",
      from_city: "",
      to_city: "",
      status: "En Route"
    };
  }
  
  return null;
}

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
    
    // Enhance aircraft data with flight information when available
    if (data.aircraft && Array.isArray(data.aircraft)) {
      data.aircraft = data.aircraft.map((aircraft: any) => {
        // If we have flight info in our database, add it
        if (aircraft.hex && flightDatabase[aircraft.hex]) {
          return { ...aircraft, ...flightDatabase[aircraft.hex] };
        }
        
        // Try to guess flight info from the callsign
        if (aircraft.flight) {
          const guessedInfo = guessFlightInfo(aircraft.flight);
          if (guessedInfo) {
            return { ...aircraft, ...guessedInfo };
          }
        }
        
        // Calculate vertical rate status
        if (aircraft.baro_rate) {
          if (aircraft.baro_rate > 300) {
            aircraft.status = "Climbing";
          } else if (aircraft.baro_rate < -300) {
            aircraft.status = "Descending";
          } else {
            aircraft.status = "Level Flight";
          }
          aircraft.verticalRate = aircraft.baro_rate;
        }
        
        return aircraft;
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching aircraft data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aircraft data' },
      { status: 500 }
    );
  }
}
