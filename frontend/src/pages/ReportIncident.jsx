import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidentService } from '../services/incidentService';
import { useAuth } from '../context/AuthContext';
import {
  AlertOctagon,
  MapPin,
  Camera,
  Upload,
  CheckCircle,
  X,
  Layers,
  Flame,
  FileText
} from 'lucide-react';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Card from '../components/common/Card';
import LocationPicker from '../components/map/LocationPicker';

const incidentTypes = [
  { value: 'landslide', label: 'Landslide / Rockfall' },
  { value: 'flood', label: 'Flash Flood / River Overflow' },
  { value: 'road_block', label: 'Road / Pass Blockage' },
  { value: 'fallen_tree', label: 'Fallen Tree / Powerline Obstruction' },
  { value: 'infrastructure_damage', label: 'Bridge / Retaining Wall Collapse' },
  { value: 'other', label: 'Other Mountain Emergency' }
];

const severityLevels = [
  { value: 'low', label: 'Low — Minor inconvenience, passable' },
  { value: 'medium', label: 'Medium — Single lane blocked, moderate hazard' },
  { value: 'high', label: 'High — Route fully severed, property at risk' },
  { value: 'critical', label: 'CRITICAL — Immediate threat to human life / stranded vehicles' }
];

const ReportIncident = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('landslide');
  const [severity, setSeverity] = useState('medium');
  const [locationName, setLocationName] = useState('');
  const [coordinates, setCoordinates] = useState({
    latitude: 31.6700,
    longitude: 77.0500
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleLocationChange = (coords) => {
    setCoordinates(coords);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large. Maximum size allowed is 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please provide an incident title.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a detailed description of the incident.');
      return;
    }
    if (!locationName.trim()) {
      setError('Please enter a location landmark or road name.');
      return;
    }
    if (!coordinates.latitude || !coordinates.longitude) {
      setError('Please click on the map to set the location coordinates.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let uploadedImageUrl = null;

      // If user uploaded an image evidence file, upload it first
      if (imageFile) {
        try {
          const uploadRes = await incidentService.uploadImage(imageFile);
          if (uploadRes.success && uploadRes.url) {
            uploadedImageUrl = uploadRes.url;
          }
        } catch (uploadErr) {
          console.warn('Image upload failed, continuing without image:', uploadErr);
        }
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        severity,
        locationName: locationName.trim(),
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        imageUrl: uploadedImageUrl
      };

      const res = await incidentService.createIncident(payload);

      if (res.success && res.data) {
        setSuccess('Incident report dispatched successfully! Redirecting...');
        setTimeout(() => {
          navigate(`/incidents/${res.data._id}`);
        }, 1200);
      }
    } catch (err) {
      console.error('Incident report error:', err);
      setError(
        err.response?.data?.message ||
          'Failed to submit incident report. Please verify all fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
          <AlertOctagon className="w-4 h-4" /> Emergency Incident Dispatch
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Mountain Incident
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Provide accurate details and coordinates to mobilize local administration, SDRF, and mountain rescue units.
        </p>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success">
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Incident Summary Card */}
        <Card className="p-6 space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-emerald-700" />
            Incident Classification & Details
          </h2>

          <div className="space-y-4">
            <Input
              label="Incident Title"
              placeholder="e.g. Major Landslide Blocking NH-21 near Pandoh Dam"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              helperText="Give a short, concise description with the landmark name."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Incident Type"
                options={incidentTypes}
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              />

              <Select
                label="Severity Level"
                options={severityLevels}
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the incident: approximate extent of debris, number of vehicles or homes affected, weather conditions, active hazard risks..."
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                required
              />
            </div>
          </div>
        </Card>

        {/* Location & Interactive Coordinates Card */}
        <Card className="p-6 space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5 text-emerald-700" />
            Geographic Location & Coordinates
          </h2>

          <div className="space-y-4">
            <Input
              label="Location Name / Landmark"
              placeholder="e.g. KM 188 on Mandi-Kullu Highway, near Kamand Turn"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
              helperText="Specific road milestone, village, river basin, or nearby prominent structure."
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Pin Location on Satellite / Mountain Map <span className="text-red-500">*</span>
              </label>
              <LocationPicker
                latitude={coordinates.latitude}
                longitude={coordinates.longitude}
                onLocationChange={handleLocationChange}
              />
            </div>
          </div>
        </Card>

        {/* Evidence Photo Upload Card */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Camera className="w-5 h-5 text-emerald-700" />
            Visual Evidence / Photo (Optional)
          </h2>

          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 max-w-md h-52 bg-slate-100">
                <img
                  src={imagePreview}
                  alt="Evidence preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm font-medium text-slate-700">
                  Upload landslide or damage photo
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  JPEG, PNG, or WebP up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="danger"
            size="lg"
            loading={loading}
            icon={AlertOctagon}
            className="font-bold px-8 shadow-md shadow-red-500/20"
          >
            Dispatch Emergency Report
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReportIncident;
