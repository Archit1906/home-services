import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Search, FileText, Calendar, CreditCard, Star, 
  Clock, MessageSquare, User, Settings, HelpCircle, Bell, ChevronDown, 
  MapPin, CheckCircle2, ArrowRight, DollarSign, TrendingUp, Menu,
  Briefcase, Users, Droplet, Zap, Send, Phone, Video, ShieldAlert,
  Sun, RefreshCw, Plus, X, Snowflake, Sprout, Paintbrush, Hammer, Sparkles
} from 'lucide-react';
import { useJsApiLoader, GoogleMap, MarkerF } from '@react-google-maps/api';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';
import { useChatStore } from '../store/chatStore.js';
import Avatar from '../components/ui/Avatar.jsx';

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

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '16px'
};

const DEFAULT_CENTER = { lat: 19.0760, lng: 72.8777 }; // Mumbai coordinates

const getCategoryImage = (category) => {
  const images = {
    'Plumbing': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=250&auto=format&fit=crop&q=60',
    'Electrical': 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=250&auto=format&fit=crop&q=60',
    'HVAC': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=250&auto=format&fit=crop&q=60',
    'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=250&auto=format&fit=crop&q=60',
    'Gardening': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=250&auto=format&fit=crop&q=60',
    'Landscaping': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=250&auto=format&fit=crop&q=60',
    'Painting': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=250&auto=format&fit=crop&q=60',
    'Carpentry': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=250&auto=format&fit=crop&q=60',
    'Appliances': 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=250&auto=format&fit=crop&q=60'
  };
  return images[category] || 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=250';
};

const CATEGORY_ICONS = {
  'Plumbing': Droplet,
  'Electrical': Zap,
  'HVAC': Snowflake,
  'Cleaning': Sparkles,
  'Gardening': Sprout,
  'Landscaping': Sprout,
  'Painting': Paintbrush,
  'Carpentry': Hammer,
  'Appliances': RefrigeratorIcon
};

const getCategorySpecificMockData = (category, userCity) => {
  const city = userCity || 'Mumbai';
  const data = {
    'Plumbing': {
      bookings: [
        { title: 'Emergency Pipe Repair', budget: 1200, address: `Andheri East, ${city}` },
        { title: 'Tap Installation', budget: 850, address: `Bandra West, ${city}` },
        { title: 'Bathroom Leakage Fix', budget: 1500, address: `Worli, ${city}` }
      ],
      transactions: [
        { title: 'Pipe repair', budget: 850 },
        { title: 'Tap installation', budget: 1200 },
        { title: 'Bathroom leakage', budget: 1500 }
      ],
      reviews: [
        'Great work! Fixed the leakage quickly and was very professional.',
        'Very punctual and did a neat installation.',
        'Good service and polite behavior.'
      ]
    },
    'Electrical': {
      bookings: [
        { title: 'EV Charger Installation', budget: 8000, address: `Vikhroli, ${city}` },
        { title: 'Ceiling Fan Installation', budget: 1200, address: `Colaba, ${city}` },
        { title: 'Short Circuit Inspection', budget: 2500, address: `Juhu, ${city}` }
      ],
      transactions: [
        { title: 'EV Charger Setup', budget: 8000 },
        { title: 'Ceiling Fan fitting', budget: 1200 },
        { title: 'Short Circuit Fix', budget: 2500 }
      ],
      reviews: [
        'Excellent electrician! Installed the Nexon EV charger safely and quickly.',
        'Very knowledgeable. Resolved my short circuit issue in no time.',
        'Punctual, clean, and highly professional wiring job.'
      ]
    },
    'Cleaning': {
      bookings: [
        { title: 'Full House Deep Cleaning', budget: 4500, address: `Powai, ${city}` },
        { title: 'Sofa & Carpet Vacuuming', budget: 1500, address: `Chembur, ${city}` },
        { title: 'Post-Renovation Cleanup', budget: 6000, address: `Goregaon, ${city}` }
      ],
      transactions: [
        { title: 'Full house deep cleaning', budget: 4500 },
        { title: 'Sofa cleaning', budget: 1500 },
        { title: 'Renovation cleanup', budget: 6000 }
      ],
      reviews: [
        'My house is absolutely sparkling! Incredible attention to detail.',
        'Very professional cleaners, arrived on time and did a thorough vacuuming.',
        'Cleaned up all the dust and debris perfectly after our painting work.'
      ]
    },
    'HVAC': {
      bookings: [
        { title: 'Daikin Split AC Servicing', budget: 1800, address: `Mulund, ${city}` },
        { title: 'AC Gas Top-Up & Cleaning', budget: 2500, address: `Bhandup, ${city}` },
        { title: 'Compressor Repair & Check', budget: 4500, address: `Malad, ${city}` }
      ],
      transactions: [
        { title: 'Daikin AC Service', budget: 1800 },
        { title: 'AC Gas Top-Up', budget: 2500 },
        { title: 'Compressor Repair', budget: 4500 }
      ],
      reviews: [
        'AC is cooling perfectly now. Excellent deep cleaning and gas top-up.',
        'Quick diagnosis of the cooling issue and resolved it on the same day.',
        'Extremely professional AC technician. Highly recommended.'
      ]
    },
    'Painting': {
      bookings: [
        { title: 'Living Room Accent Wall Paint', budget: 5000, address: `Khar, ${city}` },
        { title: 'Kitchen & Cabinet Respraying', budget: 850, address: `Dadar, ${city}` },
        { title: 'Waterproof Exterior Door Paint', budget: 3000, address: `Sion, ${city}` }
      ],
      transactions: [
        { title: 'Accent wall painting', budget: 5000 },
        { title: 'Kitchen respraying', budget: 850 },
        { title: 'Door painting', budget: 3000 }
      ],
      reviews: [
        'Beautiful accent wall painting. The finish is flawless!',
        'Resprayed our kitchen cabinets perfectly. Looks brand new.',
        'Very tidy painting work, no spills, and very professional.'
      ]
    },
    'Gardening': {
      bookings: [
        { title: 'Lawn Mowing & Weed Removal', budget: 1200, address: `Vashi, ${city}` },
        { title: 'Terrace Garden Irrigation Setup', budget: 4000, address: `Nerul, ${city}` },
        { title: 'Pruning & Hedge Trimming', budget: 1500, address: `Belapur, ${city}` }
      ],
      transactions: [
        { title: 'Lawn mowing', budget: 1200 },
        { title: 'Irrigation setup', budget: 4000 },
        { title: 'Hedge trimming', budget: 1500 }
      ],
      reviews: [
        'Pruned all my garden hedges beautifully. Looks very clean.',
        'Terrace irrigation system works like a charm. Very smart setup.',
        'Reliable gardener, cleaned up all the weeds and mowed the lawn.'
      ]
    },
    'Landscaping': {
      bookings: [
        { title: 'Lawn Mowing & Weed Removal', budget: 1200, address: `Vashi, ${city}` },
        { title: 'Terrace Garden Irrigation Setup', budget: 4000, address: `Nerul, ${city}` },
        { title: 'Pruning & Hedge Trimming', budget: 1500, address: `Belapur, ${city}` }
      ],
      transactions: [
        { title: 'Lawn mowing', budget: 1200 },
        { title: 'Irrigation setup', budget: 4000 },
        { title: 'Hedge trimming', budget: 1500 }
      ],
      reviews: [
        'Pruned all my garden hedges beautifully. Looks very clean.',
        'Terrace irrigation system works like a charm. Very smart setup.',
        'Reliable gardener, cleaned up all the weeds and mowed the lawn.'
      ]
    },
    'Carpentry': {
      bookings: [
        { title: 'Wardrobe Hinges & Latch Repair', budget: 1500, address: `Thane, ${city}` },
        { title: 'Custom TV Unit Installation', budget: 6500, address: `Kalyan, ${city}` },
        { title: 'Wooden Table Assembly & Polish', budget: 2500, address: `Dombivli, ${city}` }
      ],
      transactions: [
        { title: 'Hinges repair', budget: 1500 },
        { title: 'Custom TV unit install', budget: 6500 },
        { title: 'Table assembly', budget: 2500 }
      ],
      reviews: [
        'Fixed our wardrobe doors perfectly. Very skilled carpenter.',
        'High quality TV unit installation. Neat and sturdy.',
        'Assembled and polished our wooden table with care.'
      ]
    },
    'Appliances': {
      bookings: [
        { title: 'Double Door Refrigerator Repair', budget: 2200, address: `Ghatkopar, ${city}` },
        { title: 'Washing Machine Drum Seal Fix', budget: 1800, address: `Kurla, ${city}` },
        { title: 'Microwave Oven Heating Repair', budget: 1200, address: `Vikhroli, ${city}` }
      ],
      transactions: [
        { title: 'Refrigerator repair', budget: 2200 },
        { title: 'Washing machine fix', budget: 1800 },
        { title: 'Microwave repair', budget: 1200 }
      ],
      reviews: [
        'Diagnosed the fridge cooling issue immediately and fixed it.',
        'Washing machine is no longer leaking. Quick door seal replacement.',
        'Oven heating issue resolved. Polite and professional technician.'
      ]
    }
  };
  return data[category] || data['Plumbing'];
};


export default function WorkerDashboard() {
  const navigate = useNavigate();
  const { user, worker, logout, token } = useAuthStore();
  const { addToast } = useToastStore();
  const { initSocket } = useChatStore();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Filters
  const [findJobsFilter, setFindJobsFilter] = useState('all');
  const [findJobsView, setFindJobsView] = useState('list');
  const [findJobsSearch, setFindJobsSearch] = useState('');
  const [findJobsDistance, setFindJobsDistance] = useState(15);
  const [findJobsMinBudget, setFindJobsMinBudget] = useState('');
  const [findJobsMaxBudget, setFindJobsMaxBudget] = useState('');
  const [selectedJobForDetail, setSelectedJobForDetail] = useState(null);
  const [appsFilter, setAppsFilter] = useState('all');
  const [bookingsFilter, setBookingsFilter] = useState('upcoming');
  const [reviewsFilter, setReviewsFilter] = useState('received');
  const [incomeTrendsTimeframe, setIncomeTrendsTimeframe] = useState('monthly');
  
  // Lists
  const [allJobs, setAllJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [stats, setStats] = useState({
    jobsApplied: 0,
    interviews: 0,
    activeJobs: 0,
    totalEarnings: 0
  });
  const [earningsGoal, setEarningsGoal] = useState({ current: 1248.50, target: 2000 });
  const [weeklyJobs, setWeeklyJobs] = useState([]);

  // Shifts calendar
  const [availCalendar, setAvailCalendar] = useState([
    { day: 'Monday', active: true, slots: '09:00 AM - 05:00 PM' },
    { day: 'Tuesday', active: true, slots: '09:00 AM - 05:00 PM' },
    { day: 'Wednesday', active: true, slots: '09:00 AM - 05:00 PM' },
    { day: 'Thursday', active: true, slots: '09:00 AM - 05:00 PM' },
    { day: 'Friday', active: true, slots: '09:00 AM - 05:00 PM' },
    { day: 'Saturday', active: true, slots: '09:00 AM - 05:00 PM' },
    { day: 'Sunday', active: false, slots: 'Not Available' }
  ]);

  // Profile
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+91 98765 43210');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'ramesh.kumar@gmail.com');
  const [profileCategory, setProfileCategory] = useState(worker?.serviceType || 'Plumbing');
  const [profileExp, setProfileExp] = useState(worker?.experience || 5);
  const [profileAddress, setProfileAddress] = useState(user?.city || 'Mumbai, Maharashtra');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Settings
  const [settingsToggles, setSettingsToggles] = useState({
    pushNotifications: true,
    emailNotifications: true,
    marketingEmails: true,
    darkMode: false
  });

  // Chat
  const [activeChat, setActiveChat] = useState('alex');
  const [chatText, setChatText] = useState('');
  const [alexMessages, setAlexMessages] = useState([
    { id: 1, sender: 'alex', text: "Hi Ramesh, are you available tomorrow?", time: '10:10 AM' },
    { id: 2, sender: 'me', text: "Yes, I am available.", time: '10:11 AM' },
    { id: 3, sender: 'alex', text: "Can you come by 10 AM?", time: '10:12 AM' },
    { id: 4, sender: 'me', text: "Sure, I will be there.", time: '10:13 AM' }
  ]);
  const [priyaMessages, setPriyaMessages] = useState([
    { id: 1, sender: 'priya', text: "Thanks for the service!", time: 'Yesterday' }
  ]);
  const [sureshMessages, setSureshMessages] = useState([
    { id: 1, sender: 'suresh', text: "Please call me.", time: '12 May' }
  ]);

  const CATEGORY_THEME = {
    'Plumbing': { icon: Droplet, color: 'text-blue-600 bg-blue-50 border-l-4 border-l-blue-600' },
    'Electrical': { icon: Zap, color: 'text-orange-600 bg-orange-50 border-l-4 border-l-orange-600' },
    'Cleaning': { icon: SprayBottleIcon, color: 'text-green-600 bg-green-50 border-l-4 border-l-green-600' },
    'Appliances': { icon: RefrigeratorIcon, color: 'text-blue-600 bg-blue-50 border-l-4 border-l-blue-600' }
  };

  const getCategoryTheme = (category) => {
    return CATEGORY_THEME[category] || { icon: Briefcase, color: 'text-slate-600 bg-slate-50 border-l-4 border-l-slate-400' };
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

      const isRamesh = user?.email === 'worker1@example.com';
      const hiredApps = apps.filter(a => a.status === 'hired' || a.status === 'assigned');
      const earningsSum = hiredApps.reduce((acc, app) => acc + (app.job?.budget || 0), 0);
      const totalEarnings = isRamesh ? (earningsSum || 1248.50) : earningsSum;

      setStats({
        jobsApplied: isRamesh ? (apps.length || 12) : apps.length,
        interviews: isRamesh ? (apps.filter(a => a.status === 'shortlisted' || a.status === 'interview').length || 4) : apps.filter(a => a.status === 'shortlisted' || a.status === 'interview').length,
        activeJobs: isRamesh ? (hiredApps.length || 3) : hiredApps.length,
        totalEarnings
      });

      setEarningsGoal({
        current: totalEarnings,
        target: 2000
      });

      if (jobsRes.ok && jobsData.jobs) {
        const openJobs = jobsData.jobs.filter(j => j.status === 'open');
        setAllJobs(openJobs);

        const matched = openJobs.map(job => {
          const cacheMatch = job.aiMatchCache?.find(m => m.workerId === worker?.id);
          let score = cacheMatch ? cacheMatch.score : (job.serviceType === worker?.serviceType ? 92 : 65);
          let distance = job.distance || (Math.floor(Math.random() * 8) + 1) + (Math.round(Math.random() * 9) / 10);
          let timeString = getRelativeTimeString(job.createdAt);

          return {
            ...job,
            matchScore: score,
            distance,
            timeString
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
      setProfilePhone(user.phone || '+91 98765 43210');
      setProfileEmail(user.email || 'ramesh.kumar@gmail.com');
      setProfileAddress(user.city || 'Mumbai, Maharashtra');
      if (worker) {
        setProfileCategory(worker.serviceType || 'Plumbing');
        setProfileExp(worker.experience || 5);
        loadWorkerData();
        initSocket(user.id);

        const workerFirstName = (user.name || 'Ramesh').split(' ')[0];
        setAlexMessages(prev => prev.map(msg => {
          if (msg.sender === 'alex' && msg.text && msg.text.includes('Hi Ramesh')) {
            return {
              ...msg,
              text: msg.text.replace('Hi Ramesh', `Hi ${workerFirstName}`)
            };
          }
          return msg;
        }));
      }
    }
  }, [user, worker]);

  const handleApply = async (jobId) => {
    if (jobId.toString().startsWith('mock-')) {
      setSubmittingId(jobId);
      setTimeout(() => {
        addToast('Mock application submitted successfully!', 'success');
        setSubmittingId(null);
        setSelectedJobForDetail(null);
      }, 800);
      return;
    }
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
      setSelectedJobForDetail(null);
    } catch (err) {
      addToast(err.message || 'Application failed', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const sendMessage = () => {
    if (!chatText.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: chatText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (activeChat === 'alex') {
      setAlexMessages([...alexMessages, newMsg]);
    } else if (activeChat === 'priya') {
      setPriyaMessages([...priyaMessages, newMsg]);
    } else if (activeChat === 'suresh') {
      setSureshMessages([...sureshMessages, newMsg]);
    }
    setChatText('');
  };

  const getActiveChatMessages = () => {
    if (activeChat === 'alex') return alexMessages;
    if (activeChat === 'priya') return priyaMessages;
    if (activeChat === 'suresh') return sureshMessages;
    return [];
  };

  const getActiveChatName = () => {
    if (activeChat === 'alex') return 'Alex Johnson';
    if (activeChat === 'priya') return 'Priya Sharma';
    if (activeChat === 'suresh') return 'Suresh Yadav';
    return 'Anonymous';
  };

  const getActiveChatDetails = () => {
    if (activeChat === 'alex') return 'Mumbai, Block 10 • 1.5 km';
    if (activeChat === 'priya') return 'Mumbai, Block 4 • 2.4 km';
    if (activeChat === 'suresh') return 'Mumbai, Block 9 • 0.8 km';
    return 'Customer';
  };

  const mockFindJobs = [
    {
      id: 'mock-1',
      title: 'Emergency Water Leak Repair',
      category: 'Plumbing',
      description: 'Water tank line leak on terrace causing seepage in kitchen. Need immediate repair...',
      minBudget: 1500,
      maxBudget: 3500,
      budget: 2500,
      distance: 2.4,
      rating: 4.9,
      reviewsCount: 12,
      badge: 'NEW',
      posted: '2 hrs ago',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=250&auto=format&fit=crop&q=60',
      lat: 19.0760,
      lng: 72.8777
    },
    {
      id: 'mock-2',
      title: 'EV Charger Installation',
      category: 'Electrical',
      description: 'Installation of a Tata Nexon EV charging point in parking slot...',
      minBudget: 8000,
      maxBudget: 12000,
      budget: 10000,
      distance: 8.1,
      rating: 5.0,
      reviewsCount: 4,
      badge: '',
      posted: '4 hrs ago',
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=250&auto=format&fit=crop&q=60',
      lat: 19.0820,
      lng: 72.8820
    },
    {
      id: 'mock-3',
      title: 'Split AC Deep Servicing',
      category: 'HVAC',
      description: 'Deep servicing and gas top-up for Daikin Split AC...',
      minBudget: 1200,
      maxBudget: 2000,
      budget: 1600,
      distance: 1.2,
      rating: 4.8,
      reviewsCount: 32,
      badge: '',
      posted: '1 day ago',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=250&auto=format&fit=crop&q=60',
      lat: 19.0680,
      lng: 72.8690
    },
    {
      id: 'mock-4',
      title: 'Kitchen LED Ceiling Lights',
      category: 'Electrical',
      description: 'Install 6 new recessed ceiling LED lights in kitchen area...',
      minBudget: 4500,
      maxBudget: 7000,
      budget: 5500,
      distance: 5.5,
      rating: 4.7,
      reviewsCount: 8,
      badge: 'URGENT',
      posted: '3 days ago',
      image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=250&auto=format&fit=crop&q=60',
      lat: 19.0710,
      lng: 72.8750
    }
  ];

  const mockApplications = [
    { id: 'ma-1', title: 'Fix refrigerator cooling issue', category: 'Appliances', budget: 3450, status: 'Shortlisted', time: 'Ahmedabad • 2.1 km' },
    { id: 'ma-2', title: 'Moveout cleaning service', category: 'Cleaning', budget: 4500, status: 'Interview', time: 'Bengaluru • 7.5 km' },
    { id: 'ma-3', title: 'Re-wiring bathroom outlets', category: 'Electrical', budget: 1350, status: 'Applied', time: 'Delhi • 1.6 km' },
    { id: 'ma-4', title: 'AC servicing', category: 'Electrical', budget: 2200, status: 'Hired', time: 'Mumbai • 2.4 km' },
    { id: 'ma-5', title: 'Tap repair', category: 'Plumbing', budget: 850, status: 'Rejected', time: 'Mumbai • 1.1 km' }
  ];

  const categoryData = getCategorySpecificMockData(profileCategory, user?.city || 'Mumbai');

  const mockBookings = [
    { id: 'mb-1', title: categoryData.bookings[0].title, category: profileCategory, budget: categoryData.bookings[0].budget, date: '10:00 AM - 12:00 PM', customer: 'Aarav Sharma', phone: '+91 98765 43210', status: 'Upcoming', address: categoryData.bookings[0].address },
    { id: 'mb-2', title: categoryData.bookings[1].title, category: profileCategory, budget: categoryData.bookings[1].budget, date: '02:30 PM - 04:00 PM', customer: 'Priya Patel', phone: '+91 91234 56789', status: 'Upcoming', address: categoryData.bookings[1].address },
    { id: 'mb-3', title: categoryData.bookings[2].title, category: profileCategory, budget: categoryData.bookings[2].budget, date: '05:00 PM - 08:00 PM', customer: 'Suresh Yadav', phone: '+91 95555 12345', status: 'Upcoming', address: categoryData.bookings[2].address }
  ];

  const mockTransactions = [
    { id: 'tx-1', title: categoryData.transactions[0].title, budget: categoryData.transactions[0].budget, date: '12 May 2024', status: 'Completed' },
    { id: 'tx-2', title: categoryData.transactions[1].title, budget: categoryData.transactions[1].budget, date: '10 May 2024', status: 'Completed' },
    { id: 'tx-3', title: categoryData.transactions[2].title, budget: categoryData.transactions[2].budget, date: '8 May 2024', status: 'Completed' }
  ];

  const mockReviews = [
    { id: 'rev-1', customer: 'Aarav Sharma', date: '15 May 2024', rating: 5, text: categoryData.reviews[0] },
    { id: 'rev-2', customer: 'Priya Patel', date: '12 May 2024', rating: 5, text: categoryData.reviews[1] },
    { id: 'rev-3', customer: 'Suresh Yadav', date: '8 May 2024', rating: 5, text: categoryData.reviews[2] }
  ];

  const displayFindJobs = allJobs.length > 0 ? allJobs.map(j => ({
    id: j.id,
    title: j.title,
    category: j.serviceType,
    description: j.description,
    budget: j.budget,
    posted: getRelativeTimeString(j.createdAt),
    distance: j.distance || (Math.floor(Math.random() * 8) + 1) + (Math.round(Math.random() * 9) / 10),
    status: j.isEmergency ? 'URGENT' : 'OPEN',
    badge: j.isEmergency ? 'URGENT' : '',
    rating: (4.5 + Math.random() * 0.4).toFixed(1),
    reviewsCount: Math.floor(Math.random() * 30) + 5,
    image: getCategoryImage(j.serviceType),
    lat: j.lat,
    lng: j.lng
  })) : mockFindJobs;

  const filteredFindJobs = displayFindJobs.filter(j => {
    const jobCat = j.category || '';
    const jobTitle = j.title || '';
    const jobDesc = j.description || '';
    const distanceVal = j.distance || 1.5;
    const budgetVal = j.budget || (j.minBudget ? (j.minBudget + j.maxBudget) / 2 : 0);

    if (findJobsFilter !== 'all' && jobCat.toLowerCase() !== findJobsFilter.toLowerCase()) return false;
    if (findJobsSearch && !jobTitle.toLowerCase().includes(findJobsSearch.toLowerCase()) && !jobDesc.toLowerCase().includes(findJobsSearch.toLowerCase())) return false;
    if (distanceVal > findJobsDistance) return false;
    if (findJobsMinBudget && budgetVal < Number(findJobsMinBudget)) return false;
    if (findJobsMaxBudget && budgetVal > Number(findJobsMaxBudget)) return false;
    return true;
  });

  const workerFirstName = (user?.name || 'Ramesh').split(' ')[0];

  const getPraiseCategoryText = (cat) => {
    const map = {
      'Plumbing': 'plumbing issue',
      'Electrical': 'wiring problem',
      'Cleaning': 'cleaning service',
      'HVAC': 'AC problem',
      'Painting': 'wall paint job',
      'Gardening': 'garden trimming',
      'Landscaping': 'garden trimming',
      'Carpentry': 'wardrobe repair',
      'Appliances': 'refrigerator repair'
    };
    return map[cat] || 'service request';
  };

  const getReview1CategoryText = (cat) => {
    const map = {
      'Plumbing': 'pipes under the sink for any other leaks',
      'Electrical': 'fuse box for any other loose wires',
      'Cleaning': 'corners of the room for any left-over spots',
      'HVAC': 'air filters for any other dust build-up',
      'Painting': 'baseboards for any other paint spills',
      'Gardening': 'hedges for any other wild weeds',
      'Landscaping': 'hedges for any other wild weeds',
      'Carpentry': 'wooden joints for any other cracks',
      'Appliances': 'wiring for any other issues'
    };
    return map[cat] || 'details for any other concerns';
  };

  const getReview2CategoryText = (cat) => {
    const map = {
      'Plumbing': 'new faucets',
      'Electrical': 'new outlets',
      'Cleaning': 'sparkling carpets',
      'HVAC': 'serviced vents',
      'Painting': 'newly painted walls',
      'Gardening': 'clean garden beds',
      'Landscaping': 'clean garden beds',
      'Carpentry': 'new wooden shelves',
      'Appliances': 'repaired fridge seals'
    };
    return map[cat] || 'completed repairs';
  };

  const praiseText1 = `"${workerFirstName} was incredibly professional. The ${getPraiseCategoryText(profileCategory)} was fixed in half the time I expected and the workspace was left cleaner than when he arrived."`;
  const praiseText2 = `"Highly recommend for anyone needing quick ${profileCategory.toLowerCase()} work. Very transparent pricing."`;

  const reviewText1 = `"Absolutely wonderful service. ${workerFirstName} arrived right on time and was very respectful of my home. He even checked the ${getReview1CategoryText(profileCategory)} just to be safe. Highly recommend to anyone in the suburbs."`;
  const reviewText2 = `"Great work overall. There was a bit of a scheduling mix-up initially, but once ${workerFirstName} got here, he was fast and efficient. The ${getReview2CategoryText(profileCategory)} look great and are exactly where I wanted them."`;

  const secondaryCategory = profileCategory === 'Electrical' ? 'Plumbing' : 'Electrical';
  const tertiaryCategory = profileCategory === 'Cleaning' ? 'HVAC' : 'Cleaning';

  const mockEarningsTransactions = [
    { name: 'Sunita Rao', service: profileCategory, date: 'June 24, 2026', amount: '₹3,200.00', status: 'Completed' },
    { name: 'Manish Sharma', service: secondaryCategory, date: 'June 20, 2026', amount: '₹1,500.00', status: 'Completed' },
    { name: 'The Sharmas', service: profileCategory, date: 'June 18, 2026', amount: '₹4,850.00', status: 'Completed' },
    { name: 'Vikram Singh', service: tertiaryCategory, date: 'June 12, 2026', amount: '₹3,500.00', status: 'Completed' },
  ];

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
          <button onClick={() => addToast('Sidebar toggled', 'info')} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-all">
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-grow max-w-md mx-8 relative hidden md:block">
          <input
            type="text"
            placeholder="Search tasks or clients..."
            className="w-full bg-slate-100 border-0 rounded-full px-5 py-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
          />
          <Search className="h-4 w-4 text-slate-400 absolute right-4 top-2.5" />
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/home/post-job')}
            className="bg-indigo-600 hover:bg-indigo-700 text-xs px-4 py-2 rounded-lg font-bold text-white transition-all"
          >
            Post a Job
          </button>
          
          <button className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-500 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full" />
          </button>
          
          <button onClick={() => navigate('/auth')} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-500">
            <MessageSquare className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
              {getInitials(user?.name || 'Alex')}
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-[#f0f4f9] border-r border-slate-200 flex flex-col justify-between p-6 overflow-y-auto flex-shrink-0 text-slate-700">
          <div className="space-y-6">
            
            {/* Welcome banner at top of sidebar */}
            <div className="flex items-center gap-3 mb-6 p-1 pl-2 bg-white/40 rounded-xl border border-slate-200/50">
              <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                {getInitials(user?.name || 'Alex')}
              </div>
              <div className="leading-none text-left">
                <span className="block text-[10px] font-bold text-slate-400 mb-0.5">Welcome back</span>
                <span className="text-xs font-black text-slate-900 uppercase">Premium Member</span>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'find-jobs', label: 'Postings', icon: Briefcase },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
                { id: 'my-applications', label: 'Applicants', icon: Users },
                { id: 'earnings', label: 'Payments', icon: CreditCard },
                { id: 'reviews-tab', label: 'Reviews', icon: Star },
                { id: 'my-bookings', label: 'Schedule', icon: Calendar },
                { id: 'reviews', label: 'Analytics', icon: TrendingUp }
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
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
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
                activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <Settings className="h-4.5 w-4.5" /> Settings
            </button>

            <button 
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all text-left ${
                activeTab === 'support' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <HelpCircle className="h-4.5 w-4.5" /> Support
            </button>
            
            <button 
              onClick={() => addToast('To switch dashboard view roles, please log out and log in with a Homeowner account.', 'info')}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg text-slate-600 hover:bg-slate-200/50 hover:text-slate-950 text-left transition-all"
            >
              <RefreshCw className="h-4.5 w-4.5" /> Role Switcher
            </button>

            <button onClick={() => setShowLogoutConfirm(true)} className="w-full text-xs font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-50 p-3 rounded-lg transition-all text-left pl-4">
              Logout
            </button>
          </div>
        </aside>

        {/* Dynamic Panels */}
        <main className="flex-grow p-8 overflow-y-auto bg-slate-50">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn text-left">
              
              {/* Indigo Weather Gradient Banner */}
              <div className="bg-gradient-to-r from-indigo-600 to-[#848bf4] text-white p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center relative overflow-hidden shadow-sm">
                <div className="space-y-1 text-left relative z-10">
                  <h2 className="text-lg font-bold">Good Morning, {user?.name?.split(' ')?.[0] || 'Alex'}</h2>
                  <p className="text-xs opacity-90 font-medium">You have 3 shifts scheduled for today. The weather is perfect for outdoor work!</p>
                </div>

                <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-white flex-shrink-0 mt-4 sm:mt-0 relative z-10">
                  <div className="p-2 bg-white/20 rounded-full"><Sun className="h-5 w-5 text-white" /></div>
                  <div className="text-left leading-none font-bold uppercase text-[10px] tracking-wider">
                    <span className="block text-sm font-black mb-0.5">32°C</span>
                    Sunny &bull; Mumbai, MH
                  </div>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Weekly Earnings Card */}
                <div className="lg:col-span-8 bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-left leading-tight">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Weekly Earnings</span>
                      <h3 className="text-3xl font-display font-black text-slate-900 mt-1">₹12,485.00</h3>
                      <span className="text-[10px] text-emerald-500 font-bold block mt-1">▲ +12.4% <span className="text-slate-400">compared to last week</span></span>
                    </div>
                  </div>

                  {/* Vertical bar chart mock */}
                  <div className="h-40 flex items-end justify-between gap-4 pt-4">
                    {[
                      { day: 'Mon', val: 35 },
                      { day: 'Tue', val: 55 },
                      { day: 'Wed', val: 40 },
                      { day: 'Thu', val: 75 },
                      { day: 'Fri', val: 90 },
                      { day: 'Sat', val: 60 },
                      { day: 'Sun', val: 70, active: true }
                    ].map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-slate-100 rounded-lg overflow-hidden h-28 flex items-end">
                          <div 
                            style={{ height: `${bar.val}%` }} 
                            className={`w-full rounded-t-lg transition-all ${
                              bar.active ? 'bg-indigo-600' : 'bg-indigo-300'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side metrics cards stacked */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-xl text-slate-600"><Clock className="h-5 w-5" /></div>
                    <div className="leading-none text-left">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Hours</span>
                      <span className="text-lg font-black text-slate-900 mt-1 block">34.5 hrs</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-xl text-slate-600"><CheckCircle2 className="h-5 w-5" /></div>
                    <div className="leading-none text-left">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Completed Jobs</span>
                      <span className="text-lg font-black text-slate-900 mt-1 block">128</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-xl text-slate-600"><Star className="h-5 w-5 text-amber-500 fill-amber-500" /></div>
                    <div className="leading-none text-left">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Rating</span>
                      <span className="text-lg font-black text-slate-900 mt-1 block">4.92</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Upcoming Shifts Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase text-slate-950 tracking-wider">Upcoming Shifts</h3>
                  <button onClick={() => setActiveTab('my-bookings')} className="text-xs font-bold text-indigo-600 hover:underline">View Calendar</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {mockBookings.map((shift, idx) => {
                    const theme = getCategoryTheme(shift.category);
                    const ThemeIcon = theme.icon;
                    return (
                      <div key={idx} className="p-5 bg-white border border-slate-200/60 rounded-2xl flex flex-col justify-between h-[160px] shadow-sm hover:border-slate-300 transition-all text-left">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide">{shift.category}</span>
                            <span className="text-sm font-black text-indigo-600">₹{shift.budget}</span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 leading-tight pt-1.5">{shift.title}</h4>
                          <p className="text-[10px] text-slate-400 font-bold">{shift.address}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-3 mt-3">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{shift.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: FIND JOBS (Postings) */}
          {activeTab === 'find-jobs' && (
            <div className="space-y-6 animate-fadeIn text-left relative pb-12">
              <header className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-display font-black text-slate-900 uppercase tracking-wider">Job Postings</h1>
                  <p className="text-xs text-slate-400 font-medium">Discover high-priority service requests in your area.</p>
                </div>
                <button 
                  onClick={() => addToast('Post a Job is only available for Homeowner accounts. Log in as a Homeowner to request services.', 'info')}
                  className="bg-indigo-650 hover:bg-indigo-750 text-xs px-4 py-2.5 rounded-xl font-bold text-white transition-all shadow flex items-center gap-1.5 uppercase tracking-wide opacity-80"
                >
                  <Plus className="h-4 w-4" /> Post a Job
                </button>
              </header>

              {/* Premium Filter Console */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center bg-white p-5 border border-slate-200/60 rounded-2xl shadow-sm text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Category</label>
                  <select 
                    value={findJobsFilter}
                    onChange={(e) => setFindJobsFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  >
                    <option value="all">All Categories</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Gardening">Landscaping</option>
                    <option value="Painting">Painting</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Appliances">Appliances</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Distance (km)</label>
                  <div className="pt-2">
                    <input 
                      type="range" 
                      min="2" 
                      max="50" 
                      value={findJobsDistance} 
                      onChange={(e) => setFindJobsDistance(Number(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-extrabold mt-1 uppercase">
                      <span>2km</span>
                      <span className="text-indigo-650 font-black">{findJobsDistance}km</span>
                      <span>50km</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Budget Range (₹)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={findJobsMinBudget}
                      onChange={(e) => setFindJobsMinBudget(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20" 
                    />
                    <span className="text-slate-400 font-bold text-xs">-</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={findJobsMaxBudget}
                      onChange={(e) => setFindJobsMaxBudget(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/20" 
                    />
                  </div>
                </div>

                <button 
                  onClick={() => addToast(`Filters applied successfully: ${findJobsFilter} listings within ${findJobsDistance}km.`, 'success')}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-650 border border-indigo-100 font-extrabold text-[10px] px-5 py-2.5 rounded-xl transition-all self-end h-10 uppercase tracking-wide"
                >
                  Apply Filters
                </button>
              </div>

              {findJobsView === 'list' ? (
                /* Grid listings */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredFindJobs.map((job) => (
                    <div key={job.id} className="p-5 bg-white border border-slate-200/60 rounded-2xl flex gap-4 hover:shadow-md transition-all text-left relative shadow-sm">
                      
                      {/* Image Thumbnail with optional badge */}
                      <div className="relative h-28 w-28 flex-shrink-0 rounded-xl overflow-hidden">
                        {job.badge && (
                          <span className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider text-white ${
                            job.badge === 'URGENT' ? 'bg-[#1e293b]' : 'bg-indigo-600'
                          }`}>
                            {job.badge}
                          </span>
                        )}
                        <img src={job.image} alt={job.title} className="h-full w-full object-cover" />
                      </div>

                      {/* Job Info Details */}
                      <div className="flex-grow flex flex-col justify-between min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wide ${
                            job.category === 'Plumbing' ? 'bg-blue-50 text-blue-600' :
                            job.category === 'Electrical' ? 'bg-orange-50 text-orange-600' :
                            job.category === 'HVAC' ? 'bg-red-50 text-red-600' :
                            job.category === 'Cleaning' ? 'bg-purple-50 text-purple-600' :
                            job.category === 'Gardening' || job.category === 'Landscaping' ? 'bg-emerald-50 text-emerald-600' :
                            job.category === 'Painting' ? 'bg-orange-50 text-orange-600' :
                            job.category === 'Carpentry' ? 'bg-amber-50 text-amber-700' :
                            'bg-indigo-50 text-indigo-650'
                          }`}>
                            {job.category}
                          </span>
                          <div className="text-right leading-none">
                            <span className="block font-black text-xs text-indigo-600">
                              {job.minBudget ? `₹${job.minBudget?.toLocaleString()} - ₹${job.maxBudget?.toLocaleString()}` : `₹${job.budget?.toLocaleString()}`}
                            </span>
                            <span className="text-[8px] text-slate-400 font-bold block mt-1 uppercase">Est. Budget</span>
                          </div>
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-900 truncate leading-snug">{job.title}</h4>
                        <p className="text-[10px] text-slate-400 font-medium line-clamp-2 leading-relaxed">{job.description}</p>

                        <div className="flex justify-between items-center border-t border-slate-100 pt-2.5 mt-1">
                          <div className="flex gap-3 text-[10px] text-slate-400 font-bold items-center">
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {job.distance} km away</span>
                            <span className="flex items-center gap-1 text-amber-500 font-extrabold"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {job.rating} <span className="text-slate-400 font-bold">({job.reviewsCount} reviews)</span></span>
                          </div>
                          <button
                            onClick={() => setSelectedJobForDetail(job)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-650 text-[10px] px-3.5 py-2 rounded-lg font-bold transition-all active:scale-95 whitespace-nowrap border border-indigo-100"
                          >
                            View Details
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                /* Map Split Layout */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">
                  {/* Left Listing */}
                  <div className="lg:col-span-5 overflow-y-auto space-y-4 pr-2">
                    {filteredFindJobs.map(job => (
                      <div 
                        key={job.id} 
                        onClick={() => addToast(`Reviewing listing coordinates...`, 'info')}
                        className="p-5 bg-white border border-slate-200/60 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all h-[170px] shadow-sm text-left"
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-extrabold text-sm text-indigo-600">₹{job.budget}/hr</span>
                              <span className="text-[10px] text-slate-400 ml-1.5">({job.distance} km away)</span>
                            </div>
                            <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide">{job.status}</span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 leading-tight pt-1.5">{job.title}</h4>
                          <p className="text-[10px] text-slate-400 font-bold truncate leading-relaxed">{job.description}</p>
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-3">
                          <span className="text-[9px] text-slate-400 font-bold uppercase">Posted {job.posted}</span>
                          <button
                            onClick={() => handleApply(job.id)}
                            disabled={submittingId === job.id}
                            className="bg-indigo-600 hover:bg-indigo-700 text-[10px] px-4.5 py-2 rounded-lg font-bold text-white transition-all active:scale-95"
                          >
                            {submittingId === job.id ? 'Applying...' : 'Apply'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Map */}
                  <div className="lg:col-span-7 border border-slate-200/60 rounded-2xl overflow-hidden bg-slate-100 relative shadow-sm">
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={DEFAULT_CENTER}
                        zoom={13}
                        options={{
                          disableDefaultUI: false
                        }}
                      >
                        {filteredFindJobs.map(job => (
                          <MarkerF
                            key={job.id}
                            position={{ lat: job.lat || DEFAULT_CENTER.lat, lng: job.lng || DEFAULT_CENTER.lng }}
                            title={job.title}
                          />
                        ))}
                      </GoogleMap>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                        Loading Mumbai Map Pins...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Floating Map Toggle Button */}
              <div className="fixed bottom-6 left-[calc(50%+128px)] transform -translate-x-1/2 z-30">
                <button
                  onClick={() => setFindJobsView(findJobsView === 'list' ? 'map' : 'list')}
                  className="bg-[#1e293b] hover:bg-slate-800 text-white font-extrabold text-[10px] px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-2 transition-all active:scale-95 uppercase tracking-wider"
                >
                  <MapPin className="h-4 w-4" />
                  <span>{findJobsView === 'list' ? 'Switch to Map View' : 'Switch to List View'}</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="h-[600px] border border-slate-200/60 rounded-2xl overflow-hidden bg-white flex animate-fadeIn shadow-sm">
              <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
                <header className="p-4.5 border-b border-slate-200">
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-700 text-left">Conversations</h3>
                </header>
                <div className="flex-grow overflow-y-auto divide-y divide-slate-100">
                  {[
                    { id: 'alex', name: 'Alex Johnson', desc: 'Can you come by 10 AM?', time: '10m ago' },
                    { id: 'priya', name: 'Priya Sharma', desc: 'Thanks for the service!', time: 'Yesterday' },
                    { id: 'suresh', name: 'Suresh Yadav', desc: 'Please call me.', time: '2 days ago' }
                  ].map(chat => (
                    <button
                      key={chat.id}
                      onClick={() => setActiveChat(chat.id)}
                      className={`w-full p-4 flex items-start gap-3 transition-colors text-left ${
                        activeChat === chat.id 
                          ? 'bg-indigo-50 text-slate-900' 
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200 flex-shrink-0">
                        {getInitials(chat.name)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-bold text-xs truncate text-slate-900 leading-none">{chat.name}</h4>
                          <span className="text-[9px] text-slate-450">{chat.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate leading-tight mt-1">{chat.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-grow flex flex-col bg-white">
                <header className="h-14 border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="h-8.5 w-8.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                      {getInitials(getActiveChatName())}
                    </div>
                    <div className="text-left leading-none">
                      <h3 className="font-bold text-sm text-slate-900">{getActiveChatName()}</h3>
                      <p className="text-[10px] text-slate-400 mt-1">{getActiveChatDetails()}</p>
                    </div>
                  </div>
                </header>

                <div className="flex-grow p-6 overflow-y-auto space-y-4">
                  {getActiveChatMessages().map(msg => {
                    const isMe = msg.sender === 'me';
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
                </div>

                <footer className="p-4 border-t border-slate-200 flex-shrink-0 bg-slate-50 flex items-center gap-3">
                  <input
                    type="text"
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                  <button onClick={sendMessage} className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center text-white transition-all flex-shrink-0">
                    <Send className="h-4 w-4" />
                  </button>
                </footer>
              </div>
            </div>
          )}

          {/* TAB 4: APPLICANTS */}
          {activeTab === 'my-applications' && (
            <div className="space-y-6 animate-fadeIn text-left">
              <div>
                <h1 className="text-xl font-display font-black text-slate-900 uppercase tracking-wider">My Applications</h1>
                <p className="text-xs text-slate-400 font-medium">Verify your submitted bids and status.</p>
              </div>

              <div className="space-y-4">
                {mockApplications.map(app => (
                  <div key={app.id} className="p-5 bg-white border border-slate-200/60 rounded-2xl flex items-center justify-between hover:border-slate-300 transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs border border-indigo-100">
                        {getInitials(app.title)}
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">{app.title}</h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-1">{app.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-sm font-extrabold text-indigo-600">₹{app.budget?.toLocaleString()}</span>
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PAYMENTS */}
          {activeTab === 'earnings' && (
            <div className="space-y-8 animate-fadeIn text-left">
              <div>
                <h1 className="text-xl font-display font-black text-slate-900 uppercase tracking-wider">Payments Ledger</h1>
                <p className="text-xs text-slate-400 font-medium">Coordinate your payouts and view transaction history.</p>
              </div>

              <div className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-4 px-6">Transaction ID</th>
                      <th className="py-4 px-6">Description</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {mockTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-4.5 px-6 font-bold text-slate-900">Paid by Alex</td>
                        <td className="py-4.5 px-6 text-slate-450">{tx.title}</td>
                        <td className="py-4.5 px-6 font-semibold text-slate-800">₹{tx.budget?.toLocaleString()}</td>
                        <td className="py-4.5 px-6 text-slate-400">{tx.date}</td>
                        <td className="py-4.5 px-6 text-right">
                          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg px-2.5 py-0.5 font-bold uppercase tracking-wider text-[8px]">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: SCHEDULE */}
          {activeTab === 'my-bookings' && (
            <div className="space-y-6 animate-fadeIn text-left">
              <header className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-display font-black text-slate-900 uppercase tracking-wider">Manage Availability</h1>
                  <p className="text-xs text-slate-400 font-medium">Review your bookings and set open slots for the month.</p>
                </div>
                {/* Month/Week/Day Toggles */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/50 text-[10px] font-extrabold uppercase">
                  {['Month', 'Week', 'Day'].map((viewOpt) => (
                    <button
                      key={viewOpt}
                      onClick={() => addToast(`Toggled calendar view mode to ${viewOpt}`, 'info')}
                      className={`px-3 py-1.5 rounded-md transition-all ${
                        viewOpt === 'Month' 
                          ? 'bg-white text-indigo-650 shadow-sm font-black' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {viewOpt}
                    </button>
                  ))}
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
                
                {/* Month Calendar Grid (Left Column) */}
                <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm text-center flex flex-col">
                  {/* Calendar Headers */}
                  <div className="grid grid-cols-7 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100 pb-3 mb-3">
                    <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                  </div>
                  
                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-2.5 flex-grow">
                    {[
                      { dayNum: 29, isCurrentMonth: false },
                      { dayNum: 30, isCurrentMonth: false },
                      { dayNum: 31, isCurrentMonth: false },
                      { dayNum: 1, isCurrentMonth: true, events: [{ title: 'Plumbing Walkthrough', color: 'bg-blue-50 text-blue-600 border-l-4 border-l-blue-600' }] },
                      { dayNum: 2, isCurrentMonth: true, events: [{ title: 'Garden Maintenance', color: 'bg-green-50 text-green-600 border-l-4 border-l-green-600' }] },
                      { dayNum: 3, isCurrentMonth: true, events: [{ title: 'Install Recessed...', color: 'bg-indigo-50 text-indigo-600 border-l-4 border-l-indigo-600' }, { title: 'Client Consult...', color: 'bg-indigo-50 text-indigo-600 border-l-4 border-l-indigo-600' }] },
                      { dayNum: 4, isCurrentMonth: true },
                      { dayNum: 5, isCurrentMonth: true, events: [{ title: 'HVAC Service', color: 'bg-amber-50 text-amber-600 border-l-4 border-l-amber-600' }] },
                      { dayNum: 6, isCurrentMonth: true },
                      { dayNum: 7, isCurrentMonth: true, showAddButton: true },
                      { dayNum: 8, isCurrentMonth: true },
                      { dayNum: 9, isCurrentMonth: true, events: [{ title: 'Maid Service', color: 'bg-rose-50 text-rose-600 border-l-4 border-l-rose-600' }] },
                      { dayNum: 10, isCurrentMonth: true, events: [{ title: 'HVAC Service', color: 'bg-amber-50 text-amber-600 border-l-4 border-l-amber-600' }] },
                      { dayNum: 11, isCurrentMonth: true },
                      { dayNum: 12, isCurrentMonth: true },
                      { dayNum: 13, isCurrentMonth: true },
                      { dayNum: 14, isCurrentMonth: true, showAddButton: true },
                      { dayNum: 15, isCurrentMonth: true, events: [{ title: 'HVAC Service', color: 'bg-amber-50 text-amber-600 border-l-4 border-l-amber-600' }] },
                      { dayNum: 16, isCurrentMonth: true },
                      { dayNum: 17, isCurrentMonth: true },
                      { dayNum: 18, isCurrentMonth: true },
                      { dayNum: 19, isCurrentMonth: true },
                      { dayNum: 20, isCurrentMonth: true, events: [{ title: 'HVAC Service', color: 'bg-amber-50 text-amber-600 border-l-4 border-l-amber-600' }] },
                      { dayNum: 21, isCurrentMonth: true, showAddButton: true },
                      { dayNum: 22, isCurrentMonth: true },
                      { dayNum: 23, isCurrentMonth: true },
                      { dayNum: 24, isCurrentMonth: true },
                      { dayNum: 25, isCurrentMonth: true },
                      { dayNum: 26, isCurrentMonth: true },
                      { dayNum: 27, isCurrentMonth: true, events: [{ title: 'Maid Service', color: 'bg-rose-50 text-rose-600 border-l-4 border-l-rose-600' }] },
                      { dayNum: 28, isCurrentMonth: true, showAddButton: true },
                      { dayNum: 29, isCurrentMonth: true },
                      { dayNum: 30, isCurrentMonth: true, events: [{ title: 'HVAC Service', color: 'bg-amber-50 text-amber-600 border-l-4 border-l-amber-600' }] },
                      { dayNum: 31, isCurrentMonth: true },
                      { dayNum: 1, isCurrentMonth: false },
                    ].map((d, idx) => (
                      <div 
                        key={idx} 
                        className={`min-h-[90px] border border-slate-100 rounded-xl p-2 flex flex-col justify-between text-left ${
                          d.isCurrentMonth ? 'bg-white' : 'bg-slate-50 opacity-40'
                        }`}
                      >
                        <span className={`text-[10px] font-extrabold ${
                          d.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                        }`}>{d.dayNum}</span>

                        {/* Events content */}
                        <div className="space-y-1 my-1.5 flex-grow flex flex-col justify-center">
                          {d.events?.map((ev, eIdx) => (
                            <div key={eIdx} className={`px-1.5 py-1 rounded text-[8px] font-bold leading-tight ${ev.color}`}>
                              {ev.title}
                            </div>
                          ))}
                          
                          {d.showAddButton && (
                            <button 
                              onClick={() => addToast('Add open shift availability slot', 'info')}
                              className="h-8 w-8 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-450 hover:bg-slate-50/50 hover:border-slate-400 transition-all mx-auto"
                            >
                              <Plus className="h-4.5 w-4.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability Shift Settings (Right Column Sidebar) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Shift Settings Card */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm text-left relative flex-grow">
                    <header className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                      <Clock className="h-4.5 w-4.5 text-indigo-600" />
                      <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-900">Shift Settings</h3>
                    </header>

                    {/* Global Settings */}
                    <div className="space-y-4 mb-6">
                      <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Global Working Hours</h4>
                      
                      <div className="flex items-center justify-between bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <span className="font-bold text-xs text-slate-700">Allow Weekend Work</span>
                        <button className="w-10 h-5.5 bg-slate-200 rounded-full p-0.5 transition-colors">
                          <div className="bg-white h-4.5 w-4.5 rounded-full shadow" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <span className="font-bold text-xs text-slate-700">Enable Instant Booking</span>
                        <button className="w-10 h-5.5 bg-indigo-600 rounded-full p-0.5 transition-colors flex justify-end">
                          <div className="bg-white h-4.5 w-4.5 rounded-full shadow" />
                        </button>
                      </div>
                    </div>

                    {/* Day-wise Availability */}
                    <div className="space-y-4 mb-8">
                      <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Day-Wise Availability</h4>

                      {/* Monday */}
                      <div className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-xs text-slate-900">Monday</span>
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide">Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-slate-700 font-medium text-[10px]">09:00 AM</span>
                          </div>
                          <span className="text-slate-400 font-bold">to</span>
                          <div className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-slate-700 font-medium text-[10px]">05:00 PM</span>
                          </div>
                        </div>
                      </div>

                      {/* Tuesday */}
                      <div className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-xs text-slate-900">Tuesday</span>
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide">Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-slate-700 font-medium text-[10px]">09:00 AM</span>
                          </div>
                          <span className="text-slate-400 font-bold">to</span>
                          <div className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-slate-700 font-medium text-[10px]">05:00 PM</span>
                          </div>
                        </div>
                      </div>

                      {/* Wednesday */}
                      <div className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-xs text-slate-900">Wednesday</span>
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide ml-2">Off</span>
                        </div>
                        <button 
                          onClick={() => addToast('Add Wednesday hours slot', 'info')}
                          className="text-[10px] font-extrabold text-indigo-600 hover:underline"
                        >
                          + Add availability
                        </button>
                      </div>

                    </div>

                    <button 
                      onClick={() => addToast('Shift settings saved successfully!', 'success')}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md uppercase tracking-wider"
                    >
                      Save Changes
                    </button>

                    {/* Floating circular add button on settings box */}
                    <button 
                      onClick={() => addToast('Configure custom schedule shift overrides', 'info')}
                      className="absolute bottom-6 right-6 h-12 w-12 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white transition-all shadow-xl active:scale-95 z-10 translate-y-1/2 translate-x-1/2"
                    >
                      <Plus className="h-6 w-6" />
                    </button>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 7: ANALYTICS */}
          {activeTab === 'reviews' && (
            <div className="space-y-8 animate-fadeIn text-left">
              <div>
                <h1 className="text-xl font-display font-black text-slate-900 uppercase tracking-wider">Earnings Analytics</h1>
                <p className="text-xs text-slate-400 font-medium">Real-time updates of your revenue streams and target goals.</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Earnings */}
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Earnings</span>
                    <span className="text-2xl font-black text-slate-900 block">₹1,24,500</span>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>+12.4% this month</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>

                {/* Active Gigs */}
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Gigs</span>
                    <span className="text-2xl font-black text-slate-900 block">8</span>
                    <span className="block text-[10px] text-slate-400 font-bold mt-1">4 in progress, 4 scheduled</span>
                  </div>
                  <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                    <Briefcase className="h-5 w-5" />
                  </div>
                </div>

                {/* Avg. Rating */}
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avg. Rating</span>
                    <span className="text-2xl font-black text-slate-900 block">4.9</span>
                    <span className="block text-[10px] text-slate-400 font-bold mt-1">142 total reviews</span>
                  </div>
                  <div className="h-10 w-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center border border-amber-100">
                    <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                  </div>
                </div>

                {/* Pending Invoices */}
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pending Invoices</span>
                    <span className="text-2xl font-black text-slate-900 block">₹8,500</span>
                    <span className="block text-[10px] text-slate-400 font-bold mt-1">Due in 7 days</span>
                  </div>
                  <div className="h-10 w-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center border border-slate-100">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Income Trends Stacked Bar Chart & Target */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Income Trends */}
                <div className="lg:col-span-8 bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm text-left flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Income Trends</span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">Revenue Sources</h3>
                    </div>
                    {/* Timeframe Toggles */}
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/50 text-[10px] font-bold uppercase">
                      {['weekly', 'monthly', 'yearly'].map(tf => (
                        <button
                          key={tf}
                          onClick={() => setIncomeTrendsTimeframe(tf)}
                          className={`px-3 py-1.5 rounded-md transition-all ${
                            incomeTrendsTimeframe === tf 
                              ? 'bg-white text-indigo-600 shadow-sm font-black' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chart Legend */}
                  <div className="flex gap-4 mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 bg-indigo-600 rounded-full" />
                      <span>Plumbing</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full" />
                      <span>Electrical</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 bg-amber-500 rounded-full" />
                      <span>Handyman</span>
                    </div>
                  </div>

                  {/* Custom stacked bar chart */}
                  <div className="h-56 flex items-end justify-between gap-6 pt-4 px-2">
                    {[
                      { month: 'Jan', plumbing: 700, electrical: 500, handyman: 300, total: 1500, height: '53.6%', pPct: '46.7%', ePct: '33.3%', hPct: '20%' },
                      { month: 'Feb', plumbing: 900, electrical: 600, handyman: 400, total: 1900, height: '67.8%', pPct: '47.4%', ePct: '31.6%', hPct: '21%' },
                      { month: 'Mar', plumbing: 850, electrical: 550, handyman: 350, total: 1750, height: '62.5%', pPct: '48.6%', ePct: '31.4%', hPct: '20%' },
                      { month: 'Apr', plumbing: 1050, electrical: 650, handyman: 450, total: 2150, height: '76.8%', pPct: '48.8%', ePct: '30.2%', hPct: '21%' },
                      { month: 'May', plumbing: 1120, electrical: 740, handyman: 490, total: 2350, height: '83.9%', pPct: '47.7%', ePct: '31.5%', hPct: '20.8%' },
                      { month: 'Jun', plumbing: 1500, electrical: 800, handyman: 500, total: 2800, height: '100%', pPct: '53.6%', ePct: '28.6%', hPct: '17.8%' },
                    ].map((d, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] py-2 px-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 text-left whitespace-nowrap leading-relaxed">
                          <div className="font-extrabold text-white border-b border-white/10 pb-1 mb-1">{d.month} Revenue: ₹{d.total}</div>
                          <div className="flex justify-between gap-4 text-indigo-300"><span>Plumbing</span> <span>₹{d.plumbing}</span></div>
                          <div className="flex justify-between gap-4 text-emerald-300"><span>Electrical</span> <span>₹{d.electrical}</span></div>
                          <div className="flex justify-between gap-4 text-amber-300"><span>Handyman</span> <span>₹{d.handyman}</span></div>
                        </div>
                        
                        {/* Stacked Bar wrapper with fixed height */}
                        <div className="h-44 w-full flex flex-col justify-end">
                          <div className="w-full bg-slate-100 rounded-lg overflow-hidden flex flex-col justify-end transition-all" style={{ height: d.height }}>
                            <div style={{ height: d.hPct }} className="w-full bg-amber-500 hover:brightness-105 transition-all cursor-pointer" />
                            <div style={{ height: d.ePct }} className="w-full bg-emerald-500 hover:brightness-105 transition-all cursor-pointer" />
                            <div style={{ height: d.pPct }} className="w-full bg-indigo-600 hover:brightness-105 transition-all cursor-pointer" />
                          </div>
                        </div>
                        
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{d.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Earnings Goal Circle */}
                <div className="lg:col-span-4 bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col justify-between text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Earnings Goal</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">Monthly Target</h3>
                  </div>

                  {/* Radial Progress Ring */}
                  <div className="py-4">
                    <div className="relative flex items-center justify-center h-32 w-32 mx-auto">
                      <svg className="transform -rotate-90 h-32 w-32">
                        <circle
                          className="text-slate-100"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="45"
                          cx="64"
                          cy="64"
                        />
                        <circle
                          className="text-indigo-600 transition-all duration-500"
                          strokeWidth="8"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          strokeDashoffset={`${2 * Math.PI * 45 * (1 - 0.82)}`}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="45"
                          cx="64"
                          cy="64"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center leading-none">
                        <span className="text-2xl font-black text-slate-900">82%</span>
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase mt-1">Completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-700 font-bold">You\'re at 82% of your monthly goal</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Earn <span className="text-indigo-600 font-extrabold">₹25,500</span> more to reach your ₹1,50,000 target.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Transactions & Earnings by Service */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Recent Transactions */}
                <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden text-left">
                  <header className="p-5 border-b border-slate-100">
                    <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-700">Recent Transactions</h3>
                  </header>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-4 px-6">Client</th>
                          <th className="py-4 px-6">Service</th>
                          <th className="py-4 px-6">Date</th>
                          <th className="py-4 px-6">Amount</th>
                          <th className="py-4 px-6 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {mockEarningsTransactions.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4.5 px-6 font-bold text-slate-900">{tx.name}</td>
                            <td className="py-4.5 px-6">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide ${
                                tx.service === 'Plumbing' ? 'bg-blue-50 text-blue-600' :
                                tx.service === 'Electrical' ? 'bg-orange-50 text-orange-600' :
                                tx.service === 'HVAC' ? 'bg-red-50 text-red-650' :
                                tx.service === 'Cleaning' ? 'bg-purple-50 text-purple-600' :
                                tx.service === 'Gardening' || tx.service === 'Landscaping' ? 'bg-emerald-50 text-emerald-600' :
                                tx.service === 'Painting' ? 'bg-orange-50 text-orange-600' :
                                tx.service === 'Carpentry' ? 'bg-amber-50 text-amber-700' :
                                'bg-indigo-50 text-indigo-650'
                              }`}>
                                {tx.service}
                              </span>
                            </td>
                            <td className="py-4.5 px-6 text-slate-400 font-medium">{tx.date}</td>
                            <td className="py-4.5 px-6 font-extrabold text-slate-800">{tx.amount}</td>
                            <td className="py-4.5 px-6 text-right">
                              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg px-2.5 py-0.5 font-bold uppercase tracking-wider text-[8px]">
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Earnings by Service */}
                <div className="lg:col-span-4 bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm text-left flex flex-col justify-between">
                  <div className="mb-4">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Service Breakdown</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">Earnings by Category</h3>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        <span>{profileCategory}</span>
                        <span className="font-extrabold text-slate-900">₹61,200</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: '49%' }} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        <span>{secondaryCategory}</span>
                        <span className="font-extrabold text-slate-900">₹38,400</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '31%' }} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        <span>{tertiaryCategory}</span>
                        <span className="font-extrabold text-slate-900">₹24,900</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '20%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                    <span>Active Services</span>
                    <span className="text-slate-700 font-extrabold">3 Categories</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6.5: REVIEWS TAB */}
          {activeTab === 'reviews-tab' && (
            <div className="space-y-6 animate-fadeIn text-left">
              <div>
                <h1 className="text-xl font-display font-black text-slate-900 uppercase tracking-wider">Reviews</h1>
              </div>

              {/* Top Row: Overall Rating & Reputation Pulse */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Overall Rating Card (Left) */}
                <div className="lg:col-span-4 bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm text-center flex flex-col justify-center items-center min-h-[220px]">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Overall Rating</span>
                  <div className="text-4xl font-black text-slate-900 mt-2">4.9 <span className="text-sm text-slate-400 font-bold">/ 5.0</span></div>
                  <div className="flex text-amber-500 gap-1 my-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className="h-5 w-5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-450 font-bold">Top 5% of professionals in your area</span>
                </div>

                {/* Reputation Pulse Chart Card (Right) */}
                <div className="lg:col-span-8 bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[220px]">
                  <header className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Reputation Pulse</h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Your performance trends over the last 90 days</p>
                    </div>
                    <button 
                      onClick={() => addToast('Requested reviews links sent to recent clients!', 'success')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[9px] px-3.5 py-2 rounded-lg flex items-center gap-1.5 uppercase tracking-wide transition-all active:scale-95"
                    >
                      <Star className="h-3.5 w-3.5 fill-white text-white" /> Request Reviews
                    </button>
                  </header>

                  {/* Reputation Pulse Stacked chart representation */}
                  <div className="h-36 flex items-end justify-between gap-6 px-4 pt-6">
                    {[
                      { month: 'May', count: 18, height: '45%' },
                      { month: 'Jun', count: 10, height: '25%' },
                      { month: 'Jul', count: 26, height: '65%' },
                      { month: 'Aug', count: 42, height: '100%', active: true },
                      { month: 'Sep', count: 24, height: '60%' },
                      { month: 'Oct', count: 16, height: '40%' }
                    ].map((d, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                        
                        {/* Aug active badge overlay */}
                        {d.active && (
                          <div className="absolute bottom-full mb-6 bg-[#1e293b] text-white text-[8px] font-extrabold px-2 py-1 rounded shadow-md z-10 whitespace-nowrap uppercase tracking-wider animate-bounce">
                            42 Reviews
                          </div>
                        )}

                        <div className="w-full h-24 flex flex-col justify-end">
                          <div 
                            style={{ height: d.height }} 
                            className={`w-full rounded-t-lg transition-all ${
                              d.active ? 'bg-indigo-600' : 'bg-indigo-100 hover:bg-indigo-200'
                            }`}
                          />
                        </div>

                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{d.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Middle Row: Recent Praise & Focus Areas */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Recent Praise (Left) */}
                <div className="lg:col-span-6 bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-700">Recent Praise</h3>

                  {/* Praise Card 1 */}
                  <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                        ML
                      </div>
                      <div className="leading-none text-left">
                        <h4 className="font-bold text-xs text-slate-900">Marcus Lemur</h4>
                        <span className="text-[9px] text-slate-400 font-bold block mt-1">2 hours ago</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed text-left">
                      {praiseText1}
                    </p>
                    <div className="flex gap-2">
                      <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide">#Efficient</span>
                      <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide">#Clean</span>
                    </div>
                  </div>
 
                  {/* Praise Card 2 */}
                  <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                        SC
                      </div>
                      <div className="leading-none text-left">
                        <h4 className="font-bold text-xs text-slate-900">Sarah Chen</h4>
                        <span className="text-[9px] text-slate-400 font-bold block mt-1">Yesterday</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed text-left">
                      {praiseText2}
                    </p>
                  </div>
                </div>

                {/* Focus Areas (Right) */}
                <div className="lg:col-span-6 bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[300px]">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-700 mb-4">Focus Areas</h3>

                  <div className="space-y-5">
                    {/* Quality of Work */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        <span>Quality of Work</span>
                        <span className="font-extrabold text-slate-900">98% Positive</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: '98%' }} />
                      </div>
                    </div>

                    {/* Punctuality with Alert callout */}
                    <div className="space-y-2.5">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          <span>Punctuality</span>
                          <span className="font-extrabold text-slate-900">85% Positive</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-left text-[10px] text-amber-800 leading-relaxed flex items-start gap-2">
                        <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold block">Insight:</span>
                          3 clients mentioned slight delays due to traffic. Suggest updating ETA via chat.
                        </div>
                      </div>
                    </div>

                    {/* Pricing Clarity */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        <span>Pricing Clarity</span>
                        <span className="font-extrabold text-slate-900">92% Positive</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom: Feedback Feed */}
              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden text-left">
                <header className="p-5 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-700">Feedback Feed</h3>
                  <div className="flex items-center gap-2">
                    <select className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-650 focus:outline-none">
                      <option>Newest First</option>
                      <option>Highest Rating</option>
                      <option>Lowest Rating</option>
                    </select>
                  </div>
                </header>

                <div className="divide-y divide-slate-100 p-6 space-y-6">
                  {/* Review 1 */}
                  <div className="space-y-3 pt-0 first:pt-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                          EV
                        </div>
                        <div className="leading-none text-left">
                          <h4 className="font-extrabold text-xs text-slate-900">Eleanor Vance</h4>
                          <span className="text-[9px] text-slate-400 font-bold block mt-1">OCT 14, 2024</span>
                        </div>
                      </div>
                      <div className="flex text-amber-500 gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed pl-12">
                      {reviewText1}
                    </p>
                    <div className="flex gap-4 pl-12 text-[10px] font-bold">
                      <button 
                        onClick={() => addToast('Replying to Eleanor...', 'info')}
                        className="text-indigo-600 hover:underline"
                      >
                        Reply to Review
                      </button>
                      <button 
                        onClick={() => addToast('Review link copied to clipboard!', 'info')}
                        className="text-slate-400 hover:underline"
                      >
                        Share
                      </button>
                    </div>
                  </div>

                  {/* Review 2 */}
                  <div className="space-y-4 pt-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                          JS
                        </div>
                        <div className="leading-none text-left">
                          <h4 className="font-extrabold text-xs text-slate-900">Jordan Smith</h4>
                          <span className="text-[9px] text-slate-400 font-bold block mt-1">OCT 12, 2024</span>
                        </div>
                      </div>
                      <div className="flex text-amber-500 gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed pl-12">
                      {reviewText2}
                    </p>

                    {/* Response Card nested under Review 2 */}
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 ml-12 text-left space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Your Response</span>
                        <button 
                          onClick={() => addToast('Edit response panel...', 'info')}
                          className="text-[10px] font-bold text-indigo-650 hover:underline"
                        >
                          Edit Response
                        </button>
                      </div>
                      <p className="text-xs text-slate-650 leading-relaxed">
                        "Thank you for the feedback, Jordan! Apologies again for the delay, I'm glad we could get everything sorted to your satisfaction."
                      </p>
                    </div>
                  </div>

                </div>

                <div className="p-4 border-t border-slate-100 text-center">
                  <button 
                    onClick={() => addToast('Loading more reviews...', 'info')}
                    className="text-xs font-extrabold text-indigo-600 hover:underline uppercase tracking-wide"
                  >
                    Load More Reviews
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn text-left">
              <div>
                <h1 className="text-xl font-display font-black text-slate-900 uppercase tracking-wider">Settings</h1>
                <p className="text-xs text-slate-400 font-medium">Fine-tune system alerts and notifications.</p>
              </div>

              <div className="p-6 bg-white border border-slate-200/60 rounded-2xl max-w-xl shadow-sm text-xs text-slate-650 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">Push Notifications</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Receive job alerts and messages instantly</p>
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

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">Email Notifications</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Receive updates on your jobs and payments</p>
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
      {/* JOB DETAILS MODAL */}
      <AnimatePresence>
        {selectedJobForDetail && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200/60 max-w-lg w-full rounded-2xl p-6 shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setSelectedJobForDetail(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 transition-colors focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="h-14 w-14 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center flex-shrink-0 text-indigo-600 border border-indigo-100 dark:border-indigo-900/30">
                    {React.createElement(
                      CATEGORY_ICONS[selectedJobForDetail.category] || Briefcase,
                      { className: 'h-6 w-6' }
                    )}
                  </div>
                  <div>
                    <span className="bg-indigo-50 text-indigo-650 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide">
                      {selectedJobForDetail.category}
                    </span>
                    <h3 className="font-display font-black text-sm text-slate-900 uppercase tracking-wider leading-snug mt-1">
                      {selectedJobForDetail.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedJobForDetail.description}
                </p>

                <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4 text-xs font-semibold">
                  <div className="leading-tight">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Budget</span>
                    <span className="font-black text-xs text-indigo-650 block mt-1">
                      {selectedJobForDetail.minBudget ? `₹${selectedJobForDetail.minBudget.toLocaleString()} - ₹${selectedJobForDetail.maxBudget.toLocaleString()}` : `₹${selectedJobForDetail.budget?.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="leading-tight">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Proximity Distance</span>
                    <span className="font-black text-xs text-slate-950 block mt-1">
                      📍 {selectedJobForDetail.distance} km away
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setSelectedJobForDetail(null)}
                    className="flex-1 bg-transparent hover:bg-slate-50 border border-slate-200 text-xs py-3 font-bold rounded-lg text-slate-700 transition-all outline-none"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleApply(selectedJobForDetail.id)}
                    disabled={submittingId === selectedJobForDetail.id}
                    className="flex-grow bg-indigo-600 hover:bg-indigo-750 text-xs py-3 font-bold rounded-lg text-white transition-all outline-none shadow animate-fadeIn"
                  >
                    {submittingId === selectedJobForDetail.id ? 'Submitting...' : 'Apply to Job'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </AnimatePresence>

    </div>
  );
}
export { WorkerDashboard };
