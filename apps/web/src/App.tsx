import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [4.895168, 52.370216],
      zoom: 5,
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[380px_1fr]">
      <aside className="border-r border-slate-200 bg-white/80 backdrop-blur">
        <div className="p-6">
          <p className="text-sm uppercase tracking-wide text-slate-500">EcoFieldOps</p>
          <h1 className="mt-2 text-2xl font-semibold">Mission Control</h1>
          <p className="mt-4 text-sm text-slate-600">
            Map-based dashboard for tracking field activity. GraphQL + Mapbox integration coming soon.
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-slate-500">Live missions</p>
              <p className="text-2xl font-semibold">3</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-slate-500">Reports today</p>
              <p className="text-2xl font-semibold">12</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="relative">
        <div className="absolute inset-0" ref={mapContainer} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent" />
      </main>
    </div>
  );
}

export default App;
