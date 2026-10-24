// Haversine formula to compute great circle distance between two points in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistanceUg(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} مېتىر`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(2)} كىلومېتىر`;
  }
  return `${Math.round(distanceKm).toLocaleString()} كىلومېتىر`;
}

export function formatCoordinatesUg(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'شىمالىي' : 'جەنۇبىي';
  const lngDir = lng >= 0 ? 'شەرقىي' : 'غەربىي';
  return `${latDir} كەڭلىك ${Math.abs(lat).toFixed(4)}°, ${lngDir} ئۇزۇنلۇق ${Math.abs(lng).toFixed(4)}°`;
}

export function estimateTravelTime(distanceKm: number) {
  // Speed assumptions
  const drivingSpeed = 85; // km/h average on highway
  const flightSpeed = 700; // km/h airplane + 1.5h airport overhead
  const walkingSpeed = 4.5; // km/h

  const drivingHours = distanceKm / drivingSpeed;
  const flightHours = distanceKm > 300 ? distanceKm / flightSpeed + 1.5 : null;
  const walkingHours = distanceKm / walkingSpeed;

  const formatHours = (h: number) => {
    if (h < 1) {
      return `${Math.round(h * 60)} مىنۇت`;
    }
    const fullHours = Math.floor(h);
    const mins = Math.round((h - fullHours) * 60);
    if (mins === 0) return `${fullHours} سائەت`;
    return `${fullHours} سائەت ${mins} مىنۇت`;
  };

  return {
    driving: formatHours(drivingHours),
    flight: flightHours ? formatHours(flightHours) : null,
    walking: formatHours(walkingHours),
  };
}

export function toDMS(coordinate: number, isLat: boolean): string {
  const absolute = Math.abs(coordinate);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

  const direction = isLat
    ? coordinate >= 0
      ? 'N (ش)'
      : 'S (ج)'
    : coordinate >= 0
      ? 'E (ش)'
      : 'W (غ)';

  return `${degrees}° ${minutes}′ ${seconds}″ ${direction}`;
}
