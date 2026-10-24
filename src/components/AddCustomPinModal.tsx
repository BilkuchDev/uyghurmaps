import React, { useState } from 'react';
import { CustomUserPin } from '../types';
import { MapPin, X, Plus } from 'lucide-react';

interface AddCustomPinModalProps {
  initialCoords: { lat: number; lng: number } | null;
  onSave: (pin: CustomUserPin) => void;
  onClose: () => void;
}

const PIN_COLORS = [
  '#059669', // Emerald
  '#d97706', // Amber
  '#dc2626', // Red
  '#2563eb', // Blue
  '#9333ea', // Purple
  '#e11d48', // Rose
  '#0891b2', // Cyan
];

export const AddCustomPinModal: React.FC<AddCustomPinModalProps> = ({
  initialCoords,
  onSave,
  onClose,
}) => {
  const [nameUg, setNameUg] = useState('');
  const [descriptionUg, setDescriptionUg] = useState('');
  const [selectedColor, setSelectedColor] = useState(PIN_COLORS[0]);
  const [lat, setLat] = useState(initialCoords ? initialCoords.lat.toFixed(5) : '41.7259');
  const [lng, setLng] = useState(initialCoords ? initialCoords.lng.toFixed(5) : '86.1746');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameUg.trim()) return;

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) return;

    const newPin: CustomUserPin = {
      id: `custom-pin-${Date.now()}`,
      nameUg: nameUg.trim(),
      descriptionUg: descriptionUg.trim(),
      lat: parsedLat,
      lng: parsedLng,
      color: selectedColor,
      createdAt: new Date().toISOString(),
    };

    onSave(newPin);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: selectedColor }}
            >
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-800">يېڭى ئورۇن بەلگىسى قوشۇش</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ئورۇننىڭ ئۇيغۇرچە نامى: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nameUg}
              onChange={(e) => setNameUg(e.target.value)}
              placeholder="مەسىلەن: ئۆيىمىز، تۇغقانلار بېغى، سۆيۈملۈك قەھۋەخانا..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              قىسقىچە ئىزاھات:
            </label>
            <textarea
              value={descriptionUg}
              onChange={(e) => setDescriptionUg(e.target.value)}
              placeholder="بۇ ئورۇن توغرىسىدا ئەسلەتمە ياكى تەپسىلات..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">كەڭلىك (Lat):</label>
              <input
                type="number"
                step="any"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">ئۇزۇنلۇق (Lng):</label>
              <input
                type="number"
                step="any"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">بەلگە رەڭگى:</label>
            <div className="flex items-center gap-2">
              {PIN_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    selectedColor === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>بەلگىنى ساقلاش</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              بىكار قىلىش
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
