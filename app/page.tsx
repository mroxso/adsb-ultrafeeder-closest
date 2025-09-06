import { ClosestFlight } from "@/components/flight-info";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="py-6 px-6 border-b bg-background shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">ADSB Flight Tracker</h1>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>
      </header>
      
      <main className="flex items-center justify-center p-4 md:p-8">
        <ClosestFlight />
      </main>
      
      <footer className="py-4 px-6 text-center text-sm text-muted-foreground border-t">
        <p>Powered by ADSB Ultrafeeder • Data refreshes every 3 seconds • Optimized for TV display</p>
      </footer>
    </div>
  );
}
