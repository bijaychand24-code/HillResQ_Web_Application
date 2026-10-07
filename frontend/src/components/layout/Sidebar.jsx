import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  AlertTriangle,
  MapPin,
  Users,
  ShieldCheck,
  FilePlus,
  User
} from 'lucide-react';

const Sidebar = () => {
  const { user, isAdmin, isResponder, isCitizen } = useAuth();

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-emerald-700 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center uppercase">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-slate-900 truncate">
              {user?.name}
            </h4>
            <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full bg-emerald-100 text-emerald-800">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Operations
          </div>
          <NavLink to="/dashboard" end className={navItemClass}>
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink to="/report" className={navItemClass}>
            <FilePlus className="w-4 h-4 text-red-500" />
            Report Incident
          </NavLink>
          <NavLink to="/incidents" className={navItemClass}>
            <AlertTriangle className="w-4 h-4" />
            All Incidents
          </NavLink>
          <NavLink to="/map" className={navItemClass}>
            <MapPin className="w-4 h-4" />
            Live Map
          </NavLink>

          {/* Responder Section */}
          {isResponder && (
            <>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mt-6 mb-2">
                Responder Hub
              </div>
              <NavLink to="/responder/incidents" className={navItemClass}>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Assigned Tasks
              </NavLink>
            </>
          )}

          {/* Admin Section */}
          {isAdmin && (
            <>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mt-6 mb-2">
                Admin Console
              </div>
              <NavLink to="/admin/incidents" className={navItemClass}>
                <ShieldCheck className="w-4 h-4 text-red-600" />
                Incident Control
              </NavLink>
              <NavLink to="/admin/users" className={navItemClass}>
                <Users className="w-4 h-4 text-indigo-600" />
                User Management
              </NavLink>
            </>
          )}

          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mt-6 mb-2">
            Account
          </div>
          <NavLink to="/profile" className={navItemClass}>
            <User className="w-4 h-4" />
            Profile & Activity
          </NavLink>
        </nav>
      </div>

      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800">
        <div className="font-semibold mb-1">Mountain Safety First</div>
        <p className="text-[11px] text-emerald-700">
          In active landslide zones, prioritize personal safety and maintain high ground.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
