import { useEffect, useMemo, useRef } from 'react';
import type { FeatureCollection } from 'geojson';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Mission } from '../../graphql/missions';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const SOURCE_ID = 'missions-source';
const CLUSTER_LAYER_ID = 'mission-clusters';
const CLUSTER_COUNT_LAYER_ID = 'mission-cluster-count';
const POINT_LAYER_ID = 'mission-points';

export type MissionMapProps = {
  missions: Mission[];
  onSelectMission?: (missionId: string) => void;
  selectedMissionId?: string | null;
  isLoading?: boolean;
};

export function MissionMap({ missions, onSelectMission, isLoading }: MissionMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapLoaded = useRef(false);

  const featureCollection = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: missions.map((mission) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [mission.lng, mission.lat] as [number, number],
        },
        properties: {
          id: mission.id,
          status: mission.status,
          name: mission.name,
          code: mission.code,
        },
      })),
    }),
    [missions],
  );

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [4.895168, 52.370216],
      zoom: 5,
      preserveDrawingBuffer: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }));

    map.on('load', () => {
      mapLoaded.current = true;
      addMissionSource(map, { type: 'FeatureCollection', features: [] } as FeatureCollection);
      addMissionLayers(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded.current) return;
    const map = mapRef.current;
    const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData(featureCollection);
    }
    fitToMissions(map, missions);
  }, [featureCollection, missions]);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded.current) return;
    const map = mapRef.current;

    const handleClusterClick = (event: mapboxgl.MapLayerMouseEvent) => {
      const features = map.queryRenderedFeatures(event.point, { layers: [CLUSTER_LAYER_ID] });
      const clusterFeature = features[0];
      if (!clusterFeature) return;
      const clusterId = clusterFeature.properties?.cluster_id;
      const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        const [lng, lat] = clusterFeature.geometry.type === 'Point'
          ? (clusterFeature.geometry.coordinates as [number, number])
          : [4.895168, 52.370216];
        map.easeTo({ center: [lng, lat], zoom });
      });
    };

    const handlePointClick = (event: mapboxgl.MapLayerMouseEvent) => {
      const features = map.queryRenderedFeatures(event.point, { layers: [POINT_LAYER_ID] });
      const feature = features[0];
      if (!feature || !onSelectMission) return;
      const missionId = feature.properties?.id as string | undefined;
      if (missionId) {
        onSelectMission(missionId);
      }
    };

    map.on('click', CLUSTER_LAYER_ID, handleClusterClick);
    map.on('click', POINT_LAYER_ID, handlePointClick);
    const handleCursorPointer = () => {
      map.getCanvas().style.cursor = 'pointer';
    };
    const handleCursorDefault = () => {
      map.getCanvas().style.cursor = '';
    };

    map.on('mouseenter', CLUSTER_LAYER_ID, handleCursorPointer);
    map.on('mouseleave', CLUSTER_LAYER_ID, handleCursorDefault);
    map.on('mouseenter', POINT_LAYER_ID, handleCursorPointer);
    map.on('mouseleave', POINT_LAYER_ID, handleCursorDefault);

    return () => {
      map.off('click', CLUSTER_LAYER_ID, handleClusterClick);
      map.off('click', POINT_LAYER_ID, handlePointClick);
      map.off('mouseenter', CLUSTER_LAYER_ID, handleCursorPointer);
      map.off('mouseleave', CLUSTER_LAYER_ID, handleCursorDefault);
      map.off('mouseenter', POINT_LAYER_ID, handleCursorPointer);
      map.off('mouseleave', POINT_LAYER_ID, handleCursorDefault);
    };
  }, [onSelectMission]);

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" ref={mapContainer} />
      {isLoading ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/40 text-sm text-slate-600">
          Loading missions…
        </div>
      ) : null}
      {!isLoading && missions.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-500">
          No missions match this filter.
        </div>
      ) : null}
    </div>
  );
}

function addMissionSource(map: mapboxgl.Map, data: FeatureCollection) {
  if (map.getSource(SOURCE_ID)) return;
  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data,
    cluster: true,
    clusterMaxZoom: 11,
    clusterRadius: 45,
  } as mapboxgl.GeoJSONSourceRaw);
}

function addMissionLayers(map: mapboxgl.Map) {
  if (!map.getLayer(CLUSTER_LAYER_ID)) {
    map.addLayer({
      id: CLUSTER_LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#059669',
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          18,
          10,
          24,
          25,
          32,
        ],
        'circle-opacity': 0.9,
      },
    });
  }

  if (!map.getLayer(CLUSTER_COUNT_LAYER_ID)) {
    map.addLayer({
      id: CLUSTER_COUNT_LAYER_ID,
      type: 'symbol',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 14,
      },
      paint: {
        'text-color': '#f8fafc',
      },
    });
  }

  if (!map.getLayer(POINT_LAYER_ID)) {
    map.addLayer({
      id: POINT_LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-color': [
          'match',
          ['get', 'status'],
          'IN_PROGRESS',
          '#0ea5e9',
          'PLANNED',
          '#f59e0b',
          'COMPLETED',
          '#475569',
          '#1e293b',
        ],
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.9,
      },
    });
  }
}

function fitToMissions(map: mapboxgl.Map, missions: Mission[]) {
  if (missions.length === 0) return;
  const bounds = new mapboxgl.LngLatBounds();
  missions.forEach((mission) => bounds.extend([mission.lng, mission.lat]));
  if (missions.length === 1) {
    map.easeTo({ center: [missions[0].lng, missions[0].lat], zoom: 8, duration: 800 });
    return;
  }
  map.fitBounds(bounds, { padding: 80, duration: 800, maxZoom: 10 });
}
