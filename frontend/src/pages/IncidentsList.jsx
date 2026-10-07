import React, { useState, useEffect } from 'react';
import { incidentService } from '../services/incidentService';
import {
  Search,
  Filter,
  Grid,
  List,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import IncidentCard from '../components/incident/IncidentCard';
import IncidentTable from '../components/incident/IncidentTable';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';

const IncidentsList = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Filters state
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        ...(search && { search }),
        ...(type !== 'all' && { type }),
        ...(severity !== 'all' && { severity }),
        ...(status !== 'all' && { status })
      };

      const res = await incidentService.getIncidents(params);
      if (res.success) {
        setIncidents(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [page, type, severity, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchIncidents();
  };

  const handleResetFilters = () => {
    setSearch('');
    setType('all');
    setSeverity('all');
    setStatus('all');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Emergency Incidents Feed
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time verified reports, rescue operations, and road clearance updates
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-white shadow-xs text-slate-900'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Grid className="w-4 h-4" /> Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-white shadow-xs text-slate-900'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" /> Table
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, description, or landmark location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Search
          </Button>
          {(search || type !== 'all' || severity !== 'all' || status !== 'all') && (
            <Button
              type="button"
              variant="outline"
              size="md"
              icon={RotateCcw}
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              Reset
            </Button>
          )}
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-emerald-600 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Severity</label>
            <select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-emerald-600 text-xs"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Incident Type</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-emerald-600 text-xs"
            >
              <option value="all">All Types</option>
              <option value="landslide">Landslides</option>
              <option value="flood">Flash Floods</option>
              <option value="road_block">Road Blockages</option>
              <option value="fallen_tree">Fallen Trees</option>
              <option value="infrastructure_damage">Infrastructure Damage</option>
              <option value="other">Other Emergencies</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Feed */}
      {loading ? (
        <Loading text="Retrieving mountain emergency reports..." />
      ) : incidents.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No incidents matched your query"
          description="Try broadening your filter criteria or search keyword."
          actionText="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {incidents.map((incident) => (
            <IncidentCard key={incident._id} incident={incident} />
          ))}
        </div>
      ) : (
        <IncidentTable incidents={incidents} />
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-6">
          <div className="text-xs text-slate-500">
            Showing Page <strong>{pagination.page}</strong> of{' '}
            <strong>{pagination.pages}</strong> ({pagination.total} total reports)
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentsList;
