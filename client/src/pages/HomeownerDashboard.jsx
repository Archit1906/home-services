import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Wrench, FileText, UserCheck, MessageSquare, Star, 
  Heart, CreditCard, User, Settings, HelpCircle, Plus, MapPin, 
  Bell, ChevronDown, ClipboardList, ShieldAlert, AlertCircle, ArrowRight
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
  const { user, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const { initSocket, socket } = useChatStore();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 2,
    applications: 7,
    hiredWorkers: 1,
    pendingReviews: 0
  });

  // Recent applications mock to match the visual specification
  const [recentApplications, setRecentApplications] = useState([
    {
      id: 'app-1',
      workerId: 'w-1',
      name: 'Suresh Yadav',
      category: 'Plumber',
      experience: 5,
      matchScore: 92,
      photoURL: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'
    }
  ]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      const myJobs = data.jobs.filter(job => job.userId === user?.id);
      setJobs(myJobs);

      // Adjust stats based on real data if available
      setStats({
        activeJobs: myJobs.filter(j => j.status === 'open').length || 2,
        applications: myJobs.reduce((acc, j) => acc + (j.aiMatchCache?.length || 0), 0) || 7,
        hiredWorkers: myJobs.filter(j => j.status === 'assigned').length || 1,
        pendingReviews: 0
      });
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-text-primary dark:text-text-darkPrimary font-body">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-border/20 flex flex-col justify-between p-6 h-screen sticky top-0 flex-shrink-0">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 font-display text-lg font-black text-primary cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <span>HomeConnect</span>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl bg-primary-light dark:bg-slate-800 text-primary transition-all text-left">
              <LayoutDashboard className="h-4.5 w-4.5" /> Dashboard
            </button>
            <button onClick={() => addToast('Navigating to My Jobs...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-text-primary hover:bg-slate-50 dark:hover:bg-slate-850 transition-all text-left">
              <Wrench className="h-4.5 w-4.5" /> My Jobs
            </button>
            <button onClick={() => addToast('Viewing Applications...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-text-primary hover:bg-slate-50 dark:hover:bg-slate-850 transition-all text-left">
              <FileText className="h-4.5 w-4.5" /> Applications
            </button>
            <button onClick={() => addToast('Viewing Hired Workers...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-text-primary hover:bg-slate-50 dark:hover:bg-slate-850 transition-all text-left">
              <UserCheck className="h-4.5 w-4.5" /> Hired Workers
            </button>
            <button onClick={() => navigate('/messages/default')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-text-primary hover:bg-slate-50 dark:hover:bg-slate-850 transition-all text-left">
              <MessageSquare className="h-4.5 w-4.5" /> Messages
            </button>
            <button onClick={() => addToast('Viewing Reviews...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-text-primary hover:bg-slate-50 dark:hover:bg-slate-850 transition-all text-left">
              <Star className="h-4.5 w-4.5" /> Reviews
            </button>
            <button onClick={() => addToast('Viewing Saved Workers...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-text-primary hover:bg-slate-50 dark:hover:bg-slate-850 transition-all text-left">
              <Heart className="h-4.5 w-4.5" /> Saved Workers
            </button>
            <button onClick={() => addToast('Viewing Payments...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-text-primary hover:bg-slate-50 dark:hover:bg-slate-850 transition-all text-left">
              <CreditCard className="h-4.5 w-4.5" /> Payments
            </button>
            <button onClick={() => addToast('Opening Profile Settings...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-text-primary hover:bg-slate-50 dark:hover:bg-slate-850 transition-all text-left">
              <User className="h-4.5 w-4.5" /> Profile
            </button>
            <button onClick={() => addToast('Opening Account Settings...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-text-primary hover:bg-slate-50 dark:hover:bg-slate-850 transition-all text-left">
              <Settings className="h-4.5 w-4.5" /> Settings
            </button>
          </nav>
        </div>

        {/* Footer Sidebar Action */}
        <div className="space-y-4">
          <button onClick={() => addToast('Contacting Support...', 'info')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-text-secondary hover:text-text-primary hover:bg-slate-50 dark:hover:bg-slate-850 transition-all text-left">
            <HelpCircle className="h-4.5 w-4.5" /> Help & Support
          </button>
          <button onClick={logout} className="w-full text-xs font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-3 rounded-xl transition-all text-left pl-4">
            Logout Account
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT REGION */}
      <main className="flex-grow p-8 overflow-y-auto">
        
        {/* Upper Header Profile Row */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Avatar src={user?.photoURL} name={user?.name || 'Ramesh Kumar'} size="md" />
            <div>
              <h1 className="text-2xl font-display font-black tracking-tight leading-tight">
                Good morning, {user?.name?.split(' ')[0] || 'Ramesh'}! 👋
              </h1>
              <p className="text-xs text-text-secondary font-bold uppercase tracking-wider mt-0.5">
                Manage your home services in one place &bull; Homeowner
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-3 bg-white dark:bg-slate-900 border border-border/20 rounded-full hover:shadow transition-all text-text-secondary hover:text-text-primary">
              <Bell className="h-5 w-5" />
            </button>
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="h-5 w-5" />}
              onClick={() => navigate('/dashboard/home/post-job')}
              className="bg-primary hover:bg-primary-dark shadow-default hover:shadow-elevated px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl"
            >
              Post a New Job
            </Button>
          </div>
        </header>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white p-5 flex items-center gap-4 border border-border/10 shadow-sm">
            <div className="p-3 bg-primary-light text-primary rounded-2xl">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-display font-black leading-none">{stats.activeJobs}</div>
              <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1">Active Jobs</div>
            </div>
          </Card>

          <Card className="bg-white p-5 flex items-center gap-4 border border-border/10 shadow-sm">
            <div className="p-3 bg-primary-light text-primary rounded-2xl">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-display font-black leading-none">{stats.applications}</div>
              <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1">Applications</div>
            </div>
          </Card>

          <Card className="bg-white p-5 flex items-center gap-4 border border-border/10 shadow-sm">
            <div className="p-3 bg-primary-light text-primary rounded-2xl">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-display font-black leading-none">{stats.hiredWorkers}</div>
              <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1">Hired Workers</div>
            </div>
          </Card>

          <Card className="bg-white p-5 flex items-center gap-4 border border-border/10 shadow-sm">
            <div className="p-3 bg-primary-light text-primary rounded-2xl">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-display font-black leading-none">{stats.pendingReviews}</div>
              <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1">Pending Reviews</div>
            </div>
          </Card>
        </div>

        {/* Dashboard Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Job Posts Feed (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-display font-black uppercase tracking-wider text-text-primary">Recent Job Posts</h2>
              <button onClick={() => addToast('View All Jobs clicked...', 'info')} className="text-xs font-bold text-primary hover:underline">View All</button>
            </div>

            {loading ? (
              <div className="space-y-3">
                <Skeleton height="70px" />
                <Skeleton height="70px" />
              </div>
            ) : jobs.length === 0 ? (
              <Card className="p-12 text-center text-xs text-text-secondary">
                No active jobs posted yet. Click "+ Post a New Job" to recruit service pros.
              </Card>
            ) : (
              <div className="space-y-3.5">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/dashboard/home/matches/${job.id}`)}
                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 dark:bg-slate-900 border border-border/15 hover:border-primary/20 rounded-2xl cursor-pointer transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary-light dark:bg-slate-800 text-primary rounded-xl">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm leading-tight text-text-primary">{job.title}</h4>
                        <p className="text-[10px] text-text-secondary font-semibold mt-1 uppercase tracking-wide">
                          {job.serviceType} &bull; {job.address}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <span className="text-[11px] font-bold text-text-secondary">
                        {job.aiMatchCache?.length || 0} Applications
                      </span>
                      <Badge variant={job.status === 'open' ? 'primary' : 'success'}>
                        {job.status === 'open' ? 'Active' : 'Assigned'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Applications Sidebar panel (Right col) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-display font-black uppercase tracking-wider text-text-primary">Recent Applications</h2>
              <button onClick={() => addToast('View All Applications clicked...', 'info')} className="text-xs font-bold text-primary hover:underline">View All</button>
            </div>

            {recentApplications.map((app) => (
              <Card key={app.id} className="p-5 bg-white border border-border/15 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Avatar src={app.photoURL} name={app.name} size="md" />
                  <div>
                    <h3 className="font-bold text-sm leading-tight">{app.name}</h3>
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-0.5">
                      {app.category} &bull; {app.experience} Years Exp
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-border/10 rounded-xl p-3">
                  <div>
                    <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Match Score</span>
                    <div className="text-base font-display font-black text-emerald-500">{app.matchScore}%</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-slate-100 text-xs px-4 py-2 font-bold"
                    onClick={() => navigate(`/profile/${app.workerId}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>

        </div>

      </main>
    </div>
  );
}
export { HomeownerDashboard };
