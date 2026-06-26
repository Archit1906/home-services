import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Wrench, FileText, UserCheck, MessageSquare, Star, 
  Heart, CreditCard, User, Settings, HelpCircle, Plus, MapPin, 
  Bell, ChevronDown, ClipboardList, ShieldAlert, AlertCircle, ArrowRight, Menu,
  Briefcase, Users, Droplet, Send, CheckCircle2, Phone, Video, Search as SearchIcon,
  Calendar, Sun, RefreshCw, Paperclip, Image, DollarSign, Download, Smile, Trash
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';
import { useChatStore } from '../store/chatStore.js';

const getInitials = (name) => {
  if (!name) return 'H';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getCategoryImage = (category) => {
  const images = {
    'Plumbing': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400',
    'Electrical': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400',
    'HVAC': 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400',
    'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    'Gardening': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400',
    'Painting': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400'
  };
  return images[category] || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400';
};

const mockJobs = [
  {
    id: 1,
    serviceType: 'Plumbing',
    time: '2 hours ago',
    title: 'Emergency Pipe Leak Repair',
    description: 'Water tank line leak on terrace causing seepage in kitchen. Need urgent fixing.',
    status: 'Hired',
    hiredWorker: 'Ramesh Kumar',
    quotes: 0
  },
  {
    id: 2,
    serviceType: 'Electrical',
    time: '5 hours ago',
    title: 'EV Charger Installation',
    description: 'Tata Nexon EV Charger installation in my apartment parking slot. Need certified electrician.',
    status: 'Active',
    hiredWorker: '',
    quotes: 3
  },
  {
    id: 3,
    serviceType: 'HVAC',
    time: '1 day ago',
    title: 'AC Maintenance & Service',
    description: 'Split AC deep cleaning and gas top-up before summer starts.',
    status: 'Open',
    hiredWorker: '',
    quotes: 0
  }
];

const mockTransactions = [
  { id: 'tx-1', to: 'Amit Sharma', service: 'Emergency Pipe Leak Repair', amount: 1500, date: 'May 12, 2024', status: 'Completed' },
  { id: 'tx-2', to: 'Priya Patel', service: 'Accent Wall Painting', amount: 3500, date: 'May 10, 2024', status: 'Completed' },
  { id: 'tx-3', to: 'Rajesh Kumar', service: 'Panel Upgrade', amount: 4500, date: 'May 08, 2024', status: 'Completed' }
];

// Custom inline SVG icons
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

const PdfIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export default function HomeownerDashboard() {
  const navigate = useNavigate();
  const { user, token, logout, switchRole } = useAuthStore();
  const { addToast } = useToastStore();
  const { initSocket, socket } = useChatStore();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sidebar navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sub-filters for tabs
  const [postingsFilter, setPostingsFilter] = useState('active'); // 'active', 'drafts', 'past'
  const [activeRequestFilter, setActiveRequestFilter] = useState('plumbing'); // 'plumbing', 'electrical', 'hvac'
  const [reviewsHistoryFilter, setReviewsHistoryFilter] = useState('all'); // 'all', 'high'
  const [profileName, setProfileName] = useState(user?.name || 'Neha');

  // Messages Chat state
  const [activeChat, setActiveChat] = useState('amit');
  const [chatText, setChatText] = useState('');
  
  // Custom mock conversations matching Screenshot 1
  const [amitMessages, setAmitMessages] = useState([
    { id: 1, sender: 'amit', text: "Hi Neha! I've had a look at the photos you sent of the leak under the kitchen sink. It looks like a standard P-trap replacement.", time: '10:30 AM' },
    { id: 2, sender: 'me', text: "Thanks for the quick response, Amit. Do you have an estimate for how long that would take and what the cost would be?", time: '10:35 AM' },
    { id: 3, sender: 'amit', text: "I can get it done in about an hour. I've attached the formal quote below. If it looks good to you, I can come by tomorrow morning.", time: '10:42 AM' },
    { id: 4, sender: 'amit', isFile: true, filename: 'KitchenSink_Quote_Sterling.pdf', size: '1.2 MB', time: '10:42 AM' }
  ]);

  const [priyaMessages, setPriyaMessages] = useState([
    { id: 1, sender: 'priya', text: "Great, I'll see you on Monday at 9:00 AM.", time: 'Yesterday' }
  ]);

  const [rajeshMessages, setRajeshMessages] = useState([
    { id: 1, sender: 'rajesh', text: "Sent you a photo of the panel wiring.", time: 'Tue' }
  ]);

  // Review state matching Screenshot 4
  const [reviewsState, setReviewsState] = useState([
    { id: 'rev-1', name: 'Rohan Mehta', category: 'Certified Electrician', rating: 0, comment: '', submitted: false },
    { id: 'rev-2', name: 'Priya Patel', category: 'Painting Services', rating: 0, comment: '', submitted: false }
  ]);

  const [settingsToggles, setSettingsToggles] = useState({
    emailNotifications: true,
    pushNotifications: true
  });

  const handleRatingClick = (id, rating) => {
    setReviewsState(prev => prev.map(rev => rev.id === id ? { ...rev, rating } : rev));
  };

  const handleReviewTextChange = (id, comment) => {
    setReviewsState(prev => prev.map(rev => rev.id === id ? { ...rev, comment } : rev));
  };

  const handleReviewSubmit = (id) => {
    const rev = reviewsState.find(r => r.id === id);
    if (!rev || !rev.rating) {
      addToast('Please select a rating before submitting', 'warning');
      return;
    }
    setReviewsState(prev => prev.map(r => r.id === id ? { ...r, submitted: true } : r));
    addToast(`Review for ${rev.name} submitted successfully!`, 'success');
  };

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
    } catch (err) {
      console.error(err);
      addToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'worker') { navigate('/dashboard/worker'); return; }
      if (user.role === 'admin') { navigate('/admin'); return; }
      setProfileName(user.name || 'Jane');
      loadDashboardData();
      initSocket(user.id);
      
      const userFirstName = (user.name || 'Neha').split(' ')[0];
      setAmitMessages(prev => prev.map(msg => {
        if (msg.sender === 'amit' && msg.text && msg.text.includes('Hi Neha!')) {
          return {
            ...msg,
            text: msg.text.replace('Hi Neha!', `Hi ${userFirstName}!`)
          };
        }
        return msg;
      }));
    }
  }, [user]);

  // Chat message sending
  const sendMessage = () => {
    if (!chatText.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: chatText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (activeChat === 'amit') {
      setAmitMessages([...amitMessages, newMsg]);
    } else if (activeChat === 'priya') {
      setPriyaMessages([...priyaMessages, newMsg]);
    } else if (activeChat === 'rajesh') {
      setRajeshMessages([...rajeshMessages, newMsg]);
    }
    setChatText('');
  };

  const getActiveChatMessages = () => {
    if (activeChat === 'amit') return amitMessages;
    if (activeChat === 'priya') return priyaMessages;
    if (activeChat === 'rajesh') return rajeshMessages;
    return [];
  };

  const getActiveChatName = () => {
    if (activeChat === 'amit') return 'Amit Sharma';
    if (activeChat === 'priya') return 'Priya Patel';
    if (activeChat === 'rajesh') return 'Rajesh Kumar';
    return 'Anonymous';
  };

  const getActiveChatRole = () => {
    if (activeChat === 'amit') return 'Plumbing Specialist';
    if (activeChat === 'priya') return 'Painting Specialist';
    if (activeChat === 'rajesh') return 'Electrical Specialist';
    return 'Pro';
  };

  const displayedJobs = jobs.length > 0 
    ? jobs.map(job => ({
        id: job.id,
        serviceType: job.serviceType,
        time: new Date(job.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        title: job.title,
        description: job.description,
        status: job.status === 'assigned' ? 'Hired' : (job.status === 'open' ? 'Active' : job.status),
        hiredWorker: job.status === 'assigned' ? (job.applications?.find(a => a.status === 'hired' || a.status === 'assigned')?.worker?.user?.name || 'Assigned Worker') : '',
        quotes: job.applications?.length || 0
      }))
    : mockJobs;

  const activeJobs = jobs.filter(j => j.status === 'open' || j.status === 'assigned');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-body selection:bg-indigo-600/30">
      
      {/* Header navbar */}
      <header className="h-16 bg-white border-b border-slate-200/60 px-6 flex items-center justify-between z-10 sticky top-0 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 font-display text-lg font-black text-indigo-600 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="h-9 w-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-indigo-600" />
            </div>
            <span>HomeConnect</span>
          </div>
          <button onClick={() => addToast('Sidebar menu toggled', 'info')} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-all">
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-grow max-w-md mx-8 relative hidden md:block">
          <input
            type="text"
            placeholder="Search for services..."
            className="w-full bg-slate-100 border-0 rounded-full px-5 py-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
          />
          <SearchIcon className="h-4 w-4 text-slate-400 absolute right-4 top-2.5" />
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/home/post-job')}
            className="bg-indigo-600 hover:bg-indigo-700 text-xs px-4 py-2 rounded-lg font-bold text-white transition-all"
          >
            Post a Job
          </button>

          <button onClick={() => addToast('No new notifications', 'info')} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-500 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full" />
          </button>
          
          <button onClick={() => setActiveTab('messages')} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-500">
            <MessageSquare className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
              {getInitials(profileName)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-[#f0f4f9] border-r border-slate-200 flex flex-col justify-between p-6 overflow-y-auto flex-shrink-0 text-slate-700">
          <div className="space-y-6">

            {/* Welcome banner at top of sidebar */}
            <div className="flex items-center gap-3 mb-6 p-1 pl-2 bg-white/40 rounded-xl border border-slate-200/50">
              <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                {getInitials(profileName)}
              </div>
              <div className="leading-none text-left">
                <span className="block text-[10px] font-bold text-slate-400 mb-0.5">Welcome back</span>
                <span className="text-xs font-black text-slate-900 uppercase">Premium Member</span>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'my-jobs', label: 'Postings', icon: Wrench },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
                { id: 'applications', label: 'Applicants', icon: FileText },
                { id: 'reviews', label: 'Reviews', icon: Star },
                { id: 'help', label: 'Analytics', icon: Star }
              ].map(item => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all text-left ${
                      isActive 
                        ? 'bg-indigo-600 text-white font-black' 
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
                    }`}
                  >
                    <IconComponent className="h-4.5 w-4.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-200/60">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all text-left ${
                activeTab === 'settings' ? 'bg-indigo-600 text-white font-black' : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <Settings className="h-4.5 w-4.5" /> Settings
            </button>
            
            <button 
              onClick={async () => {
                try {
                  await switchRole();
                  addToast('Role switched successfully!', 'success');
                } catch (err) {
                  addToast('Failed to switch roles', 'error');
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg text-slate-600 hover:bg-slate-200/50 hover:text-slate-950 text-left transition-all"
            >
              <RefreshCw className="h-4.5 w-4.5" /> Role Switcher
            </button>

            <button 
              onClick={() => setShowLogoutConfirm(true)} 
              className="w-full text-xs font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-50 p-3 rounded-lg transition-all text-left pl-4"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Dashboard Main View Container */}
        <main className="flex-grow p-8 overflow-y-auto bg-slate-50">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn text-left">
              
              {/* Weather Banner card */}
              <div className="bg-gradient-to-r from-indigo-600 to-[#848bf4] text-white p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center relative overflow-hidden shadow-sm">
                <div className="space-y-3 text-left relative z-10">
                  <h2 className="text-lg font-bold">Good morning, {profileName.split(' ')?.[0] || 'Neha'}!</h2>
                  <p className="text-xs opacity-90 font-medium max-w-xl leading-relaxed">It's 32°C and sunny in Bengaluru today. Perfect weather to schedule a home cleanup.</p>
                  
                  <div className="flex gap-2 pt-1.5">
                    <button onClick={() => addToast('Clear Skies selected', 'info')} className="bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all text-white">
                      <Sun className="h-3.5 w-3.5" /> Clear Skies
                    </button>
                    <button onClick={() => addToast('Current humidity: 45%', 'info')} className="bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all text-white">
                      <Droplet className="h-3.5 w-3.5" /> 45% Humidity
                    </button>
                  </div>
                </div>

                <div className="h-16 w-16 rounded-full bg-white/15 border border-white/10 flex items-center justify-center text-white flex-shrink-0 mt-4 sm:mt-0 relative z-10">
                  <Sun className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Active Requests */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-950">Active Requests</h2>
                  <button onClick={() => setActiveTab('my-jobs')} className="text-xs font-bold text-indigo-600 hover:underline">View all</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {displayedJobs.map((job) => (
                    <div key={job.id} className="p-5 bg-white border border-slate-200/60 rounded-2xl flex flex-col justify-between h-[200px] shadow-sm hover:border-slate-300 transition-all text-left">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide">{job.serviceType}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{job.time}</span>
                        </div>
                        <h4 className="font-bold text-sm leading-tight text-slate-900 pt-2">{job.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold leading-normal truncate-2-lines pt-1">{job.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                        {job.status === 'Hired' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide">Hired</span>
                            <span className="text-[9px] text-slate-500 font-bold">{job.hiredWorker}</span>
                          </div>
                        ) : (
                          <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 rounded px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide">
                            {job.quotes > 0 ? `${job.quotes} Quotes` : job.status}
                          </span>
                        )}
                        
                        {job.status === 'Hired' ? (
                          <button 
                            onClick={() => { setActiveTab('messages'); setActiveChat('amit'); }}
                            className="text-[10px] text-indigo-600 hover:text-indigo-700 font-extrabold uppercase"
                          >
                            Message
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              if (job.status === 'Active') {
                                setActiveTab('applications');
                              } else {
                                addToast('Editing request...', 'info');
                              }
                            }}
                            className="text-[10px] text-indigo-600 hover:text-indigo-700 font-extrabold uppercase"
                          >
                            {job.status === 'Active' ? 'Manage' : 'Edit'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros for Your Next Project */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-950">Pros for Your Next Project</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: 'Evergreen Landscaping', rating: 4.9, badge: 'TOP RATED', img: 'https://images.unsplash.com/photo-1557429287-b2e26467fc2b?w=400' },
                    { name: 'Precision Painters', rating: 4.8, badge: 'VERIFIED', img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400' },
                    { name: 'Smart Home Pros', rating: 5.0, badge: 'TOP RATED', img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400' }
                  ].map((pro, index) => (
                    <div key={index} className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between h-[260px] hover:border-slate-300 transition-all text-left">
                      <div className="relative h-28 bg-slate-100 flex-shrink-0">
                        <img src={pro.img} alt={pro.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2.5 left-2.5 bg-indigo-600 text-white px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide">
                          {pro.badge}
                        </span>
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-slate-950 leading-tight">{pro.name}</h4>
                          <div className="flex text-amber-500 gap-0.5 items-center pt-1">
                            <Star className="h-3.5 w-3.5 fill-currentColor" />
                            <span className="text-[10px] text-slate-600 font-bold pl-0.5">{pro.rating} rating</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => addToast(`Opening profile details...`, 'info')}
                          className="w-full text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold py-2 rounded-lg transition-colors mt-3"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: POSTINGS */}
          {activeTab === 'my-jobs' && (
            <div className="space-y-6 animate-fadeIn text-left">
              <header className="flex justify-between items-center">
                <div className="text-left">
                  <h1 className="text-2xl font-display font-black text-slate-950 leading-tight">Manage Postings</h1>
                  <p className="text-xs text-slate-400 font-medium mt-1">Track your active projects and drafts.</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/home/post-job')}
                  className="bg-indigo-600 hover:bg-indigo-750 flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl text-white transition-all"
                >
                  <Plus className="h-4 w-4" /> Post New Job
                </button>
              </header>

              {/* Ongoing budget row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#5c3ceb] text-white p-5 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden shadow">
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-85">ONGOING BUDGET</span>
                  <div className="text-2xl font-display font-black">₹1,42,500.00</div>
                  <span className="text-[9.5px] font-bold block mt-1">▲ 4 active contracts in progress</span>
                </div>
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between h-28 shadow-sm">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Awaiting Response</span>
                  <div className="text-2xl font-display font-black text-slate-900">12</div>
                  <button onClick={() => setActiveTab('applications')} className="text-[9.5px] font-black text-indigo-600 text-left hover:underline">View Applicants &rarr;</button>
                </div>
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between h-28 shadow-sm">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Drafts Saved</span>
                  <div className="text-2xl font-display font-black text-slate-900">3</div>
                  <span className="text-[9.5px] text-slate-450 font-bold block mt-1">Updated 2h ago</span>
                </div>
              </div>

              {/* Active Jobs / Drafts tab switcher */}
              <div className="flex gap-4 border-b border-slate-200/60 pb-2 mt-4 text-xs font-bold">
                {['active', 'drafts', 'past'].map(item => (
                  <button 
                    key={item} 
                    onClick={() => setPostingsFilter(item)}
                    className={`pb-2 border-b-2 px-1 uppercase tracking-wider transition-all ${
                      postingsFilter === item ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    {item === 'active' ? 'Active Jobs' : (item === 'drafts' ? 'Drafts' : 'Past Projects')}
                  </button>
                ))}
              </div>

              {/* Postings grid */}
              {postingsFilter === 'active' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {activeJobs.length > 0 ? (
                    activeJobs.map((job) => {
                      const progress = job.status === 'assigned' ? 65 : 5;
                      const hiredWorker = job.status === 'assigned' 
                        ? (job.applications?.find(a => a.status === 'hired' || a.status === 'assigned')?.worker?.user?.name || 'Ramesh Kumar')
                        : 'Awaiting Quotes';
                      return (
                        <div key={job.id} className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[280px]">
                          <div className="h-28 bg-slate-100">
                            <img src={getCategoryImage(job.serviceType)} alt={job.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-4 flex-grow flex flex-col justify-between">
                            <div className="space-y-1">
                              <span className="text-[8px] text-indigo-600 font-extrabold uppercase tracking-wide">{job.serviceType.toUpperCase()}</span>
                              <h4 className="font-bold text-sm text-slate-900 leading-tight">{job.title}</h4>
                              <span className="text-[9.5px] text-slate-400 font-bold block mt-1">
                                {job.status === 'assigned' ? `Assigned to ${hiredWorker}` : 'Awaiting Quotes'}
                              </span>
                            </div>
                            <div className="space-y-2 mt-4">
                              <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                                <span>Progress</span>
                                <span>{progress}% Done</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      {/* Card 1 */}
                      <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[280px]">
                        <div className="h-28 bg-slate-100">
                          <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400" alt="Kitchen Remodel" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4 flex-grow flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[8px] text-indigo-600 font-extrabold uppercase tracking-wide">KITCHEN REMODEL</span>
                            <h4 className="font-bold text-sm text-slate-900 leading-tight">Gourmet Kitchen Upgrade</h4>
                            <span className="text-[9.5px] text-slate-400 font-bold block mt-1">2 pros assigned</span>
                          </div>
                          <div className="space-y-2 mt-4">
                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                              <span>Progress</span>
                              <span>65% Done</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full w-[65%]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[280px]">
                        <div className="h-28 bg-slate-100">
                          <img src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400" alt="HVAC Repair" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4 flex-grow flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[8px] text-indigo-600 font-extrabold uppercase tracking-wide">HVAC MAINTENANCE</span>
                            <h4 className="font-bold text-sm text-slate-900 leading-tight">Annual AC System Repair</h4>
                            <span className="text-[9.5px] text-slate-400 font-bold block mt-1">Priya Patel &bull; Scheduled Tomorrow</span>
                          </div>
                          <div className="space-y-2 mt-4">
                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                              <span>Progress</span>
                              <span>Not Started</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-slate-300 h-full w-[5%]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Card 3 (Start new project link) */}
                  <div 
                    onClick={() => navigate('/dashboard/home/post-job')}
                    className="border border-dashed border-slate-350 hover:border-slate-450 hover:bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-center p-6 h-[280px] cursor-pointer transition-all"
                  >
                    <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-100">
                      <Plus className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-slate-950 mt-3.5 text-sm">Start a New Project</h4>
                    <p className="text-[10px] text-slate-400 font-semibold max-w-xs mt-1">Get quotes from top pros in minutes.</p>
                  </div>
                </div>
              )}

              {postingsFilter === 'drafts' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Draft Card */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-[200px] text-left">
                    <div className="space-y-2">
                      <span className="bg-slate-100 text-slate-550 border border-slate-200 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide">DRAFT</span>
                      <h4 className="font-bold text-sm text-slate-950 pt-1">Smart Home Security Setup</h4>
                      <p className="text-[10px] text-slate-400 font-bold leading-normal">Last edited: 2 days ago. Missing budget estimation.</p>
                    </div>
                    <div className="flex gap-3 pt-3 border-t border-slate-100">
                      <button onClick={() => addToast('Loading draft...', 'info')} className="bg-indigo-600 hover:bg-indigo-700 text-[10px] font-bold px-4 py-2 rounded-lg text-white">Finish Posting</button>
                      <button onClick={() => addToast('Draft discarded', 'info')} className="text-[10px] font-bold text-rose-600 hover:text-rose-700">Discard</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Recently Completed section at bottom */}
              <div className="space-y-4 pt-6 border-t border-slate-200/60 mt-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase text-slate-950 tracking-wider">Recently Completed</h3>
                  <button onClick={() => addToast('Viewing all completed posts...', 'info')} className="text-xs font-bold text-indigo-600 hover:underline">View All &rarr;</button>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
                  {[
                    { title: 'Roof Leak Patching', date: 'Completed Oct 12', cost: 850 },
                    { title: 'Bathroom Sink Faucet Install', date: 'Completed Sep 28', cost: 220 }
                  ].map((job, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs pb-3 last:pb-0 last:border-b-0 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="h-8.5 w-8.5 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500"><CheckCircle2 className="h-4.5 w-4.5" /></div>
                        <div className="leading-none text-left">
                          <h4 className="font-bold text-slate-900 leading-tight">{job.title}</h4>
                          <span className="text-[9.5px] text-slate-400 font-bold block mt-1">{job.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-extrabold text-slate-900">${job.cost}</span>
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded px-2.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wide">VERIFIED</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="h-[600px] border border-slate-200/60 rounded-2xl overflow-hidden bg-white flex animate-fadeIn shadow-sm text-left">
              
              {/* Inbox sidebar */}
              <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
                <header className="p-4.5 border-b border-slate-200">
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-700">Messages</h3>
                </header>
                <div className="flex-grow overflow-y-auto divide-y divide-slate-100 bg-white">
                  {[
                    { id: 'amit', name: 'Amit Sharma', category: 'PLUMBING', desc: "I've attached the quote for the kitchen si...", time: '10:42 AM', active: true },
                    { id: 'priya', name: 'Priya Patel', category: 'PAINTING', desc: "Great, I'll see you on Monday at 9:00 AM.", time: 'Yesterday' },
                    { id: 'rajesh', name: 'Rajesh Kumar', category: 'ELECTRICAL', desc: 'Sent you a photo of the panel wiring.', time: 'Tue' }
                  ].map(chat => (
                    <button
                      key={chat.id}
                      onClick={() => setActiveChat(chat.id)}
                      className={`w-full p-4 flex items-start gap-3 transition-colors text-left border-l-4 ${
                        activeChat === chat.id 
                          ? 'bg-indigo-50/50 border-l-indigo-600 text-slate-900' 
                          : 'border-l-transparent hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200 flex-shrink-0 relative">
                        {getInitials(chat.name)}
                        {chat.active && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white" />}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-bold text-xs truncate text-slate-900 leading-none">{chat.name}</h4>
                          <span className="text-[9px] text-slate-450 flex-shrink-0">{chat.time}</span>
                        </div>
                        <span className="bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded text-[7.5px] font-extrabold uppercase tracking-wide leading-none">{chat.category}</span>
                        <p className="text-xs text-slate-400 truncate leading-tight mt-1">{chat.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Window */}
              <div className="flex-grow flex flex-col bg-white">
                <header className="h-14 border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="h-8.5 w-8.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                      {getInitials(getActiveChatName())}
                    </div>
                    <div className="text-left leading-none">
                      <h3 className="font-bold text-sm text-slate-900">{getActiveChatName()}</h3>
                      <p className="text-[10px] text-slate-400 mt-1">Active Now &bull; {getActiveChatRole()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <button onClick={() => addToast('Calling...', 'info')} className="p-1.5 hover:text-indigo-600 rounded-lg hover:bg-slate-100"><Phone className="h-4 w-4" /></button>
                    <button onClick={() => addToast('Opening Video Call...', 'info')} className="p-1.5 hover:text-indigo-600 rounded-lg hover:bg-slate-100"><Video className="h-4 w-4" /></button>
                  </div>
                </header>

                <div className="flex-grow p-6 overflow-y-auto space-y-4">
                  <div className="text-center my-4"><span className="bg-indigo-50 text-indigo-600 text-[9px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-100/50">TODAY</span></div>
                  {getActiveChatMessages().map(msg => {
                    const isMe = msg.sender === 'me';
                    if (msg.isFile) {
                      return (
                        <div key={msg.id} className="flex justify-start">
                          <div className="max-w-md p-4 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 flex-shrink-0"><PdfIcon className="h-5 w-5" /></div>
                              <div className="leading-none text-left">
                                <h4 className="text-xs font-bold text-slate-800 leading-tight">{msg.filename}</h4>
                                <span className="text-[9.5px] text-slate-400 font-bold block mt-1">{msg.size} &bull; PDF Document</span>
                              </div>
                            </div>
                            <button onClick={() => addToast('Downloading PDF quote...', 'info')} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500"><Download className="h-4 w-4" /></button>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-slate-100 text-slate-800 rounded-tl-none'
                        }`}>
                          <p>{msg.text}</p>
                          <span className="block text-[8px] opacity-75 text-right mt-1">{msg.time}</span>
                        </div>
                      </div>
                    );
                  })}
                  {activeChat === 'amit' && (
                    <div className="text-[10px] text-slate-400 font-bold italic text-left pl-1.5 animate-pulse">
                      &bull;&bull;&bull; Amit is typing...
                    </div>
                  )}
                </div>

                <footer className="p-4 border-t border-slate-200 flex-shrink-0 bg-slate-50 flex flex-col gap-3">
                  <div className="flex gap-2 items-center">
                    <button onClick={() => addToast('Opening file selector...', 'info')} className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-[9.5px] font-extrabold uppercase tracking-wide"><Paperclip className="h-3.5 w-3.5" /> Attach</button>
                    <button onClick={() => addToast('Opening photos drawer...', 'info')} className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-[9.5px] font-extrabold uppercase tracking-wide"><Image className="h-3.5 w-3.5" /> Photos</button>
                    {activeChat === 'amit' && (
                      <button onClick={() => addToast(`Opening payment window for ₹1,200.00 to pay ${getActiveChatName()}...`, 'success')} className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 px-4.5 py-1.5 rounded-lg text-[9.5px] font-extrabold uppercase tracking-wide shadow"><DollarSign className="h-3.5 w-3.5" /> Pay {getActiveChatName().split(' ')[0]}</button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={chatText}
                      onChange={(e) => setChatText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                    <button onClick={() => addToast('Smiley drawer loading...', 'info')} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400"><Smile className="h-5 w-5" /></button>
                    <button onClick={sendMessage} className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center text-white transition-all flex-shrink-0">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </footer>
              </div>
            </div>
          )}

          {/* TAB 4: APPLICANTS */}
          {activeTab === 'applications' && (
            <div className="space-y-6 animate-fadeIn text-left">
              <header className="flex justify-between items-center">
                <div className="text-left">
                  <h1 className="text-2xl font-display font-black text-slate-950">Manage Applicants</h1>
                  <p className="text-xs text-slate-400 font-medium">Review and compare bids for your active home projects.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => addToast('Filters toggled', 'info')} className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold">Filter</button>
                  <button onClick={() => addToast('Sort toggled', 'info')} className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold">Sort</button>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-[450px]">
                
                {/* Active Requests Left sidebar */}
                <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm flex flex-col text-left h-full">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest p-4 pb-2 block border-b border-slate-100">ACTIVE REQUESTS</span>
                  <div className="flex-grow overflow-y-auto divide-y divide-slate-100">
                    {[
                      { id: 'plumbing', category: 'PLUMBING', title: 'Water Leak Repair', desc: 'Main supply line issues in...', bids: 4 },
                      { id: 'electrical', category: 'ELECTRICAL', title: 'EV Charger Setup', desc: 'Upgrading to 200A servi...', bids: 2 },
                      { id: 'hvac', category: 'HVAC', title: 'AC Service', desc: 'Annual cleaning and...', bids: 7 }
                    ].map(req => (
                      <button
                        key={req.id}
                        onClick={() => setActiveRequestFilter(req.id)}
                        className={`w-full p-4 text-left border-l-4 transition-all ${
                          activeRequestFilter === req.id 
                            ? 'bg-indigo-50/50 border-l-indigo-600' 
                            : 'border-l-transparent hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded text-[7.5px] font-extrabold uppercase tracking-wide leading-none">{req.category}</span>
                          <span className="text-[9.5px] text-indigo-600 font-bold flex-shrink-0">{req.bids} Bids</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 leading-tight mt-1.5">{req.title}</h4>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{req.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right applicants grid */}
                <div className="lg:col-span-8 overflow-y-auto h-full space-y-6 pr-2">
                  <h3 className="text-sm font-black uppercase text-slate-950 tracking-wider">Applicants for "{activeRequestFilter === 'plumbing' ? 'Water Leak Repair' : (activeRequestFilter === 'electrical' ? 'EV Charger Setup' : 'AC Service')}"</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Applicant 1 */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-[230px]">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <img src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100" alt="Vikram Singh" className="h-10 w-10 rounded-full object-cover" />
                          <div className="text-left leading-none">
                            <h4 className="font-bold text-xs text-slate-900">Vikram Singh</h4>
                            <span className="bg-indigo-600 text-white text-[7.5px] font-extrabold px-1.5 py-0.2 rounded uppercase block mt-1.5 self-start w-fit">TOP MATCH</span>
                          </div>
                        </div>
                        <div className="flex text-amber-500 gap-0.5 items-center text-[10px] font-bold">
                          <Star className="h-3.5 w-3.5 fill-currentColor" />
                          <span>4.9 <span className="text-slate-450">(128 reviews)</span></span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2 text-[10px] font-bold text-slate-450">
                          <span>EXPERIENCE</span>
                          <span>BID AMOUNT</span>
                        </div>
                        <div className="flex justify-between items-baseline font-black text-xs">
                          <span>12 Years</span>
                          <span className="text-indigo-600 text-sm">₹3,500.00</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                        <button onClick={() => addToast('Bidding comparison updated', 'info')} className="flex-grow bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[10px] py-2 rounded-lg font-bold">Compare</button>
                        <button onClick={() => addToast('Hired Vikram Singh successfully!', 'success')} className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-[10px] py-2 rounded-lg font-bold text-white shadow">Hire</button>
                      </div>
                    </div>
 
                    {/* Applicant 2 */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-[230px]">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100" alt="Sunita Rao" className="h-10 w-10 rounded-full object-cover" />
                          <div className="text-left leading-none">
                            <h4 className="font-bold text-xs text-slate-900">Sunita Rao</h4>
                          </div>
                        </div>
                        <div className="flex text-amber-500 gap-0.5 items-center text-[10px] font-bold">
                          <Star className="h-3.5 w-3.5 fill-currentColor" />
                          <span>4.7 <span className="text-slate-450">(84 reviews)</span></span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2 text-[10px] font-bold text-slate-450">
                          <span>EXPERIENCE</span>
                          <span>BID AMOUNT</span>
                        </div>
                        <div className="flex justify-between items-baseline font-black text-xs">
                          <span>6 Years</span>
                          <span className="text-indigo-600 text-sm">₹2,950.00</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                        <button onClick={() => addToast('Bidding comparison updated', 'info')} className="flex-grow bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[10px] py-2 rounded-lg font-bold">Compare</button>
                        <button onClick={() => addToast('Hired Sunita Rao successfully!', 'success')} className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-[10px] py-2 rounded-lg font-bold text-white shadow">Hire</button>
                      </div>
                    </div>
 
                    {/* Applicant 3 */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-[230px]">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="Arjun Nair" className="h-10 w-10 rounded-full object-cover" />
                          <div className="text-left leading-none">
                            <h4 className="font-bold text-xs text-slate-900">Arjun Nair</h4>
                          </div>
                        </div>
                        <div className="flex text-amber-500 gap-0.5 items-center text-[10px] font-bold">
                          <Star className="h-3.5 w-3.5 fill-currentColor" />
                          <span>5.0 <span className="text-slate-450">(12 reviews)</span></span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2 text-[10px] font-bold text-slate-450">
                          <span>EXPERIENCE</span>
                          <span>BID AMOUNT</span>
                        </div>
                        <div className="flex justify-between items-baseline font-black text-xs">
                          <span>3 Years</span>
                          <span className="text-indigo-600 text-sm">₹2,100.00</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                        <button onClick={() => addToast('Bidding comparison updated', 'info')} className="flex-grow bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[10px] py-2 rounded-lg font-bold">Compare</button>
                        <button onClick={() => addToast('Hired Arjun Nair successfully!', 'success')} className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-[10px] py-2 rounded-lg font-bold text-white shadow">Hire</button>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Bottom comparison panel */}
              <div className="space-y-4 pt-6 border-t border-slate-200/60 mt-8 text-left">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase text-slate-950 tracking-wider">Side-by-Side Comparison</h3>
                  <button onClick={() => addToast('Customizing compare options...', 'info')} className="text-xs font-bold text-indigo-600 hover:underline">Customize View</button>
                </div>
                
                <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-4 px-6">Feature</th>
                        <th className="py-4 px-6">Vikram Singh</th>
                        <th className="py-4 px-6">Sunita Rao</th>
                        <th className="py-4 px-6">Arjun Nair</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-bold">
                      <tr>
                        <td className="py-4 px-6 text-slate-400 uppercase text-[9px] tracking-wider">Est. Timeline</td>
                        <td className="py-4 px-6">Today, 2 PM</td>
                        <td className="py-4 px-6">Tomorrow, 9 AM</td>
                        <td className="py-4 px-6">Thursday, 1 PM</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-slate-400 uppercase text-[9px] tracking-wider">Insurance</td>
                        <td className="py-4 px-6 text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Verified</td>
                        <td className="py-4 px-6 text-emerald-600"><span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Verified</span></td>
                        <td className="py-4 px-6 text-amber-600"><span className="flex items-center gap-1.5"><AlertCircle className="h-4 w-4" /> Pending</span></td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-slate-400 uppercase text-[9px] tracking-wider">Labor Warranty</td>
                        <td className="py-4 px-6">2 Years</td>
                        <td className="py-4 px-6">1 Year</td>
                        <td className="py-4 px-6">90 Days</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-slate-400 uppercase text-[9px] tracking-wider">Cancellation Policy</td>
                        <td className="py-4 px-6">24h notice</td>
                        <td className="py-4 px-6">Flexible</td>
                        <td className="py-4 px-6">Flexible</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}



          {/* TAB 6: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-8 animate-fadeIn text-left">
              <header className="flex justify-between items-center">
                <div className="text-left">
                  <h1 className="text-2xl font-display font-black text-slate-950">Reviews Console</h1>
                  <p className="text-xs text-slate-400 font-medium mt-1">You have 2 completed jobs that need your review.</p>
                </div>
              </header>

              {/* Awaiting Feedback row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Review Prompt Card 1 */}
                <div className="md:col-span-2 bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row h-[320px]">
                  <div className="relative w-full md:w-56 h-48 md:h-full bg-slate-100 flex-shrink-0">
                    <img src="https://images.unsplash.com/photo-1558002038-1055907df827?w=400" alt="Marcus Thorne" className="w-full h-full object-cover" />
                    <span className="absolute top-2.5 left-2.5 bg-indigo-600 text-white px-2.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide">
                      COMPLETED MAY 12
                    </span>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 px-2.5 py-1 rounded-xl text-white backdrop-blur-sm">
                      <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px] border border-white/20">MT</div>
                      <div className="text-left leading-none">
                        <span className="block text-[8.5px] font-bold">Marcus Thorne</span>
                        <span className="text-[7.5px] font-medium opacity-80">Certified Electrician</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between text-xs">
                    <div className="space-y-4">
                      <div className="text-left leading-tight">
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">Smart Lighting Installation</h4>
                        <p className="text-[9.5px] text-slate-400 font-bold block mt-1 uppercase">Professional setup of Philips Hue eco-system across the main floor and terrace.</p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">HOW WAS THE EXPERIENCE?</span>
                        <div className="flex gap-1 text-slate-300">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => handleRatingClick('rev-1', star)} className="hover:scale-110 transition-transform">
                              <Star className={`h-5.5 w-5.5 ${star <= (reviewsState.find(r => r.id === 'rev-1')?.rating || 0) ? 'text-amber-400 fill-currentColor' : 'text-slate-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">YOUR COMMENTS</span>
                        <input
                          type="text"
                          value={reviewsState.find(r => r.id === 'rev-1')?.comment || ''}
                          onChange={(e) => handleReviewTextChange('rev-1', e.target.value)}
                          placeholder="What stood out about Marcus's work?"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        handleReviewSubmit('rev-1');
                      }}
                      className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-2 rounded-xl transition-all shadow mt-4"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>

                {/* Review Prompt Card 2 */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[320px] text-left">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs border border-indigo-200">ER</div>
                      <div className="text-left leading-none">
                        <h4 className="font-bold text-xs text-slate-900">Elena Rodriguez</h4>
                        <span className="text-[9px] text-slate-400 font-bold block mt-1.5 uppercase">Painting Services</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-sm text-slate-950 pt-2 leading-tight">Accent Wall Painting</h4>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">Completed 2 days ago. Elena is waiting for your feedback to complete her job payout.</p>
                  </div>
                  <button 
                    onClick={() => addToast('Review details loaded...', 'info')}
                    className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-2 rounded-xl transition-all shadow"
                  >
                    Start Review
                  </button>
                </div>
              </div>

              {/* History section */}
              <div className="space-y-4 pt-6 border-t border-slate-200/60 mt-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase text-slate-950 tracking-wider">History</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setReviewsHistoryFilter('all')} className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${reviewsHistoryFilter === 'all' ? 'bg-slate-200 text-slate-800' : 'text-slate-400'}`}>All</button>
                    <button onClick={() => setReviewsHistoryFilter('high')} className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${reviewsHistoryFilter === 'high' ? 'bg-slate-200 text-slate-800' : 'text-slate-400'}`}>High Rated</button>
                  </div>
                </div>
                <div className="p-8 bg-white border border-slate-200/60 rounded-2xl text-center space-y-1 text-slate-450 shadow-sm h-[120px] flex flex-col justify-center items-center">
                  <Star className="h-6 w-6 text-slate-300" />
                  <p className="text-xs mt-2">Past rating history will appear here.</p>
                </div>
              </div>

            </div>
          )}



          {/* TAB 8: ANALYTICS / SUPPORT */}
          {activeTab === 'help' && (
            <div className="space-y-8 animate-fadeIn text-left">
              <div>
                <h1 className="text-xl font-display font-black text-slate-900 uppercase tracking-wider">Analytics & FAQ</h1>
                <p className="text-xs text-slate-400 font-medium">Coordinate help logs and support details.</p>
              </div>

              <div className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-display font-black text-xs uppercase text-slate-900 tracking-wide text-center">FAQ Support search</h3>
                <div className="relative max-w-md mx-auto">
                  <input
                    type="text"
                    placeholder="Search help topics..."
                    className="w-full bg-slate-50 border-0 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                  <SearchIcon className="h-4.5 w-4.5 text-slate-400 absolute left-3.5 top-2.5" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn text-left">
              <div>
                <h1 className="text-xl font-display font-black text-slate-900 uppercase tracking-wider">Settings</h1>
                <p className="text-xs text-slate-400 font-medium">Update notification and interface toggles.</p>
              </div>

              <div className="p-6 bg-white border border-slate-200/60 rounded-2xl max-w-xl shadow-sm text-xs text-slate-650 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">Email Notifications</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Receive email alerts on bids</p>
                  </div>
                  <button
                    onClick={() => setSettingsToggles({ ...settingsToggles, emailNotifications: !settingsToggles.emailNotifications })}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${
                      settingsToggles.emailNotifications ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  >
                    <div className={`bg-white h-4.5 w-4.5 rounded-full transform transition-transform duration-200 ${
                      settingsToggles.emailNotifications ? 'translate-x-4.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                  <div>
                    <h4 className="font-bold text-slate-900">Push Notifications</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Receive real-time alerts on bids and messages</p>
                  </div>
                  <button
                    onClick={() => setSettingsToggles({ ...settingsToggles, pushNotifications: !settingsToggles.pushNotifications })}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${
                      settingsToggles.pushNotifications ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  >
                    <div className={`bg-white h-4.5 w-4.5 rounded-full transform transition-transform duration-200 ${
                      settingsToggles.pushNotifications ? 'translate-x-4.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 12: LOGOUT CONFIRMATION */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 max-w-sm w-full rounded-2xl p-6 shadow-2xl relative text-center"
            >
              <div className="flex flex-col items-center gap-4.5">
                <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center border border-rose-100">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-slate-900 uppercase tracking-wider leading-none">Logout</h3>
                  <p className="text-xs text-slate-400 mt-2.5 leading-normal">
                    Are you sure you want to logout from your account?
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-4">
                  <button 
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 bg-transparent hover:bg-slate-50 border border-slate-200 text-xs py-3 font-bold rounded-lg text-slate-700 transition-all outline-none"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setShowLogoutConfirm(false);
                      logout();
                      navigate('/');
                    }}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-xs py-3 font-bold rounded-lg text-white transition-all outline-none shadow"
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
