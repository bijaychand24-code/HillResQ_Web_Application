import React, { useState, useEffect } from 'react';
import { incidentService } from '../../services/incidentService';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Activity,
  CheckCircle,
  Clock,
  Send,
  MapPin,
  Eye,
  AlertTriangle
} from 'lucide-react';
import IncidentTable from '../../components/incident/IncidentTable';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';

const ResponderIncidents = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all'); // 'all', 'active', 'resolved'

  // Modal State for update
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState('in_progress');
  const [responseNotes, setResponseNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchAssignedIncidents = async () => {
    try {
      setLoading(true);
      const params = {
        assignedToMe: 'true',
        limit: 50,
        ...(tab === 'active' && { status: 'in_progress' }),
        ...(tab === 'resolved' && { status: 'resolved' })
      };
      const res = await incidentService.getIncidents(params);
      if (res.success) {
        setIncidents(res.data);
      }
    } catch (err) {
      console.error('Failed to load assigned incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedIncidents();
  }, [tab]);

  const handleOpenActionModal = (incident) => {
    setSelectedIncident(incident);
    setStatus(incident.status === 'assigned' ? 'in_progress' : incident.status);
    setResponseNotes(incident.responseNotes || '');
    setModalOpen(true);
  };

  const handleSaveResponse = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;

    try {
      setUpdating(true);
      const res = await incidentService.updateIncident(selectedIncident._id, {
        status,
        responseNotes
      });
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Operational status and response notes updated successfully.'
        });
        setModalOpen(false);
        fetchAssignedIncidents();
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update incident'
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" /> Tactical Field Console
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            My Assigned Rescue Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage ongoing site clearances, document equipment deployed, and mark hazards as resolved once cleared.
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setTab('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              tab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Assigned
          </button>
          <button
            onClick={() => setTab('active')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              tab === 'active'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active / In Progress
          </button>
          <button
            onClick={() => setTab('resolved')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              tab === 'resolved'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {feedback && (
        <Alert type={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      {loading ? (
        <Loading text="Loading assigned rescue tasks..." />
      ) : incidents.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-2">
          <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-slate-800">No Operations Pending</h3>
          <p className="text-xs max-w-sm mx-auto">
            You currently have no incidents assigned under this filter tab.
          </p>
        </div>
      ) : (
        <IncidentTable
          incidents={incidents}
          showAction={true}
          actionLabel="Update Status"
          onAction={handleOpenActionModal}
        />
      )}

      {/* Responder Action Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Update Operational Response"
      >
        {selectedIncident && (
          <form onSubmit={handleSaveResponse} className="space-y-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <div className="font-bold text-slate-900">{selectedIncident.title}</div>
              <div className="text-xs text-slate-500">
                {selectedIncident.locationName}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Field Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value="in_progress">In Progress (Field crews deploying/active)</option>
                <option value="resolved">Resolved (Hazard eliminated, traffic restored)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Response Notes & Resource Log
              </label>
              <textarea
                rows={4}
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                placeholder="Details of action taken: Heavy machinery used, barriers installed, single lane opened at 14:00, etc..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
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
                loading={updating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Operational Update
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ResponderIncidents;
