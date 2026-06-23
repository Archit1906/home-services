import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Wrench, FileText, UserCheck, MessageSquare, Star, 
  Heart, CreditCard, User, Settings, HelpCircle, Plus, MapPin, 
  Bell, ChevronDown, ClipboardList, ShieldAlert, AlertCircle, ArrowRight, Menu,
  Briefcase, Users, ChefHat, Bolt, Sparkles, Sprout, Hammer, Paintbrush, Activity, Laptop,
  Droplet, Send, CheckCircle2, Phone, Video, Search as SearchIcon, Calendar
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';
import { useChatStore } from '../store/chatStore.js';
import Avatar from '../components/ui/Avatar.jsx';

// Custom inline SVG icons for Refrigerator/Spray Bottle
const RefrigeratorIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 2h14v20H5zM5 12h14" />
    <path d="M9 7h2M9 16h2" />
  </svg>
);

const SprayBottleIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 2h4M12 2v4M9 6h6v4H9z" />
    <path d="M9 10L6 14v7h12v-7l-3-4H9z" />
    <path d="M6 16h12" />
  </svg>
);

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

  // Sidebar / Tab Navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sub-filters for tabs
  const [myJobsFilter, setMyJobsFilter] = useState('all');
  const [appsFilter, setAppsFilter] = useState('received');
  const [reviewsFilter, setReviewsFilter] = useState('to-review');
  const [settingsSubTab, setSettingsSubTab] = useState('general');

  // Messages Tab interactive state
  const [activeChat, setActiveChat] = useState('ramesh');
  const [chatText, setChatText] = useState('');
  const [rameshMessages, setRameshMessages] = useState([
    { id: 1, sender: 'ramesh', text: "Hi Alex, I'm on my way", time: '10:30 AM' },
    { id: 2, sender: 'me', text: "Okay, please check the main bathroom pipes.", time: '10:31 AM' },
    { id: 3, sender: 'ramesh', text: "Sure, I will check and update you.", time: '10:32 AM' },
    { id: 4, sender: 'me', text: "Great, thanks!", time: '10:33 AM' }
  ]);
  const [sureshMessages, setSureshMessages] = useState([
    { id: 1, sender: 'suresh', text: "Thank you for selecting me!", time: 'Yesterday' }
  ]);
  const [poojaMessages, setPoojaMessages] = useState([
    { id: 1, sender: 'pooja', text: "Okay, will come tomorrow.", time: '2 days ago' }
  ]);

  // Review interaction state
  const [reviewsState, setReviewsState] = useState([
    { id: 'ramesh', name: 'Ramesh Kumar', category: 'Plumber', completedDate: '12 May 2024', rating: 0, text: '', submitted: false },
    { id: 'suresh', name: 'Suresh Yadav', category: 'Electrician', completedDate: '8 May 2024', rating: 0, text: '', submitted: false },
    { id: 'pooja', name: 'Pooja Sharma', category: 'House Cleaner', completedDate: '2 May 2024', rating: 0, text: '', submitted: false }
  ]);

  // Profile Edit fields
  const [profileName, setProfileName] = useState(user?.name || 'Alex');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'alex@example.com');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+91 98765 43210');
  const [profileCity, setProfileCity] = useState(user?.city || 'Udaipur, Rajasthan, India');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Settings Toggles state
  const [settingsToggles, setSettingsToggles] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    darkMode: true
  });

  // Search Help state
  const [helpSearchQuery, setHelpSearchQuery] = useState('');

  // Category Icon & Color Mapping
  const CATEGORY_THEME = {
    'Plumbing': { icon: Droplet, color: 'text-[#6b95d6] bg-[#2a3c5a]/40' },
    'Electrical': { icon: Bolt, color: 'text-[#fb923c] bg-[#3f281f]/40' },
    'Cleaning': { icon: SprayBottleIcon, color: 'text-[#4ade80] bg-[#1f3f35]/40' },
    'Appliances': { icon: RefrigeratorIcon, color: 'text-[#6b95d6] bg-[#2a3c5a]/40' },
    'Gardening': { icon: Sprout, color: 'text-emerald-450 bg-emerald-500/10' },
    'Carpentry': { icon: Hammer, color: 'text-orange-450 bg-orange-500/10' },
    'Painting': { icon: Paintbrush, color: 'text-pink-450 bg-pink-500/10' },
    'HVAC': { icon: Activity, color: 'text-red-450 bg-red-500/10' }
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
    const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = nowMidnight - dateMidnight;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    return `Posted ${diffDays} days ago`;
  };

  // Weather Dynamic headings
  const weatherByCity = {
    'Jodhpur': 'Jodhpur • 32°C, clear — a good day to get that fan installed',
    'Mumbai': 'Mumbai • 28°C, cloudy — a good day to get that leakage fixed',
    'Delhi': 'Delhi • 35°C, sunny — perfect day for AC maintenance',
    'Bengaluru': 'Bengaluru • 22°C, drizzle — perfect day for indoor repairs',
    'Ahmedabad': 'Ahmedabad • 36°C, hot — check your AC units',
    'Udaipur': 'Udaipur • 30°C, clear — great day to renovate home interiors'
  };

  const userCity = user?.city || 'Alex';
  const cityWeather = weatherByCity[userCity] || `${userCity} • 26°C, clear — perfect day for home service tasks`;

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs/my-jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      const myJobs = data.jobs || [];
      setJobs(myJobs);

      const activeJobsCount = myJobs.filter(j => j.status === 'open').length;
      const hiredWorkersCount = myJobs.filter(j => j.status === 'assigned').length;

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

      allApps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setStats({
        activeJobs: activeJobsCount || 2,
        applications: allApps.length || 5,
        hiredWorkers: hiredWorkersCount || 1,
        pendingReviews: reviewsState.filter(r => !r.submitted).length
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
      if (user.role === 'worker') { navigate('/dashboard/worker'); return; }
      if (user.role === 'admin') { navigate('/admin'); return; }
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

  // Chat message sending
  const sendMessage = () => {
    if (!chatText.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: chatText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (activeChat === 'ramesh') {
      setRameshMessages([...rameshMessages, newMsg]);
    } else if (activeChat === 'suresh') {
      setSureshMessages([...sureshMessages, newMsg]);
    } else if (activeChat === 'pooja') {
      setPoojaMessages([...poojaMessages, newMsg]);
    }
    setChatText('');
  };

  // Submit worker review
  const handleReviewSubmit = (id) => {
    const review = reviewsState.find(r => r.id === id);
    if (!review.rating) {
      addToast('Please select a star rating first', 'warning');
      return;
    }
    setReviewsState(
      reviewsState.map(r => r.id === id ? { ...r, submitted: true } : r)
    );
    setStats({
      ...stats,
      pendingReviews: Math.max(0, stats.pendingReviews - 1)
    });
    addToast(`Submitted review for ${review.name}`, 'success');
  };

  const handleRatingClick = (id, rating) => {
    setReviewsState(
      reviewsState.map(r => r.id === id ? { ...r, rating } : r)
    );
  };

  const handleReviewTextChange = (id, text) => {
    setReviewsState(
      reviewsState.map(r => r.id === id ? { ...r, text } : r)
    );
  };

  // Mock list fallbacks if no database objects exist
  const mockJobs = [
    { id: 'mock-1', title: 'Need a Plumber', description: 'Bathroom pipe leaking', serviceType: 'Plumbing', budget: 1000, minBudget: 800, maxBudget: 1200, applicants: 1, postedOn: '2 days ago', status: 'Active' },
    { id: 'mock-2', title: 'Looking for a Cook', description: 'Full-time - North Indian', serviceType: 'Cleaning', budget: 9000, minBudget: 8000, maxBudget: 10000, applicants: 2, postedOn: '5 days ago', status: 'Active' },
    { id: 'mock-3', title: 'Electrician Needed', description: 'Switch board repair', serviceType: 'Electrical', budget: 650, minBudget: 500, maxBudget: 800, applicants: 1, postedOn: '10 days ago', status: 'Completed' },
    { id: 'mock-4', title: 'House Cleaner', description: '3 BHK Deep Cleaning', serviceType: 'Cleaning', budget: 1350, minBudget: 1200, maxBudget: 1500, applicants: 4, postedOn: '15 days ago', status: 'Completed' }
  ];

  const mockApplications = [
    { id: 'app-1', name: 'Ramesh Kumar', category: 'Plumber', experience: 5, rating: 4.6, price: 1000, time: 'Applied 2 hours ago', status: 'received' },
    { id: 'app-2', name: 'Suresh Yadav', category: 'Electrician', experience: 7, rating: 4.8, price: 1200, time: 'Applied 5 hours ago', status: 'received' },
    { id: 'app-3', name: 'Vikram Singh', category: 'Plumber', experience: 3, rating: 4.2, price: 900, time: 'Applied 1 day ago', status: 'received' },
    { id: 'app-4', name: 'Amit Gupta', category: 'Carpenter', experience: 4, rating: 4.5, price: 1100, time: 'Applied 2 days ago', status: 'shortlisted' },
    { id: 'app-5', name: 'Manoj Verma', category: 'Plumber', experience: 9, rating: 4.7, price: 1400, time: 'Applied 3 days ago', status: 'shortlisted' }
  ];

  const mockHired = [
    { id: 'hired-1', name: 'Ramesh Kumar', category: 'Plumber', rating: 4.6, price: 1000, active: true },
    { id: 'hired-2', name: 'Suresh Yadav', category: 'Electrician', rating: 4.7, price: 800, active: false, status: 'Completed' },
    { id: 'hired-3', name: 'Pooja Sharma', category: 'House Cleaner', rating: 4.5, price: 1200, active: false, status: 'Completed' }
  ];

  const mockSaved = [
    { id: 'saved-1', name: 'Ramesh Kumar', category: 'Plumber', experience: 5, rating: 4.6, price: 1000 },
    { id: 'saved-2', name: 'Suresh Yadav', category: 'Electrician', experience: 7, rating: 4.7, price: 800 },
    { id: 'saved-3', name: 'Pooja Sharma', category: 'House Cleaner', experience: 4, rating: 4.5, price: 1200 },
    { id: 'saved-4', name: 'Amit Gupta', category: 'Carpenter', experience: 6, rating: 4.4, price: 1500 }
  ];

  const mockTransactions = [
    { id: 'tx-1', to: 'Ramesh Kumar', service: 'Plumbing Service', amount: 1000, date: '12 May 2024', status: 'Completed' },
    { id: 'tx-2', to: 'Suresh Yadav', service: 'Electrical Repair', amount: 800, date: '8 May 2024', status: 'Completed' },
    { id: 'tx-3', to: 'Pooja Sharma', service: 'House Cleaning', amount: 650, date: '2 May 2024', status: 'Completed' }
  ];

  // Resolve dynamic vs mock data for homeowner jobs
  const displayJobs = jobs.length > 0 ? jobs.map(j => ({
    id: j.id,
    title: j.title,
    description: j.description,
    serviceType: j.serviceType,
    budget: j.budget,
    minBudget: Math.round(j.budget * 0.8),
    maxBudget: Math.round(j.budget * 1.2),
    applicants: j.applications?.length || 0,
    postedOn: getRelativeTimeString(j.createdAt),
    status: j.status === 'open' ? 'Active' : 'Completed'
  })) : mockJobs;

  const displayApplications = recentApplications.length > 0 ? recentApplications.map(a => ({
    id: a.id,
    name: a.name,
    category: a.category,
    experience: a.experience,
    rating: a.matchScore >= 80 ? 4.8 : 4.4,
    price: Math.round(a.matchScore * 15),
    time: getRelativeTimeString(a.createdAt),
    status: a.status === 'shortlisted' ? 'shortlisted' : 'received'
  })) : mockApplications;

  // Filter Jobs List
  const filteredJobs = displayJobs.filter(j => {
    if (myJobsFilter === 'all') return true;
    if (myJobsFilter === 'active') return j.status === 'Active';
    if (myJobsFilter === 'completed') return j.status === 'Completed';
    if (myJobsFilter === 'cancelled') return j.status === 'Cancelled';
    return true;
  });

  // Filter Applications
  const filteredApps = displayApplications.filter(a => {
    if (appsFilter === 'received') return a.status === 'received';
    if (appsFilter === 'shortlisted') return a.status === 'shortlisted';
    if (appsFilter === 'rejected') return a.status === 'rejected';
    return true;
  });

  const getActiveChatMessages = () => {
    if (activeChat === 'ramesh') return rameshMessages;
    if (activeChat === 'suresh') return sureshMessages;
    if (activeChat === 'pooja') return poojaMessages;
    return [];
  };

  const getActiveChatName = () => {
    if (activeChat === 'ramesh') return 'Ramesh Kumar';
    if (activeChat === 'suresh') return 'Suresh Yadav';
    if (activeChat === 'pooja') return 'Pooja Sharma';
    return 'Anonymous';
  };

  const getActiveChatRole = () => {
    if (activeChat === 'ramesh') return 'Plumber';
    if (activeChat === 'suresh') return 'Electrician';
    if (activeChat === 'pooja') return 'House Cleaner';
    return 'Pro';
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] flex flex-col text-white font-body selection:bg-primary/30">
      
      {/* Global Header */}
      <header className="h-16 bg-[#161618] border-b border-zinc-800/50 px-6 flex items-center justify-between z-10 sticky top-0 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 font-display text-lg font-black text-primary cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary" />
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
            <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs border border-emerald-500/20">
              {getInitials(profileName)}
            </div>
            <div className="hidden sm:block text-left leading-none">
              <span className="block text-xs font-black text-white">{profileName}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 block">Homeowner</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-[#121214] border-r border-zinc-800/40 flex flex-col justify-between p-6 overflow-y-auto flex-shrink-0">
          <div className="space-y-6">
            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'my-jobs', label: 'My Jobs', icon: Wrench },
                { id: 'applications', label: 'Applications', icon: FileText },
                { id: 'hired-workers', label: 'Hired Workers', icon: UserCheck },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
                { id: 'reviews', label: 'Reviews', icon: Star },
                { id: 'saved-workers', label: 'Saved Workers', icon: Heart },
                { id: 'payments', label: 'Payments', icon: CreditCard },
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(item => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all text-left ${
                      isActive 
                        ? 'bg-[#1c1c1e] text-white font-black' 
                        : 'text-slate-400 hover:text-white hover:bg-zinc-800/40'
                    }`}
                  >
                    <IconComponent className={`h-4.5 w-4.5 ${isActive ? 'text-primary' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="space-y-2 pt-4 border-t border-zinc-800/40">
            <button 
              onClick={() => setActiveTab('help')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all text-left ${
                activeTab === 'help' 
                  ? 'bg-[#1c1c1e] text-white font-black' 
                  : 'text-slate-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <HelpCircle className="h-4.5 w-4.5" /> Help & Support
            </button>
            <button 
              onClick={() => setShowLogoutConfirm(true)} 
              className="w-full text-xs font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-950/20 p-3 rounded-xl transition-all text-left pl-4"
            >
              Logout Account
            </button>
          </div>
        </aside>

        {/* Dashboard Main View Container */}
        <main className="flex-grow p-8 overflow-y-auto bg-[#0f0f11]">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              <header className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-display font-black tracking-tight leading-tight">
                    Good morning, {profileName.split(' ')[0]}! 👋
                  </h1>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                    Here's what's happening with your home service hub today.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/home/post-job')}
                  className="bg-primary hover:bg-primary-dark shadow-default flex items-center gap-1.5 px-4.5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-white transition-all hover:scale-[1.02]"
                >
                  <Plus className="h-4 w-4" /> Post a new job
                </button>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1a2333]/40 border border-[#2b3a4a]/40 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Active jobs</span>
                    <Briefcase className="h-4.5 w-4.5 text-blue-450" />
                  </div>
                  <div className="text-3xl font-display font-black text-blue-100">{stats.activeJobs}</div>
                </div>

                <div className="bg-[#2b2214]/40 border border-[#3f311c]/40 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Applications</span>
                    <ClipboardList className="h-4.5 w-4.5 text-amber-450" />
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
                    <UserCheck className="h-4.5 w-4.5 text-emerald-450" />
                  </div>
                  <div className="text-3xl font-display font-black text-emerald-100">{stats.hiredWorkers}</div>
                </div>

                <div className="bg-[#18181b]/40 border border-[#27272a]/40 p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending reviews</span>
                    <Star className="h-4.5 w-4.5 text-slate-450" />
                  </div>
                  <div className="text-3xl font-display font-black text-slate-100">{stats.pendingReviews}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Job Posts */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-display font-black uppercase tracking-wider text-white">Recent Job Posts</h2>
                    <button onClick={() => setActiveTab('my-jobs')} className="text-xs font-bold text-blue-400 hover:text-blue-300">View all</button>
                  </div>

                  <div className="space-y-4">
                    {displayJobs.slice(0, 2).map((job) => {
                      const theme = getCategoryTheme(job.serviceType);
                      const CategoryIcon = theme.icon;
                      return (
                        <div key={job.id} className="p-5 bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl flex items-center justify-between hover:border-zinc-700/80 transition-all shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${theme.color} h-11 w-11 flex items-center justify-center`}>
                              <CategoryIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm leading-tight text-white">{job.title}</h4>
                              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
                                {job.description.split('.')[0]}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-5">
                            <span className="text-xs font-extrabold text-white">₹{job.minBudget?.toLocaleString()} - ₹{job.maxBudget?.toLocaleString()}</span>
                            <span className="bg-emerald-500/15 text-emerald-400 rounded-lg px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/20">
                              {job.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Upcoming Bookings */}
                <div className="lg:col-span-5 space-y-4">
                  <h2 className="text-base font-display font-black uppercase tracking-wider text-white">Upcoming Bookings</h2>
                  <div className="p-8 bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl flex flex-col items-center justify-center text-center h-[162px] gap-3">
                    <div className="h-10 w-10 bg-zinc-800 text-zinc-400 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">No upcoming bookings</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Your upcoming bookings will appear here.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY JOBS */}
          {activeTab === 'my-jobs' && (
            <div className="space-y-6 animate-fadeIn">
              <header className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-display font-black text-white uppercase tracking-wider">My Jobs</h1>
                  <p className="text-xs text-slate-400 font-medium">Manage and review your posted service requests.</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/home/post-job')}
                  className="bg-primary hover:bg-primary-dark flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl text-white transition-all"
                >
                  <Plus className="h-4 w-4" /> Post a new job
                </button>
              </header>

              <div className="flex gap-2 border-b border-zinc-800/40 pb-3">
                {['all', 'active', 'completed', 'cancelled'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setMyJobsFilter(filter)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                      myJobsFilter === filter 
                        ? 'bg-zinc-800 text-white' 
                        : 'text-zinc-450 hover:text-white'
                    }`}
                  >
                    {filter} jobs
                  </button>
                ))}
              </div>

              <div className="bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-[#151517] text-zinc-400 uppercase font-black tracking-wider text-[10px] border-b border-zinc-800/40">
                      <tr>
                        <th className="py-4 px-6">Job Title</th>
                        <th className="py-4 px-6">Budget</th>
                        <th className="py-4 px-6 text-center">Applicants</th>
                        <th className="py-4 px-6">Posted On</th>
                        <th className="py-4 px-6 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/30">
                      {filteredJobs.map((job) => {
                        const theme = getCategoryTheme(job.serviceType);
                        const CategoryIcon = theme.icon;
                        return (
                          <tr key={job.id} className="hover:bg-zinc-850/25 transition-colors">
                            <td className="py-4.5 px-6 flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${theme.color} h-8 w-8 flex items-center justify-center flex-shrink-0`}>
                                <CategoryIcon className="h-4.5 w-4.5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white leading-tight">{job.title}</h4>
                                <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">{job.description.split('.')[0]}</p>
                              </div>
                            </td>
                            <td className="py-4.5 px-6 font-semibold">
                              ₹{job.minBudget?.toLocaleString()} - ₹{job.maxBudget?.toLocaleString()}
                            </td>
                            <td className="py-4.5 px-6 text-center font-bold text-indigo-400">
                              {job.applicants}
                            </td>
                            <td className="py-4.5 px-6 text-zinc-450">{job.postedOn}</td>
                            <td className="py-4.5 px-6 text-right">
                              <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                                job.status === 'Active'
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : 'bg-zinc-800/50 border-zinc-700 text-zinc-400'
                              }`}>
                                {job.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h1 className="text-2xl font-display font-black text-white uppercase tracking-wider">Applications</h1>
                <p className="text-xs text-slate-400 font-medium">Review bids submitted by matched service providers.</p>
              </div>

              <div className="flex gap-2 border-b border-zinc-800/40 pb-3">
                {['received', 'shortlisted', 'rejected'].map(filter => {
                  const count = displayApplications.filter(a => a.status === filter).length;
                  return (
                    <button
                      key={filter}
                      onClick={() => setAppsFilter(filter)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        appsFilter === filter 
                          ? 'bg-zinc-800 text-white' 
                          : 'text-zinc-450 hover:text-white'
                      }`}
                    >
                      {filter} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4">
                {filteredApps.length === 0 ? (
                  <div className="p-8 bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl text-center space-y-2">
                    <ClipboardList className="h-8 w-8 text-zinc-550 mx-auto" />
                    <h4 className="font-bold text-white text-sm">No applications in this category</h4>
                    <p className="text-xs text-zinc-400">Applications from matched local pros will show up here.</p>
                  </div>
                ) : (
                  filteredApps.map((app) => (
                    <div key={app.id} className="p-5 bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl flex items-center justify-between hover:border-zinc-700/80 transition-all shadow-sm">
                      <div className="flex items-center gap-4.5">
                        <div className="h-10 w-10 rounded-full bg-indigo-950 text-indigo-200 flex items-center justify-center font-black text-xs border border-indigo-900/40">
                          {getInitials(app.name)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white leading-tight">{app.name}</h4>
                          <p className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                            <span>{app.category}</span> &bull; 
                            <span>{app.experience} yrs exp</span> &bull;
                            <span className="flex items-center text-amber-400 gap-0.5"><Star className="h-3 w-3 fill-currentColor" /> {app.rating}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="block text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Estimated Quote</span>
                          <span className="text-sm font-black text-[#4ade80]">₹{app.price?.toLocaleString()}</span>
                        </div>
                        <span className="text-xs text-zinc-450 font-medium">{app.time}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              addToast(`Opening profile of ${app.name}`, 'info');
                            }} 
                            className="px-4 py-2 border border-zinc-800 bg-transparent hover:bg-zinc-800 text-xs font-bold rounded-xl transition-all"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => {
                              setActiveTab('messages');
                              setActiveChat(app.name.toLowerCase().includes('ramesh') ? 'ramesh' : app.name.toLowerCase().includes('suresh') ? 'suresh' : 'pooja');
                            }} 
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl text-white transition-all"
                          >
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: HIRED WORKERS */}
          {activeTab === 'hired-workers' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="space-y-4">
                <h2 className="text-base font-display font-black uppercase tracking-wider text-white">Active Workers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockHired.filter(h => h.active).map(worker => (
                    <div key={worker.id} className="p-5 bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl flex items-center justify-between hover:border-zinc-700/80 transition-all">
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-full bg-emerald-950 text-emerald-250 flex items-center justify-center font-black text-xs border border-emerald-900/40">
                          {getInitials(worker.name)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white leading-tight">{worker.name}</h4>
                          <p className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                            <span>{worker.category}</span> &bull; 
                            <span className="flex items-center text-amber-400 gap-0.5"><Star className="h-3 w-3 fill-currentColor" /> {worker.rating}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[9px] text-zinc-550 block uppercase font-bold tracking-wider">Rate</span>
                          <span className="text-xs font-black text-zinc-200">₹{worker.price?.toLocaleString()}/Visit</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => addToast('Hiring flow initiated', 'info')} className="bg-[#5d87c2] hover:bg-[#4b75af] text-xs px-4 py-2 font-bold rounded-xl text-white transition-all">
                            Hire Again
                          </button>
                          <button onClick={() => { setActiveTab('messages'); setActiveChat('ramesh'); }} className="border border-zinc-800 hover:bg-zinc-800 text-xs px-4 py-2 font-bold rounded-xl transition-all">
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-800/40">
                <h2 className="text-base font-display font-black uppercase tracking-wider text-white">Past Hired Workers</h2>
                <div className="bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-[#151517] text-zinc-400 uppercase font-black tracking-wider text-[10px] border-b border-zinc-800/40">
                        <tr>
                          <th className="py-4 px-6">Worker</th>
                          <th className="py-4 px-6">Category</th>
                          <th className="py-4 px-6">Cost</th>
                          <th className="py-4 px-6">Rating</th>
                          <th className="py-4 px-6 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/30">
                        {mockHired.filter(h => !h.active).map(worker => (
                          <tr key={worker.id} className="hover:bg-zinc-850/25 transition-colors">
                            <td className="py-4 px-6 flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-xs border border-zinc-700/50">
                                {getInitials(worker.name)}
                              </div>
                              <span className="font-bold text-white">{worker.name}</span>
                            </td>
                            <td className="py-4 px-6 text-zinc-400">{worker.category}</td>
                            <td className="py-4 px-6 font-semibold">₹{worker.price?.toLocaleString()}/Visit</td>
                            <td className="py-4 px-6 text-amber-400 font-bold flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-currentColor" /> {worker.rating}</td>
                            <td className="py-4 px-6 text-right">
                              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg px-2 py-0.5 font-bold uppercase tracking-wider text-[8px]">
                                {worker.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="h-[600px] border border-zinc-800/60 rounded-2xl overflow-hidden bg-[#121214] flex animate-fadeIn">
              
              {/* Active chats sidebar */}
              <div className="w-80 border-r border-zinc-800/50 flex flex-col">
                <header className="p-4.5 border-b border-zinc-800/50">
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-zinc-300">Conversations</h3>
                </header>
                <div className="flex-grow overflow-y-auto divide-y divide-zinc-850">
                  {[
                    { id: 'ramesh', name: 'Ramesh Kumar', desc: 'I will be at your place in 20 mins.', time: '2m ago' },
                    { id: 'suresh', name: 'Suresh Yadav', desc: 'Thank you!', time: '1d ago' },
                    { id: 'pooja', name: 'Pooja Sharma', desc: 'Okay, will come tomorrow.', time: '2d ago' }
                  ].map(chat => (
                    <button
                      key={chat.id}
                      onClick={() => setActiveChat(chat.id)}
                      className={`w-full p-4 flex items-start gap-3 transition-colors text-left ${
                        activeChat === chat.id 
                          ? 'bg-[#1c1c1e] text-white' 
                          : 'hover:bg-zinc-800/30 text-zinc-400'
                      }`}
                    >
                      <div className="h-9 w-9 rounded-full bg-zinc-800 text-zinc-250 flex items-center justify-center font-bold text-xs border border-zinc-700 flex-shrink-0">
                        {getInitials(chat.name)}
                      </div>
                      <div className="flex-grow min-w-0 leading-none">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-bold text-sm truncate text-zinc-200">{chat.name}</h4>
                          <span className="text-[9px] text-zinc-550 flex-shrink-0">{chat.time}</span>
                        </div>
                        <p className="text-xs text-zinc-400 truncate leading-tight mt-0.5">{chat.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Viewport */}
              <div className="flex-grow flex flex-col bg-[#141416]">
                <header className="h-14 border-b border-zinc-800/50 px-6 flex items-center justify-between flex-shrink-0 bg-[#161618]">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-xs border border-zinc-700">
                      {getInitials(getActiveChatName())}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-tight text-white">{getActiveChatName()}</h3>
                      <p className="text-[10px] text-emerald-450 font-bold uppercase tracking-wider">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400">
                    <button onClick={() => addToast('Voice calling...', 'info')} className="p-1.5 hover:text-white rounded-lg hover:bg-zinc-850"><Phone className="h-4 w-4" /></button>
                    <button onClick={() => addToast('Video calling...', 'info')} className="p-1.5 hover:text-white rounded-lg hover:bg-zinc-850"><Video className="h-4 w-4" /></button>
                  </div>
                </header>

                <div className="flex-grow p-6 overflow-y-auto space-y-4">
                  {getActiveChatMessages().map(msg => {
                    const isMe = msg.sender === 'me';
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-zinc-800 text-zinc-200 rounded-tl-none'
                        }`}>
                          <p>{msg.text}</p>
                          <span className="block text-[8px] text-zinc-450/80 text-right mt-1 leading-none">{msg.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <footer className="p-4 border-t border-zinc-800/50 flex-shrink-0 bg-[#121214] flex items-center gap-3">
                  <input
                    type="text"
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-550 focus:outline-none focus:border-zinc-700"
                  />
                  <button onClick={sendMessage} className="h-9 w-9 bg-primary hover:bg-primary-dark rounded-xl flex items-center justify-center text-white transition-all flex-shrink-0">
                    <Send className="h-4 w-4" />
                  </button>
                </footer>
              </div>
            </div>
          )}

          {/* TAB 6: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h1 className="text-2xl font-display font-black text-white uppercase tracking-wider">Reviews</h1>
                <p className="text-xs text-slate-400 font-medium">Leave feedback for workers or read past reviews.</p>
              </div>

              <div className="flex gap-2 border-b border-zinc-800/40 pb-3">
                {['to-review', 'past-reviews'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setReviewsFilter(filter)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                      reviewsFilter === filter 
                        ? 'bg-zinc-800 text-white' 
                        : 'text-zinc-450 hover:text-white'
                    }`}
                  >
                    {filter === 'to-review' ? 'To Review' : 'Past Reviews'}
                  </button>
                ))}
              </div>

              {reviewsFilter === 'to-review' ? (
                <div className="space-y-4">
                  {reviewsState.filter(r => !r.submitted).length === 0 ? (
                    <div className="p-8 bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl text-center space-y-2">
                      <CheckCircle2 className="h-8 w-8 text-emerald-450 mx-auto" />
                      <h4 className="font-bold text-white text-sm">All reviews completed!</h4>
                      <p className="text-xs text-zinc-400">You have reviewed all hired professionals.</p>
                    </div>
                  ) : (
                    reviewsState.filter(r => !r.submitted).map(review => (
                      <div key={review.id} className="p-5 bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl flex flex-col gap-4 hover:border-zinc-700/80 transition-all">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-xs border border-zinc-700">
                              {getInitials(review.name)}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-white leading-none">{review.name}</h4>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">{review.category}</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider">Job Completed: {review.completedDate}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-zinc-400">Rating:</span>
                          <div className="flex gap-1 text-zinc-650">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button 
                                key={star}
                                onClick={() => handleRatingClick(review.id, star)}
                                className="p-0.5 hover:scale-110 transition-transform"
                              >
                                <Star className={`h-5 w-5 ${star <= review.rating ? 'text-amber-400 fill-currentColor' : 'text-zinc-600'}`} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3 items-end">
                          <textarea
                            value={review.text}
                            onChange={(e) => handleReviewTextChange(review.id, e.target.value)}
                            placeholder="Write a feedback review about their plumbing/electrical/cleaning quality, communication and speed..."
                            className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-550 focus:outline-none focus:border-zinc-700 h-16 resize-none"
                          />
                          <button
                            onClick={() => handleReviewSubmit(review.id)}
                            className="bg-primary hover:bg-primary-dark text-xs px-5 py-3 rounded-xl font-bold text-white transition-all flex-shrink-0"
                          >
                            Write a review
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewsState.filter(r => r.submitted).length === 0 ? (
                    <div className="p-8 bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl text-center space-y-1">
                      <Star className="h-8 w-8 text-zinc-650 mx-auto" />
                      <h4 className="font-bold text-white text-sm">No reviews written yet</h4>
                      <p className="text-xs text-zinc-400">Completed feedback submissions will display here.</p>
                    </div>
                  ) : (
                    reviewsState.filter(r => r.submitted).map(review => (
                      <div key={review.id} className="p-5 bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-xs">
                              {getInitials(review.name)}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-white leading-none">{review.name}</h4>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">{review.category}</p>
                            </div>
                          </div>
                          <div className="flex text-amber-400 gap-0.5">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'fill-currentColor text-amber-400' : 'text-zinc-700'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-450 leading-relaxed italic mt-1 font-medium pl-1">
                          "{review.text || 'Excellent job, highly professional and timely work!'}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: SAVED WORKERS */}
          {activeTab === 'saved-workers' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h1 className="text-2xl font-display font-black text-white uppercase tracking-wider">Saved Professionals</h1>
                <p className="text-xs text-slate-400 font-medium">Quickly reach out to your bookmarked local professionals.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockSaved.map(worker => (
                  <div key={worker.id} className="p-5 bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl flex items-center justify-between hover:border-zinc-700/80 transition-all shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-full bg-indigo-950 text-indigo-255 flex items-center justify-center font-black text-xs border border-indigo-900/40">
                        {getInitials(worker.name)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white leading-tight">{worker.name}</h4>
                        <p className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                          <span>{worker.category}</span> &bull; 
                          <span>{worker.experience} yrs exp</span> &bull;
                          <span className="flex items-center text-amber-400 gap-0.5"><Star className="h-3 w-3 fill-currentColor" /> {worker.rating}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[9px] text-zinc-550 block uppercase font-bold tracking-wider">Est. Rate</span>
                        <span className="text-xs font-black text-zinc-200">₹{worker.price?.toLocaleString()}/Visit</span>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveTab('messages');
                          setActiveChat(worker.name.toLowerCase().includes('ramesh') ? 'ramesh' : worker.name.toLowerCase().includes('suresh') ? 'suresh' : 'pooja');
                        }}
                        className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl text-white transition-all"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h1 className="text-2xl font-display font-black text-white uppercase tracking-wider">Payments</h1>
                <p className="text-xs text-slate-400 font-medium">Track your completed and pending transactions.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1c1c1e] border border-zinc-800/60 p-5 rounded-2xl flex flex-col justify-between h-28">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Spent</span>
                  <div className="text-3xl font-display font-black text-white">₹2,450</div>
                  <span className="text-[9px] text-zinc-500 font-medium uppercase">2 Payments</span>
                </div>
                <div className="bg-[#1c1c1e] border border-zinc-800/60 p-5 rounded-2xl flex flex-col justify-between h-28">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Pending Payments</span>
                  <div className="text-3xl font-display font-black text-zinc-400">₹0</div>
                  <span className="text-[9px] text-zinc-500 font-medium uppercase">0 Payments</span>
                </div>
                <div className="bg-[#1c1c1e] border border-zinc-800/60 p-5 rounded-2xl flex flex-col justify-between h-28">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Completed Payments</span>
                  <div className="text-3xl font-display font-black text-emerald-450">₹2,450</div>
                  <span className="text-[9px] text-zinc-550 font-medium uppercase">3 Payments</span>
                </div>
                <div className="bg-[#1c1c1e] border border-zinc-800/60 p-5 rounded-2xl flex flex-col justify-between h-28">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Saved Cards</span>
                  <div className="text-3xl font-display font-black text-white">2</div>
                  <span className="text-[9px] text-zinc-500 font-medium uppercase">Cards</span>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-base font-display font-black uppercase tracking-wider text-white">Recent Transactions</h2>
                <div className="bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-[#151517] text-zinc-400 uppercase font-black tracking-wider text-[10px] border-b border-zinc-800/40">
                        <tr>
                          <th className="py-4 px-6">Transaction</th>
                          <th className="py-4 px-6">Service</th>
                          <th className="py-4 px-6">Amount</th>
                          <th className="py-4 px-6">Date</th>
                          <th className="py-4 px-6 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/30">
                        {mockTransactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-zinc-850/25 transition-colors">
                            <td className="py-4.5 px-6 font-bold text-white">Paid to {tx.to}</td>
                            <td className="py-4.5 px-6 text-zinc-400">{tx.service}</td>
                            <td className="py-4.5 px-6 font-semibold">₹{tx.amount?.toLocaleString()}</td>
                            <td className="py-4.5 px-6 text-zinc-450">{tx.date}</td>
                            <td className="py-4.5 px-6 text-right">
                              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg px-2.5 py-0.5 font-bold uppercase tracking-wider text-[8px]">
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-display font-black text-white uppercase tracking-wider">Profile Information</h1>
                  <p className="text-xs text-slate-400 font-medium">View and update your homeowner contact coordinates.</p>
                </div>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="bg-[#1c1c1e] border border-zinc-800 hover:bg-zinc-850 text-xs px-4 py-2.5 font-bold rounded-xl text-white transition-all"
                >
                  {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>

              <div className="p-6 bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-20 w-20 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-3xl border-2 border-zinc-850 shadow-md">
                    {getInitials(profileName)}
                  </div>
                  <div className="text-center leading-tight">
                    <h3 className="font-bold text-base text-white">{profileName}</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Homeowner</p>
                  </div>
                </div>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-zinc-500 block uppercase font-bold tracking-wider text-[9px]">Full Name</span>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-zinc-700"
                      />
                    ) : (
                      <div className="text-zinc-200 font-bold py-1">{profileName}</div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-zinc-500 block uppercase font-bold tracking-wider text-[9px]">Email Address</span>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-zinc-700"
                      />
                    ) : (
                      <div className="text-zinc-200 font-semibold py-1">{profileEmail}</div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-zinc-500 block uppercase font-bold tracking-wider text-[9px]">Phone Number</span>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-zinc-700"
                      />
                    ) : (
                      <div className="text-zinc-200 font-semibold py-1">{profilePhone}</div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-zinc-500 block uppercase font-bold tracking-wider text-[9px]">Address</span>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileCity}
                        onChange={(e) => setProfileCity(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-zinc-700"
                      />
                    ) : (
                      <div className="text-zinc-200 font-semibold py-1">{profileCity}</div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-zinc-500 block uppercase font-bold tracking-wider text-[9px]">Member Since</span>
                    <div className="text-zinc-300 font-medium py-1">May 2024</div>
                  </div>

                  {isEditingProfile && (
                    <div className="md:col-span-2 pt-2 text-right">
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          addToast('Profile updated successfully!', 'success');
                        }}
                        className="bg-primary hover:bg-primary-dark text-xs px-6 py-2 rounded-xl font-bold text-white transition-all"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h1 className="text-2xl font-display font-black text-white uppercase tracking-wider">Settings</h1>
                <p className="text-xs text-slate-400 font-medium">Fine-tune system behaviors and alert parameters.</p>
              </div>

              <div className="border border-zinc-800/60 rounded-2xl bg-[#121214] flex min-h-[400px] overflow-hidden">
                <div className="w-56 border-r border-zinc-800/50 flex flex-col p-4 space-y-1 bg-[#161618]">
                  {[
                    { id: 'general', label: 'General Settings' },
                    { id: 'notifications', label: 'Notifications' },
                    { id: 'privacy', label: 'Privacy Control' },
                    { id: 'security', label: 'Security & Access' },
                    { id: 'language', label: 'Language & Locale' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsSubTab(tab.id)}
                      className={`w-full text-left text-xs font-bold px-4 py-2.5 rounded-lg transition-colors uppercase tracking-wider ${
                        settingsSubTab === tab.id 
                          ? 'bg-[#1c1c1e] text-white' 
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex-grow p-6 space-y-6 text-xs text-zinc-350">
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-white border-b border-zinc-800/40 pb-2.5">
                    {settingsSubTab.toUpperCase()} Settings
                  </h3>

                  {settingsSubTab === 'general' && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-zinc-250">Dark Mode</h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Toggle default interface layout coloration</p>
                        </div>
                        <button
                          onClick={() => setSettingsToggles({ ...settingsToggles, darkMode: !settingsToggles.darkMode })}
                          className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                            settingsToggles.darkMode ? 'bg-primary' : 'bg-zinc-850'
                          }`}
                        >
                          <div className={`bg-white h-4.5 w-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                            settingsToggles.darkMode ? 'translate-x-4.5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-zinc-250">High Contrast Text</h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Enhance legibility threshold across dashboard panels</p>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase border border-zinc-800/60 rounded px-1.5 py-0.5 bg-zinc-900">Active</span>
                      </div>
                    </div>
                  )}

                  {settingsSubTab === 'notifications' && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-zinc-250">Email Notifications</h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Receive email updates about jobs and applicant statuses</p>
                        </div>
                        <button
                          onClick={() => setSettingsToggles({ ...settingsToggles, emailNotifications: !settingsToggles.emailNotifications })}
                          className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${
                            settingsToggles.emailNotifications ? 'bg-primary' : 'bg-zinc-850'
                          }`}
                        >
                          <div className={`bg-white h-4.5 w-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                            settingsToggles.emailNotifications ? 'translate-x-4.5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-zinc-250">SMS Notifications</h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Receive text message alerts about important bookings and messages</p>
                        </div>
                        <button
                          onClick={() => setSettingsToggles({ ...settingsToggles, smsNotifications: !settingsToggles.smsNotifications })}
                          className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${
                            settingsToggles.smsNotifications ? 'bg-primary' : 'bg-zinc-850'
                          }`}
                        >
                          <div className={`bg-white h-4.5 w-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                            settingsToggles.smsNotifications ? 'translate-x-4.5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-zinc-250">Push Notifications</h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Receive push notifications in your browser window</p>
                        </div>
                        <button
                          onClick={() => setSettingsToggles({ ...settingsToggles, pushNotifications: !settingsToggles.pushNotifications })}
                          className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${
                            settingsToggles.pushNotifications ? 'bg-primary' : 'bg-zinc-850'
                          }`}
                        >
                          <div className={`bg-white h-4.5 w-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                            settingsToggles.pushNotifications ? 'translate-x-4.5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>
                  )}

                  {settingsSubTab === 'privacy' && (
                    <div className="space-y-4">
                      <p className="text-xs text-zinc-450 leading-relaxed">Privacy preferences regulate visibility parameters for active job postings and candidate lists to public search networks.</p>
                      <button className="px-4 py-2 border border-zinc-800 bg-transparent text-xs font-bold rounded-xl text-white transition-all hover:bg-zinc-800">
                        Adjust Visibility Settings
                      </button>
                    </div>
                  )}

                  {settingsSubTab === 'security' && (
                    <div className="space-y-4">
                      <p className="text-xs text-zinc-450 leading-relaxed">Security rules ensure that unauthorized individuals cannot access details of payment coordinates or home locations.</p>
                      <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl text-white transition-all">
                        Update Password
                      </button>
                    </div>
                  )}

                  {settingsSubTab === 'language' && (
                    <div className="space-y-4">
                      <p className="text-xs text-zinc-450 leading-relaxed">Choose preferred language settings for all automated emails and alert prompts.</p>
                      <select className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700">
                        <option>English (United States)</option>
                        <option>Hindi</option>
                      </select>
                    </div>
                  )}

                  <div className="pt-6 border-t border-zinc-800/40 flex justify-end gap-3 mt-4">
                    <button 
                      onClick={() => addToast('Changes canceled', 'info')}
                      className="px-4 py-2 bg-transparent border border-zinc-800 text-xs font-bold rounded-xl hover:bg-zinc-850 transition-all text-white"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => addToast('Settings saved successfully!', 'success')}
                      className="px-6 py-2 bg-primary hover:bg-primary-dark text-xs font-bold rounded-xl text-white transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: HELP & SUPPORT */}
          {activeTab === 'help' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h1 className="text-2xl font-display font-black text-white uppercase tracking-wider">Help & Support</h1>
                <p className="text-xs text-slate-400 font-medium">Find answers or chat with our systems support division.</p>
              </div>

              <div className="p-6 bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl space-y-4">
                <h3 className="font-display font-black text-sm uppercase text-white tracking-wider text-center">How can we help you?</h3>
                <div className="relative max-w-lg mx-auto">
                  <input
                    type="text"
                    value={helpSearchQuery}
                    onChange={(e) => setHelpSearchQuery(e.target.value)}
                    placeholder="Search for help topics..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700"
                  />
                  <SearchIcon className="h-4.5 w-4.5 text-zinc-550 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs text-zinc-350">
                <div className="space-y-4">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider text-white pl-1">Popular Topics</h3>
                  <div className="p-5 bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl space-y-3.5">
                    {[
                      { q: 'How to post a job?', a: 'Navigate to the dashboard and click the "+ Post a new job" button in the upper right. Provide job details, budget parameters and geocoding coordinates.' },
                      { q: 'How to hire a professional?', a: 'Review candidate lists in the Applications panel. Examine profiles and compatibility scores, message the pros directly, and click hire.' },
                      { q: 'How to make a payment?', a: 'Hired bookings allow in-app ledger records. Payments are securely processed via linked cards listed under the Payments screen.' },
                      { q: 'How to contact support?', a: 'Write an email directly to support@homeconnect.com or initiate support messaging using the button on the right.' }
                    ].filter(item => item.q.toLowerCase().includes(helpSearchQuery.toLowerCase())).map((item, index) => (
                      <details key={index} className="group border-b border-zinc-800/40 pb-3 last:border-b-0 last:pb-0 cursor-pointer">
                        <summary className="font-bold text-zinc-200 group-hover:text-white flex justify-between items-center outline-none">
                          <span>{item.q}</span>
                          <span className="text-[10px] text-zinc-500 font-bold group-open:rotate-180 transition-transform">&darr;</span>
                        </summary>
                        <p className="text-zinc-450 leading-relaxed mt-2 pl-1.5">{item.a}</p>
                      </details>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider text-white pl-1">Contact Support</h3>
                  <div className="p-5 bg-[#1c1c1e] border border-zinc-800/60 rounded-2xl flex flex-col justify-between h-[216px] items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-300 uppercase tracking-wider text-[10px] w-14">Email:</span>
                        <a href="mailto:support@homeconnect.com" className="text-blue-400 hover:underline">support@homeconnect.com</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-300 uppercase tracking-wider text-[10px] w-14">Phone:</span>
                        <span className="text-zinc-200 font-semibold">+91 98765 43210</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-300 uppercase tracking-wider text-[10px] w-14">Availability:</span>
                        <span className="text-zinc-450 leading-none">We usually reply within a few hours.</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => addToast('Opening support chat window...', 'info')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-xs px-5 py-2.5 font-bold rounded-xl text-white transition-all w-full text-center mt-4"
                    >
                      Start a Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 12: LOGOUT CONFIRMATION */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1c1c1e] border border-zinc-800 max-w-sm w-full rounded-2xl p-6 shadow-2xl relative"
            >
              <div className="flex flex-col items-center text-center gap-4.5">
                <div className="h-12 w-12 bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center border border-rose-900/30">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-white uppercase tracking-wider leading-none">Logout Account</h3>
                  <p className="text-xs text-zinc-400 mt-2.5 leading-normal">
                    Are you sure you want to logout from your account?
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-2">
                  <button 
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 bg-transparent hover:bg-zinc-850 border border-zinc-800 text-xs py-3.5 font-bold rounded-xl text-white transition-all outline-none"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setShowLogoutConfirm(false);
                      logout();
                      navigate('/');
                    }}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-xs py-3.5 font-bold rounded-xl text-white transition-all outline-none shadow-lg shadow-rose-600/10"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
export { HomeownerDashboard };
