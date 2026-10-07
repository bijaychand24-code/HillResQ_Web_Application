import React from 'react';
import {
  Clock,
  CheckCircle2,
  UserCheck,
  Activity,
  CheckCheck,
  XCircle
} from 'lucide-react';

const StatusBadge = ({ status = 'reported', showIcon = true, className = '' }) => {
  const config = {
    reported: {
      label: 'Reported',
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: Clock
    },
    verified: {
      label: 'Verified',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: CheckCircle2
    },
    assigned: {
      label: 'Assigned',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: UserCheck
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-amber-50 text-amber-800 border-amber-300 font-medium',
      icon: Activity
    },
    resolved: {
      label: 'Resolved',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
      icon: CheckCheck
    },
    rejected: {
      label: 'Rejected',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle
    }
  };

  const current = config[status.toLowerCase()] || config.reported;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${current.bg} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{current.label}</span>
    </span>
  );
};

export default StatusBadge;
