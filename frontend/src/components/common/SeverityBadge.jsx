import React from 'react';
import { AlertTriangle, AlertCircle, AlertOctagon, Info } from 'lucide-react';

const SeverityBadge = ({ severity = 'medium', showIcon = true, className = '' }) => {
  const config = {
    low: {
      label: 'Low',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Info
    },
    medium: {
      label: 'Medium',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle
    },
    high: {
      label: 'High',
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: AlertCircle
    },
    critical: {
      label: 'CRITICAL',
      bg: 'bg-red-100 text-red-800 border-red-300 font-bold',
      icon: AlertOctagon
    }
  };

  const current = config[severity.toLowerCase()] || config.medium;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border shadow-xs ${current.bg} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{current.label}</span>
    </span>
  );
};

export default SeverityBadge;
