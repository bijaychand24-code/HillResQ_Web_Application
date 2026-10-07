import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Mountain,
  MapPin,
  AlertOctagon,
  ListFilter,
  LayoutDashboard,
  ShieldAlert,
  User,
  LogOut,
  Menu,
  X,
  PhoneCall
} from 'lucide-react';
import Button from '../common/Button';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isResponder } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Emergency Hotlines Ticker */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1 flex items-center justify-between overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <PhoneCall className="w-3 h-3" /> 24/7 Mountain Emergency Lines:
          </span>
          <span>NDRF: <strong>1078</strong></span>
          <span className="text-slate-600">|</span>
          <span>Disaster Helpline: <strong>1070 / 1077</strong></span>
          <span className="text-slate-600">|</span>
          <span>Police: <strong>112</strong></span>
        </div>
        <div className="text-emerald-400 font-medium hidden md:inline">
          ● Incident Response Center Online
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-900 flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
            <Mountain className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                HillResQ
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                Hills
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">
              Report. Respond. Rescue.
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/incidents"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/incidents')
                ? 'bg-slate-100 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Incidents Feed
          </Link>

          <Link
            to="/map"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/map')
                ? 'bg-slate-100 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            Live Map
          </Link>

          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/dashboard')
                  ? 'bg-slate-100 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              Dashboard
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin/incidents"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/admin/incidents')
                  ? 'bg-red-50 text-red-700 font-semibold'
                  : 'text-red-700 hover:bg-red-50/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Admin
            </Link>
          )}

          {isResponder && (
            <Link
              to="/responder/incidents"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/responder/incidents')
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-blue-700 hover:bg-blue-50/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Responder Tasks
            </Link>
          )}
        </div>

        {/* Actions & User State */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/report">
            <Button
              variant="danger"
              size="sm"
              icon={AlertOctagon}
              className="shadow-sm shadow-red-500/20"
            >
              Report Emergency
            </Button>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="View Profile"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs uppercase">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="text-left text-xs hidden lg:block">
                  <div className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                    {user.name}
                  </div>
                  <div className="text-slate-500 capitalize">{user.role}</div>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link to="/report">
            <Button variant="danger" size="sm" icon={AlertOctagon}>
              Report
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            <Link
              to="/incidents"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              Incidents Feed
            </Link>
            <Link
              to="/map"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              Live Map
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/incidents"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-red-700 hover:bg-red-50"
              >
                Admin Management
              </Link>
            )}
            {isResponder && (
              <Link
                to="/responder/incidents"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-blue-700 hover:bg-blue-50"
              >
                Responder Tasks
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                My Profile
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button
                variant="outline"
                onClick={handleLogout}
                icon={LogOut}
                className="w-full text-red-600 hover:text-red-700"
              >
                Log out ({user.name})
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
