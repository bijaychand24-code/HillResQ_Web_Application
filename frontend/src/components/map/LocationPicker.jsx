import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';
import Button from '../common/Button';

// Custom pin icon for picker
const pickerIcon = L.divIcon({
  className: 'location-picker-marker',
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <div style="width: 32px; height: 32px; background-color: #059669; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <div style="width: 4px; height: 8px; background-color: #059669; margin-top: -2px;"></div>
      <div style="width: 8px; height: 3px; background-color: rgba(0,0,0,0.3); border-radius: 50%;"></div>
    </div>
  `,
  iconSize: [32, 42],
  iconAnchor: [16, 42]
});

// Click handler hook for map
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

// Map view center updater
const MapRecenter = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 13);
    }
  }, [lat, lng, map]);
  return null;
};

const LocationPicker = ({
  latitude,
  longitude,
  onLocationChange,
  height = '320px'
}) => {
  const defaultCenter = [
    latitude || 31.6700,
    longitude || 77.0500
  ];
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const handleMapClick = (lat, lng) => {
    onLocationChange({
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6))
    });
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const { latitude: lat, longitude: lng } = pos.coords;
        onLocationChange({
          latitude: parseFloat(lat.toFixed(6)),
          longitude: parseFloat(lng.toFixed(6))
        });
      },
      (err) => {
        setGpsLoading(false);
        setGpsError('Could not fetch location: ' + err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1 font-medium">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          Click anywhere on map to position the emergency pin
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          icon={Navigation}
          loading={gpsLoading}
          onClick={handleUseGPS}
          className="text-xs py-1"
        >
          Use Device GPS
        </Button>
      </div>

      {gpsError && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          {gpsError}
        </p>
      )}

      <div
        style={{ height }}
        className="w-full rounded-xl overflow-hidden border border-slate-300 relative z-0 shadow-inner"
      >
        <MapContainer
          center={defaultCenter}
          zoom={11}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          {latitude && longitude && (
            <>
              <MapRecenter lat={latitude} lng={longitude} />
              <Marker
                position={[latitude, longitude]}
                icon={pickerIcon}
              />
            </>
          )}
        </MapContainer>
      </div>

      {latitude && longitude ? (
        <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-lg text-xs text-emerald-900">
          <span>
            Selected Coordinates: <strong>{latitude}°, {longitude}°</strong>
          </span>
          <span className="text-[11px] text-emerald-700">GPS Locked</span>
        </div>
      ) : (
        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
          ⚠️ Please click on the map to set the emergency location coordinates.
        </p>
      )}
    </div>
  );
};

export default LocationPicker;
