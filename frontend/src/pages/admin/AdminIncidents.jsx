import React, { useState, useEffect } from 'react';
import { incidentService } from '../../services/incidentService';
import { userService } from '../../services/userService';
import {
  Shield,
  CheckCircle,
  XCircle,
  UserCheck,
  Trash2,
  Filter,
  Eye,
  AlertTriangle
} from 'lucide-react';
import IncidentTable from '../../components/incident/IncidentTable';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import SeverityBadge from '../../components/common/SeverityBadge';
import StatusBadge from '../../components/common/StatusBadge';

const AdminIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [responders, setResponders] = useState([]);

  // Modal State for managing selected incident
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [assignedResponderId, setAssignedResponderId] = useState('');
  const [targetStatus, setTargetStatus] = useState('verified');
  const [targetSeverity, setTargetSeverity] = useState('medium');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
        ...(statusFilter !== 'all' && { status: statusFilter })
      };
      const res = await incidentService.getIncidents(params);
      if (res.success) {
        setIncidents(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponders = async () => {
    try {
      const res = await userService.getResponders();
      if (res.success) {
        setResponders(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch responders:', err);
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchResponders();
  }, [statusFilter]);

  const handleOpenManageModal = (incident) => {
    setSelectedIncident(incident);
    setAssignedResponderId(incident.assignedTo?._id || incident.assignedTo || '');
    setTargetStatus(incident.status);
    setTargetSeverity(incident.severity);
    setAdminNotes(incident.responseNotes || '');
    setModalOpen(true);
  };

  const handleSaveIncidentChanges = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;

    try {
      setProcessing(true);
      const updates = {
        status: targetStatus,
        severity: targetSeverity,
        assignedTo: assignedResponderId || null,
        responseNotes: adminNotes
      };

      const res = await incidentService.updateIncident(selectedIncident._id, updates);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Incident '${selectedIncident.title}' updated successfully.`
        });
        setModalOpen(false);
        fetchIncidents();
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update incident'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (incidentId) => {
    if (!window.confirm('Are you sure you want to delete this incident record permanently?')) {
      return;
    }
    try {
      await incidentService.deleteIncident(incidentId);
      setFeedback({
        type: 'success',
        message: 'Incident record permanently deleted.'
      });
      fetchIncidents();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete incident'
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" /> Administrative Control
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Incident Dispatch Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming citizen reports, verify threats, assign mountain rescue teams, and supervise road clearances.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
          {['all', 'reported', 'verified', 'assigned', 'in_progress', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <Alert type={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      {loading ? (
        <Loading text="Loading incident control table..." />
      ) : incidents.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          No incidents matching the selected status filter.
        </div>
      ) : (
        <IncidentTable
          incidents={incidents}
          showAction={true}
          actionLabel="Manage"
          onAction={handleOpenManageModal}
        />
      )}

      {/* Incident Management Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Manage Incident & Dispatch"
        maxWidth="max-w-xl"
      >
        {selectedIncident && (
          <form onSubmit={handleSaveIncidentChanges} className="space-y-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <div className="font-bold text-slate-900">{selectedIncident.title}</div>
              <div className="text-xs text-slate-500">
                Location: {selectedIncident.locationName}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="reported">Reported</option>
                  <option value="verified">Verified</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Severity
                </label>
                <select
                  value={targetSeverity}
                  onChange={(e) => setTargetSeverity(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assign Responder Unit
              </label>
              <select
                value={assignedResponderId}
                onChange={(e) => setAssignedResponderId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">-- No Responder (Unassigned) --</option>
                {responders.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} ({r.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Administrative / Operational Notes
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Disaster control instructions, road clearance priority, team notes..."
                className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => {
                  setModalOpen(false);
                  handleDelete(selectedIncident._id);
                }}
              >
                Delete
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={processing}
                >
                  Apply Updates
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminIncidents;
