import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { incidentService } from '../services/incidentService';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Activity,
  PlusCircle,
  Shield,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  UserCheck
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import IncidentTable from '../components/incident/IncidentTable';
import IncidentCard from '../components/incident/IncidentCard';

const Dashboard = () => {
  const { user, isAdmin, isResponder, isCitizen } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [statsRes, incidentsRes] = await Promise.all([
          incidentService.getStats(),
          incidentService.getIncidents({
            limit: 6,
            ...(isCitizen && { mine: 'true' }),
            ...(isResponder && { assignedToMe: 'true' })
          })
        ]);

        if (statsRes.success) {
          setStats(statsRes.stats);
        }
        if (incidentsRes.success) {
          setRecentIncidents(incidentsRes.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) return <Loading fullScreen text="Loading operational dashboard..." />;

  // ----------------------------------------------------
  // ADMIN DASHBOARD VIEW
  // ----------------------------------------------------
  if (isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" /> Disaster Operations Headquarters
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Command & Control Center
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time mountain emergency metrics, responder mobilization, and incident lifecycle oversight
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/admin/incidents">
              <Button variant="primary" size="md">
                Manage Incidents
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="outline" size="md" icon={Users}>
                Users & Roles
              </Button>
            </Link>
          </div>
        </div>

        {/* Real Admin Statistics Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <Card className="p-3.5 bg-slate-50">
            <div className="text-xs font-semibold text-slate-500">Total Incidents</div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {stats?.totalIncidents ?? 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Database records</div>
          </Card>

          <Card className="p-3.5 bg-red-50/70 border-red-200">
            <div className="text-xs font-semibold text-red-700 flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5" /> Critical
            </div>
            <div className="text-2xl font-black text-red-700 mt-1">
              {stats?.criticalIncidents ?? 0}
            </div>
            <div className="text-[10px] text-red-600/80 mt-0.5">High threat</div>
          </Card>

          <Card className="p-3.5 bg-amber-50/70 border-amber-200">
            <div className="text-xs font-semibold text-amber-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Pending Verify
            </div>
            <div className="text-2xl font-black text-amber-800 mt-1">
              {stats?.pendingVerification ?? 0}
            </div>
            <div className="text-[10px] text-amber-700 mt-0.5">Needs review</div>
          </Card>

          <Card className="p-3.5 bg-blue-50/70 border-blue-200">
            <div className="text-xs font-semibold text-blue-700 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> Assigned
            </div>
            <div className="text-2xl font-black text-blue-700 mt-1">
              {stats?.assignedIncidents ?? 0}
            </div>
            <div className="text-[10px] text-blue-600 mt-0.5">Teams mobilized</div>
          </Card>

          <Card className="p-3.5 bg-yellow-50/70 border-yellow-200">
            <div className="text-xs font-semibold text-yellow-800 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> In Progress
            </div>
            <div className="text-2xl font-black text-yellow-800 mt-1">
              {stats?.inProgressIncidents ?? 0}
            </div>
            <div className="text-[10px] text-yellow-700 mt-0.5">Active clearance</div>
          </Card>

          <Card className="p-3.5 bg-emerald-50/70 border-emerald-200">
            <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Resolved
            </div>
            <div className="text-2xl font-black text-emerald-800 mt-1">
              {stats?.resolvedIncidents ?? 0}
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Safety restored</div>
          </Card>

          <Card className="p-3.5 bg-purple-50/70 border-purple-200">
            <div className="text-xs font-semibold text-purple-800 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Total Users
            </div>
            <div className="text-2xl font-black text-purple-900 mt-1">
              {stats?.totalUsers ?? 0}
            </div>
            <div className="text-[10px] text-purple-600 mt-0.5">Registered accounts</div>
          </Card>
        </div>

        {/* Recent Incidents Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              Recent Emergency Dispatches
            </h3>
            <Link
              to="/admin/incidents"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Manage All Incidents <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <IncidentTable incidents={recentIncidents} />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RESPONDER DASHBOARD VIEW
  // ----------------------------------------------------
  if (isResponder) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" /> Mountain Rescue & SDRF Task Board
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Responder Mission Hub
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Welcome back, {user.name}. Here are your active assignments and high-priority field operations.
            </p>
          </div>

          <Link to="/map">
            <Button variant="outline" size="md" icon={Compass}>
              View Spatial Map
            </Button>
          </Link>
        </div>

        {/* Responder Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-5 bg-blue-50/70 border-blue-200">
            <div className="text-xs font-semibold text-blue-700">Assigned Incidents</div>
            <div className="text-3xl font-black text-blue-900 mt-1">
              {stats?.assignedIncidents ?? 0}
            </div>
            <div className="text-xs text-blue-600 mt-1">Assigned to your unit</div>
          </Card>

          <Card className="p-5 bg-red-50/70 border-red-200">
            <div className="text-xs font-semibold text-red-700">Critical Priority</div>
            <div className="text-3xl font-black text-red-900 mt-1">
              {stats?.criticalAssigned ?? 0}
            </div>
            <div className="text-xs text-red-600 mt-1">Immediate action needed</div>
          </Card>

          <Card className="p-5 bg-amber-50/70 border-amber-200">
            <div className="text-xs font-semibold text-amber-800">In Progress</div>
            <div className="text-3xl font-black text-amber-900 mt-1">
              {stats?.inProgressIncidents ?? 0}
            </div>
            <div className="text-xs text-amber-700 mt-1">Crews currently deployed</div>
          </Card>

          <Card className="p-5 bg-emerald-50/70 border-emerald-200">
            <div className="text-xs font-semibold text-emerald-800">Resolved by Unit</div>
            <div className="text-3xl font-black text-emerald-900 mt-1">
              {stats?.resolvedIncidents ?? 0}
            </div>
            <div className="text-xs text-emerald-700 mt-1">Route cleared</div>
          </Card>
        </div>

        {/* Assigned Incidents Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              Your Assigned Operations
            </h3>
            <Link
              to="/responder/incidents"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Task Management Board <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentIncidents.length === 0 ? (
            <Card className="p-8 text-center text-slate-500">
              No active incidents currently assigned to your account.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentIncidents.map((incident) => (
                <IncidentCard key={incident._id} incident={incident} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // CITIZEN DASHBOARD VIEW (Phase 14)
  // ----------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" /> Citizen Incident Portal
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            My Emergency Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome, {user.name}. Track the status of your reported hazards and view clearance progress in real time.
          </p>
        </div>

        <Link to="/report">
          <Button variant="danger" size="md" icon={AlertOctagon} className="font-bold">
            Report New Incident
          </Button>
        </Link>
      </div>

      {/* Citizen Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-slate-50">
          <div className="text-xs font-semibold text-slate-500">Total Reports Submitted</div>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {stats?.totalReports ?? 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Lifetime reports</div>
        </Card>

        <Card className="p-5 bg-amber-50/70 border-amber-200">
          <div className="text-xs font-semibold text-amber-800">Active Reports</div>
          <div className="text-3xl font-black text-amber-900 mt-1">
            {stats?.activeReports ?? 0}
          </div>
          <div className="text-xs text-amber-700 mt-1">Being verified or cleared</div>
        </Card>

        <Card className="p-5 bg-emerald-50/70 border-emerald-200">
          <div className="text-xs font-semibold text-emerald-800">Resolved Reports</div>
          <div className="text-3xl font-black text-emerald-900 mt-1">
            {stats?.resolvedReports ?? 0}
          </div>
          <div className="text-xs text-emerald-700 mt-1">Hazards mitigated</div>
        </Card>
      </div>

      {/* Recent Citizen Reports */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">
          Your Submitted Reports
        </h3>

        {recentIncidents.length === 0 ? (
          <Card className="p-10 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">No Incidents Reported Yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                If you encounter a blocked road, landslide, or fallen tree in your area, submit an emergency report to notify response teams.
              </p>
            </div>
            <Link to="/report">
              <Button variant="danger" size="sm" icon={AlertOctagon}>
                Report an Emergency
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentIncidents.map((incident) => (
              <IncidentCard key={incident._id} incident={incident} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
