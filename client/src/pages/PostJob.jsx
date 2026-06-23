import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles, MapPin, DollarSign, Calendar, Clock, Award, Info } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useJsApiLoader, GoogleMap, MarkerF, CircleF, Autocomplete } from '@react-google-maps/api';

export default function PostJob() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { addToast } = useToastStore();

  const [step, setStep] = useState(1);

  // Form Fields
  const [serviceType, setServiceType] = useState('Plumbing');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [budget, setBudget] = useState('');
  const [hours, setHours] = useState('4');
  const [experience, setExperience] = useState('1');
  const [address, setAddress] = useState('');
  const [radius, setRadius] = useState(10);
  const [coordinates, setCoordinates] = useState({ lat: 19.0760, lng: 72.8777 }); // Mumbai center default
  const [hasLocation, setHasLocation] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const [autocomplete, setAutocomplete] = useState(null);



  // AI states
  const [improving, setImproving] = useState(false);

  const handleImproveDescription = async () => {
    if (!title || !description) {
      addToast('Please enter both title and a basic description first', 'warning');
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

  const handleSubmit = async () => {
    try {
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
          hours: Number(hours),
          experience: Number(experience),
          location: { address, lat: coordinates.lat, lng: coordinates.lng },
          radius: Number(radius),
          isEmergency
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Post creation failed');

      addToast('Service job request posted successfully!', 'success');
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
        addToast('Location updated from search', 'success');
      } else {
        addToast('Address not found. Please try a different search or click on the map.', 'warning');
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-text-primary dark:text-text-darkPrimary p-6 md:p-12 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/dashboard/home')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-bold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel & Back
        </button>
        <span className="text-xs font-bold text-text-secondary uppercase tracking-widest bg-slate-200/50 dark:bg-slate-900/50 px-4 py-1.5 rounded-full border border-border/10">
          Step {step} of 3
        </span>
      </div>

      <Card className="max-w-3xl mx-auto shadow-elevated p-8 relative overflow-hidden">
        {/* Stepper Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/20">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= 1 ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-text-secondary'
            }`}>
              {step > 1 ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <span className={`text-sm font-bold ${step === 1 ? 'text-primary' : 'text-text-secondary'}`}>
              Basic Info
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-border dark:bg-border-dark mx-4" />
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= 2 ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-text-secondary'
            }`}>
              {step > 2 ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <span className={`text-sm font-bold ${step === 2 ? 'text-primary' : 'text-text-secondary'}`}>
              Details & Budget
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-border dark:bg-border-dark mx-4" />
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= 3 ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-text-secondary'
            }`}>
              3
            </div>
            <span className={`text-sm font-bold ${step === 3 ? 'text-primary' : 'text-text-secondary'}`}>
              Proximity Location
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
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">
                  Service Category
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full rounded-input border bg-white dark:bg-slate-900 border-border dark:border-border-dark py-3.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all duration-200 text-text-primary dark:text-text-darkPrimary"
                >
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Gardening">Gardening</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Painting">Painting</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Appliances">Appliances</option>
                </select>
              </div>

              <Input
                label="Job Post Title"
                id="title"
                placeholder="e.g. Fix bathroom pipeline leakage and switchboard"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5 relative">
                <div className="flex items-center justify-between ml-1">
                  <label htmlFor="description" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Task Requirements Description
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary-light gap-1.5 px-3 py-1.5 text-xs rounded-xl"
                    onClick={handleImproveDescription}
                    loading={improving}
                  >
                    <Sparkles className="h-3.5 w-3.5 fill-current" /> AI Improve
                  </Button>
                </div>
                <textarea
                  id="description"
                  placeholder="Explain exactly what you need fixed, hours, or any materials you will provide..."
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-input border bg-white dark:bg-slate-900 border-border dark:border-border-dark py-3.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all duration-200 text-text-primary dark:text-text-darkPrimary"
                  required
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl w-full">
                <input
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="rounded border-rose-300 text-danger focus:ring-danger/25 h-4 w-4"
                />
                <span className="text-xs text-rose-800 dark:text-rose-300 font-bold uppercase tracking-wider">
                  Mark this as an URGENT / Emergency request
                </span>
              </label>

              <div className="flex justify-end pt-4">
                <Button
                  variant="primary"
                  onClick={() => {
                    if (!title || !description) {
                      addToast('Please fill out the title and description fields first', 'warning');
                      return;
                    }
                    setStep(2);
                  }}
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  Continue
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Estimated Working Hours"
                  id="hours"
                  type="number"
                  placeholder="e.g. 4"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  icon={<Clock className="h-5 w-5" />}
                  required
                />
                <Input
                  label="Min Experience Required (Yrs)"
                  id="experience"
                  type="number"
                  placeholder="e.g. 2"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  icon={<Award className="h-5 w-5" />}
                  required
                />
              </div>

              <div>
                <Input
                  label="Budget Amount (₹)"
                  id="budget"
                  type="number"
                  placeholder="e.g. 2000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  icon={<DollarSign className="h-5 w-5" />}
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (!budget || Number(budget) <= 0) {
                      addToast('Please enter a budget amount', 'warning');
                      return;
                    }
                    setStep(3);
                  }}
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  Continue
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
              {/* Autocomplete wrapped address input */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-text-secondary dark:text-text-darkSecondary uppercase tracking-wider ml-1">
                  Proximity Address Location
                </label>
                <div className="flex gap-2">
                  <div className="relative flex items-center flex-grow">
                    <div className="absolute left-4 text-text-secondary pointer-events-none">
                      <MapPin className="h-5 w-5" />
                    </div>
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={onAutocompleteLoad}
                        onPlaceChanged={onPlaceChanged}
                        style={{ width: '100%' }}
                        className="w-full"
                      >
                        <input
                          id="address"
                          type="text"
                          placeholder="Search for your street, city, or neighborhood..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.preventDefault();
                          }}
                          className="w-full rounded-input border bg-white dark:bg-slate-900 border-border dark:border-border-dark py-3 px-4 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all duration-200 text-text-primary dark:text-text-darkPrimary placeholder-text-secondary/50 dark:placeholder-text-darkSecondary/40"
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
                        className="w-full rounded-input border bg-white dark:bg-slate-900 border-border dark:border-border-dark py-3 px-4 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all duration-200 text-text-primary dark:text-text-darkPrimary placeholder-text-secondary/50 dark:placeholder-text-darkSecondary/40"
                        disabled
                      />
                    )}
                  </div>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleSearchAddress}
                    disabled={!isLoaded || !address}
                    className="px-4 py-2 text-xs font-bold whitespace-nowrap bg-white border border-border hover:bg-slate-50 dark:bg-slate-900 dark:border-border-dark dark:hover:bg-slate-800"
                  >
                    Locate
                  </Button>
                </div>
              </div>

              {/* Radius slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">
                  <span>Search Radius area</span>
                  <span className="text-primary font-bold">{radius} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Map Board */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-primary" /> Proximity Pinpoint
                </label>
                
                {isLoaded ? (
                  <div className="w-full aspect-[2/1] rounded-card overflow-hidden border border-border/20 shadow-md">
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={coordinates}
                      zoom={13}
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
                          fillColor: '#3b82f6',
                          fillOpacity: 0.15,
                          strokeColor: '#3b82f6',
                          strokeOpacity: 0.6,
                          strokeWeight: 1.5,
                          clickable: false,
                          editable: false,
                          zIndex: 1,
                        }}
                      />
                    </GoogleMap>
                  </div>
                ) : (
                  <div className="w-full aspect-[2/1] bg-slate-100 dark:bg-slate-900 border border-border/20 rounded-card flex items-center justify-center text-xs text-text-secondary animate-pulse">
                    Loading interactive Google Map...
                  </div>
                )}
              </div>

              {/* Address label / debugging stats */}
              {hasLocation && (
                <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-2xl border border-border/10 flex flex-col gap-0.5 animate-fadeIn">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Selected Address</span>
                  <div className="text-xs font-bold text-text-primary leading-snug">
                    {address}
                  </div>
                  <div className="text-[9px] text-text-secondary/70 font-semibold mt-1">
                    Latitude: {coordinates.lat.toFixed(6)} &bull; Longitude: {coordinates.lng.toFixed(6)}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={!hasLocation || !address}
                  icon={<Check className="h-4 w-4" />}
                >
                  Submit Request
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
