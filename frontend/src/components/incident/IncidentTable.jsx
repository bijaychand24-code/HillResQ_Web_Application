import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, MapPin, UserCheck, ShieldAlert } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';

const IncidentTable = ({
  incidents = [],
  onAction,
  actionLabel = 'Manage',
  showAction = false
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 font-semibold text-slate-700">
          <tr>
            <th scope="col" className="px-4 py-3.5">
              Incident / Location
            </th>
            <th scope="col" className="px-3 py-3.5">
              Type
            </th>
            <th scope="col" className="px-3 py-3.5">
              Severity
            </th>
            <th scope="col" className="px-3 py-3.5">
              Status
            </th>
            <th scope="col" className="px-3 py-3.5">
              Assigned To
            </th>
            <th scope="col" className="px-3 py-3.5">
              Reported At
            </th>
            <th scope="col" className="px-4 py-3.5 text-right">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {incidents.map((incident) => {
            const formattedDate = new Date(incident.createdAt).toLocaleDateString(
              'en-US',
              {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }
            );

            return (
              <tr
                key={incident._id}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className="px-4 py-3 max-w-xs">
                  <div className="font-semibold text-slate-900 truncate">
                    {incident.title}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{incident.locationName}</span>
                  </div>
                </td>
                <td className="px-3 py-3 capitalize text-slate-600 font-medium">
                  {incident.type.replace('_', ' ')}
                </td>
                <td className="px-3 py-3">
                  <SeverityBadge severity={incident.severity} showIcon={false} />
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={incident.status} />
                </td>
                <td className="px-3 py-3 text-xs text-slate-600">
                  {incident.assignedTo ? (
                    <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      {incident.assignedTo.name}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">
                  {formattedDate}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/incidents/${incident._id}`}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors inline-block"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {showAction && onAction && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAction(incident)}
                      >
                        {actionLabel}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default IncidentTable;
