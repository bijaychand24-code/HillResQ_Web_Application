import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';
import StatusBadge from '../common/StatusBadge';
import Card from '../common/Card';

const typeLabels = {
  landslide: 'Landslide',
  flood: 'Flash Flood',
  road_block: 'Road Blockage',
  fallen_tree: 'Fallen Tree',
  infrastructure_damage: 'Infrastructure Damage',
  other: 'Emergency Incident'
};

const defaultPlaceholders = {
  landslide: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=75',
  flood: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=75',
  road_block: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=75',
  fallen_tree: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=75',
  infrastructure_damage: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=75',
  other: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=75'
};

const IncidentCard = ({ incident }) => {
  const imageSrc = incident.imageUrl || defaultPlaceholders[incident.type] || defaultPlaceholders.other;
  const formattedDate = new Date(incident.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card hover className="flex flex-col h-full group">
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={incident.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultPlaceholders.other;
          }}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <SeverityBadge severity={incident.severity} />
        </div>
        <div className="absolute top-3 right-3 z-10">
          <StatusBadge status={incident.status} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-3 left-3 right-3 text-white text-xs flex items-center justify-between">
          <span className="bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            {typeLabels[incident.type] || incident.type}
          </span>
          <span className="flex items-center gap-1 text-slate-200">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-lg leading-snug mb-2 group-hover:text-emerald-700 transition-colors line-clamp-1">
            {incident.title}
          </h3>
          <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
            {incident.description}
          </p>

          <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="line-clamp-1 font-medium text-slate-700">
              {incident.locationName}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {incident.assignedTo ? (
              <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                <Shield className="w-3.5 h-3.5" /> Responder Active
              </span>
            ) : (
              <span className="text-slate-400">Unassigned</span>
            )}
          </div>
          <Link
            to={`/incidents/${incident._id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default IncidentCard;
