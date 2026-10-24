export type PlaceCategory = 'all' | 'city' | 'history' | 'nature' | 'monument' | 'culture' | 'saved';

export interface LocationItem {
  id: string;
  nameUg: string; // ئۇيغۇرچە نامى (مەسىلەن: قەشقەر، ھېيتگاھ مەسچىتى)
  nameLatin: string; // ULY نامى (Qeshqer, Héytgah Meschiti)
  nameZh?: string; // خەنزۇچە نامى
  nameEn?: string; // ئىنگلىزچە نامى
  category: 'city' | 'history' | 'nature' | 'monument' | 'culture' | 'saved';
  lat: number;
  lng: number;
  zoomLevel: number;
  regionUg: string; // تەۋەلىكى (مەسىلەن: قەشقەر ۋىلايىتى)
  descriptionUg: string; // قىسقىچە تونۇشتۇرۇش
  historicalNoteUg?: string; // تارىخىي ئارقا كۆرۈنۈشى
  famousForUg?: string[]; // ئالاھىدىلىكلىرى
  imageUrl?: string;
  elevationMeters?: number; // دېڭىز يۈزىدىن ئېگىزلىكى (مېتىر)
  isCustom?: boolean;
}

export type MapTileLayerKey = 'osm' | 'satellite' | 'dark' | 'topo' | 'light';

export interface MapTileLayerConfig {
  id: MapTileLayerKey;
  nameUg: string;
  nameEn: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

export type AppToolMode = 'explore' | 'measure' | 'route' | 'coordinate' | 'add_pin';

export interface MeasurePoint {
  lat: number;
  lng: number;
  id: string;
  label?: string;
}

export interface RouteRequest {
  start: LocationItem | { lat: number; lng: number; nameUg: string } | null;
  end: LocationItem | { lat: number; lng: number; nameUg: string } | null;
  mode: 'driving' | 'flight' | 'walking';
}

export interface CustomUserPin {
  id: string;
  nameUg: string;
  descriptionUg?: string;
  lat: number;
  lng: number;
  color: string;
  createdAt: string;
}
