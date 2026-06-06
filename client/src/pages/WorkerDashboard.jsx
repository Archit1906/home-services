import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Search, FileText, Calendar, CreditCard, Star, 
  Clock, MessageSquare, User, UserCheck, Settings, HelpCircle, Bell, ChevronDown, 
  MapPin, CheckCircle, ArrowRight, DollarSign, Laptop, TrendingUp, Menu
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

  const [recommendedJobs, setRecommendedJobs] = useState([
    {
      id: 'mock-rec-1',
      title: 'Plumber Needed',
      description: 'Bathroom Repair',
      address: 'Andheri West',
      budget: '800 - ₹1,200',
      matchScore: 92,
      serviceType: 'Plumbing'
    },
    {
      id: 'mock-rec-2',
      title: 'Pipeline Installation',
      description: 'Full-time',
      address: 'Goregaon East',
      budget: '15,000 - ₹18,000',
      matchScore: 88,
      serviceType: 'Plumbing'
    },
    {
      id: 'mock-rec-3',
      title: 'Urgent: Water Leakage',
      description: 'Emergency repair',
      address: 'Malad West',
      budget: '600 - ₹900',
      matchScore: 95,
      serviceType: 'Plumbing'
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  // Mock stats to match Suresh Yadav's mock view in specifications
  const [stats, setStats] = useState({
    jobsApplied: 12,
    interviews: 4,
    activeJobs: 2,
    totalEarnings: 18450
  });

  const [earningsGoal, setEarningsGoal] = useState({
    current: 18450,
    target: 25000
  });

  const loadWorkerData = async () => {
    setLoading(true);
    try {
      // 1. Fetch worker applications to set stats
      const appsRes = await fetch('/api/workers/profile/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const appsData = await appsRes.json();
      
      // 2. Fetch Jobs
      const jobsRes = await fetch('/api/jobs');
      const jobsData = await jobsRes.json();

      if (appsRes.ok && appsData.applications) {
        const apps = appsData.applications;
        setStats({
          jobsApplied: apps.length || 12,
          interviews: apps.filter(a => a.status === 'shortlisted').length || 4,
          activeJobs: apps.filter(a => a.status === 'hired').length || 2,
          totalEarnings: 18450
        });
      }

      if (jobsRes.ok && jobsData.jobs) {
        // Filter jobs matching category or show recent open ones
        const list = jobsData.jobs.filter(j => j.status === 'open');
        if (list.length > 0) {
          setRecommendedJobs(list.map(job => ({
            id: job.id,
            title: job.title,
            description: job.description,
            address: job.address,
            budget: `${job.budget}`,
            matchScore: 92,
            serviceType: job.serviceType
          })).slice(0, 3));
        }
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
      if (user.role === 'user') {
        navigate('/dashboard/home');
        return;
      }
      if (user.role === 'admin') {
        navigate('/admin');
        return;
      }
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: `I have ${worker.experience} years of experience as a service professional. Let me assist you!`
        })
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-text-primary dark:text-text-darkPrimary font-body">
      
      {/* Global Top Header in Green Theme */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-border/20 px-6 flex items-center justify-between z-10 sticky top-0 flex-shrink-0">
        <div className="flex items-center gap-6">
          {/* Logo in Green */}
          <div className="flex items-center gap-2.5 font-display text-lg font-black text-emerald-600 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-9 w-9 bg-emerald-100 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-emerald-600" />
            </div>
            <span>HomeConnect</span>
          </div>
          {/* Hamburger Menu Toggle */}
          <button onClick={() => addToast('Sidebar menu toggled', 'info')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-text-secondary transition-all">
            <Menu className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-text-secondary hover:text-emerald-600 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2.5 pl-2 border-l border-border/20">
            <Avatar src={user?.photoURL} name={user?.name || 'Suresh Yadav'} size="sm" />
            <div className="hidden sm:block text-left leading-none">
              <span className="block text-xs font-black text-text-primary">{user?.name || 'Suresh Yadav'}</span>
              <span className="text-[10px] text-text-secondary font-bold uppercase mt-0.5 block">
                {worker?.serviceType || 'Plumber'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Layout Container */}
      <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* 1. LEFT SIDEBAR */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-border/20 flex flex-col justify-between p-6 overflow-y-auto flex-shrink-0">
          <div className="space-y-6">
            {/* Menu Items */}
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 transition-all text-left">
                <LayoutDashboard className="h-4.5 w-4.5" /> Dashboard
              </button>
              <button onClick={() => navigate('/dashboard/worker/jobs')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-850 transition-all text-left">
                <Search className="h-4.5 w-4.5" /> Find Jobs
              </button>
              <button onClick={() => addToast('Viewing Applications...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-850 transition-all text-left">
                <FileText className="h-4.5 w-4.5" /> My Applications
              </button>
              <button onClick={() => addToast('Viewing Bookings...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-850 transition-all text-left">
                <Calendar className="h-4.5 w-4.5" /> My Bookings
              </button>
              <button onClick={() => addToast('Viewing Earnings...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-850 transition-all text-left">
                <CreditCard className="h-4.5 w-4.5" /> Earnings
              </button>
              <button onClick={() => addToast('Viewing Reviews...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-850 transition-all text-left">
                <Star className="h-4.5 w-4.5" /> Reviews
              </button>
              <button onClick={() => addToast('Opening Availability Calendar...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-850 transition-all text-left">
                <Clock className="h-4.5 w-4.5" /> Availability
              </button>
              <button onClick={() => navigate('/messages/default')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-850 transition-all text-left">
                <MessageSquare className="h-4.5 w-4.5" /> Messages
              </button>
              <button onClick={() => navigate(`/profile/${worker?.id}`)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-850 transition-all text-left">
                <User className="h-4.5 w-4.5" /> Profile
              </button>
              <button onClick={() => addToast('Opening Settings...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-850 transition-all text-left">
                <Settings className="h-4.5 w-4.5" /> Settings
              </button>
            </nav>
          </div>

          {/* Footer Sidebar Action */}
          <div className="space-y-2 pt-4 border-t border-border/10">
            <button onClick={() => addToast('Contacting Support...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-850 transition-all text-left">
              <HelpCircle className="h-4.5 w-4.5" /> Help & Support
            </button>
            <button onClick={logout} className="w-full text-xs font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-3 rounded-xl transition-all text-left pl-4">
              Logout Account
            </button>
          </div>
        </aside>

        {/* 2. MAIN CONTENT REGION */}
        <main className="flex-grow p-8 overflow-y-auto">
          
          {/* Aligned Header: Greeting on left, CTA on right */}
          <header className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-display font-black tracking-tight leading-tight">
                Good morning, {user?.name?.split(' ')[0] || 'Suresh'}! 👋
              </h1>
              <p className="text-xs text-text-secondary font-bold uppercase tracking-wider mt-0.5">
                Find jobs, grow your skills and earn more
              </p>
            </div>
            
            <Button
              variant="primary"
              size="md"
              icon={<Search className="h-4.5 w-4.5" />}
              onClick={() => navigate('/dashboard/worker/jobs')}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-default hover:shadow-elevated px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-white border-none"
            >
              Find Jobs
            </Button>
          </header>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white p-5 flex items-center gap-4 border border-border/15 shadow-sm hover:translate-y-0 hover:shadow-sm">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-2xl">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-display font-black leading-none text-text-primary">{stats.jobsApplied}</div>
                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1.5">Jobs Applied</div>
              </div>
            </Card>

            <Card className="bg-white p-5 flex items-center gap-4 border border-border/15 shadow-sm hover:translate-y-0 hover:shadow-sm">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-2xl">
                <Laptop className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-display font-black leading-none text-text-primary">{stats.interviews}</div>
                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1.5">Interviews</div>
              </div>
            </Card>

            <Card className="bg-white p-5 flex items-center gap-4 border border-border/15 shadow-sm hover:translate-y-0 hover:shadow-sm">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-2xl">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-display font-black leading-none text-text-primary">{stats.activeJobs}</div>
                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1.5">Active Jobs</div>
              </div>
            </Card>

            <Card className="bg-white p-5 flex items-center gap-4 border border-border/15 shadow-sm hover:translate-y-0 hover:shadow-sm">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-2xl">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-display font-black leading-none text-emerald-650 dark:text-emerald-400">₹{stats.totalEarnings.toLocaleString()}</div>
                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1.5">Total Earnings</div>
              </div>
            </Card>
          </div>

          {/* Dashboard Panels Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recommended Jobs feed (Left 2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-display font-black uppercase tracking-wider text-text-primary">Recommended Jobs for You</h2>
                <button onClick={() => navigate('/dashboard/worker/jobs')} className="text-xs font-bold text-emerald-600 hover:underline">View All</button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  <Skeleton height="70px" />
                  <Skeleton height="70px" />
                </div>
              ) : (
                <div className="space-y-3.5">
                  {recommendedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-slate-900 border border-border/15 rounded-2xl transition-all shadow-sm hover:shadow"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="p-3 bg-emerald-50 dark:bg-slate-800 text-emerald-600 rounded-xl">
                          <Search className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm leading-tight text-text-primary">{job.title}</h4>
                          <p className="text-[10px] text-text-secondary font-semibold mt-1 uppercase tracking-wide flex items-center gap-1.5">
                            <span>{job.description}</span> &bull; 
                            <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3 text-emerald-600" /> {job.address}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-none border-border/10">
                        <div className="text-right">
                          <span className="font-black text-sm text-emerald-600 block">₹{job.budget}</span>
                          <span className="text-[8px] font-bold text-text-secondary uppercase">Today</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                            {job.matchScore}% Match
                          </span>
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-xs px-4 py-2 font-bold text-white border-none"
                            onClick={() => handleApply(job.id)}
                            loading={submittingId === job.id}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly Earnings Progress Overview panel (Right col) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-display font-black uppercase tracking-wider text-text-primary">Earnings Overview</h2>
                <select className="text-xs font-bold text-text-secondary border-none bg-transparent focus:outline-none cursor-pointer">
                  <option>This Month</option>
                  <option>Last Month</option>
                </select>
              </div>

              <Card className="p-6 bg-white border border-border/15 flex flex-col gap-6 hover:translate-y-0 hover:shadow-sm">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Goal Achievement</div>
                  <div className="text-3xl font-display font-black text-emerald-600">
                    ₹{earningsGoal.current.toLocaleString()}{' '}
                    <span className="text-sm font-semibold text-text-secondary">
                      / ₹{earningsGoal.target.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progress visual bar */}
                <div className="space-y-2">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden border border-border/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentageProgress}%` }}
                      transition={{ duration: 0.8 }}
                      className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary">
                    <span>{percentageProgress}% of Monthly Goal</span>
                    <span>₹{(earningsGoal.target - earningsGoal.current).toLocaleString()} remaining</span>
                  </div>
                </div>
              </Card>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
export { WorkerDashboard };
