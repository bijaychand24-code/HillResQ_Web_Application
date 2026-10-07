import React, { useState, useEffect } from 'react';
import { incidentService } from '../services/incidentService';
import IncidentMap from '../components/map/IncidentMap';
import Loading from '../components/common/Loading';
import {
  Compass,
  Filter,
  Layers,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  MapPin
} from 'lucide-react';

const MapPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [onlyActive, setOnlyActive] = useState(false);

  useEffect(() => {
    const fetchIncidentsForMap = async () => {
      try {
        setLoading(true);
        const params = {
          limit: 50,
          ...(selectedType !== 'all' && { type: selectedType }),
          ...(selectedSeverity !== 'all' && { severity: selectedSeverity }),
          ...(onlyActive && { status: 'in_progress' })
        };
        const res = await incidentService.getIncidents(params);
        if (res.success) {
          setIncidents(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch map incidents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentsForMap();
  }, [selectedType, selectedSeverity, onlyActive]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" /> Spatial Intelligence
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Live Mountain Emergency Map
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geospatial visualization of active landslides, floods, and road blockages across mountain ranges
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">All Incident Types</option>
            <option value="landslide">Landslides</option>
            <option value="flood">Flash Floods</option>
            <option value="road_block">Road Blockages</option>
            <option value="fallen_tree">Fallen Trees</option>
            <option value="infrastructure_damage">Infrastructure Damage</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
            <option value="low">Low Only</option>
          </select>

          <button
            type="button"
            onClick={() => setOnlyActive(!onlyActive)}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              onlyActive
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {onlyActive ? '✓ Active Only' : 'Filter: Active Only'}
          </button>
        </div>
      </div>

      {/* Map Display & Legend */}
      <div className="space-y-4">
        {loading ? (
          <div className="h-[600px] flex items-center justify-center bg-white rounded-2xl border border-slate-200">
            <Loading text="Loading geospatial disaster map..." />
          </div>
        ) : (
          <IncidentMap
            incidents={incidents}
            height="620px"
            center={[31.6700, 77.0500]}
            zoom={9}
          />
        )}

        {/* Map Legend */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between text-xs text-slate-600 gap-4">
          <div className="flex items-center gap-6">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Pin Severity Legend:
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-white shadow-xs animate-ping" />
              <div className="w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-white shadow-xs -ml-5" />
              <span>Critical Emergency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white shadow-xs" />
              <span>High Hazard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-xs" />
              <span>Medium Blockage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-xs" />
              <span>Low Risk</span>
            </div>
          </div>

          <div className="font-semibold text-slate-700">
            Showing <strong>{incidents.length}</strong> active markers
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
