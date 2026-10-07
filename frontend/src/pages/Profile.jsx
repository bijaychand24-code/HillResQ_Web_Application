import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Calendar,
  KeyRound,
  FileText,
  CheckCircle,
  Award,
  ArrowRight
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  const roleDescriptions = {
    citizen:
      'Authorized to report real-time mountain hazards, upload photographic evidence, track status progression, and manage personal submissions.',
    responder:
      'Authorized to view assigned emergency operations, coordinate rescue efforts, deploy heavy equipment, log clearance notes, and resolve incidents.',
    admin:
      'Full administrative access to verify incoming incidents, assign responders, configure threat severities, oversee operational lifecycle, and manage user roles.'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          User Profile & Security
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Your credentials, system authorization level, and emergency platform activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6 text-center space-y-4 md:col-span-1">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-2xl flex items-center justify-center mx-auto uppercase shadow-inner">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{user.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
          </div>

          <div className="pt-2">
            <span
              className={`inline-block px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider ${
                user.role === 'admin'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : user.role === 'responder'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {user.role} Role
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
          </div>
        </Card>

        {/* Authorization & Role Privileges */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="w-5 h-5 text-emerald-700" />
              Role Permissions & Responsibilities
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-sm text-slate-700 leading-relaxed">
              <div className="font-semibold text-slate-900 mb-1 capitalize">
                {user.role} Privileges:
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {roleDescriptions[user.role]}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>JWT Authentication Active & Protected</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Password Protected via Salted Bcrypt Hashing</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Role Verified on Every API Request by Backend Middleware</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Need Help or Transfer?</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                To upgrade to a verified Mountain Rescue team responder account, contact your district disaster administrator.
              </p>
            </div>
            <Link to="/dashboard">
              <Button variant="primary" size="sm">
                Open Dashboard
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
