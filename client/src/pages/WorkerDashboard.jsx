import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Search, FileText, Calendar, CreditCard, Star, 
  Clock, MessageSquare, User, UserCheck, Settings, HelpCircle, Bell, ChevronDown, 
  MapPin, CheckCircle, ArrowRight, DollarSign, Laptop, TrendingUp, Menu,
  Briefcase, Users, ChefHat, Bolt, Sparkles, Sprout, Hammer, Paintbrush, Activity,
  Droplet
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';
import { useChatStore } from '../store/chatStore.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const { user, worker, logout, token } = useAuthStore();
  const { addToast } = useToastStore();
  const { initSocket } = useChatStore();

  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  const [stats, setStats] = useState({
    jobsApplied: 0,
    interviews: 0,
    activeJobs: 0,
    totalEarnings: 0
  });

  const [earningsGoal, setEarningsGoal] = useState({
    current: 18450,
    target: 25000
  });

  const [weeklyJobs, setWeeklyJobs] = useState([]);

  // Category Icon & Color Mapping
  const CATEGORY_THEME = {
    'Plumbing': { icon: Droplet, color: 'text-blue-400 bg-blue-500/10' },
    'Electrical': { icon: Bolt, color: 'text-amber-400 bg-amber-500/10' },
    'Cleaning': { icon: Sparkles, color: 'text-purple-400 bg-purple-500/10' },
    'Gardening': { icon: Sprout, color: 'text-emerald-400 bg-emerald-500/10' },
    'Carpentry': { icon: Hammer, color: 'text-orange-400 bg-orange-500/10' },
    'Painting': { icon: Paintbrush, color: 'text-pink-400 bg-pink-500/10' },
    'HVAC': { icon: Activity, color: 'text-red-400 bg-red-500/10' },
    'Appliances': { icon: Laptop, color: 'text-teal-400 bg-teal-500/10' },
  };

  const getCategoryTheme = (category) => {
    return CATEGORY_THEME[category] || { icon: Briefcase, color: 'text-slate-400 bg-slate-500/10' };
  };

  const getRelativeTimeString = (dateInput) => {
    const date = new Date(dateInput);
    const now = new Date();
    const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = nowMidnight - dateMidnight;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const loadWorkerData = async () => {
    setLoading(true);
    try {
      const appsRes = await fetch('/api/workers/profile/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const appsData = await appsRes.json();
      const jobsRes = await fetch('/api/jobs');
      const jobsData = await jobsRes.json();

      let apps = [];
      if (appsRes.ok && appsData.applications) {
        apps = appsData.applications;
      }

      const hiredApps = apps.filter(a => a.status === 'hired' || a.status === 'assigned');
      const earningsSum = hiredApps.reduce((acc, app) => acc + (app.job?.budget || 0), 0);
      const totalEarnings = earningsSum || 18450;

      setStats({
        jobsApplied: apps.length,
        interviews: apps.filter(a => a.status === 'shortlisted' || a.status === 'interview').length || 4,
        activeJobs: hiredApps.length || 2,
        totalEarnings
      });

      setEarningsGoal({
        current: totalEarnings,
        target: 25000
      });

      const weeklyHired = hiredApps.map(app => {
        const titleWords = app.job?.title?.split(' ') || [];
        const shortTitle = titleWords.length > 2 ? `${titleWords[0]} ${titleWords[1]}` : app.job?.title || 'Service';
        return {
          title: shortTitle,
          address: app.job?.address?.split(',')[0]?.trim() || 'Block 4',
          budget: app.job?.budget || 1000
        };
      });
      setWeeklyJobs(weeklyHired.length > 0 ? weeklyHired : [
        { title: 'AC servicing', address: 'Block 4', budget: 2200 },
        { title: 'Tap repair', address: 'Block 9', budget: 950 }
      ]);

      if (jobsRes.ok && jobsData.jobs) {
        const openJobs = jobsData.jobs.filter(j => j.status === 'open');
        const matched = openJobs.map(job => {
          const cacheMatch = job.aiMatchCache?.find(m => m.workerId === worker?.id);
          const score = cacheMatch ? cacheMatch.score : (job.serviceType === worker?.serviceType ? 92 : 65);
          return {
            ...job,
            matchScore: score,
            distance: job.distance || (Math.floor(Math.random() * 8) + 1) + (Math.round(Math.random() * 9) / 10)
          };
        });
        matched.sort((a, b) => b.matchScore - a.matchScore);
        setRecommendedJobs(matched.slice(0, 3));
      }
    } catch (err) {
      console.error(err);
      addToast('Error synchronizing dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'user') { navigate('/dashboard/home'); return; }
      if (user.role === 'admin') { navigate('/admin'); return; }
      if (worker) {
        loadWorkerData();
        initSocket(user.id);
      }
    }
  }, [user, worker]);

  const handleApply = async (jobId) => {
    setSubmittingId(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: `I have experience as a service professional. Let me assist you!` })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit application');
      addToast('Application submitted successfully!', 'success');
      loadWorkerData();
    } catch (err) {
      addToast(err.message || 'Application failed', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const percentageProgress = Math.round((earningsGoal.current / earningsGoal.target) * 100);
  const workerCity = user?.city || 'Jodhpur';
  const workerArea = worker?.availabilityCalendar?.[0]?.day ? 'Block 8' : 'Block 2';
  const jobsCountText = recommendedJobs.length;

  return (
    <div className="min-h-screen bg-[#0f0f11] flex flex-col text-white font-body selection:bg-emerald-600/30">
      <header className="h-16 bg-[#161618] border-b border-zinc-800/50 px-6 flex items-center justify-between z-10 sticky top-0 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 font-display text-lg font-black text-emerald-500 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-9 w-9 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-emerald-500" />
            </div>
            <span>HomeConnect</span>
          </div>
          <button onClick={() => addToast('Sidebar menu toggled', 'info')} className="p-1.5 hover:bg-zinc-850 rounded-lg text-slate-400 hover:text-white transition-all">
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-zinc-850 rounded-full transition-all text-slate-400 hover:text-white relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-800/40">
            <Avatar src={user?.photoURL} name={user?.name || 'Worker'} size="sm" />
            <div className="hidden sm:block text-left leading-none">
              <span className="block text-xs font-black text-white">{user?.name}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 block">
                {worker?.headline?.split(' ')[1] || 'Professional'}
              </span>
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
        <aside className="w-64 bg-[#121214] border-r border-zinc-800/40 flex flex-col justify-between p-6 overflow-y-auto flex-shrink-0">
          <div className="space-y-6">
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl bg-[#1c1c1e] text-white transition-all text-left">
                <LayoutDashboard className="h-4.5 w-4.5 text-emerald-500" /> Dashboard
              </button>
              <button onClick={() => navigate('/dashboard/worker/jobs')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <Search className="h-4.5 w-4.5" /> Find Jobs
              </button>
              <button onClick={() => addToast('Viewing Applications...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <FileText className="h-4.5 w-4.5" /> My Applications
              </button>
              <button onClick={() => addToast('Viewing Bookings...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <Calendar className="h-4.5 w-4.5" /> My Bookings
              </button>
              <button onClick={() => addToast('Viewing Earnings...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <CreditCard className="h-4.5 w-4.5" /> Earnings
              </button>
              <button onClick={() => addToast('Viewing Reviews...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <Star className="h-4.5 w-4.5" /> Reviews
              </button>
              <button onClick={() => addToast('Opening Availability Calendar...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <Clock className="h-4.5 w-4.5" /> Availability
              </button>
              <button onClick={() => navigate('/messages/default')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <MessageSquare className="h-4.5 w-4.5" /> Messages
              </button>
              <button onClick={() => navigate(`/profile/${worker?.id}`)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <User className="h-4.5 w-4.5" /> Profile
              </button>
              <button onClick={() => addToast('Opening Settings...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <Settings className="h-4.5 w-4.5" /> Settings
              </button>
            </nav>
          </div>
          <div className="space-y-2 pt-4 border-t border-zinc-800/40">
            <button onClick={() => addToast('Contacting Support...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
              <HelpCircle className="h-4.5 w-4.5" /> Help & Support
            </button>
            <button onClick={logout} className="w-full text-xs font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-950/20 p-3 rounded-xl transition-all text-left pl-4">
              Logout Account
            </button>
          </div>
        </aside>
        <main className="flex-grow p-8 overflow-y-auto bg-[#0f0f11]">
          <header className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-black tracking-tight leading-tight">
                Good morning, {user?.name?.split(' ')[0] || 'Worker'}
              </h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                {jobsCountText} new job{jobsCountText === 1 ? '' : 's'} near you today — {workerCity}, {workerArea} area
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/worker/jobs')}
              className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 px-4.5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-white transition-all hover:scale-[1.02]"
            >
              <Search className="h-4 w-4" /> Find jobs
            </button>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#18181b]/40 border border-zinc-800/40 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Jobs applied</span>
                <FileText className="h-4.5 w-4.5 text-slate-400/80" />
              </div>
              <div className="text-3xl font-display font-black text-slate-100">{stats.jobsApplied}</div>
            </div>
            <div className="bg-[#eceffa] border border-transparent p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden text-[#1e1b4b]">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] text-[#4f46e5] font-bold uppercase tracking-wider">Interviews</span>
                <MessageSquare className="h-4.5 w-4.5 text-[#4f46e5]/80" />
              </div>
              <div className="text-3xl font-display font-black text-[#1e1b4b]">{stats.interviews}</div>
            </div>
            <div className="bg-[#1e3a8a]/40 border border-blue-900/30 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Active jobs</span>
                <Briefcase className="h-4.5 w-4.5 text-blue-400/80" />
              </div>
              <div className="text-3xl font-display font-black text-blue-100">{stats.activeJobs}</div>
            </div>
            <div className="bg-[#122b1c]/40 border border-emerald-900/30 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Total earnings</span>
                <TrendingUp className="h-4.5 w-4.5 text-emerald-400/80" />
              </div>
              <div className="text-3xl font-display font-black text-emerald-100">₹{stats.totalEarnings.toLocaleString()}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-display font-black uppercase tracking-wider text-white">Recommended jobs for you</h2>
                <button onClick={() => navigate('/dashboard/worker/jobs')} className="text-xs font-bold text-blue-400 hover:text-blue-300">View all</button>
              </div>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-[140px] bg-[#1c1c1e] animate-pulse rounded-2xl border border-zinc-800/40" />
                  <div className="h-[140px] bg-[#1c1c1e] animate-pulse rounded-2xl border border-zinc-800/40" />
                </div>
              ) : recommendedJobs.length === 0 ? (
                <div className="p-8 bg-[#1c1c1e] border border-zinc-800/40 rounded-2xl text-center space-y-3">
                  <div className="h-10 w-10 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white">No recommended jobs matching your profile</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Update your worker skills or search all open jobs to apply.</p>
                  </div>
                  <button onClick={() => navigate('/dashboard/worker/jobs')} className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold hover:underline">
                    Browse All Jobs &rarr;
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendedJobs.map((job) => {
                    const theme = getCategoryTheme(job.serviceType);
                    const CategoryIcon = theme.icon;
                    return (
                      <div key={job.id} className="p-5 bg-[#1c1c1e] border border-zinc-800/60 hover:border-zinc-700/80 rounded-2xl flex flex-col gap-4 shadow-sm transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${theme.color}`}>
                              <CategoryIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-white leading-tight">{job.title}</h4>
                              <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3 text-slate-500" /> {job.address?.split(',')[0]}</span> &bull; 
                                <span>{job.distance?.toFixed(1)} km</span> &bull; 
                                <span>{getRelativeTimeString(job.createdAt)}</span>
                              </p>
                            </div>
                          </div>
                          <span className="font-black text-sm text-emerald-400">₹{job.budget?.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-normal pl-1">{job.description}</p>
                        <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/40">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            job.matchScore >= 90 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            job.matchScore >= 70 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {job.matchScore}% match
                          </span>
                          <button
                            onClick={() => handleApply(job.id)}
                            disabled={submittingId === job.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-xs px-4.5 py-1.5 font-bold rounded-xl text-white transition-all ml-auto hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                          >
                            {submittingId === job.id ? 'Applying...' : 'Apply'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-display font-black uppercase tracking-wider text-white">Earnings overview</h2>
                  <span className="text-xs font-bold text-slate-400">This month</span>
                </div>
                <div className="p-6 bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl flex flex-col gap-6 shadow-sm">
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Goal Achievement</div>
                    <div className="text-3xl font-display font-black text-emerald-400">
                      ₹{earningsGoal.current.toLocaleString()}{' '}
                      <span className="text-sm font-semibold text-slate-400">/ ₹{earningsGoal.target.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full bg-[#27272a] h-3 rounded-full overflow-hidden border border-zinc-800/10">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${percentageProgress}%` }} transition={{ duration: 0.8 }} className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full" />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 pt-0.5">
                      <span>{percentageProgress}% of goal</span>
                      <span>₹{(earningsGoal.target - earningsGoal.current).toLocaleString()} left</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-emerald-400/90 font-bold pt-1 border-t border-zinc-800/40 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" /> On pace to hit your goal by the 27th
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">This week's jobs</div>
                <div className="p-5 bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl divide-y divide-zinc-800/40 shadow-sm">
                  {weeklyJobs.map((item, index) => (
                    <div key={index} className={`flex items-center justify-between text-xs py-3 ${index === 0 ? 'pt-0' : ''} ${index === weeklyJobs.length - 1 ? 'pb-0' : ''}`}>
                      <span className="font-bold text-slate-200">{item.title} — {item.address}</span>
                      <span className="font-black text-white">₹{item.budget.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
export { WorkerDashboard };
