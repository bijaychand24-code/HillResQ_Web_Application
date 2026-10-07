import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { incidentService } from '../services/incidentService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Calendar,
  User,
  Shield,
  Layers,
  CheckCircle,
  Clock,
  ArrowLeft,
  AlertTriangle,
  FileText,
  Trash2,
  Edit,
  Send,
  UserCheck
} from 'lucide-react';
import SeverityBadge from '../components/common/SeverityBadge';
import StatusBadge from '../components/common/StatusBadge';
import IncidentMap from '../components/map/IncidentMap';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';

const statusSteps = ['reported', 'verified', 'assigned', 'in_progress', 'resolved'];

const IncidentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isResponder, isAuthenticated } = useAuth();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Admin Assignment modal & data
  const [responders, setResponders] = useState([]);
  const [selectedResponder, setSelectedResponder] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [updatingAssignment, setUpdatingAssignment] = useState(false);

  // Responder status update
  const [responderStatus, setResponderStatus] = useState('in_progress');
  const [responseNotes, setResponseNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Citizen edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchIncident = async () => {
    try {
      setLoading(true);
      const res = await incidentService.getIncidentById(id);
      if (res.success && res.data) {
        setIncident(res.data);
        setResponseNotes(res.data.responseNotes || '');
        setResponderStatus(res.data.status === 'assigned' ? 'in_progress' : res.data.status);
        setEditTitle(res.data.title);
        setEditDescription(res.data.description);
        setEditLocation(res.data.locationName);
      }
    } catch (err) {
      console.error('Failed to load incident details:', err);
      setError('Incident not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);

  useEffect(() => {
    if (isAdmin) {
      const loadResponders = async () => {
        try {
          const res = await userService.getResponders();
          if (res.success) {
            setResponders(res.data);
          }
        } catch (e) {
          console.warn('Could not load responders:', e);
        }
      };
      loadResponders();
    }
  }, [isAdmin]);

  // Admin actions: verify, reject, delete
  const handleAdminStatusChange = async (newStatus) => {
    try {
      const res = await incidentService.updateIncident(id, { status: newStatus });
      if (res.success) {
        setIncident(res.data);
        setActionSuccess(`Incident status updated to ${newStatus}.`);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAssignResponder = async (e) => {
    e.preventDefault();
    try {
      setUpdatingAssignment(true);
      const res = await incidentService.updateIncident(id, {
        assignedTo: selectedResponder || null
      });
      if (res.success) {
        setIncident(res.data);
        setAssignModalOpen(false);
        setActionSuccess('Responder assigned successfully.');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign responder');
    } finally {
      setUpdatingAssignment(false);
    }
  };

  const handleDeleteIncident = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this incident record?')) {
      return;
    }
    try {
      await incidentService.deleteIncident(id);
      navigate('/incidents');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete incident');
    }
  };

  // Responder actions: update status + response notes
  const handleResponderUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdatingStatus(true);
      const res = await incidentService.updateIncident(id, {
        status: responderStatus,
        responseNotes
      });
      if (res.success) {
        setIncident(res.data);
        setActionSuccess('Response status & notes updated successfully.');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update incident');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Citizen edit action
  const handleCitizenSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setSavingEdit(true);
      const res = await incidentService.updateIncident(id, {
        title: editTitle,
        description: editDescription,
        locationName: editLocation
      });
      if (res.success) {
        setIncident(res.data);
        setEditModalOpen(false);
        setActionSuccess('Report details updated.');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to edit report');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) return <Loading fullScreen text="Loading incident report..." />;
  if (error || !incident) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4">
        <Alert type="error">{error || 'Incident not found'}</Alert>
        <Link to="/incidents">
          <Button variant="outline" icon={ArrowLeft}>
            Back to Incidents Feed
          </Button>
        </Link>
      </div>
    );
  }

  const isAssignedResponder =
    user &&
    incident.assignedTo &&
    (incident.assignedTo._id === user._id || incident.assignedTo === user._id);

  const isReporter =
    user &&
    incident.reportedBy &&
    (incident.reportedBy._id === user._id || incident.reportedBy === user._id);

  const currentStepIndex = statusSteps.indexOf(incident.status);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back link */}
      <div>
        <Link
          to="/incidents"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Incidents Feed
        </Link>
      </div>

      {actionSuccess && (
        <Alert type="success" onClose={() => setActionSuccess(null)}>
          {actionSuccess}
        </Alert>
      )}

      {/* Header Info */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium capitalize">
              {incident.type?.replace('_', ' ')}
            </span>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(incident.createdAt).toLocaleString()}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
          {incident.title}
        </h1>

        <div className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900">{incident.locationName}</span>
            <span className="text-xs text-slate-500 block">
              Coordinates: {incident.latitude}°, {incident.longitude}°
            </span>
          </div>
        </div>

        {/* Lifecycle Tracker */}
        {incident.status !== 'rejected' && (
          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Lifecycle Progress
            </div>
            <div className="grid grid-cols-5 gap-2 text-center">
              {statusSteps.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs mt-1.5 capitalize font-medium ${
                        isCurrent
                          ? 'text-emerald-700 font-bold'
                          : isPassed
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Details & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Description, Evidence, Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Description */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                Incident Description & Impact
              </h2>
              {isReporter && incident.status === 'reported' && (
                <Button
                  size="sm"
                  variant="outline"
                  icon={Edit}
                  onClick={() => setEditModalOpen(true)}
                >
                  Edit Report
                </Button>
              )}
            </div>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {incident.description}
            </p>
          </Card>

          {/* Evidence Image */}
          {incident.imageUrl && (
            <Card className="p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Photo Evidence
              </h2>
              <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-96 bg-slate-100">
                <img
                  src={incident.imageUrl}
                  alt={incident.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
          )}

          {/* Responder Notes */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="w-5 h-5 text-blue-600" />
              Emergency Response Logs & Clearance Notes
            </h2>
            {incident.responseNotes ? (
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/80 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {incident.responseNotes}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No response notes or clearance dispatch records entered yet.
              </p>
            )}
          </Card>

          {/* Responder Actions Form (Visible if assigned responder or admin) */}
          {(isAssignedResponder || isAdmin) && (
            <Card className="p-6 space-y-4 bg-slate-50 border-blue-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Update Operations & Response Notes
              </h3>
              <form onSubmit={handleResponderUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Set Operational Status
                  </label>
                  <select
                    value={responderStatus}
                    onChange={(e) => setResponderStatus(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  >
                    <option value="in_progress">In Progress (Crews active on site)</option>
                    <option value="resolved">Resolved (Route cleared / hazard mitigated)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Log Clearance Notes / Resources Deployed
                  </label>
                  <textarea
                    rows={3}
                    value={responseNotes}
                    onChange={(e) => setResponseNotes(e.target.value)}
                    placeholder="Enter details: Machinery deployed, single-lane opened, traffic diverted..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Send}
                  loading={updatingStatus}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Operations Update
                </Button>
              </form>
            </Card>
          )}
        </div>

        {/* Right Column: Location Map & Administration */}
        <div className="space-y-6">
          {/* Location Map View */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              Location Coordinates
            </h3>
            <IncidentMap
              incidents={[incident]}
              center={[incident.latitude, incident.longitude]}
              zoom={13}
              height="280px"
            />
            <div className="text-xs text-slate-500 text-center">
              Lat: {incident.latitude.toFixed(4)}, Lng: {incident.longitude.toFixed(4)}
            </div>
          </Card>

          {/* Assignment & Reporter Info */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Stakeholder Information
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Reported By</span>
                <span className="font-semibold text-slate-800">
                  {incident.reportedBy?.name || 'Anonymous Citizen'}
                </span>
                <span className="text-slate-500 block">
                  {incident.reportedBy?.email}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block font-medium">Assigned Responder</span>
                {incident.assignedTo ? (
                  <div>
                    <span className="font-semibold text-blue-700 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      {incident.assignedTo.name}
                    </span>
                    <span className="text-slate-500 block">
                      {incident.assignedTo.email}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No responder assigned yet</span>
                )}
              </div>
            </div>
          </Card>

          {/* Admin Command Panel */}
          {isAdmin && (
            <Card className="p-6 space-y-4 border-red-200 bg-red-50/20">
              <h3 className="text-sm font-bold text-red-900 flex items-center gap-1.5 border-b border-red-200/60 pb-2">
                <Shield className="w-4 h-4 text-red-600" />
                Administrative Command
              </h3>

              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={UserCheck}
                  onClick={() => setAssignModalOpen(true)}
                  className="w-full text-xs"
                >
                  Assign / Reassign Responder
                </Button>

                {incident.status === 'reported' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleAdminStatusChange('verified')}
                    className="w-full text-xs bg-indigo-700 hover:bg-indigo-800"
                  >
                    Verify Incident
                  </Button>
                )}

                {incident.status !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAdminStatusChange('rejected')}
                    className="w-full text-xs text-rose-600 hover:bg-rose-50"
                  >
                    Reject Incident
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="danger"
                  icon={Trash2}
                  onClick={handleDeleteIncident}
                  className="w-full text-xs"
                >
                  Delete Record
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Admin Assign Responder Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Responder Team"
      >
        <form onSubmit={handleAssignResponder} className="space-y-4">
          <p className="text-xs text-slate-500">
            Select a verified mountain rescue, SDRF, or district response team member to take operational responsibility for this incident.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Responder
            </label>
            <select
              value={selectedResponder}
              onChange={(e) => setSelectedResponder(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-100"
              required
            >
              <option value="">-- Choose Responder --</option>
              {responders.map((resp) => (
                <option key={resp._id} value={resp._id}>
                  {resp.name} ({resp.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={updatingAssignment}
            >
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Citizen Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Reported Incident"
      >
        <form onSubmit={handleCitizenSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Landmark
            </label>
            <input
              type="text"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={savingEdit}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IncidentDetails;
