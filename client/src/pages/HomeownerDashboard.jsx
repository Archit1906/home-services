import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MessageSquare, AlertCircle, Wrench, Shield, Calendar, MapPin, DollarSign, Clock, Users, ArrowRight, Star } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';
import { useChatStore } from '../store/chatStore.js';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Modal from '../components/ui/Modal.jsx';
import Input from '../components/ui/Input.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';

export default function HomeownerDashboard() {
  const { user, token } = useAuthStore();
  const { addToast } = useToastStore();
  const { initSocket, socket } = useChatStore();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);

  // Job creation form fields
  const [serviceType, setServiceType] = useState('Plumbing');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [hours, setHours] = useState('2');
  const [experience, setExperience] = useState('1');
  const [address, setAddress] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [autoImprove, setAutoImprove] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Matches/Applications View modal
  const [activeJobForMatches, setActiveJobForMatches] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch jobs');
      
      // Filter jobs belonging to current homeowner
      const myJobs = data.jobs.filter(job => job.userId === user?.id);
      setJobs(myJobs);
    } catch (err) {
      addToast(err.message || 'Error loading dashboard feeds', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyJobs();
      initSocket(user.id);
    }
  }, [user]);

  // Real-time socket event binding for applications
  useEffect(() => {
    if (socket) {
      socket.on('new_application', (payload) => {
        addToast(`New candidate applied for job: "${payload.jobTitle}" with AI score: ${payload.compatibilityScore}%!`, 'success');
        fetchMyJobs();
      });
      return () => {
        socket.off('new_application');
      };
    }
  }, [socket]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!title || !description || !address) {
      addToast('Please fill out all required fields', 'warning');
      return;
    }

    setSubmitLoading(true);
    try {
      // Mock coordinates for New York/Los Angeles
      const lat = 40.7128 + (Math.random() - 0.5) * 0.05;
      const lng = -74.0060 + (Math.random() - 0.5) * 0.05;

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
          location: { address, lat, lng },
          radius: 10,
          isEmergency,
          autoImprove
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Job creation failed');

      addToast(data.notes || 'Job request posted successfully!', 'success');
      setShowPostModal(false);
      
      // Reset form fields
      setTitle('');
      setDescription('');
      setBudget('');
      setAddress('');
      setIsEmergency(false);
      setAutoImprove(false);

      fetchMyJobs();
    } catch (err) {
      addToast(err.message || 'Failed to post job request', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleViewMatches = async (job) => {
    setActiveJobForMatches(job);
    setMatchesLoading(true);
    setMatches([]);
    try {
      const res = await fetch(`/api/jobs/${job.id}/matches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load recommendations');
      setMatches(data.matches || []);
    } catch (err) {
      addToast(err.message || 'Error fetching matches', 'error');
    } finally {
      setMatchesLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-text-primary dark:text-text-darkPrimary p-6 md:p-12">
      {/* Top Banner Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight mb-2">
            Welcome Back, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{user?.name}</span>
          </h1>
          <p className="text-text-secondary dark:text-text-darkSecondary text-sm font-semibold tracking-wide flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" /> {user?.city} Area &bull; Homeowner Account
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="h-5 w-5" />}
            onClick={() => setShowPostModal(true)}
          >
            Post a New Job
          </Button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Feeds / Jobs List (Left Col) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border/20 pb-4">
            <h2 className="text-xl font-display font-extrabold flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" /> Your Posted Requests
            </h2>
            <Badge variant="neutral">{jobs.length} Active</Badge>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton height="150px" />
              <Skeleton height="150px" />
            </div>
          ) : jobs.length === 0 ? (
            <Card className="text-center py-16 flex flex-col items-center gap-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-text-secondary">
                <Wrench className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">No job posts yet</h3>
                <p className="text-sm text-text-secondary max-w-sm">
                  Describe what you need fixed or cleaned, and let verified experts apply to work.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setShowPostModal(true)}>
                Create First Post
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {jobs.map((job) => (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card className="relative overflow-hidden hover:shadow-elevated transition-shadow duration-300">
                      {job.isEmergency && (
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-danger" />
                      )}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={job.isEmergency ? 'danger' : 'primary'}>
                              {job.serviceType}
                            </Badge>
                            {job.isEmergency && (
                              <Badge variant="danger" className="animate-pulse">
                                Urgent
                              </Badge>
                            )}
                            <span className="text-xs text-text-secondary font-semibold">
                              Posted {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg">{job.title}</h3>
                          <p className="text-sm text-text-secondary line-clamp-2">{job.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-display font-black text-primary">
                            ₹{job.budget}
                          </div>
                          <div className="text-xs text-text-secondary font-bold uppercase tracking-wider">
                            Estimated Budget
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-border/10">
                        <div className="flex items-center gap-4 text-xs font-semibold text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" /> {job.hours} hrs expected
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> Start {new Date(job.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-initial"
                            onClick={() => handleViewMatches(job)}
                          >
                            View AI Matches
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Quick Actions Panel (Right Col) */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-extrabold border-b border-border/20 pb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Quick Action Panel
          </h2>

          <Card className="space-y-4">
            <h3 className="font-bold text-base mb-2">Available Actions</h3>
            <div className="space-y-2.5">
              <button
                onClick={() => setShowPostModal(true)}
                className="w-full flex items-center justify-between p-4 bg-primary-light hover:bg-primary hover:text-white text-primary rounded-2xl transition-all font-bold text-sm group"
              >
                <span className="flex items-center gap-2.5">
                  <Plus className="h-5 w-5" /> Post New Job Request
                </span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => addToast('Search workers feature coming soon!', 'info')}
                className="w-full flex items-center justify-between p-4 border border-border dark:border-border-dark hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all font-bold text-sm group"
              >
                <span className="flex items-center gap-2.5">
                  <Search className="h-5 w-5 text-text-secondary" /> Search Verified Service Pros
                </span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => addToast('Conversation list feature coming soon!', 'info')}
                className="w-full flex items-center justify-between p-4 border border-border dark:border-border-dark hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all font-bold text-sm group"
              >
                <span className="flex items-center gap-2.5">
                  <MessageSquare className="h-5 w-5 text-text-secondary" /> Open Chat Messages
                </span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Card>

          {/* Quick Stats Summary Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
            <h3 className="font-bold text-base mb-4">Activity Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border/10 shadow-sm text-center">
                <div className="text-2xl font-display font-black text-primary">
                  {jobs.filter(j => j.isEmergency).length}
                </div>
                <div className="text-xs text-text-secondary font-bold uppercase mt-1">Urgent Posts</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border/10 shadow-sm text-center">
                <div className="text-2xl font-display font-black text-secondary">
                  {jobs.filter(j => j.status === 'assigned').length}
                </div>
                <div className="text-xs text-text-secondary font-bold uppercase mt-1">Assigned</div>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* MODAL: Post a New Job Request */}
      <Modal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        title="Post a New Job Request"
      >
        <form onSubmit={handlePostJob} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">
              Service Category
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full rounded-input border bg-white dark:bg-slate-900 border-border dark:border-border-dark py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all duration-200 text-text-primary dark:text-text-darkPrimary"
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
            label="Job Request Title"
            id="jobTitle"
            placeholder="e.g. Clean kitchen grease or fix sink pipeline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="jobDesc" className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">
              Detailed Description
            </label>
            <textarea
              id="jobDesc"
              placeholder="Provide clean and detailed requirements of the task..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-input border bg-white dark:bg-slate-900 border-border dark:border-border-dark py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all duration-200 text-text-primary dark:text-text-darkPrimary placeholder-text-secondary/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Estimated Budget (₹)"
              id="jobBudget"
              type="number"
              placeholder="e.g. 1500"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
            <Input
              label="Experience Required (Yrs)"
              id="jobExp"
              type="number"
              placeholder="e.g. 2"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />
          </div>

          <Input
            label="Service Location Address"
            id="jobAddress"
            placeholder="e.g. Section 4, New York"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            icon={<MapPin className="h-5 w-5" />}
            required
          />

          <div className="flex flex-col gap-2 py-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="rounded border-border text-danger focus:ring-danger/25 h-4 w-4 mt-0.5"
              />
              <span className="text-xs text-text-secondary font-semibold">
                Mark as <span className="text-danger font-bold uppercase">Emergency / Urgent</span> request
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoImprove}
                onChange={(e) => setAutoImprove(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary/20 h-4 w-4 mt-0.5"
              />
              <span className="text-xs text-text-secondary font-semibold">
                Auto-professionalize description using Gemini AI
              </span>
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowPostModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={submitLoading}
            >
              Submit Post
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: View AI Matches */}
      <Modal
        isOpen={activeJobForMatches !== null}
        onClose={() => setActiveJobForMatches(null)}
        title="AI Candidate Recommendations"
        size="lg"
      >
        {matchesLoading ? (
          <div className="space-y-4 py-8">
            <Skeleton height="80px" />
            <Skeleton height="80px" />
            <Skeleton height="80px" />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-8 w-8 text-text-secondary mx-auto mb-2" />
            <p className="text-sm font-semibold text-text-secondary">
              No matching service pros found in your radius yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-xs text-text-secondary font-semibold mb-4 leading-relaxed">
              We ranked these local professionals using AI scores computed from skill keyword overlaps, experience levels, and city proximity.
            </p>
            {matches.map((match) => (
              <Card key={match.worker.id} className="p-4 border border-border/10 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={match.worker.user.photoURL}
                      name={match.worker.user.name}
                      size="md"
                    />
                    <div>
                      <h4 className="font-bold text-sm">{match.worker.user.name}</h4>
                      <p className="text-xs text-text-secondary line-clamp-1 font-medium">{match.worker.headline}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Badge variant="success" className="text-[10px] py-0.5 px-2">
                          {match.worker.experience} Yrs Exp
                        </Badge>
                        <Badge variant="primary" className="text-[10px] py-0.5 px-2">
                          {match.worker.verificationStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-emerald-600 dark:text-emerald-400 font-display font-black text-lg">
                      <Star className="h-4 w-4 fill-current" /> {match.score}%
                    </div>
                    <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Match Score</span>
                  </div>
                </div>

                <div className="text-xs text-text-secondary bg-white dark:bg-slate-900 border border-border/10 rounded-xl p-3 mt-4 italic">
                  <strong>AI Explanation:</strong> {match.explanation}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
export { HomeownerDashboard };
