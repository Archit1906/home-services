import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Wrench, FileText, UserCheck, MessageSquare, Star, 
  Heart, CreditCard, User, Settings, HelpCircle, Plus, MapPin, 
  Bell, ChevronDown, ClipboardList, ShieldAlert, AlertCircle, ArrowRight, Menu,
  Briefcase, Users, ChefHat, Bolt, Sparkles, Sprout, Hammer, Paintbrush, Activity, Laptop,
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
 
export default function HomeownerDashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const { initSocket, socket } = useChatStore();
 
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    applications: 0,
    hiredWorkers: 0,
    pendingReviews: 0
  });
 
  const [recentApplications, setRecentApplications] = useState([]);

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
    return CATEGORY_THEME[category] || { icon: Wrench, color: 'text-slate-400 bg-slate-500/10' };
  };

  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRelativeTimeString = (dateInput) => {
    const date = new Date(dateInput);
    const now = new Date();
    
    // Normalize times to midnight to compute absolute day difference
    const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = nowMidnight - dateMidnight;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return 'Posted today';
    } else if (diffDays === 1) {
      return 'Posted 1 day ago';
    } else {
      return `Posted ${diffDays} days ago`;
    }
  };

  // Weather Dynamic headings
  const weatherByCity = {
    'Jodhpur': 'Jodhpur • 32°C, clear — a good day to get that fan installed',
    'Mumbai': 'Mumbai • 28°C, cloudy — a good day to get that leakage fixed',
    'Delhi': 'Delhi • 35°C, sunny — perfect day for AC maintenance',
    'Bengaluru': 'Bengaluru • 22°C, drizzle — perfect day for indoor repairs',
    'Chennai': 'Chennai • 30°C, humid — good day for a clean-up',
    'Pune': 'Pune • 24°C, pleasant — great day to update home electricals',
    'Kolkata': 'Kolkata • 29°C, rain — perfect day to stay inside and fix things',
    'Ahmedabad': 'Ahmedabad • 36°C, hot — check your AC units'
  };

  const userCity = user?.city || 'Jodhpur';
  const cityWeather = weatherByCity[userCity] || `${userCity} • 26°C, clear — perfect day for home service tasks`;

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs/my-jobs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      const myJobs = data.jobs || [];
      setJobs(myJobs);

      // Compute stats dynamically
      const activeJobsCount = myJobs.filter(j => j.status === 'open').length;
      const hiredWorkersCount = myJobs.filter(j => j.status === 'assigned').length;

      // Extract and format all applications across all jobs
      const allApps = [];
      myJobs.forEach(job => {
        if (job.applications) {
          job.applications.forEach(app => {
            allApps.push({
              id: app.id,
              jobId: job.id,
              jobTitle: job.title,
              workerId: app.workerId,
              name: app.worker?.user?.name || 'Anonymous Pro',
              photoURL: app.worker?.user?.photoURL,
              category: job.serviceType,
              experience: app.worker?.experience || 0,
              matchScore: app.compatibilityScore || 50,
              status: app.status,
              createdAt: app.createdAt
            });
          });
        }
      });

      // Sort by date (newest first)
      allApps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setStats({
        activeJobs: activeJobsCount,
        applications: allApps.length,
        hiredWorkers: hiredWorkersCount,
        pendingReviews: 0
      });

      setRecentApplications(allApps);
    } catch (err) {
      console.error(err);
      addToast('Error loading dashboard feeds', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'worker') {
        navigate('/dashboard/worker');
        return;
      }
      if (user.role === 'admin') {
        navigate('/admin');
        return;
      }
      loadDashboardData();
      initSocket(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('new_application', (payload) => {
        addToast(`New application for "${payload.jobTitle}" with Match Score: ${payload.compatibilityScore}%`, 'success');
        loadDashboardData();
      });
      return () => socket.off('new_application');
    }
  }, [socket]);

  const displayedApps = recentApplications.slice(0, 2);
  const remainingApps = recentApplications.slice(2);

  let waitingBanner = null;
  const pendingRemaining = remainingApps.filter(app => app.status === 'pending' || app.status === 'applied' || app.status === 'open');
  if (pendingRemaining.length > 0) {
    const countsByJob = {};
    pendingRemaining.forEach(app => {
      countsByJob[app.jobTitle] = (countsByJob[app.jobTitle] || 0) + 1;
    });

    let maxJobTitle = '';
    let maxCount = 0;
    Object.keys(countsByJob).forEach(title => {
      if (countsByJob[title] > maxCount) {
        maxCount = countsByJob[title];
        maxJobTitle = title;
      }
    });

    if (maxJobTitle) {
      const matchingApp = pendingRemaining.find(app => app.jobTitle === maxJobTitle);
      waitingBanner = {
        text: `${maxCount} more application${maxCount > 1 ? 's' : ''} waiting on ${maxJobTitle}`,
        jobId: matchingApp?.jobId
      };
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f11] flex flex-col text-white font-body selection:bg-primary/30">
      
      {/* Global Top Header */}
      <header className="h-16 bg-[#161618] border-b border-zinc-800/50 px-6 flex items-center justify-between z-10 sticky top-0 flex-shrink-0">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 font-display text-lg font-black text-primary cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <span>HomeConnect</span>
          </div>
          {/* Hamburger Menu Toggle */}
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
            <Avatar src={user?.photoURL} name={user?.name || 'Homeowner'} size="sm" />
            <div className="hidden sm:block text-left leading-none">
              <span className="block text-xs font-black text-white">{user?.name}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 block">Homeowner</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Layout Container */}
      <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* 1. LEFT SIDEBAR */}
        <aside className="w-64 bg-[#121214] border-r border-zinc-800/40 flex flex-col justify-between p-6 overflow-y-auto flex-shrink-0">
          <div className="space-y-6">
            {/* Menu Items */}
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl bg-[#1c1c1e] text-white transition-all text-left">
                <LayoutDashboard className="h-4.5 w-4.5 text-primary" /> Dashboard
              </button>
              <button onClick={() => addToast('Navigating to My Jobs...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <Wrench className="h-4.5 w-4.5" /> My Jobs
              </button>
              <button onClick={() => addToast('Viewing Applications...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <FileText className="h-4.5 w-4.5" /> Applications
              </button>
              <button onClick={() => addToast('Viewing Hired Workers...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <UserCheck className="h-4.5 w-4.5" /> Hired Workers
              </button>
              <button onClick={() => navigate('/messages/default')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <MessageSquare className="h-4.5 w-4.5" /> Messages
              </button>
              <button onClick={() => addToast('Viewing Reviews...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <Star className="h-4.5 w-4.5" /> Reviews
              </button>
              <button onClick={() => addToast('Viewing Saved Workers...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <Heart className="h-4.5 w-4.5" /> Saved Workers
              </button>
              <button onClick={() => addToast('Viewing Payments...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <CreditCard className="h-4.5 w-4.5" /> Payments
              </button>
              <button onClick={() => addToast('Opening Profile Settings...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <User className="h-4.5 w-4.5" /> Profile
              </button>
              <button onClick={() => addToast('Opening Account Settings...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
                <Settings className="h-4.5 w-4.5" /> Settings
              </button>
            </nav>
          </div>

          {/* Footer Sidebar Action */}
          <div className="space-y-2 pt-4 border-t border-zinc-800/40">
            <button onClick={() => addToast('Contacting Support...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800/40 transition-all text-left">
              <HelpCircle className="h-4.5 w-4.5" /> Help & Support
            </button>
            <button onClick={logout} className="w-full text-xs font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-950/20 p-3 rounded-xl transition-all text-left pl-4">
              Logout Account
            </button>
          </div>
        </aside>

        {/* 2. MAIN CONTENT REGION */}
        <main className="flex-grow p-8 overflow-y-auto bg-[#0f0f11]">
          
          {/* Aligned Header: Greeting on left, CTA on right */}
          <header className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-black tracking-tight leading-tight">
                Good morning, {user?.name?.split(' ')[0] || 'Homeowner'}
              </h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                {cityWeather}
              </p>
            </div>
            
            <button
              onClick={() => navigate('/dashboard/home/post-job')}
              className="bg-primary hover:bg-primary-dark shadow-default flex items-center gap-1.5 px-4.5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-white transition-all hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" /> Post a new job
            </button>
          </header>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#1a2333]/40 border border-[#2b3a4a]/40 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Active jobs</span>
                <Briefcase className="h-4.5 w-4.5 text-blue-400/80" />
              </div>
              <div className="text-3xl font-display font-black text-blue-100">{stats.activeJobs}</div>
            </div>

            <div className="bg-[#2b2214]/40 border border-[#3f311c]/40 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Applications</span>
                <ClipboardList className="h-4.5 w-4.5 text-amber-400/80" />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-display font-black text-amber-100">{stats.applications}</div>
                {stats.applications > 0 && (
                  <span className="text-[8px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    +3 this week
                  </span>
                )}
              </div>
            </div>

            <div className="bg-[#122b1c]/40 border border-[#1a3f29]/40 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Hired workers</span>
                <UserCheck className="h-4.5 w-4.5 text-emerald-400/80" />
              </div>
              <div className="text-3xl font-display font-black text-emerald-100">{stats.hiredWorkers}</div>
            </div>

            <div className="bg-[#18181b]/40 border border-[#27272a]/40 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending reviews</span>
                <Star className="h-4.5 w-4.5 text-slate-400/80" />
              </div>
              <div className="text-3xl font-display font-black text-slate-100">{stats.pendingReviews}</div>
            </div>
          </div>

          {/* Dashboard Panels Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Recent Job Posts Feed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-display font-black uppercase tracking-wider text-white">Recent job posts</h2>
                <button onClick={() => addToast('Viewing all job posts...', 'info')} className="text-xs font-bold text-blue-400 hover:text-blue-300">View all</button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  <div className="h-[75px] bg-[#1c1c1e] animate-pulse rounded-2xl border border-zinc-800/40" />
                  <div className="h-[75px] bg-[#1c1c1e] animate-pulse rounded-2xl border border-zinc-800/40" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="p-8 bg-[#1c1c1e] border border-zinc-800/40 rounded-2xl text-center space-y-3">
                  <div className="h-10 w-10 bg-blue-950 text-blue-400 rounded-full flex items-center justify-center mx-auto">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white">No active job posts yet</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Post a service request to start matching with local professionals.</p>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard/home/post-job')}
                    className="inline-flex items-center gap-1 text-xs text-blue-400 font-bold hover:underline"
                  >
                    Post a Job &rarr;
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {jobs.map((job) => {
                    const theme = getCategoryTheme(job.serviceType);
                    const CategoryIcon = theme.icon;
                    return (
                      <div
                        key={job.id}
                        onClick={() => navigate(`/dashboard/home/matches/${job.id}`)}
                        className="w-full flex items-center justify-between p-4 bg-[#1c1c1e] border border-zinc-800/60 hover:border-zinc-700/80 rounded-2xl cursor-pointer transition-all hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${theme.color}`}>
                            <CategoryIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm leading-tight text-white">{job.title}</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
                              {job.description.split('.')[0]} &bull; {getRelativeTimeString(job.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-[11px] font-bold text-slate-400">
                            {job.applications?.length || 0} application{(job.applications?.length !== 1) ? 's' : ''}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            job.status === 'open' 
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                              : 'bg-zinc-800 border border-zinc-700 text-slate-400'
                          }`}>
                            {job.status === 'open' ? 'Active' : 'Awaiting response'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Applications Sidebar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-display font-black uppercase tracking-wider text-white">Recent applications</h2>
                <button onClick={() => addToast('Viewing all applications...', 'info')} className="text-xs font-bold text-blue-400 hover:text-blue-300">View all</button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  <div className="h-[120px] bg-[#1c1c1e] animate-pulse rounded-2xl border border-zinc-800/40" />
                  <div className="h-[120px] bg-[#1c1c1e] animate-pulse rounded-2xl border border-zinc-800/40" />
                </div>
              ) : recentApplications.length === 0 ? (
                <div className="p-8 bg-[#1c1c1e] border border-zinc-800/40 rounded-2xl text-center space-y-3">
                  <div className="h-10 w-10 bg-amber-950 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white">No applications received yet</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Applications from matched local professionals will show up here.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedApps.map((app) => (
                    <div key={app.id} className="p-5 bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl flex flex-col gap-4 hover:border-zinc-700/80 transition-all shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-950 text-indigo-200 flex items-center justify-center font-black text-xs border border-indigo-900/40">
                          {getInitials(app.name)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm leading-tight text-white">{app.name}</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            {app.category} &bull; {app.experience} years exp
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/40">
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">Match score</span>
                          <div className="text-base font-display font-black text-emerald-450 mt-0.5 leading-none">{app.matchScore}%</div>
                        </div>
                        <button
                          className="bg-transparent border border-zinc-850 hover:bg-zinc-800 text-xs px-4 py-2 font-bold rounded-xl text-white transition-all"
                          onClick={() => navigate(`/profile/${app.workerId}`)}
                        >
                          View profile
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Banner for extra pending applications */}
                  {waitingBanner && (
                    <div className="bg-[#1c1c1e] border border-zinc-800/50 rounded-2xl p-4 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-300">{waitingBanner.text}</span>
                      <button
                        onClick={() => navigate(`/dashboard/home/matches/${waitingBanner.jobId}`)}
                        className="text-blue-400 hover:text-blue-300 font-bold hover:underline"
                      >
                        Review them
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
export { HomeownerDashboard };
