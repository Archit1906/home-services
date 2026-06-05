import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, DollarSign, Clock, Calendar, ArrowLeft, Star, Heart, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';
import { useFilterStore } from '../store/filterStore.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';

export default function BrowseJobs() {
  const navigate = useNavigate();
  const { user, worker, token } = useAuthStore();
  const { addToast } = useToastStore();
  
  const { jobFilters, setJobFilter, resetJobFilters } = useFilterStore();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobIds, setAppliedJobIds] = useState([]);

  // Application sub-state
  const [selectedJobForApp, setSelectedJobForApp] = useState(null);
  const [pitchMessage, setPitchMessage] = useState('');
  const [appLoading, setAppLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch worker applications to track already applied
      const appsRes = await fetch('/api/workers/profile/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const appsData = await appsRes.json();
      if (appsRes.ok) {
        setAppliedJobIds((appsData.applications || []).map(a => a.jobId));
      }

      // 2. Build Query Parameters
      const params = new URLSearchParams();
      if (jobFilters.serviceType) params.append('serviceType', jobFilters.serviceType);
      if (jobFilters.minBudget) params.append('minBudget', jobFilters.minBudget);
      if (jobFilters.isEmergency) params.append('isEmergency', jobFilters.isEmergency);
      if (jobFilters.city) params.append('city', jobFilters.city);
      if (jobFilters.search) params.append('search', jobFilters.search);

      // 3. Fetch Jobs
      const jobsRes = await fetch(`/api/jobs?${params.toString()}`);
      const jobsData = await jobsRes.json();
      if (!jobsRes.ok) throw new Error(jobsData.message);
      
      setJobs(jobsData.jobs || []);
    } catch (err) {
      addToast(err.message || 'Failed to search job database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [jobFilters]);

  const handleApplyClick = (job) => {
    setSelectedJobForApp(job);
    setPitchMessage(`Hello! I am ${user.name}, an expert ${job.serviceType} professional with ${worker.experience} years of experience. I would love to complete this request for you.`);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!pitchMessage) {
      addToast('Please enter a pitch introduction message', 'warning');
      return;
    }

    setAppLoading(true);
    try {
      const res = await fetch(`/api/jobs/${selectedJobForApp.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: pitchMessage })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Application submission failed');

      addToast('Application submitted successfully!', 'success');
      setSelectedJobForApp(null);
      loadData(); // Reload applied list
    } catch (err) {
      addToast(err.message || 'Failed to submit application', 'error');
    } finally {
      setAppLoading(false);
    }
  };

  // Helper: calculate compatibility score locally
  const calculateMatchScore = (job) => {
    let score = 55;
    const skills = worker?.skills || [];
    const headline = worker?.headline || '';
    const jobKeywords = `${job.title} ${job.description} ${job.serviceType}`.toLowerCase();

    // Skill matches
    let skillOverlaps = 0;
    skills.forEach(s => {
      if (jobKeywords.includes(s.toLowerCase())) skillOverlaps++;
    });
    score += Math.min(20, skillOverlaps * 6);

    // Experience match
    if (worker?.experience >= job.experience) {
      score += 15;
    } else {
      score -= 10;
    }

    // Proximity
    if (job.address.includes(user?.city)) {
      score += 10;
    }

    return Math.max(15, Math.min(100, score));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-text-primary dark:text-text-darkPrimary p-6 md:p-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/dashboard/worker')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-bold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        <span className="text-xs text-text-secondary font-bold uppercase tracking-widest bg-slate-200/50 dark:bg-slate-900/50 px-4 py-1 rounded-full border border-border/10">
          Job Board Marketplace
        </span>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Filters Panel Card */}
        <Card className="p-6 bg-white/70 dark:bg-slate-900/70 border border-border/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Search Input */}
            <div className="lg:col-span-2 relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-text-secondary pointer-events-none" />
              <input
                type="text"
                placeholder="Search job keyword..."
                value={jobFilters.search}
                onChange={(e) => setJobFilter('search', e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-input py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white dark:focus:bg-slate-900 transition-all border border-border/5"
              />
            </div>

            {/* Category Select */}
            <select
              value={jobFilters.serviceType}
              onChange={(e) => setJobFilter('serviceType', e.target.value)}
              className="rounded-input border bg-slate-100 dark:bg-slate-800 border-border/5 py-3 px-4 text-sm focus:outline-none text-text-secondary font-medium"
            >
              <option value="">All Categories</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Gardening">Gardening</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Painting">Painting</option>
              <option value="HVAC">HVAC</option>
              <option value="Appliances">Appliances</option>
            </select>

            {/* Minimum Budget Input */}
            <select
              value={jobFilters.minBudget}
              onChange={(e) => setJobFilter('minBudget', e.target.value)}
              className="rounded-input border bg-slate-100 dark:bg-slate-800 border-border/5 py-3 px-4 text-sm focus:outline-none text-text-secondary font-medium"
            >
              <option value="">Any Budget</option>
              <option value="1000">₹1,000+ minimum</option>
              <option value="2500">₹2,500+ minimum</option>
              <option value="5000">₹5,000+ minimum</option>
            </select>

            {/* Emergency Check Toggle */}
            <button
              onClick={() => setJobFilter('isEmergency', jobFilters.isEmergency === 'true' ? '' : 'true')}
              className={`py-3 px-4 rounded-input font-bold text-xs uppercase tracking-wider transition-all border ${
                jobFilters.isEmergency === 'true'
                  ? 'border-danger/30 bg-rose-50 dark:bg-rose-950/20 text-danger shadow-inner'
                  : 'border-border/5 bg-slate-100 dark:bg-slate-800 text-text-secondary'
              }`}
            >
              Urgent / Emergency
            </button>
          </div>
          
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border/10">
            <button
              onClick={resetJobFilters}
              className="text-xs font-bold text-text-secondary hover:text-text-primary px-3 py-1.5 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </Card>

        {/* Listings Result */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton height="150px" />
            <Skeleton height="150px" />
          </div>
        ) : jobs.length === 0 ? (
          <Card className="text-center py-16 flex flex-col items-center gap-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-text-secondary">
              <Search className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-text-secondary">
              No matching open jobs found based on current active search filters.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const hasApplied = appliedJobIds.includes(job.id);
              const score = calculateMatchScore(job);
              const mockDistance = (3 + (job.title.length % 9) * 0.7).toFixed(1);

              return (
                <Card
                  key={job.id}
                  className="hover:shadow-elevated transition-shadow duration-300 relative overflow-hidden"
                >
                  {job.isEmergency && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-danger" />
                  )}
                  
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    
                    {/* Job content */}
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={job.isEmergency ? 'danger' : 'primary'} className="text-[9px]">
                          {job.serviceType}
                        </Badge>
                        {job.isEmergency && (
                          <Badge variant="danger" className="text-[9px] animate-pulse">
                            Urgent
                          </Badge>
                        )}
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded">
                          {score}% AI Match
                        </span>
                      </div>
                      <h3 className="font-bold text-lg leading-snug">{job.title}</h3>
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                        {job.description}
                      </p>
                    </div>

                    {/* Pricing info */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-display font-black text-primary">
                        ₹{job.budget}
                      </div>
                      <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mt-1">
                        Offered Budget
                      </span>
                    </div>

                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-border/10">
                    <div className="flex items-center gap-4 text-[11px] font-bold text-text-secondary flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-emerald-500" /> {job.address} ({mockDistance} km away)
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-primary" /> {job.hours} hours work
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-primary" /> Start: {new Date(job.startDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* CTA Actions */}
                    <div className="w-full sm:w-auto">
                      {hasApplied ? (
                        <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 py-2 px-4 rounded-xl border border-emerald-500/10">
                          <Check className="h-4 w-4" /> Applied Successfully
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApplyClick(job)}
                        >
                          Apply to Job
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Apply Pitch Form */}
      <Modal
        isOpen={selectedJobForApp !== null}
        onClose={() => setSelectedJobForApp(null)}
        title={`Apply for job: "${selectedJobForApp?.title}"`}
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <p className="text-xs text-text-secondary leading-normal">
            Enter a pitch introduction explaining your credentials and details for the homeowner.
          </p>

          <div className="flex flex-col gap-1">
            <label htmlFor="pitchText" className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">
              Your Pitch Message
            </label>
            <textarea
              id="pitchText"
              rows={4}
              value={pitchMessage}
              onChange={(e) => setPitchMessage(e.target.value)}
              className="w-full rounded-input border bg-white dark:bg-slate-900 border-border dark:border-border-dark py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all duration-200 text-text-primary dark:text-text-darkPrimary"
              required
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setSelectedJobForApp(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={appLoading}
            >
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
export { BrowseJobs };
