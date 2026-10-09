import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import SeverityBadge from '../common/SeverityBadge';
import StatusBadge from '../common/StatusBadge';
import { ArrowRight, MapPin } from 'lucide-react';

// Create custom colored DivIcon based on incident severity
const createSeverityIcon = (severity, isCritical) => {
  const colors = {
    low: '#3b82f6',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444'
  };

  const color = colors[severity?.toLowerCase()] || colors.medium;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
        ${
          isCritical
            ? `<div style="position: absolute; width: 36px; height: 36px; background: ${color}40; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
            : ''
        }
        <div style="width: 26px; height: 26px; background-color: ${color}; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Component to dynamically fit bounds or recenter when incidents change
const ChangeView = ({ center, zoom, bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (center) {
      map.setView(center, zoom || 9);
    }
  }, [center, zoom, bounds, map]);
  return null;
};

const IncidentMap = ({
  incidents = [],
  center = [31.6700, 77.0500],
  zoom = 9,
  height = '500px',
  interactive = true
}) => {
  // Calculate bounds if multiple incidents exist
  const validCoordinates = incidents
    .filter((inc) => {
      const lat = parseFloat(inc?.latitude);
      const lng = parseFloat(inc?.longitude);
      return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    })
    .map((inc) => [parseFloat(inc.latitude), parseFloat(inc.longitude)]);

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        style={{ width: '100%', height: '100%' }}
      >
        <ChangeView
          center={center}
          zoom={zoom}
          bounds={validCoordinates.length > 1 ? validCoordinates : null}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {incidents.map((incident) => {
          const lat = parseFloat(incident?.latitude);
          const lng = parseFloat(incident?.longitude);
          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
          const isCritical = incident.severity === 'critical';
          const icon = createSeverityIcon(incident.severity, isCritical);

          return (
            <Marker
              key={incident._id}
              position={[lat, lng]}
              icon={icon}
            >
              <Popup className="incident-popup">
                <div className="p-1 max-w-xs text-slate-800">
                  <div className="flex items-center gap-1.5 mb-2">
                    <SeverityBadge severity={incident.severity} />
                    <StatusBadge status={incident.status} />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug mb-1">
                    {incident.title}
                  </h4>
                  <div className="flex items-start gap-1 text-xs text-slate-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{incident.locationName}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 capitalize">
                      {incident.type?.replace('_', ' ')}
                    </span>
                    <Link
                      to={`/incidents/${incident._id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      View Report <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default IncidentMap;
