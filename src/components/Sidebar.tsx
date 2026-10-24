import React, { useState, useMemo } from 'react';
import { LocationItem, PlaceCategory, CustomUserPin } from '../types';
import { formatCoordinatesUg, toDMS } from '../utils/geo';
import {
  Search,
  X,
  MapPin,
  Mountain,
  Landmark,
  Building2,
  Globe,
  Sparkles,
  Navigation,
  Ruler,
  Copy,
  Check,
  Star,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  locations: LocationItem[];
  selectedLocation: LocationItem | null;
  onSelectLocation: (loc: LocationItem | null) => void;
  onStartRouteWithLocation: (loc: LocationItem) => void;
  onStartMeasureWithLocation: (loc: LocationItem) => void;
  onSearchExternal: (query: string) => Promise<void>;
  isSearchingExternal: boolean;
  customPins: CustomUserPin[];
  onDeleteCustomPin: (pinId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  locations,
  selectedLocation,
  onSelectLocation,
  onStartRouteWithLocation,
  onStartMeasureWithLocation,
  onSearchExternal,
  isSearchingExternal,
  customPins,
  onDeleteCustomPin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<PlaceCategory>('all');
  const [copiedCoord, setCopiedCoord] = useState(false);

  // Category Tabs Configuration
  const categories: { key: PlaceCategory; labelUg: string; icon: React.ReactNode }[] = [
    { key: 'all', labelUg: 'ھەممىسى', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: 'city', labelUg: 'شەھەرلەر', icon: <Building2 className="w-3.5 h-3.5" /> },
    { key: 'history', labelUg: 'تارىخىي ئورۇنلار', icon: <Landmark className="w-3.5 h-3.5" /> },
    { key: 'nature', labelUg: 'تەبىئىي مەنزىرىلەر', icon: <Mountain className="w-3.5 h-3.5" /> },
    { key: 'monument', labelUg: 'مەقبەرە-يادىكارلىقلار', icon: <Landmark className="w-3.5 h-3.5" /> },
    { key: 'culture', labelUg: 'يىپەك يولى ۋە دۇنيا', icon: <Globe className="w-3.5 h-3.5" /> },
    { key: 'saved', labelUg: `ساقلانغانلار (${customPins.length})`, icon: <Star className="w-3.5 h-3.5" /> },
  ];

  // Filter Locations
  const filteredLocations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return locations.filter((loc) => {
      // Category filter
      if (activeCategory !== 'all' && loc.category !== activeCategory) {
        return false;
      }

      // Search query filter (checks Uyghur name, Latin name, Chinese name, Region, Description)
      if (query) {
        const matchesUg = loc.nameUg.toLowerCase().includes(query);
        const matchesLatin = loc.nameLatin.toLowerCase().includes(query);
        const matchesZh = loc.nameZh ? loc.nameZh.toLowerCase().includes(query) : false;
        const matchesRegion = loc.regionUg.toLowerCase().includes(query);
        const matchesDesc = loc.descriptionUg.toLowerCase().includes(query);

        return matchesUg || matchesLatin || matchesZh || matchesRegion || matchesDesc;
      }

      return true;
    });
  }, [locations, activeCategory, searchQuery]);

  const handleCopyCoordinates = (lat: number, lng: number) => {
    const text = `${lat.toFixed(5)}, ${lng.toFixed(5)} (${formatCoordinatesUg(lat, lng)})`;
    navigator.clipboard.writeText(text);
    setCopiedCoord(true);
    setTimeout(() => setCopiedCoord(false), 2000);
  };

  const handleExternalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchExternal(searchQuery.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      id="app-sidebar-drawer"
      className="absolute top-0 right-0 bottom-0 w-full sm:w-96 max-w-full bg-white/98 backdrop-blur-lg border-l border-slate-200 z-30 shadow-2xl flex flex-col transition-all duration-300"
      dir="rtl"
    >
      {/* Sidebar Header & Search Box */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-800">ئورۇن ۋە مەنزىرىگاھلار</h2>
          </div>
          <button
            id="close-sidebar-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="تاقاش"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleExternalSearchSubmit} className="relative">
          <input
            id="sidebar-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="شەھەر ياكى ئورۇن ئىسمىنى ئىزدەڭ..."
            className="w-full pl-9 pr-9 py-2.5 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* External Global Search Trigger Button */}
        {searchQuery.trim().length > 0 && (
          <button
            id="btn-global-osm-search"
            onClick={() => onSearchExternal(searchQuery.trim())}
            disabled={isSearchingExternal}
            className="w-full mt-2 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Globe className={`w-3.5 h-3.5 ${isSearchingExternal ? 'animate-spin' : ''}`} />
            <span>پۈتۈن دۇنيا خەرىتىسىدىن «{searchQuery}» نى ئىزدەش</span>
          </button>
        )}

        {/* Category Horizontal Scroll Filter */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              id={`cat-filter-${cat.key}`}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.icon}
              <span>{cat.labelUg}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Selected Location Detail OR Location List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {selectedLocation ? (
          /* Detailed View for Selected Location */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Image Banner */}
            {selectedLocation.imageUrl && (
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={selectedLocation.imageUrl}
                  alt={selectedLocation.nameUg}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  id="btn-back-to-list"
                  onClick={() => onSelectLocation(null)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-xs transition-colors"
                  title="تىزىملىككە قايتىش"
                >
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                </button>
                <div className="absolute bottom-2 right-2 bg-emerald-600/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {selectedLocation.regionUg}
                </div>
              </div>
            )}

            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {selectedLocation.nameUg}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{selectedLocation.nameLatin}</span>
                    {selectedLocation.nameZh && <span>• {selectedLocation.nameZh}</span>}
                  </div>
                </div>

                {!selectedLocation.imageUrl && (
                  <button
                    onClick={() => onSelectLocation(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 bg-slate-100"
                  >
                    <ChevronLeft className="w-4 h-4 rotate-180" />
                  </button>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {selectedLocation.descriptionUg}
              </p>

              {/* Historical Note if Available */}
              {selectedLocation.historicalNoteUg && (
                <div className="text-xs bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-xl text-amber-900 leading-relaxed">
                  <div className="font-bold flex items-center gap-1 text-amber-800 mb-1">
                    <Landmark className="w-3.5 h-3.5" />
                    <span>تارىخىي ئەھمىيىتى:</span>
                  </div>
                  {selectedLocation.historicalNoteUg}
                </div>
              )}

              {/* Famous Features Badges */}
              {selectedLocation.famousForUg && selectedLocation.famousForUg.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-500 mb-1.5">داڭلىق ئالاھىدىلىكلىرى:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedLocation.famousForUg.map((item, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-md font-medium"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Geographical Stats (Coordinates, Elevation) */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">دېڭىز يۈزى ئېگىزلىكى</span>
                  <span className="font-bold text-slate-800">
                    {selectedLocation.elevationMeters !== undefined
                      ? `${selectedLocation.elevationMeters} مېتىر`
                      : 'نامەلۇم'}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">كوردىناتى</span>
                  <span className="font-mono text-[11px] text-slate-800 block truncate">
                    {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  id="btn-plan-route-from-detail"
                  onClick={() => onStartRouteWithLocation(selectedLocation)}
                  className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>يول لىنىيەسى تۈزۈش</span>
                </button>

                <button
                  id="btn-measure-from-detail"
                  onClick={() => onStartMeasureWithLocation(selectedLocation)}
                  className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>ئارىلىق ئۆلچەش</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  id="btn-copy-coords"
                  onClick={() => handleCopyCoordinates(selectedLocation.lat, selectedLocation.lng)}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedCoord ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCoord ? 'كۆچۈرۈلدى!' : 'كوردىنات كۆچۈرۈش'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Locations List */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>تېپىلغان ئورۇنلار: {filteredLocations.length} دانە</span>
            </div>

            {filteredLocations.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <MapPin className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">ھېچقانداق ئورۇن تېپىلمىدى.</p>
                {searchQuery && (
                  <button
                    onClick={() => onSearchExternal(searchQuery)}
                    className="text-xs text-emerald-600 font-bold hover:underline"
                  >
                    پۈتۈن دۇنيا ئوچۇق خەرىتىسىدىن ئىزدەپ كۆرۈڭ
                  </button>
                )}
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const isSaved = loc.category === 'saved';

                return (
                  <div
                    key={loc.id}
                    id={`place-card-${loc.id}`}
                    onClick={() => onSelectLocation(loc)}
                    className="p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl cursor-pointer transition-all hover:shadow-xs group flex items-start gap-3"
                  >
                    {/* Thumbnail or Category Icon */}
                    {loc.imageUrl ? (
                      <img
                        src={loc.imageUrl}
                        alt={loc.nameUg}
                        className="w-14 h-14 rounded-lg object-cover shrink-0 bg-slate-100"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0 text-lg shadow-xs"
                        style={{
                          backgroundColor:
                            loc.category === 'city'
                              ? '#059669'
                              : loc.category === 'history'
                              ? '#d97706'
                              : loc.category === 'nature'
                              ? '#0284c7'
                              : loc.category === 'monument'
                              ? '#9333ea'
                              : '#ea580c',
                        }}
                      >
                        {loc.category === 'city'
                          ? '🏛️'
                          : loc.category === 'history'
                          ? '🕌'
                          : loc.category === 'nature'
                          ? '🏔️'
                          : loc.category === 'monument'
                          ? '📜'
                          : '📍'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 truncate">
                          {loc.nameUg}
                        </h4>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium shrink-0">
                          {loc.regionUg}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{loc.descriptionUg}</p>

                      <div className="flex items-center justify-between mt-1.5 pt-1 text-[11px] text-slate-400">
                        <span className="font-mono text-[10px]">
                          {loc.lat.toFixed(2)}°, {loc.lng.toFixed(2)}°
                        </span>
                        {isSaved && loc.isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCustomPin(loc.id);
                            }}
                            className="text-rose-500 hover:text-rose-700 text-[10px] font-bold"
                          >
                            ئۆچۈرۈش
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
