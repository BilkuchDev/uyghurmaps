import React, { useState, useEffect } from 'react';
import { formatCoordinatesUg, toDMS } from '../utils/geo';
import {
  Crosshair,
  Copy,
  Check,
  X,
  BookmarkPlus,
  Navigation,
  Ruler,
  Globe2,
} from 'lucide-react';

interface CoordinateInspectorModalProps {
  coordinates: { lat: number; lng: number } | null;
  onClose: () => void;
  onSaveAsPin: (coords: { lat: number; lng: number }) => void;
  onRouteHere: (coords: { lat: number; lng: number; nameUg: string }) => void;
  onMeasureHere: (coords: { lat: number; lng: number }) => void;
}

export const CoordinateInspectorModal: React.FC<CoordinateInspectorModalProps> = ({
  coordinates,
  onClose,
  onSaveAsPin,
  onRouteHere,
  onMeasureHere,
}) => {
  const [copied, setCopied] = useState(false);
  const [placeName, setPlaceName] = useState<string>('تەكشۈرۈلۈۋاتىدۇ...');
  const [isLoadingGeocode, setIsLoadingGeocode] = useState(false);

  useEffect(() => {
    if (!coordinates) return;

    // Fetch reverse geocoding via OpenStreetMap Nominatim
    setIsLoadingGeocode(true);
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&zoom=14&addressdetails=1`,
      { headers: { 'Accept-Language': 'ug,en,zh' } }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.display_name) {
          setPlaceName(data.display_name);
        } else {
          setPlaceName('نامەلۇم تەبىئىي رايون ياكى دالى');
        }
      })
      .catch(() => {
        setPlaceName('كوردىنات ئورنى تەكشۈرۈلدى');
      })
      .finally(() => {
        setIsLoadingGeocode(false);
      });
  }, [coordinates]);

  if (!coordinates) return null;

  const latDms = toDMS(coordinates.lat, true);
  const lngDms = toDMS(coordinates.lng, false);

  const handleCopy = () => {
    const text = `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="coord-inspector-modal"
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in slide-in-from-bottom-5 duration-200"
      dir="rtl"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Crosshair className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">نۇقتا كوردىناتى ۋە مەلۇماتى</h3>
            <p className="text-[11px] text-slate-500">{formatCoordinatesUg(coordinates.lat, coordinates.lng)}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Reverse Geocode Address */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
          <Globe2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-slate-400 font-medium block">تەۋەلىك ۋە ئورۇن مەلۇماتى:</span>
            <p className="text-xs text-slate-700 font-medium leading-relaxed truncate">
              {isLoadingGeocode ? 'ئورۇن ئېنىقلىنىۋاتىدۇ...' : placeName}
            </p>
          </div>
        </div>

        {/* Coordinates grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100">
            <span className="text-[10px] text-indigo-600 block">كەڭلىك (Latitude)</span>
            <span className="font-mono font-bold text-slate-800 text-sm">{coordinates.lat.toFixed(5)}°</span>
            <span className="text-[10px] text-slate-500 block font-mono mt-0.5">{latDms}</span>
          </div>

          <div className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100">
            <span className="text-[10px] text-indigo-600 block">ئۇزۇنلۇق (Longitude)</span>
            <span className="font-mono font-bold text-slate-800 text-sm">{coordinates.lng.toFixed(5)}°</span>
            <span className="text-[10px] text-slate-500 block font-mono mt-0.5">{lngDms}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => onSaveAsPin(coordinates)}
            className="py-2 px-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>ساقلاش</span>
          </button>

          <button
            onClick={() => onRouteHere({ lat: coordinates.lat, lng: coordinates.lng, nameUg: placeName.slice(0, 18) })}
            className="py-2 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>بۇ يەرگە بېرىش</span>
          </button>

          <button
            onClick={handleCopy}
            className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'كۆچۈرۈلدى' : 'كۆچۈرۈش'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
