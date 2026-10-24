import React, { useState, useEffect, useCallback } from 'react';
import {
  LocationItem,
  MapTileLayerKey,
  AppToolMode,
  MeasurePoint,
  RouteRequest,
  CustomUserPin,
} from './types';
import { DEFAULT_UYGHUR_LOCATIONS } from './data/locations';
import { MapView } from './components/MapView';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { MeasureToolPanel } from './components/MeasureToolPanel';
import { RoutePlannerPanel } from './components/RoutePlannerPanel';
import { CoordinateInspectorModal } from './components/CoordinateInspectorModal';
import { AddCustomPinModal } from './components/AddCustomPinModal';

const LOCAL_STORAGE_KEY_PINS = 'uyghur_map_custom_pins_v1';

export default function App() {
  const [currentLayer, setCurrentLayer] = useState<MapTileLayerKey>('osm');
  const [locations, setLocations] = useState<LocationItem[]>(DEFAULT_UYGHUR_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [toolMode, setToolMode] = useState<AppToolMode>('explore');
  const [measurePoints, setMeasurePoints] = useState<MeasurePoint[]>([]);
  const [routeData, setRouteData] = useState<RouteRequest>({
    start: null,
    end: null,
    mode: 'driving',
  });
  const [inspectedCoordinates, setInspectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [customPins, setCustomPins] = useState<CustomUserPin[]>([]);
  const [isAddPinModalOpen, setIsAddPinModalOpen] = useState(false);
  const [addPinCoords, setAddPinCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Load custom pins from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PINS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCustomPins(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load custom pins', e);
    }
  }, []);

  // Save custom pins to localStorage
  const saveCustomPinsToStorage = (pins: CustomUserPin[]) => {
    setCustomPins(pins);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PINS, JSON.stringify(pins));
    } catch (e) {
      console.error('Failed to save custom pins', e);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Quick jump to city
  const handleQuickJumpCity = (cityId: string) => {
    const city = locations.find((l) => l.id === cityId);
    if (city) {
      setSelectedLocation(city);
    }
  };

  // Handle map click
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (toolMode === 'coordinate') {
        setInspectedCoordinates({ lat, lng });
      } else if (toolMode === 'add_pin') {
        setAddPinCoords({ lat, lng });
        setIsAddPinModalOpen(true);
        setToolMode('explore');
      } else {
        // In explore mode, clicking ground opens coordinate inspector
        setInspectedCoordinates({ lat, lng });
      }
    },
    [toolMode],
  );

  // Add a measure point
  const handleAddMeasurePoint = useCallback((point: MeasurePoint) => {
    setMeasurePoints((prev) => [...prev, point]);
  }, []);

  // Remove last measure point
  const handleRemoveLastMeasurePoint = () => {
    setMeasurePoints((prev) => prev.slice(0, -1));
  };

  // Clear measure points
  const handleClearMeasurePoints = () => {
    setMeasurePoints([]);
  };

  // Geolocation locate me
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      showToast('تور كۆرگۈچىڭىزدە ئورۇن بەلگىلەش ئىقتىدارى قوزغىتىلمىغان.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserCoordinates(coords);
        setIsLocating(false);

        const myLocItem: LocationItem = {
          id: 'my-current-location',
          nameUg: 'ھازىرقى ئورنۇم',
          nameLatin: 'My Current Location',
          category: 'saved',
          lat: coords.lat,
          lng: coords.lng,
          zoomLevel: 15,
          regionUg: 'ئۈسكۈنە ئورنى',
          descriptionUg: 'سىز تۇرۇۋاتقان ھازىرقى جۇغراپىيىلىك ئورۇن.',
        };
        setSelectedLocation(myLocItem);
        showToast('ھازىرقى ئورنىڭىز تېپىلدى!');
      },
      (error) => {
        setIsLocating(false);
        showToast('ئورۇننى ئېنىقلاش مەغلۇپ بولدى ياكى رۇخسەت بېرىلمىدى.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Global search through OpenStreetMap Nominatim
  const handleSearchExternal = async (query: string) => {
    setIsSearchingExternal(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'Accept-Language': 'ug,en,zh' } },
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const item = data[0];
        const newLoc: LocationItem = {
          id: `search-${Date.now()}`,
          nameUg: item.name || query,
          nameLatin: item.display_name.split(',')[0],
          nameZh: item.display_name,
          category: 'culture',
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          zoomLevel: 12,
          regionUg: item.type || 'ئىزدەش نەتىجىسى',
          descriptionUg: item.display_name,
        };

        // Add to locations list if not existing
        setLocations((prev) => [newLoc, ...prev.filter((p) => p.id !== newLoc.id)]);
        setSelectedLocation(newLoc);
        showToast(`«${newLoc.nameUg}» تېپىلدى ۋە خەرىتىدە كۆرسىتىلدى.`);
      } else {
        showToast(`«${query}» بويىچە ھېچقانداق دۇنيا ئورنى تېپىلمىدى.`);
      }
    } catch (e) {
      showToast('ئىزدەشتە تور خاتالىقى كۆرۈلدى.');
    } finally {
      setIsSearchingExternal(false);
    }
  };

  // Start route with given location
  const handleStartRouteWithLocation = (loc: LocationItem) => {
    setRouteData((prev) => ({
      ...prev,
      start: prev.start || loc,
      end: prev.start ? loc : prev.end,
    }));
    setToolMode('route');
    showToast(`«${loc.nameUg}» يول لىنىيەسىگە قوشۇلدى.`);
  };

  // Start measure with given location
  const handleStartMeasureWithLocation = (loc: LocationItem) => {
    setToolMode('measure');
    const point: MeasurePoint = {
      lat: loc.lat,
      lng: loc.lng,
      id: `m-${Date.now()}`,
      label: loc.nameUg,
    };
    setMeasurePoints([point]);
    showToast(`«${loc.nameUg}» ئۆلچەشنىڭ تۇنجى نۇقتىسى قىلىپ تال Romeلاندى.`);
  };

  // Save new custom pin
  const handleSaveCustomPin = (pin: CustomUserPin) => {
    const updated = [pin, ...customPins];
    saveCustomPinsToStorage(updated);
    setIsAddPinModalOpen(false);
    showToast(`«${pin.nameUg}» خاس بەلگە نۇقتىسى ساقلاندى.`);
  };

  // Delete custom pin
  const handleDeleteCustomPin = (pinId: string) => {
    const updated = customPins.filter((p) => p.id !== pinId);
    saveCustomPinsToStorage(updated);
    if (selectedLocation?.id === pinId) {
      setSelectedLocation(null);
    }
    showToast('بەلگە ئۆچۈرۈلدى.');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-900 font-sans" dir="rtl">
      {/* Top Navigation */}
      <TopNav
        currentLayer={currentLayer}
        onLayerChange={setCurrentLayer}
        toolMode={toolMode}
        onToolModeChange={setToolMode}
        onQuickJumpCity={handleQuickJumpCity}
        onLocateMe={handleLocateMe}
        isLocating={isLocating}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        cities={locations.filter((l) => l.category === 'city')}
      />

      {/* Main Map Content Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <MapView
          currentLayer={currentLayer}
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
          toolMode={toolMode}
          measurePoints={measurePoints}
          onAddMeasurePoint={handleAddMeasurePoint}
          routeData={routeData}
          onMapClick={handleMapClick}
          userCoordinates={userCoordinates}
          customPins={customPins}
        />

        {/* Sidebar Drawer */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
          onStartRouteWithLocation={handleStartRouteWithLocation}
          onStartMeasureWithLocation={handleStartMeasureWithLocation}
          onSearchExternal={handleSearchExternal}
          isSearchingExternal={isSearchingExternal}
          customPins={customPins}
          onDeleteCustomPin={handleDeleteCustomPin}
        />

        {/* Measurement Tool Floating Panel */}
        {toolMode === 'measure' && (
          <MeasureToolPanel
            points={measurePoints}
            onRemoveLastPoint={handleRemoveLastMeasurePoint}
            onClearPoints={handleClearMeasurePoints}
            onClose={() => setToolMode('explore')}
          />
        )}

        {/* Route Planner Floating Panel */}
        {toolMode === 'route' && (
          <RoutePlannerPanel
            routeData={routeData}
            onRouteChange={setRouteData}
            locations={locations}
            onClose={() => setToolMode('explore')}
          />
        )}

        {/* Coordinate Inspector Modal */}
        {inspectedCoordinates && (
          <CoordinateInspectorModal
            coordinates={inspectedCoordinates}
            onClose={() => setInspectedCoordinates(null)}
            onSaveAsPin={(coords) => {
              setAddPinCoords(coords);
              setInspectedCoordinates(null);
              setIsAddPinModalOpen(true);
            }}
            onRouteHere={(dest) => {
              setRouteData((prev) => ({
                ...prev,
                end: dest,
              }));
              setInspectedCoordinates(null);
              setToolMode('route');
            }}
            onMeasureHere={(coords) => {
              setToolMode('measure');
              setMeasurePoints((prev) => [
                ...prev,
                {
                  lat: coords.lat,
                  lng: coords.lng,
                  id: `m-${Date.now()}`,
                  label: `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}`,
                },
              ]);
              setInspectedCoordinates(null);
            }}
          />
        )}

        {/* Add Custom Bookmark Pin Modal */}
        {isAddPinModalOpen && (
          <AddCustomPinModal
            initialCoords={addPinCoords}
            onSave={handleSaveCustomPin}
            onClose={() => {
              setIsAddPinModalOpen(false);
              setAddPinCoords(null);
            }}
          />
        )}

        {/* Toast Notification Banner */}
        {notification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
            {notification}
          </div>
        )}
      </div>
    </div>
  );
}
