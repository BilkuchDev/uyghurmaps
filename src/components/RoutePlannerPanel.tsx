import React from 'react';
import { RouteRequest, LocationItem } from '../types';
import { calculateDistanceKm, formatDistanceUg, estimateTravelTime } from '../utils/geo';
import {
  Navigation,
  Car,
  Plane,
  Footprints,
  ArrowRightLeft,
  X,
  MapPin,
} from 'lucide-react';

interface RoutePlannerPanelProps {
  routeData: RouteRequest;
  onRouteChange: (newRoute: RouteRequest) => void;
  locations: LocationItem[];
  onClose: () => void;
}

export const RoutePlannerPanel: React.FC<RoutePlannerPanelProps> = ({
  routeData,
  onRouteChange,
  locations,
  onClose,
}) => {
  const distanceKm =
    routeData.start && routeData.end
      ? calculateDistanceKm(
          routeData.start.lat,
          routeData.start.lng,
          routeData.end.lat,
          routeData.end.lng,
        )
      : 0;

  const travelTime = estimateTravelTime(distanceKm);

  const handleSwap = () => {
    onRouteChange({
      ...routeData,
      start: routeData.end,
      end: routeData.start,
    });
  };

  const handleSelectStart = (locationId: string) => {
    const loc = locations.find((l) => l.id === locationId);
    if (loc) {
      onRouteChange({ ...routeData, start: loc });
    }
  };

  const handleSelectEnd = (locationId: string) => {
    const loc = locations.find((l) => l.id === locationId);
    if (loc) {
      onRouteChange({ ...routeData, end: loc });
    }
  };

  return (
    <div
      id="route-planner-panel"
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-lg bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in slide-in-from-bottom-5 duration-200"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">يول لىنىيەسى تۈزۈش ۋە مۆلچەرلەش</h3>
            <p className="text-[11px] text-slate-500">باشلىنىش ۋە مەنزىل ئورنىنى تاللاڭ</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <button
          onClick={() => onRouteChange({ ...routeData, mode: 'driving' })}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            routeData.mode === 'driving'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>ماشىنا</span>
        </button>

        <button
          onClick={() => onRouteChange({ ...routeData, mode: 'flight' })}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            routeData.mode === 'flight'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>ئايروپىلان</span>
        </button>

        <button
          onClick={() => onRouteChange({ ...routeData, mode: 'walking' })}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            routeData.mode === 'walking'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Footprints className="w-4 h-4" />
          <span>پىيادە</span>
        </button>
      </div>

      {/* Origin & Destination Selectors */}
      <div className="space-y-2 relative mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 text-center text-xs font-bold text-emerald-600 shrink-0">🚩</span>
          <select
            value={routeData.start ? (routeData.start as LocationItem).id || '' : ''}
            onChange={(e) => handleSelectStart(e.target.value)}
            className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- باشلىنىش نۇقتىسىنى تاللاڭ --</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.nameUg} ({loc.regionUg})
              </option>
            ))}
          </select>
        </div>

        {/* Swap button */}
        <div className="flex justify-end pr-8">
          <button
            onClick={handleSwap}
            disabled={!routeData.start || !routeData.end}
            className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-40"
            title="باشلىنىش ۋە مەنزىلنى ئالماشتۇرۇش"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 rotate-90" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-6 text-center text-xs font-bold text-rose-600 shrink-0">🏁</span>
          <select
            value={routeData.end ? (routeData.end as LocationItem).id || '' : ''}
            onChange={(e) => handleSelectEnd(e.target.value)}
            className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- مەنزىل ئورنىنى تاللاڭ --</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.nameUg} ({loc.regionUg})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result Metrics */}
      {routeData.start && routeData.end ? (
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-800 font-semibold">مۆلچەردىكى ئارىلىق:</span>
            <span className="text-base font-extrabold text-blue-950 font-mono">
              {formatDistanceUg(distanceKm)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-700 pt-1 border-t border-blue-100">
            <span>مۆلچەر ۋاقىت:</span>
            <span className="font-bold text-blue-900">
              {routeData.mode === 'driving'
                ? `🚗 ~${travelTime.driving}`
                : routeData.mode === 'flight'
                ? `✈️ ~${travelTime.flight || travelTime.driving}`
                : `🚶 ~${travelTime.walking}`}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-2 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          باشلىنىش ۋە مەنزىل نۇقتىسىنى تاللاپ لىنىيە كۆرۈڭ
        </div>
      )}
    </div>
  );
};
