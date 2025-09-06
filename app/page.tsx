import { ClosestFlight } from "@/components/flight-info";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] min-h-screen bg-muted/20">
      <header className="py-4 px-6 border-b bg-background">
        <h1 className="text-2xl font-bold text-center">ADSB Ultrafeeder Closest Flight</h1>
      </header>
      
      <main className="flex items-center justify-center p-4 md:p-8">
        <ClosestFlight />
      </main>
      
      <footer className="py-4 px-6 text-center text-sm text-muted-foreground border-t">
        <p>Powered by ADSB Ultrafeeder • Data refreshes every 5 seconds</p>
      </footer>
    </div>
  );
}
