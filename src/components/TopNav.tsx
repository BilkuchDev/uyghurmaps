import React, { useState } from 'react';
import { MapTileLayerKey, AppToolMode, LocationItem } from '../types';
import { TILE_LAYERS } from '../data/locations';
import {
  Layers,
  Ruler,
  Navigation,
  Crosshair,
  MapPin,
  Locate,
  Menu,
  Sparkles,
  Search,
  Check,
} from 'lucide-react';

interface TopNavProps {
  currentLayer: MapTileLayerKey;
  onLayerChange: (layer: MapTileLayerKey) => void;
  toolMode: AppToolMode;
  onToolModeChange: (mode: AppToolMode) => void;
  onQuickJumpCity: (cityId: string) => void;
  onLocateMe: () => void;
  isLocating: boolean;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  cities: LocationItem[];
}

export const TopNav: React.FC<TopNavProps> = ({
  currentLayer,
  onLayerChange,
  toolMode,
  onToolModeChange,
  onQuickJumpCity,
  onLocateMe,
  isLocating,
  isSidebarOpen,
  onToggleSidebar,
  cities,
}) => {
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  const quickCities = [
    { id: 'city-urumqi', name: 'ئۈرۈمچى' },
    { id: 'city-kashgar', name: 'قەشقەر' },
    { id: 'city-turpan', name: 'تۇرپان' },
    { id: 'city-hotan', name: 'خوتەن' },
    { id: 'city-ghulja', name: 'غۇلجا' },
    { id: 'city-korla', name: 'كورلا' },
    { id: 'city-aqsu', name: 'ئاقسۇ' },
    { id: 'city-kuchar', name: 'كۇچار' },
    { id: 'city-altay', name: 'ئالتاي' },
    { id: 'city-tashqurghan', name: 'تاشقورغان' },
  ];

  return (
    <header className="relative z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            id="toggle-sidebar-btn"
            onClick={onToggleSidebar}
            className={`p-2 rounded-xl border transition-all ${
              isSidebarOpen
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-slate-100/80 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="تىزىملىكنى ئېچىش/تاقاش"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-100">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                ئۇيغۇرچە خەرىتە
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                مەنزىللەرنى كۆرۈش ۋە ئارىلىق ئۆلچەش
              </p>
            </div>
          </div>
        </div>

        {/* Center: Quick City Jump Bar (Scrollable on mobile) */}
        <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-1 px-2 scrollbar-none">
          <span className="text-xs text-slate-400 font-medium shrink-0 ml-1">تېز يۆتكىلىش:</span>
          {quickCities.map((c) => (
            <button
              key={c.id}
              id={`quick-city-${c.id}`}
              onClick={() => onQuickJumpCity(c.id)}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors whitespace-nowrap"
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Right: Actions and Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Layer Selector */}
          <div className="relative">
            <button
              id="layer-selector-btn"
              onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                isLayerMenuOpen
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-100'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">{TILE_LAYERS[currentLayer]?.nameUg || 'خەرىتە'}</span>
            </button>

            {isLayerMenuOpen && (
              <div
                className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-right animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setIsLayerMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                  خەرىتە تۈرىنى تاللاڭ
                </div>
                {Object.values(TILE_LAYERS).map((layer) => (
                  <button
                    key={layer.id}
                    id={`layer-option-${layer.id}`}
                    onClick={() => onLayerChange(layer.id as MapTileLayerKey)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                      currentLayer === layer.id
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full border" style={{
                        backgroundColor: layer.id === 'satellite' ? '#1e293b' : layer.id === 'dark' ? '#0f172a' : layer.id === 'topo' ? '#b45309' : '#10b981'
                      }} />
                      {layer.nameUg}
                    </span>
                    {currentLayer === layer.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Measure Tool */}
          <button
            id="tool-measure-btn"
            onClick={() => onToolModeChange(toolMode === 'measure' ? 'explore' : 'measure')}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              toolMode === 'measure'
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="ئارىلىق ئۆلچەش قورالى"
          >
            <Ruler className="w-4 h-4" />
            <span className="hidden md:inline">ئارىلىق</span>
          </button>

          {/* Route Tool */}
          <button
            id="tool-route-btn"
            onClick={() => onToolModeChange(toolMode === 'route' ? 'explore' : 'route')}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              toolMode === 'route'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="يول لىنىيەسى تېپىش"
          >
            <Navigation className="w-4 h-4" />
            <span className="hidden md:inline">لىنىيە</span>
          </button>

          {/* Coordinate Picker Tool */}
          <button
            id="tool-coord-btn"
            onClick={() => onToolModeChange(toolMode === 'coordinate' ? 'explore' : 'coordinate')}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              toolMode === 'coordinate'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="كوردىنات كۆرگۈچ"
          >
            <Crosshair className="w-4 h-4" />
            <span className="hidden lg:inline">كوردىنات</span>
          </button>

          {/* Add Custom Pin */}
          <button
            id="tool-addpin-btn"
            onClick={() => onToolModeChange(toolMode === 'add_pin' ? 'explore' : 'add_pin')}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              toolMode === 'add_pin'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="بەلگە قوشۇش"
          >
            <MapPin className="w-4 h-4 text-amber-600" />
            <span className="hidden lg:inline">بەلگە</span>
          </button>

          {/* Locate Me */}
          <button
            id="btn-locate-me"
            onClick={onLocateMe}
            disabled={isLocating}
            className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-50"
            title="ھازىرقى ئورنۇمنى تېپىش"
            aria-label="Locate me"
          >
            <Locate className={`w-4 h-4 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
