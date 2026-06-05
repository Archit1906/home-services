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
  const [coordinates, setCoordinates] = useState({ lat: 40.7128, lng: -74.0060 });

  // AI states
  const [improving, setImproving] = useState(false);
  const [loadingSalaryGuide, setLoadingSalaryGuide] = useState(false);
  const [salaryGuide, setSalaryGuide] = useState(null);

  // Auto load salary suggestions when step 2 is active
  useEffect(() => {
    if (step === 2 && description) {
      fetchSalaryBand();
    }
  }, [step]);

  const fetchSalaryBand = async () => {
    setLoadingSalaryGuide(true);
    try {
      const res = await fetch('/api/jobs/suggest-salary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ serviceType, description })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSalaryGuide({
        min: data.minSalary,
        max: data.maxSalary,
        frequency: data.frequency,
        explanation: data.explanation
      });
    } catch (err) {
      console.error('Salary band suggestion failed', err);
    } finally {
      setLoadingSalaryGuide(false);
    }
  };

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

  const applySuggestedBudget = () => {
    if (salaryGuide) {
      const avg = Math.round((salaryGuide.min + salaryGuide.max) / 2);
      setBudget(avg.toString());
      addToast(`Applied standard average budget of ₹${avg}!`, 'info');
    }
  };

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    // Map relative click to simulated coordinates
    setCoordinates({
      lat: 40.7128 + (50 - y) * 0.005,
      lng: -74.0060 + (x - 50) * 0.005
    });
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
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

                {/* AI Salary suggested widget */}
                <div className="bg-slate-50 dark:bg-slate-900 border border-border/20 rounded-card p-4 space-y-3 relative overflow-hidden">
                  <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-primary">
                    <Sparkles className="h-4 w-4 fill-current text-primary" /> Gemini AI Rate recommendation
                  </div>
                  {loadingSalaryGuide ? (
                    <div className="space-y-2 py-2">
                      <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                      <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                    </div>
                  ) : salaryGuide ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-lg font-black text-text-primary dark:text-text-darkPrimary">
                          ₹{salaryGuide.min} - ₹{salaryGuide.max}{' '}
                          <span className="text-xs font-semibold text-text-secondary uppercase">
                            / {salaryGuide.frequency}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary leading-normal mt-1 italic">
                          {salaryGuide.explanation}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/10 text-xs w-full py-2 font-bold bg-white dark:bg-slate-900 border border-primary/25 rounded-xl mt-2"
                        onClick={applySuggestedBudget}
                      >
                        Apply Suggested Budget
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xs text-text-secondary py-2 flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-text-secondary" /> Fill in Step 1 to generate wage estimate.
                    </div>
                  )}
                </div>
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
              <Input
                label="Proximity Address Location"
                id="address"
                placeholder="e.g. Sector 5, New York"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                icon={<MapPin className="h-5 w-5" />}
                required
              />

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">
                  <span>Search Radius area</span>
                  <span className="text-primary font-bold">{radius} km</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Mock interactive map */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-primary" /> Pin Coordinates Pinpoint
                </label>
                <div
                  onClick={handleMapClick}
                  className="w-full aspect-[2/1] bg-slate-100 dark:bg-slate-900 border border-border/20 rounded-card relative overflow-hidden cursor-crosshair shadow-inner"
                >
                  {/* Grid Lines mockup */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:24px_24px] opacity-25" />
                  
                  {/* Simulated map graphic blobs */}
                  <div className="absolute top-10 left-12 w-28 h-28 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute bottom-6 right-20 w-44 h-24 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
                  
                  {/* Selected Marker */}
                  <div
                    className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none"
                    style={{
                      left: `${((coordinates.lng - (-74.0060)) / 0.05 + 10) * 5}%`,
                      top: `${(50 - (coordinates.lat - 40.7128) / 0.005)}%`
                    }}
                  >
                    <MapPin className="h-7 w-7 text-primary fill-primary/30 filter drop-shadow animate-bounce" />
                    <div className="bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow whitespace-nowrap mt-1">
                      Lat: {coordinates.lat.toFixed(4)}, Lng: {coordinates.lng.toFixed(4)}
                    </div>
                  </div>

                  <span className="absolute bottom-3 left-3 text-[10px] text-text-secondary bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded shadow">
                    Interactive Grid Mock: Click anywhere to drop pin
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
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
