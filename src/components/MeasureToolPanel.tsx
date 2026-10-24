import React from 'react';
import { MeasurePoint } from '../types';
import { calculateDistanceKm, formatDistanceUg, estimateTravelTime } from '../utils/geo';
import { Ruler, Trash2, Undo2, X, Navigation } from 'lucide-react';

interface MeasureToolPanelProps {
  points: MeasurePoint[];
  onRemoveLastPoint: () => void;
  onClearPoints: () => void;
  onClose: () => void;
}

export const MeasureToolPanel: React.FC<MeasureToolPanelProps> = ({
  points,
  onRemoveLastPoint,
  onClearPoints,
  onClose,
}) => {
  // Calculate total distance across all points
  let totalDistanceKm = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalDistanceKm += calculateDistanceKm(
      points[i].lat,
      points[i].lng,
      points[i + 1].lat,
      points[i + 1].lng,
    );
  }

  const travelTime = estimateTravelTime(totalDistanceKm);

  return (
    <div
      id="measure-tool-panel"
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-lg bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in slide-in-from-bottom-5 duration-200"
      dir="rtl"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">ئارىلىق ئۆلچەش قورالى</h3>
            <p className="text-[11px] text-slate-500">خەرىتە ئۈستىنى چېكىپ ئۆلچەش نۇقتىلىرىنى قوشۇڭ</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {points.length === 0 ? (
        <div className="text-center py-3 text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          📍 خەرىتە ئۈستىدىكى تۇنجى نۇقتىنى چېكىڭ
        </div>
      ) : (
        <div className="space-y-3">
          {/* Total Distance Display */}
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-rose-700 font-semibold block">ئومۇمىي تۈز ئارىلىق:</span>
              <span className="text-xl font-extrabold text-rose-950 font-mono">
                {formatDistanceUg(totalDistanceKm)}
              </span>
            </div>
            <div className="text-left text-xs text-slate-500 space-y-0.5">
              <div>🚗 ماشىنا: ~{travelTime.driving}</div>
              {travelTime.flight && <div>✈️ ئايروپىلان: ~{travelTime.flight}</div>}
              <div>🚶 پىيادە: ~{travelTime.walking}</div>
            </div>
          </div>

          {/* Points list summary */}
          <div className="text-xs text-slate-600 flex items-center justify-between px-1">
            <span>جەمئىي بەلگىلەنگەن نۇقتىلار: {points.length} دانە</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onRemoveLastPoint}
              disabled={points.length === 0}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>ئالدىنقى نۇقتىنى قايتۇرۇش</span>
            </button>

            <button
              onClick={onClearPoints}
              disabled={points.length === 0}
              className="py-2 px-3 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>بارلىقىنى تازىلاش</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
