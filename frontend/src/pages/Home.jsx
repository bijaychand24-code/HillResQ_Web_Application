import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { incidentService } from '../services/incidentService';
import {
  Mountain,
  AlertOctagon,
  MapPin,
  Shield,
  Activity,
  CheckCircle,
  Clock,
  ArrowRight,
  Phone,
  Flame,
  Radio,
  Compass
} from 'lucide-react';
import Button from '../components/common/Button';
import IncidentCard from '../components/incident/IncidentCard';
import SeverityBadge from '../components/common/SeverityBadge';
import Loading from '../components/common/Loading';

const Home = () => {
  const [criticalIncidents, setCriticalIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active: 0,
    critical: 0,
    resolved: 0
  });

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [incidentsRes] = await Promise.all([
          incidentService.getIncidents({ limit: 4, sortBy: 'severity' })
        ]);

        if (incidentsRes.success) {
          setCriticalIncidents(incidentsRes.data);
          const criticalCount = incidentsRes.data.filter((i) => i.severity === 'critical').length;
          const resolvedCount = incidentsRes.data.filter((i) => i.status === 'resolved').length;
          setStats({
            active: incidentsRes.pagination?.total || incidentsRes.data.length,
            critical: criticalCount,
            resolved: resolvedCount
          });
        }
      } catch (err) {
        console.error('Failed to load homepage incidents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-20 lg:py-28 flex flex-col items-start gap-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-800 text-red-300 text-xs font-semibold tracking-wide uppercase animate-pulse">
            <Radio className="w-4 h-4 text-red-400" />
            Active Mountain Incident Monitoring
          </div>

          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Report. Respond. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Rescue in Hilly Terrains.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
              HillResQ empowers mountain residents, travelers, and disaster management agencies to quickly report landslides, flash floods, and blocked passes, coordinating life-saving responses in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/report">
              <Button
                variant="danger"
                size="lg"
                icon={AlertOctagon}
                className="shadow-lg shadow-red-600/30 font-bold"
              >
                Report Emergency Now
              </Button>
            </Link>
            <Link to="/map">
              <Button
                variant="outline"
                size="lg"
                icon={Compass}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 font-semibold"
              >
                Explore Live Map
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 pt-8 border-t border-slate-800/80 w-full max-w-3xl">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.active > 0 ? stats.active : '12+'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Total Incidents Tracked</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-red-400">
                {stats.critical > 0 ? stats.critical : '2'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Critical Hotspots</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                100%
              </div>
              <div className="text-xs text-slate-400 mt-0.5">GPS Verification</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">
                &lt; 15 min
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Avg Response Dispatch</div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Hotlines Alert Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-600 to-amber-600 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base">
                Immediate Threat to Life or Vehicle Trapped?
              </div>
              <div className="text-xs text-white/90">
                Call National Disaster Emergency Helpline immediately alongside submitting report:
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:1078"
              className="px-4 py-2 bg-white text-red-700 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors shadow-xs"
            >
              Call NDRF (1078)
            </a>
            <a
              href="tel:112"
              className="px-4 py-2 bg-slate-900/80 text-white font-bold text-sm rounded-xl hover:bg-slate-900 transition-colors shadow-xs"
            >
              Call Police (112)
            </a>
          </div>
        </div>
      </div>

      {/* Live Active Emergencies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              <Activity className="w-4 h-4" /> Real-time Feed
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Active Mountain Emergencies
            </h2>
          </div>
          <Link to="/incidents">
            <Button variant="outline" size="sm" icon={ArrowRight}>
              View All Reports
            </Button>
          </Link>
        </div>

        {loading ? (
          <Loading text="Loading active mountain incidents..." />
        ) : criticalIncidents.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 text-slate-500">
            No active emergency incidents recorded at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {criticalIncidents.map((incident) => (
              <IncidentCard key={incident._id} incident={incident} />
            ))}
          </div>
        )}
      </section>

      {/* Incident Response Lifecycle Diagram */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-xl mb-10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              Coordinated Workflow
            </h3>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              End-to-End Emergency Response Lifecycle
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Every incident passes through strict verification and structured assignment stages to ensure rapid resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-white mb-3 text-sm">
                01
              </div>
              <h4 className="font-bold text-white text-sm mb-1">REPORTED</h4>
              <p className="text-xs text-slate-400">
                Citizen submits location, evidence photo, and severity description.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-900 text-indigo-300 flex items-center justify-center font-bold mb-3 text-sm">
                02
              </div>
              <h4 className="font-bold text-white text-sm mb-1">VERIFIED</h4>
              <p className="text-xs text-slate-400">
                Disaster control admin checks coordinates and validates threat level.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-900 text-blue-300 flex items-center justify-center font-bold mb-3 text-sm">
                03
              </div>
              <h4 className="font-bold text-white text-sm mb-1">ASSIGNED</h4>
              <p className="text-xs text-slate-400">
                Nearest Mountain Rescue or SDRF team is assigned to respond.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-900 text-amber-300 flex items-center justify-center font-bold mb-3 text-sm">
                04
              </div>
              <h4 className="font-bold text-white text-sm mb-1">IN PROGRESS</h4>
              <p className="text-xs text-slate-400">
                Heavy machinery, medical units, or road crews deployed on site.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-900 text-emerald-300 flex items-center justify-center font-bold mb-3 text-sm">
                05
              </div>
              <h4 className="font-bold text-white text-sm mb-1">RESOLVED</h4>
              <p className="text-xs text-slate-400">
                Hazard cleared, traffic resumed, and response notes published.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
