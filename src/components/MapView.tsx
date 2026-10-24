import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocationItem, MapTileLayerKey, AppToolMode, MeasurePoint, RouteRequest, CustomUserPin } from '../types';
import { TILE_LAYERS } from '../data/locations';
import { calculateDistanceKm, formatDistanceUg } from '../utils/geo';

interface MapViewProps {
  currentLayer: MapTileLayerKey;
  locations: LocationItem[];
  selectedLocation: LocationItem | null;
  onSelectLocation: (loc: LocationItem | null) => void;
  toolMode: AppToolMode;
  measurePoints: MeasurePoint[];
  onAddMeasurePoint: (point: MeasurePoint) => void;
  routeData: RouteRequest;
  onMapClick: (lat: number, lng: number) => void;
  userCoordinates: { lat: number; lng: number } | null;
  customPins: CustomUserPin[];
}

export const MapView: React.FC<MapViewProps> = ({
  currentLayer,
  locations,
  selectedLocation,
  onSelectLocation,
  toolMode,
  measurePoints,
  onAddMeasurePoint,
  routeData,
  onMapClick,
  userCoordinates,
  customPins,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const measureLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center: Uyghur region (Xinjiang / Tarim & Tianshan basin)
    const map = L.map(mapContainerRef.current, {
      center: [41.7259, 84.8],
      zoom: 6,
      zoomControl: false,
    });

    // Add zoom control at bottom-left (since RTL places main drawer on right)
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // Initial Tile Layer
    const initialConfig = TILE_LAYERS[currentLayer] || TILE_LAYERS.osm;
    const tileLayer = L.tileLayer(initialConfig.url, {
      attribution: initialConfig.attribution,
      maxZoom: initialConfig.maxZoom,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Layer groups for dynamic elements
    markersLayerRef.current = L.layerGroup().addTo(map);
    measureLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const config = TILE_LAYERS[currentLayer] || TILE_LAYERS.osm;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
    }).addTo(map);
  }, [currentLayer]);

  // Handle map clicks based on active tool mode
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (toolMode === 'measure') {
        const newPoint: MeasurePoint = {
          lat,
          lng,
          id: `m-${Date.now()}`,
          label: `${measurePoints.length + 1}-نۇقتا`,
        };
        onAddMeasurePoint(newPoint);
      } else {
        onMapClick(lat, lng);
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [toolMode, measurePoints, onAddMeasurePoint, onMapClick]);

  // Handle fly to selected location
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;
    const map = mapInstanceRef.current;
    map.flyTo([selectedLocation.lat, selectedLocation.lng], selectedLocation.zoomLevel || 13, {
      duration: 1.5,
      easeLinearity: 0.25,
    });
  }, [selectedLocation]);

  // Render Category and City Markers
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    // Helper to generate custom colored SVG marker HTML
    const createMarkerIcon = (loc: LocationItem, isSelected: boolean) => {
      let bgColor = '#059669'; // Emerald for city
      let symbol = '🏛️';

      if (loc.category === 'history') {
        bgColor = '#d97706'; // Amber
        symbol = '🕌';
      } else if (loc.category === 'nature') {
        bgColor = '#0284c7'; // Sky
        symbol = '🏔️';
      } else if (loc.category === 'monument') {
        bgColor = '#9333ea'; // Purple
        symbol = '📜';
      } else if (loc.category === 'culture') {
        bgColor = '#e11d48'; // Rose
        symbol = '🌍';
      } else if (loc.category === 'saved') {
        bgColor = '#ea580c'; // Orange
        symbol = '⭐';
      }

      const pulseEffect = isSelected
        ? `<div class="absolute -inset-2 rounded-full animate-ping opacity-75" style="background-color: ${bgColor};"></div>`
        : '';

      const html = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="transform: translate(-50%, -50%);">
          ${pulseEffect}
          <div class="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg border-2 border-white transition-all transform hover:scale-110 ${
            isSelected ? 'scale-110 ring-4 ring-emerald-400 font-bold' : ''
          }" style="background-color: ${bgColor}; color: white;">
            <span class="text-sm">${symbol}</span>
            <span class="text-xs font-semibold whitespace-nowrap">${loc.nameUg}</span>
          </div>
        </div>
      `;

      return L.divIcon({
        className: 'custom-map-icon',
        html,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
    };

    // Add standard locations
    locations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createMarkerIcon(loc, isSelected),
        zIndexOffset: isSelected ? 1000 : 100,
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectLocation(loc);
      });

      markersGroup.addLayer(marker);
    });

    // Add Custom user pins
    customPins.forEach((pin) => {
      const isSelected = selectedLocation?.id === pin.id;
      const html = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="transform: translate(-50%, -50%);">
          <div class="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg border-2 border-white transition-all transform hover:scale-110 ${
            isSelected ? 'scale-110 ring-4 ring-amber-400 font-bold' : ''
          }" style="background-color: ${pin.color || '#ea580c'}; color: white;">
            <span class="text-sm">📍</span>
            <span class="text-xs font-semibold whitespace-nowrap">${pin.nameUg}</span>
          </div>
        </div>
      `;
      const icon = L.divIcon({
        className: 'custom-user-pin',
        html,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const pinLocationItem: LocationItem = {
        id: pin.id,
        nameUg: pin.nameUg,
        nameLatin: 'Custom Pin',
        category: 'saved',
        lat: pin.lat,
        lng: pin.lng,
        zoomLevel: 14,
        regionUg: 'ساقلانغان بەلگە',
        descriptionUg: pin.descriptionUg || 'ئۆزىڭىز قوشقان خاس بەلگە نۇقتىسى.',
        isCustom: true,
      };

      const marker = L.marker([pin.lat, pin.lng], {
        icon,
        zIndexOffset: 900,
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectLocation(pinLocationItem);
      });

      markersGroup.addLayer(marker);
    });
  }, [locations, selectedLocation, onSelectLocation, customPins]);

  // Render Measurement Lines & Waypoints
  useEffect(() => {
    if (!measureLayerRef.current) return;
    const group = measureLayerRef.current;
    group.clearLayers();

    if (measurePoints.length === 0) return;

    const latlngs: [number, number][] = measurePoints.map((p) => [p.lat, p.lng]);

    // Draw Polyline
    if (latlngs.length >= 2) {
      const line = L.polyline(latlngs, {
        color: '#dc2626',
        weight: 3.5,
        dashArray: '6, 8',
        opacity: 0.9,
      });
      group.addLayer(line);
    }

    // Draw point markers
    measurePoints.forEach((point, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === measurePoints.length - 1;

      let subLabel = '';
      if (idx > 0) {
        const prev = measurePoints[idx - 1];
        const segDist = calculateDistanceKm(prev.lat, prev.lng, point.lat, point.lng);
        subLabel = `(+${formatDistanceUg(segDist)})`;
      }

      const html = `
        <div class="flex flex-col items-center cursor-pointer" style="transform: translate(-50%, -50%);">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md border-2 border-white ${
            isFirst ? 'bg-emerald-600' : isLast ? 'bg-rose-600' : 'bg-amber-600'
          }">
            ${idx + 1}
          </div>
          <div class="bg-white/95 px-1.5 py-0.5 rounded shadow text-[10px] text-slate-800 font-semibold mt-1 whitespace-nowrap border border-slate-200">
            ${point.label || `${idx + 1}-نۇقتا`} ${subLabel}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'measure-point-marker',
        html,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([point.lat, point.lng], { icon });
      group.addLayer(marker);
    });
  }, [measurePoints]);

  // Render Route Polyline & Endpoints
  useEffect(() => {
    if (!routeLayerRef.current) return;
    const group = routeLayerRef.current;
    group.clearLayers();

    if (!routeData.start || !routeData.end) return;

    const startLatLng: [number, number] = [routeData.start.lat, routeData.start.lng];
    const endLatLng: [number, number] = [routeData.end.lat, routeData.end.lng];

    // Compute curved great circle route arc for realistic visual
    const numSteps = 40;
    const routeArc: [number, number][] = [];
    for (let i = 0; i <= numSteps; i++) {
      const frac = i / numSteps;
      const lat = startLatLng[0] + (endLatLng[0] - startLatLng[0]) * frac;
      const lng = startLatLng[1] + (endLatLng[1] - startLatLng[1]) * frac;
      // slight curve offset for aesthetic flight / road line
      const offset = Math.sin(frac * Math.PI) * (routeData.mode === 'flight' ? 0.3 : 0.08);
      routeArc.push([lat + offset, lng]);
    }

    const routeColor = routeData.mode === 'flight' ? '#6366f1' : routeData.mode === 'walking' ? '#059669' : '#2563eb';

    const polyline = L.polyline(routeArc, {
      color: routeColor,
      weight: 4,
      opacity: 0.85,
      dashArray: routeData.mode === 'flight' ? '8, 6' : routeData.mode === 'walking' ? '4, 4' : undefined,
    });
    group.addLayer(polyline);

    // Start marker
    const startHtml = `
      <div class="flex items-center gap-1 bg-emerald-600 text-white px-2 py-1 rounded-full shadow-lg border-2 border-white text-xs font-bold whitespace-nowrap" style="transform: translate(-50%, -50%);">
        <span>🚩</span>
        <span>باشلىنىش: ${routeData.start.nameUg}</span>
      </div>
    `;
    group.addLayer(
      L.marker(startLatLng, {
        icon: L.divIcon({ className: 'route-start', html: startHtml, iconSize: [0, 0] }),
      }),
    );

    // End marker
    const endHtml = `
      <div class="flex items-center gap-1 bg-rose-600 text-white px-2 py-1 rounded-full shadow-lg border-2 border-white text-xs font-bold whitespace-nowrap" style="transform: translate(-50%, -50%);">
        <span>🏁</span>
        <span>مەنزىل: ${routeData.end.nameUg}</span>
      </div>
    `;
    group.addLayer(
      L.marker(endLatLng, {
        icon: L.divIcon({ className: 'route-end', html: endHtml, iconSize: [0, 0] }),
      }),
    );

    // Auto fit bounds
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds([startLatLng, endLatLng], { padding: [80, 80] });
    }
  }, [routeData]);

  // Render User Location
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (!userCoordinates) {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      return;
    }

    const html = `
      <div class="relative flex items-center justify-center" style="transform: translate(-50%, -50%);">
        <div class="absolute w-8 h-8 rounded-full bg-blue-500 animate-ping opacity-60"></div>
        <div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg"></div>
      </div>
    `;

    const icon = L.divIcon({
      className: 'user-location-pulse',
      html,
      iconSize: [0, 0],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userCoordinates.lat, userCoordinates.lng]);
    } else {
      userMarkerRef.current = L.marker([userCoordinates.lat, userCoordinates.lng], { icon, zIndexOffset: 2000 }).addTo(map);
    }
  }, [userCoordinates]);

  return (
    <div className="relative w-full h-full">
      <div id="uyghur-map-container" ref={mapContainerRef} className="w-full h-full z-0 bg-slate-100" />
      
      {/* Mode Status Banner if Active */}
      {toolMode === 'measure' && (
        <div className="absolute top-20 right-1/2 translate-x-1/2 z-20 bg-rose-700/90 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-xl flex items-center gap-2 border border-rose-400 text-sm font-medium animate-bounce">
          <span>📏</span>
          <span>خەرىتە ئۈستىنى چېكىپ ئارىلىق ئۆلچەش نۇقتىلىرىنى قوشۇڭ</span>
        </div>
      )}

      {toolMode === 'coordinate' && (
        <div className="absolute top-20 right-1/2 translate-x-1/2 z-20 bg-indigo-700/90 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-xl flex items-center gap-2 border border-indigo-400 text-sm font-medium">
          <span>🎯</span>
          <span>خەرىتىدىكى خالىغان نۇقتىنى چېكىپ ئورۇن ۋە كوردىناتىنى كۆرۈڭ</span>
        </div>
      )}

      {toolMode === 'add_pin' && (
        <div className="absolute top-20 right-1/2 translate-x-1/2 z-20 bg-emerald-700/90 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-xl flex items-center gap-2 border border-emerald-400 text-sm font-medium">
          <span>📍</span>
          <span>بەلگە قويماقچى بولغان ئورۇننى چېكىڭ</span>
        </div>
      )}
    </div>
  );
};
