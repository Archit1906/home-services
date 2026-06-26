import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, Check, Sparkles, MapPin, Clock, Award, 
  Droplet, Zap, Snowflake, Sprout, Paintbrush, Hammer, 
  UploadCloud, X, Globe, UserPlus, CreditCard, Wallet, Calendar
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import { useJsApiLoader, GoogleMap, MarkerF, CircleF, Autocomplete } from '@react-google-maps/api';

// Custom inline Refrigerator Icon for Appliances category
const RefrigeratorIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 2h14v20H5zM5 12h14" />
    <path d="M9 7h2M9 16h2" />
  </svg>
);

// India-localized categories list (matching landing page categories + extra specialties)
const CATEGORY_ITEMS = [
  { id: 'Plumbing', name: 'Plumbing', icon: Droplet, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30' },
  { id: 'Electrical', name: 'Electrical', icon: Zap, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30' },
  { id: 'HVAC', name: 'HVAC', icon: Snowflake, color: 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30' },
  { id: 'Cleaning', name: 'Cleaning', icon: Sparkles, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30' },
  { id: 'Gardening', name: 'Landscaping', icon: Sprout, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30' },
  { id: 'Painting', name: 'Painting', icon: Paintbrush, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30' },
  { id: 'Carpentry', name: 'Carpentry', icon: Hammer, color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30' },
  { id: 'Appliances', name: 'Appliances', icon: RefrigeratorIcon, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-100 dark:border-cyan-900/30' }
];

export default function PostJob() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { addToast } = useToastStore();

  const [step, setStep] = useState(1);

  // Form Fields State
  const [serviceType, setServiceType] = useState('Plumbing');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  
  // Location & Scheduling State (Step 2)
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [timingOption, setTimingOption] = useState('flexible'); // 'urgent', 'flexible', 'specific'
  const [specificDate, setSpecificDate] = useState('');
  const [radius, setRadius] = useState(15);
  const [coordinates, setCoordinates] = useState({ lat: 19.0760, lng: 72.8777 }); // Mumbai center default
  const [hasLocation, setHasLocation] = useState(false);
  const [photos, setPhotos] = useState([]);

  // Budget & Bidding State (Step 3)
  const [budget, setBudget] = useState(1500);
  const [budgetPreset, setBudgetPreset] = useState('small'); // 'small', 'standard', 'complex'
  const [biddingPrivacy, setBiddingPrivacy] = useState('all'); // 'all', 'invite'

  // AI Description Assistance
  const [improving, setImproving] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const [autocomplete, setAutocomplete] = useState(null);

  // Sync isEmergency based on timing selection
  useEffect(() => {
    setIsEmergency(timingOption === 'urgent');
  }, [timingOption]);

  // Sync budget preset to specific value defaults
  const handlePresetSelect = (preset) => {
    setBudgetPreset(preset);
    if (preset === 'small') {
      setBudget(1500);
    } else if (preset === 'standard') {
      setBudget(5000);
    } else if (preset === 'complex') {
      setBudget(15000);
    }
  };

  const handleImproveDescription = async () => {
    if (!title || !description) {
      addToast('Please enter both a title and a basic description first', 'warning');
      return;
    }
    setImproving(true);
    try {
      const res = await fetch('/api/jobs/improve-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, serviceType, description })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDescription(data.improvedDescription);
      addToast('Description professionalized by Gemini!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to improve description', 'error');
    } finally {
      setImproving(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => URL.createObjectURL(file));
    setPhotos(prev => [...prev, ...newPhotos].slice(0, 5));
    addToast('Photos attached successfully!', 'success');
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      // Build final address string including pincode if present
      const finalAddress = pinCode ? `${address}, PIN - ${pinCode}` : address;

      let calculatedStartDate = new Date().toISOString();
      if (timingOption === 'specific' && specificDate) {
        calculatedStartDate = new Date(specificDate).toISOString();
      }

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceType,
          title,
          description,
          budget: Number(budget) || 0,
          hours: timingOption === 'urgent' ? 2 : 4,
          experience: budgetPreset === 'complex' ? 5 : 2,
          startDate: calculatedStartDate,
          location: { address: finalAddress, lat: coordinates.lat, lng: coordinates.lng },
          radius: Number(radius),
          isEmergency
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Post creation failed');

      addToast('Service job request posted successfully in India marketplace!', 'success');
      navigate('/dashboard/home');
    } catch (err) {
      addToast(err.message || 'Failed to post job request', 'error');
    }
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newCoords = { lat, lng };
    setCoordinates(newCoords);
    setHasLocation(true);

    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: newCoords }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setAddress(results[0].formatted_address);
        }
      });
    }
  };

  const handleMarkerDragEnd = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newCoords = { lat, lng };
    setCoordinates(newCoords);
    setHasLocation(true);

    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: newCoords }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setAddress(results[0].formatted_address);
        }
      });
    }
  };

  const handleSearchAddress = () => {
    if (!window.google || !address) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        const newCoords = { lat: loc.lat(), lng: loc.lng() };
        setCoordinates(newCoords);
        setAddress(results[0].formatted_address);
        setHasLocation(true);
        addToast('Location pinpointed on map', 'success');
      } else {
        addToast('Location not found. Please pinpoint directly on map.', 'warning');
      }
    });
  };

  const onAutocompleteLoad = (autoInstance) => {
    setAutocomplete(autoInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const loc = place.geometry.location;
        setCoordinates({ lat: loc.lat(), lng: loc.lng() });
        setAddress(place.formatted_address || '');
        setHasLocation(true);
        addToast('Location set from suggestions', 'success');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-text-primary dark:text-text-darkPrimary p-4 md:p-8 relative overflow-hidden flex flex-col justify-center">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5c3ceb]/10 rounded-full blur-3xl -z-10" />

      {/* Header controls */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/dashboard/home')}
          className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel & Back
        </button>
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest bg-slate-200/50 dark:bg-slate-900/50 px-4 py-1.5 rounded-full border border-border/10">
          Step {step} of 3
        </span>
      </div>

      <Card className="max-w-2xl mx-auto w-full shadow-elevated border border-slate-200/60 dark:border-slate-800/80 p-8 relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl overflow-hidden">
        {/* Stepper Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              step >= 1 ? 'bg-indigo-650 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              {step > 1 ? <Check className="h-3.5 w-3.5" /> : '1'}
            </div>
            <span className={`text-xs font-extrabold uppercase tracking-wider ${step === 1 ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-400'}`}>
              Service Details
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-100 dark:bg-slate-800 mx-4" />
          <div className="flex items-center gap-2.5">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              step >= 2 ? 'bg-indigo-650 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              {step > 2 ? <Check className="h-3.5 w-3.5" /> : '2'}
            </div>
            <span className={`text-xs font-extrabold uppercase tracking-wider ${step === 2 ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-400'}`}>
              Schedule & Location
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-100 dark:bg-slate-800 mx-4" />
          <div className="flex items-center gap-2.5">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              step >= 3 ? 'bg-indigo-650 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              3
            </div>
            <span className={`text-xs font-extrabold uppercase tracking-wider ${step === 3 ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-400'}`}>
              Budget & Post
            </span>
          </div>
        </div>

        {/* Wizard Form Stages */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1.5 mb-2">
                <h2 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-wide">What do you need help with?</h2>
                <p className="text-xs text-slate-400 font-medium">Select a category to help us match you with the right pro.</p>
              </div>

              {/* Grid of Categories */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORY_ITEMS.map((item) => {
                  const IconComponent = item.icon;
                  const isSelected = serviceType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setServiceType(item.id)}
                      className={`p-4 rounded-2xl border text-left flex flex-col gap-3 transition-all transform active:scale-95 ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20 dark:bg-indigo-950/20 dark:border-indigo-500' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl w-10 h-10 flex items-center justify-center ${item.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 tracking-wide">{item.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Job Title */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                  Job Title
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Add a short title (e.g., Fix Leaky Kitchen Tap)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 py-3 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/40 dark:focus:ring-indigo-500/40 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all font-semibold"
                  required
                />
              </div>

              {/* Job Description */}
              <div className="flex flex-col gap-1.5 text-left">
                <div className="flex items-center justify-between ml-1">
                  <label htmlFor="description" className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Job Description
                  </label>
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg"
                    onClick={handleImproveDescription}
                    disabled={improving}
                  >
                    {improving ? (
                      <span className="h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 fill-current" />
                    )}
                    AI Improve
                  </button>
                </div>
                <textarea
                  id="description"
                  placeholder="Tell us more about the job... Mention any specific issues, urgency, or materials needed."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 py-3 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/40 dark:focus:ring-indigo-500/40 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all font-semibold"
                  required
                />
              </div>

              {/* Next Step Controls */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/home')}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (!title || !description) {
                      addToast('Please fill out the title and description fields first', 'warning');
                      return;
                    }
                    setStep(2);
                  }}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-md"
                >
                  Next Step <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1.5 mb-2">
                <h2 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-wide">Where and when?</h2>
                <p className="text-xs text-slate-400 font-medium">Set the timeline and service location for your task.</p>
              </div>

              {/* Location inputs (Address & Pin Code) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                    Street Address
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                      <MapPin className="h-4 w-4" />
                    </div>
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={onAutocompleteLoad}
                        onPlaceChanged={onPlaceChanged}
                        className="w-full"
                      >
                        <input
                          id="address"
                          type="text"
                          placeholder="e.g. Bandra West, Mumbai"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                          className="w-full rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 py-3 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/40 focus:border-indigo-600 transition-all font-semibold"
                          required
                        />
                      </Autocomplete>
                    ) : (
                      <input
                        id="address"
                        type="text"
                        placeholder="Loading maps API..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full rounded-2xl border bg-slate-100 dark:bg-slate-800 py-3 pl-10 pr-4 text-xs font-semibold"
                        disabled
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 400050"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 py-3 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/40 focus:border-indigo-600 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Map Locate Utility */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSearchAddress}
                  disabled={!isLoaded || !address}
                  className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-250 rounded-xl transition-all"
                >
                  Locate Address on Map
                </button>
              </div>

              {/* Google Map Panel */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-indigo-650" /> Proximity Pinpoint
                </label>
                {isLoaded ? (
                  <div className="w-full aspect-[2/1] rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80 shadow-inner">
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={coordinates}
                      zoom={14}
                      onClick={handleMapClick}
                      options={{
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                      }}
                    >
                      <MarkerF
                        position={coordinates}
                        draggable={true}
                        onDragEnd={handleMarkerDragEnd}
                      />
                      <CircleF
                        center={coordinates}
                        radius={radius * 1000}
                        options={{
                          fillColor: '#4f46e5',
                          fillOpacity: 0.1,
                          strokeColor: '#4f46e5',
                          strokeOpacity: 0.5,
                          strokeWeight: 1.5,
                          clickable: false,
                          editable: false,
                        }}
                      />
                    </GoogleMap>
                  </div>
                ) : (
                  <div className="w-full aspect-[2/1] bg-slate-100 dark:bg-slate-900 border border-slate-200/60 rounded-2xl flex items-center justify-center text-xs text-slate-400 animate-pulse">
                    Loading Google Map interface...
                  </div>
                )}
              </div>

              {/* Radius slider */}
              <div className="space-y-1 text-left">
                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ml-1">
                  <span>Match Radius Limit</span>
                  <span className="text-indigo-650 font-black">{radius} km</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Timing Selection */}
              <div className="space-y-2.5 text-left">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                  Timing Selection
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTimingOption('urgent')}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      timingOption === 'urgent'
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20 dark:bg-indigo-950/20 dark:border-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-850 dark:text-slate-150">As soon as possible</span>
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    </div>
                    <span className="text-[10px] text-slate-400 leading-normal mt-1">Within 2-4 hours for urgent needs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimingOption('flexible')}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      timingOption === 'flexible'
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20 dark:bg-indigo-950/20 dark:border-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    <span className="font-extrabold text-xs text-slate-850 dark:text-slate-150">In the next few days</span>
                    <span className="text-[10px] text-slate-400 leading-normal mt-1">Most flexible scheduling options</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimingOption('specific')}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      timingOption === 'specific'
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20 dark:bg-indigo-950/20 dark:border-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    <span className="font-extrabold text-xs text-slate-850 dark:text-slate-150">Pick specific date</span>
                    <span className="text-[10px] text-slate-400 leading-normal mt-1">Schedule for a precise calendar day</span>
                  </button>
                </div>

                {timingOption === 'specific' && (
                  <div className="mt-3 animate-fadeIn">
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={specificDate}
                      onChange={(e) => setSpecificDate(e.target.value)}
                      className="w-full max-w-xs rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-slate-800 dark:text-slate-200"
                    />
                  </div>
                )}
              </div>

              {/* Photos Drag & Drop Area */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                  Upload Photos
                </label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/30 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-850/30 transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <UploadCloud className="h-8 w-8 text-slate-400 group-hover:text-indigo-650 transition-colors mb-2" />
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Drag & drop job photos</span>
                  <span className="text-[10px] text-slate-400 mt-1 font-medium">Show the problem area (Max 5 photos, JPG or PNG)</span>
                </div>

                {photos.length > 0 && (
                  <div className="flex gap-3 flex-wrap pt-3">
                    {photos.map((url, idx) => (
                      <div key={idx} className="relative h-16 w-16 rounded-xl overflow-hidden border border-slate-200 group shadow-sm">
                        <img src={url} alt="job preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 p-0.5 bg-slate-900/80 text-white rounded-full hover:bg-slate-900 transition-opacity opacity-80 hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step Navigation controls */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Back
                </button>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (!address) {
                      addToast('Please input a service address or select it on the map', 'warning');
                      return;
                    }
                    if (timingOption === 'specific' && !specificDate) {
                      addToast('Please select a specific date for execution', 'warning');
                      return;
                    }
                    setStep(3);
                  }}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-md"
                >
                  Next Step <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1.5 mb-2">
                <h2 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-wide">Set your budget</h2>
                <p className="text-xs text-slate-400 font-medium">Select a range that fits the scale of your home project.</p>
              </div>

              {/* Budget Preset Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <button
                  type="button"
                  onClick={() => handlePresetSelect('small')}
                  className={`p-5 rounded-2xl border flex flex-col justify-between h-[110px] transition-all transform active:scale-95 ${
                    budgetPreset === 'small'
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20 dark:bg-indigo-950/20 dark:border-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                  }`}
                >
                  <CreditCard className={`h-5 w-5 ${budgetPreset === 'small' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="block font-black text-sm text-slate-900 dark:text-white">₹1,000 - ₹3,000</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Small Fixes</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('standard')}
                  className={`p-5 rounded-2xl border flex flex-col justify-between h-[110px] transition-all transform active:scale-95 ${
                    budgetPreset === 'standard'
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20 dark:bg-indigo-950/20 dark:border-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                  }`}
                >
                  <Wallet className={`h-5 w-5 ${budgetPreset === 'standard' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="block font-black text-sm text-slate-900 dark:text-white">₹3,000 - ₹10,000</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Standard Repairs</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('complex')}
                  className={`p-5 rounded-2xl border flex flex-col justify-between h-[110px] transition-all transform active:scale-95 ${
                    budgetPreset === 'complex'
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20 dark:bg-indigo-950/20 dark:border-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                  }`}
                >
                  <Award className={`h-5 w-5 ${budgetPreset === 'complex' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="block font-black text-sm text-slate-900 dark:text-white">₹10,000+</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Complex Projects</span>
                  </div>
                </button>
              </div>

              {/* Slider for Budget */}
              <div className="space-y-2 text-left pt-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ml-1">Custom Slider Budget</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setBudget(val);
                        setBudgetPreset(val <= 3000 ? 'small' : val <= 10000 ? 'standard' : 'complex');
                      }}
                      className="w-24 text-right rounded-xl border border-slate-200 dark:border-slate-800 py-1.5 px-3 text-xs font-black focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="500"
                  max="40000"
                  step="500"
                  value={budget}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setBudget(val);
                    setBudgetPreset(val <= 3000 ? 'small' : val <= 10000 ? 'standard' : 'complex');
                  }}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase tracking-wider px-1">
                  <span>₹500</span>
                  <span>₹40,000+</span>
                </div>
              </div>

              {/* Privacy & Bidding Preference */}
              <div className="space-y-2.5 text-left border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                  Privacy & Bidding
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBiddingPrivacy('all')}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      biddingPrivacy === 'all'
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20 dark:bg-indigo-950/20 dark:border-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-650">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block font-extrabold text-xs text-slate-850 dark:text-slate-150">Allow all pros to bid</span>
                      <span className="text-[9px] text-slate-400 font-medium">Control who can see and bid on your job.</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBiddingPrivacy('invite')}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      biddingPrivacy === 'invite'
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20 dark:bg-indigo-950/20 dark:border-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-650">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block font-extrabold text-xs text-slate-850 dark:text-slate-150">Invite specific pros</span>
                      <span className="text-[9px] text-slate-400 font-medium">Only invite selected service providers.</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Summary Card Preview */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 flex gap-4 text-left items-center shadow-sm">
                <div className="h-14 w-14 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center flex-shrink-0 text-indigo-600 border border-indigo-100 dark:border-indigo-900/30">
                  {React.createElement(
                    CATEGORY_ITEMS.find(c => c.id === serviceType)?.icon || Droplet,
                    { className: 'h-6 w-6' }
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{title || 'Bathroom Sink Repair'}</h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 truncate mt-0.5">
                    📍 {address || 'Mumbai, Maharashtra'} &bull; ⏱️ {
                      timingOption === 'urgent' ? 'ASAP (Emergency)' :
                      timingOption === 'flexible' ? 'Next few days' : `Scheduled for ${specificDate}`
                    }
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="block font-black text-sm text-indigo-600 dark:text-indigo-400">₹{budget.toLocaleString()}</span>
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Est. Budget</span>
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Back
                </button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-650 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-md"
                >
                  Post Job <Sparkles className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
export { PostJob };
