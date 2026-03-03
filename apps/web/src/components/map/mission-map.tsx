import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

type MissionMapProps = {
  initialCenter?: [number, number];
  initialZoom?: number;
};

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

export function MissionMap({ initialCenter = [4.895168, 52.370216], initialZoom = 5 }: MissionMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: initialCenter,
      zoom: initialZoom,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }));

    return () => {
      mapRef.current?.remove();
    };
  }, [initialCenter, initialZoom]);

  return <div className="absolute inset-0" ref={mapContainer} />;
}
