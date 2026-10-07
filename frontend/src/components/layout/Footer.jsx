import React from 'react';
import { Mountain, Phone, Shield, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Mountain className="w-5 h-5 text-emerald-100" />
              </div>
              <span className="font-bold text-white text-lg">HillResQ</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dedicated emergency response and disaster monitoring platform designed specifically for hilly terrains, high-altitude passes, and mountain valleys.
            </p>
            <div className="text-xs text-emerald-400 font-medium">
              Tagline: Report. Respond. Rescue.
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/incidents" className="hover:text-white transition-colors">
                  Incidents Feed
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-white transition-colors">
                  Live Emergency Map
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-white transition-colors">
                  Report New Emergency
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Responder Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Incident Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Mountain Incidents
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Landslides & Mudflows</li>
              <li>Flash Floods & River Surges</li>
              <li>Highway & Pass Blockages</li>
              <li>Fallen Pine/Deodar Trees</li>
              <li>Bailey Bridge & Road Subsidence</li>
            </ul>
          </div>

          {/* Emergency Directory */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-1 text-amber-400">
              <Phone className="w-3.5 h-3.5" /> Emergency Contacts
            </h4>
            <div className="space-y-2 text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                <div className="text-slate-400">National Disaster (NDRF):</div>
                <div className="font-bold text-white text-sm">1078 / 011-24363260</div>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                <div className="text-slate-400">State Disaster Management:</div>
                <div className="font-bold text-white text-sm">1070 / 1077</div>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                <div className="text-slate-400">Ambulance & Medical Emergency:</div>
                <div className="font-bold text-white text-sm">108 / 102</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} HillResQ Emergency Incident System. Open source public safety initiative.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with care for mountain communities</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
