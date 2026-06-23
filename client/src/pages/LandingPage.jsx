import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, ChevronDown, Wrench, ShieldCheck, Star, Users, MessageSquare, Globe, ArrowRight, 
  FileText, CheckCircle, Sparkles, MapPin, Check, AlertTriangle, 
  UserCheck, Laptop, TrendingUp, Paintbrush, Hammer, BookOpen, 
  ChefHat, Bolt, Car, Sprout, MoreHorizontal, Activity, HelpCircle
} from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useToastStore } from '../store/toastStore.js';
import { useAuthStore } from '../store/authStore.js';

// Popular Service category definitions with icons, counts, and average salary data
const CATEGORIES = [
  { id: 'maid', name: 'Maid', icon: Users, salary: '₹10,000 - ₹18,000 / month', count: 512, rating: 4.8 },
  { id: 'cook', name: 'Cook', icon: ChefHat, salary: '₹12,000 - ₹22,000 / month', count: 190, rating: 4.7 },
  { id: 'plumber', name: 'Plumber', icon: Wrench, salary: '₹15,000 - ₹25,000 / month', count: 248, rating: 4.6 },
  { id: 'electrician', name: 'Electrician', icon: Bolt, salary: '₹14,000 - ₹26,000 / month', count: 135, rating: 4.5 },
  { id: 'driver', name: 'Driver', icon: Car, salary: '₹16,500 - ₹28,000 / month', count: 320, rating: 4.6 },
  { id: 'tutor', name: 'Tutor', icon: BookOpen, salary: '₹18,000 - ₹35,000 / month', count: 410, rating: 4.9 },
  { id: 'gardener', name: 'Gardener', icon: Sprout, salary: '₹8,000 - ₹15,000 / month', count: 74, rating: 4.4 },
  { id: 'painter', name: 'Painter', icon: Paintbrush, salary: '₹12,000 - ₹20,000 / month', count: 115, rating: 4.5 },
  { id: 'carpenter', name: 'Carpenter', icon: Hammer, salary: '₹15,000 - ₹28,000 / month', count: 98, rating: 4.6 },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[2]); // Plumber default
  const [dashboardRoleTab, setDashboardRoleTab] = useState('homeowner'); // Homeowner active toggle
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [language, setLanguage] = useState('English');

  // Handle emergency category quick select
  const handleEmergencyClick = (type, title) => {
    addToast(`Selected emergency category: ${type}`, 'success');
    navigate('/auth', { 
      state: { 
        selectedRole: 'user', 
        isEmergency: true,
        emergencyTitle: title 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-text-primary dark:text-text-darkPrimary font-body">
      
      {/* 1. HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border/20 px-6 lg:px-16 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5 font-display text-xl font-black text-primary cursor-pointer" onClick={() => navigate('/')}>
          <div className="h-8.5 w-8.5 bg-primary/10 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <span>HomeConnect</span>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-darkSecondary">
          <a href="#services" className="hover:text-primary transition-colors">Find Services</a>
          <button onClick={() => navigate('/auth')} className="hover:text-primary transition-colors font-bold uppercase tracking-wider">Find Jobs</button>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
          <button onClick={() => addToast('Pricing details are available after account registration.', 'info')} className="hover:text-primary transition-colors font-bold uppercase tracking-wider">Pricing</button>
        </nav>

        {/* Actions Menu */}
        <div className="flex items-center gap-4">
          {/* Language Dropdown Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-text-secondary"
            >
              <Globe className="h-4 w-4" />
              <span>{language}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            
            {showLanguageDropdown && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 border border-border/10 rounded-xl shadow-lg overflow-hidden py-1 z-50">
                {['English', 'Hindi', 'Marathi', 'Kannada'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setShowLanguageDropdown(false);
                      addToast(`Language changed to ${lang}`, 'success');
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-text-primary"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <>
              <button 
                onClick={() => {
                  logout();
                  addToast('Logged out successfully', 'success');
                }} 
                className="text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary hidden sm:inline-block px-3"
              >
                Log Out
              </button>
              <Button 
                variant="primary" 
                size="sm" 
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:shadow"
                onClick={() => {
                  if (user?.role === 'worker') {
                    navigate('/dashboard/worker');
                  } else if (user?.role === 'admin') {
                    navigate('/admin');
                  } else {
                    navigate('/dashboard/home');
                  }
                }}
              >
                Dashboard
              </Button>
            </>
          ) : (
            <>
              <button 
                onClick={() => navigate('/auth')} 
                className="text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary hidden sm:inline-block px-3"
              >
                Log In
              </button>
              <Button 
                variant="primary" 
                size="sm" 
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:shadow"
                onClick={() => navigate('/get-started')}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden py-16 lg:py-24 px-6 lg:px-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side Content */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-full border border-emerald-200/10">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Trusted by 15,000+ families</span>
          </div>

          <h1 className="text-4xl md:text-5.5xl font-display font-black tracking-tight leading-tight">
            Find trusted local help <br />
            <span className="text-primary font-black">without asking around.</span>
          </h1>

          <p className="text-text-secondary dark:text-text-darkSecondary text-base md:text-lg max-w-xl font-semibold leading-relaxed">
            Hire verified maids, cooks, plumbers, electricians and more. AI matching. Safe. Reliable. Near you.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => navigate('/get-started', { state: { selectedRole: 'user' } })}
              className="bg-primary hover:bg-primary-dark shadow-default px-6 py-4 text-xs font-bold uppercase tracking-wider rounded-xl text-white flex items-center justify-center gap-2"
            >
              Hire Services <ArrowRight className="h-4.5 w-4.5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/get-started', { state: { selectedRole: 'worker' } })}
              className="bg-white hover:bg-slate-50 border-border/30 px-6 py-4 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2"
            >
              Find Work <ArrowRight className="h-4.5 w-4.5" />
            </Button>
          </div>

          {/* Customer Avatar Stack */}
          <div className="flex items-center gap-3 pt-6">
            <div className="flex -space-x-3">
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" 
                alt="user1" 
                className="h-10 w-10 rounded-full border-2 border-white object-cover" 
              />
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" 
                alt="user2" 
                className="h-10 w-10 rounded-full border-2 border-white object-cover" 
              />
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" 
                alt="user3" 
                className="h-10 w-10 rounded-full border-2 border-white object-cover" 
              />
            </div>
            <div>
              <div className="text-sm font-black font-display leading-tight">16,000+</div>
              <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Happy customers</div>
            </div>
          </div>
        </div>

        {/* Right Side Map Visualizer Mock */}
        <div className="relative flex flex-col items-center">
          {/* Map Container */}
          <div className="w-full aspect-[4/3] bg-blue-50/50 dark:bg-slate-900/60 border border-border/10 rounded-3xl overflow-hidden relative shadow-default">
            
            {/* SVG Local Grid Map Gridlines */}
            <svg className="absolute inset-0 w-full h-full text-blue-100/50 dark:text-slate-800/40" stroke="currentColor" strokeWidth="1.5" fill="none">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Radial Proximity Radar Ring */}
              <circle cx="50%" cy="50%" r="90" className="stroke-primary/10 dark:stroke-primary/5 stroke-dasharray-[4,4] animate-spin-slow" />
              <circle cx="50%" cy="50%" r="140" className="stroke-primary/5" />
            </svg>

            {/* Central Blinking Pulse Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <span className="absolute inline-flex h-6 w-6 rounded-full bg-primary/20 animate-ping" />
              <div className="h-4 w-4 bg-primary rounded-full border-2 border-white shadow flex items-center justify-center">
                <div className="h-1.5 w-1.5 bg-white rounded-full" />
              </div>
            </div>

            {/* 4 Floating Professional Avatar Pins */}
            {/* 1. Plumber */}
            <div className="absolute top-[20%] left-[25%] flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-full shadow-md border border-border/5 cursor-pointer hover:scale-105 transition-all">
              <Avatar src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100" name="Ramesh" size="xs" />
              <div className="pr-2 text-[8px] font-bold">
                <span className="block leading-none">Plumber</span>
                <span className="text-text-secondary leading-none text-[7px] font-semibold">1.2km away</span>
              </div>
            </div>

            {/* 2. Cook */}
            <div className="absolute top-[35%] right-[20%] flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-full shadow-md border border-border/5 cursor-pointer hover:scale-105 transition-all">
              <Avatar src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100" name="Sanjay" size="xs" />
              <div className="pr-2 text-[8px] font-bold">
                <span className="block leading-none">Cook</span>
                <span className="text-text-secondary leading-none text-[7px] font-semibold">3.2km away</span>
              </div>
            </div>

            {/* 3. Maid */}
            <div className="absolute bottom-[30%] left-[18%] flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-full shadow-md border border-border/5 cursor-pointer hover:scale-105 transition-all">
              <Avatar src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100" name="Sunita" size="xs" />
              <div className="pr-2 text-[8px] font-bold">
                <span className="block leading-none">Maid</span>
                <span className="text-text-secondary leading-none text-[7px] font-semibold">0.8km away</span>
              </div>
            </div>

            {/* 4. Electrician */}
            <div className="absolute bottom-[20%] right-[25%] flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-full shadow-md border border-border/5 cursor-pointer hover:scale-105 transition-all">
              <Avatar src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" name="Harpreet" size="xs" />
              <div className="pr-2 text-[8px] font-bold">
                <span className="block leading-none">Electrician</span>
                <span className="text-text-secondary leading-none text-[7px] font-semibold">1.5km away</span>
              </div>
            </div>

          </div>

          {/* Under Map Info Bubbles */}
          <div className="w-full grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white dark:bg-slate-900 border border-border/10 p-3 rounded-2xl flex items-center gap-2.5 shadow-sm">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <div className="leading-tight">
                <div className="text-xs font-black font-display">12</div>
                <div className="text-[7.5px] text-text-secondary font-bold uppercase tracking-wider">Jobs posted today</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-border/10 p-3 rounded-2xl flex items-center gap-2.5 shadow-sm">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-emerald-600">
                <Users className="h-4.5 w-4.5" />
              </div>
              <div className="leading-tight">
                <div className="text-xs font-black font-display">8</div>
                <div className="text-[7.5px] text-text-secondary font-bold uppercase tracking-wider">Workers nearby</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-border/10 p-3 rounded-2xl flex items-center gap-2.5 shadow-sm">
              <div className="p-2 bg-rose-50 dark:bg-rose-950/20 rounded-xl text-rose-600">
                <AlertTriangle className="h-4.5 w-4.5" />
              </div>
              <div className="leading-tight">
                <div className="text-xs font-black font-display">3</div>
                <div className="text-[7.5px] text-text-secondary font-bold uppercase tracking-wider">Emergency alerts</div>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* 3. POPULAR SERVICES GRID & STATS DETAIL */}
      <section id="services" className="py-16 bg-white dark:bg-slate-900 border-y border-border/20 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-display font-black tracking-tight">Popular Services</h2>
            <button onClick={() => navigate('/auth')} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              View all services <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Horizontal Category Icons Selector Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-4">
            {CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = selectedCategory.id === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-4 border rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5 dark:bg-slate-800 shadow-sm text-primary' 
                      : 'border-border/15 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${isSelected ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-900 text-text-secondary'}`}>
                    <IconComponent className="h-5.5 w-5.5" />
                  </div>
                  <span className="text-xs font-bold leading-none">{cat.name}</span>
                </button>
              );
            })}
            
            {/* Mock More Icon */}
            <button
              onClick={() => navigate('/auth')}
              className="p-4 border border-border/15 bg-white dark:bg-slate-950 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:bg-slate-50 text-text-secondary"
            >
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900">
                <MoreHorizontal className="h-5.5 w-5.5" />
              </div>
              <span className="text-xs font-bold leading-none">More</span>
            </button>
          </div>

          {/* Category Detail Info Panel */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-6 border border-border/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="text-sm font-black font-display uppercase tracking-wide text-primary">{selectedCategory.name}</div>
              <h3 className="text-base text-text-secondary font-semibold">Average salaries and availability metrics within metropolitan centers:</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-6 md:gap-12 divide-x divide-border/10">
              <div className="pl-0">
                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Avg. Salary</div>
                <div className="text-base font-black text-text-primary mt-1">{selectedCategory.salary}</div>
              </div>
              <div className="pl-6">
                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Workers Available</div>
                <div className="text-base font-black text-text-primary mt-1">{selectedCategory.count} Pros</div>
              </div>
              <div className="pl-6">
                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Average Rating</div>
                <div className="text-base font-black text-amber-500 mt-1 flex items-center gap-1">
                  <span>{selectedCategory.rating}</span>
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. HOW IT WORKS PIPELINE */}
      <section id="how-it-works" className="py-20 px-6 lg:px-16 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-display font-black">How it works</h2>
          <p className="text-sm text-text-secondary font-semibold">Simple steps to get the help you need</p>
        </div>

        {/* Process Flow Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          
          {/* Decorative Connecting Process Line */}
          <div className="absolute top-[35px] left-[12%] right-[12%] h-0.5 border-t border-dashed border-slate-200 dark:border-slate-800 hidden md:block z-0" />

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center gap-4 relative z-10 hover:-translate-y-1 transition-all">
            <div className="h-[70px] w-[70px] bg-white dark:bg-slate-900 border border-border/10 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
              <FileText className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">1</span>
              <h4 className="font-bold text-sm text-text-primary mt-1">Post Requirement</h4>
              <p className="text-xs text-text-secondary max-w-xs font-semibold leading-relaxed">
                Tell us what service you need and your preferences.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center gap-4 relative z-10 hover:-translate-y-1 transition-all">
            <div className="h-[70px] w-[70px] bg-white dark:bg-slate-900 border border-border/10 rounded-full flex items-center justify-center text-primary shadow-sm">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-primary bg-primary-light dark:bg-blue-950/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">2</span>
              <h4 className="font-bold text-sm text-text-primary mt-1">AI Finds Matches</h4>
              <p className="text-xs text-text-secondary max-w-xs font-semibold leading-relaxed">
                Our AI matches you with verified professionals.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center gap-4 relative z-10 hover:-translate-y-1 transition-all">
            <div className="h-[70px] w-[70px] bg-white dark:bg-slate-900 border border-border/10 rounded-full flex items-center justify-center text-purple-600 shadow-sm">
              <MessageSquare className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-purple-600 bg-purple-50 dark:bg-purple-950/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">3</span>
              <h4 className="font-bold text-sm text-text-primary mt-1">Chat & Compare</h4>
              <p className="text-xs text-text-secondary max-w-xs font-semibold leading-relaxed">
                Chat, compare profiles, reviews and pricing.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center gap-4 relative z-10 hover:-translate-y-1 transition-all">
            <div className="h-[70px] w-[70px] bg-white dark:bg-slate-900 border border-border/10 rounded-full flex items-center justify-center text-amber-600 shadow-sm">
              <CheckCircle className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">4</span>
              <h4 className="font-bold text-sm text-text-primary mt-1">Hire</h4>
              <p className="text-xs text-text-secondary max-w-xs font-semibold leading-relaxed">
                Choose the best match and get the job done.
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* 6. TRUST & METRICS BANNER */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-display font-black">Trust is our priority</h2>
          </div>

          {/* Badges Grid (4 items) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-border/10 p-5 rounded-2xl flex items-center gap-3.5 shadow-sm">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="leading-tight">
                <h4 className="font-bold text-xs text-text-primary">Government Verified</h4>
                <p className="text-[10px] text-text-secondary font-semibold mt-0.5">ID & address verified</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-border/10 p-5 rounded-2xl flex items-center gap-3.5 shadow-sm">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="leading-tight">
                <h4 className="font-bold text-xs text-text-primary">Background Checked</h4>
                <p className="text-[10px] text-text-secondary font-semibold mt-0.5">Police verification done</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-border/10 p-5 rounded-2xl flex items-center gap-3.5 shadow-sm">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl">
                <Star className="h-6 w-6" />
              </div>
              <div className="leading-tight">
                <h4 className="font-bold text-xs text-text-primary">Top Rated</h4>
                <p className="text-[10px] text-text-secondary font-semibold mt-0.5">High ratings & reviews</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-border/10 p-5 rounded-2xl flex items-center gap-3.5 shadow-sm">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
              <div className="leading-tight">
                <h4 className="font-bold text-xs text-text-primary">Community Trusted</h4>
                <p className="text-[10px] text-text-secondary font-semibold mt-0.5">15,000+ happy customers</p>
              </div>
            </div>
          </div>

          {/* Dark Metrics Banner */}
          <div className="bg-[#0b172a] rounded-3xl p-8 lg:p-12 text-white grid grid-cols-2 lg:grid-cols-4 gap-8 text-center border border-white/5 shadow-lg">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-white/5 rounded-2xl text-blue-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="text-3xl font-display font-black tracking-tight mt-1">15,000+</div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Professionals</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-white/5 rounded-2xl text-blue-400">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-3xl font-display font-black tracking-tight mt-1">35,000+</div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Jobs Completed</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-white/5 rounded-2xl text-amber-500">
                <Star className="h-6 w-6 fill-amber-500" />
              </div>
              <div className="text-3xl font-display font-black tracking-tight mt-1">4.8 ★</div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Rating</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-white/5 rounded-2xl text-emerald-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="text-3xl font-display font-black tracking-tight mt-1">95%</div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Successful Matches</span>
            </div>
          </div>

        </div>
      </section>

      {/* 7. BUILT FOR EVERYONE (DASHBOARD PREVIEWS) */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-border/20 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-display font-black">Built for everyone</h2>
            <p className="text-sm text-text-secondary font-semibold">Two dashboards, one platform</p>

            {/* Toggle Button Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-full max-w-xs mx-auto mt-6 border border-border/10">
              <button 
                onClick={() => setDashboardRoleTab('homeowner')}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-full transition-all ${
                  dashboardRoleTab === 'homeowner' 
                    ? 'bg-primary text-white shadow-default' 
                    : 'text-text-secondary'
                }`}
              >
                For Homeowners
              </button>
              <button 
                onClick={() => setDashboardRoleTab('worker')}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-full transition-all ${
                  dashboardRoleTab === 'worker' 
                    ? 'bg-emerald-600 text-white shadow-default' 
                    : 'text-text-secondary'
                }`}
              >
                For Workers
              </button>
            </div>
          </div>

          {/* Interactive Simulated Preview Panel Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Left Column: Homeowner Dashboard Mockup preview */}
            <div className={`p-6 bg-slate-50 dark:bg-slate-950 border rounded-3xl flex flex-col gap-5 transition-all duration-300 ${
              dashboardRoleTab === 'homeowner' ? 'border-primary/20 bg-blue-50/10' : 'border-border/10 opacity-70'
            }`}>
              <div>
                <h4 className="text-sm font-black text-primary uppercase tracking-wider">Homeowner Dashboard</h4>
                <p className="text-xs text-text-secondary mt-1">Manage postings and applicants</p>
              </div>

              {/* Mini Ramesh Dashboard representation */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-border/10 space-y-4 shadow-sm flex-grow">
                <div className="flex items-center gap-3">
                  <Avatar src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" name="Ramesh" size="sm" />
                  <div>
                    <h5 className="font-bold text-xs">Welcome back, Ramesh! 👋</h5>
                    <span className="text-[8px] font-bold text-text-secondary uppercase">Homeowner</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-border/5 text-center">
                    <div className="text-sm font-black font-display leading-none">2</div>
                    <span className="text-[7px] text-text-secondary font-bold uppercase tracking-wider block mt-1">Active Jobs</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-border/5 text-center">
                    <div className="text-sm font-black font-display leading-none">7</div>
                    <span className="text-[7px] text-text-secondary font-bold uppercase tracking-wider block mt-1">Apps</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-border/5 text-center">
                    <div className="text-sm font-black font-display leading-none">1</div>
                    <span className="text-[7px] text-text-secondary font-bold uppercase tracking-wider block mt-1">Hired</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-border/5 text-center">
                    <div className="text-sm font-black font-display leading-none">0</div>
                    <span className="text-[7px] text-text-secondary font-bold uppercase tracking-wider block mt-1">Reviews</span>
                  </div>
                </div>

                {/* Simulated Recent Job row */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-border/5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[10px]">Need Cook for full-time</div>
                    <span className="text-[8px] text-text-secondary uppercase">8 Applicants</span>
                  </div>
                  <Badge variant="primary" className="text-[7px]">Active</Badge>
                </div>
              </div>
            </div>

            {/* Right Column: Worker Dashboard Mockup preview */}
            <div className={`p-6 bg-slate-50 dark:bg-slate-950 border rounded-3xl flex flex-col gap-5 transition-all duration-300 ${
              dashboardRoleTab === 'worker' ? 'border-emerald-600/20 bg-emerald-50/10' : 'border-border/10 opacity-70'
            }`}>
              <div>
                <h4 className="text-sm font-black text-emerald-600 uppercase tracking-wider">Worker Dashboard</h4>
                <p className="text-xs text-text-secondary mt-1">Review active leads and track earnings</p>
              </div>

              {/* Mini Suresh Dashboard representation */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-border/10 space-y-4 shadow-sm flex-grow">
                <div className="flex items-center gap-3">
                  <Avatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" name="Suresh" size="sm" />
                  <div>
                    <h5 className="font-bold text-xs">Good morning, Suresh! 👋</h5>
                    <span className="text-[8px] font-bold text-text-secondary uppercase">Plumber Expert</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-border/5 text-center">
                    <div className="text-sm font-black font-display leading-none">12</div>
                    <span className="text-[7px] text-text-secondary font-bold uppercase tracking-wider block mt-1">Applied</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-border/5 text-center">
                    <div className="text-sm font-black font-display leading-none">4</div>
                    <span className="text-[7px] text-text-secondary font-bold uppercase tracking-wider block mt-1">Interviews</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-border/5 text-center">
                    <div className="text-sm font-black font-display leading-none">2</div>
                    <span className="text-[7px] text-text-secondary font-bold uppercase tracking-wider block mt-1">Active</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-border/5 text-center text-emerald-600">
                    <div className="text-sm font-black font-display leading-none">₹18k</div>
                    <span className="text-[7px] text-text-secondary font-bold uppercase tracking-wider block mt-1">Earnings</span>
                  </div>
                </div>

                {/* Simulated Recommended Job row */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-border/5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[10px]">Plumber Needed</div>
                    <span className="text-[8px] text-text-secondary uppercase">₹800 - ₹1,200</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-1 rounded">92% Match</span>
                    <button className="text-[8px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded">Apply</button>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 8. EMERGENCY URGENT ACTIONS PANEL */}
      <section className="py-12 bg-slate-50 dark:bg-slate-950 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0b172a] rounded-3xl p-6 lg:p-10 text-white flex flex-col lg:flex-row items-center justify-between gap-6 border border-white/5 shadow-default">
            
            <div className="space-y-1 text-center lg:text-left">
              <h3 className="text-lg font-display font-black tracking-tight">Need urgent help?</h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Post an emergency request and get priority responses.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button 
                onClick={() => handleEmergencyClick('Plumbing', 'Emergency Pipe Burst Repair')}
                className="bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5"
              >
                <Wrench className="h-4 w-4 text-rose-500" /> Pipe Burst
              </button>
              <button 
                onClick={() => handleEmergencyClick('Electrical', 'Emergency Power Outage/Wiring Fix')}
                className="bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5"
              >
                <Bolt className="h-4 w-4 text-amber-500" /> Power Failure
              </button>
              <button 
                onClick={() => handleEmergencyClick('Care', 'Urgent Patient/Caretaker needed')}
                className="bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5"
              >
                <Users className="h-4 w-4 text-emerald-500" /> Caretaker Needed
              </button>
              <button 
                onClick={() => handleEmergencyClick('HVAC', 'Urgent AC breakdown troubleshooting')}
                className="bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5"
              >
                <Activity className="h-4 w-4 text-blue-500" /> AC Breakdown
              </button>
              
              <button 
                onClick={() => handleEmergencyClick('General', 'General Urgent Repair Service')}
                className="bg-rose-600 hover:bg-rose-700 px-5 py-3 rounded-xl text-xs font-bold transition-all text-white flex items-center gap-1 leading-none uppercase tracking-wider ml-2"
              >
                Post Emergency &rarr;
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 9. READY TO HIRE GRADIENT CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-b from-blue-50/40 to-slate-100 dark:from-slate-900 dark:to-slate-950 px-6 lg:px-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-display font-black tracking-tight leading-tight">
            Ready to hire <br />
            or start earning?
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-darkSecondary font-semibold max-w-md mx-auto leading-relaxed">
            Join thousands of families and professionals using HomeConnect every day.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => navigate('/get-started', { state: { selectedRole: 'user' } })}
              className="bg-primary hover:bg-primary-dark px-6 py-4 text-xs font-bold uppercase tracking-wider rounded-xl text-white flex items-center justify-center gap-2"
            >
              Hire Services <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/get-started', { state: { selectedRole: 'worker' } })}
              className="bg-white hover:bg-slate-50 border-border/30 px-6 py-4 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2"
            >
              Find Jobs <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* 10. COMPREHENSIVE FOOTER & LINKS DIRECTORY */}
      <footer className="bg-[#0b172a] text-slate-400 py-16 px-6 lg:px-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          {/* Logo & description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2.5 font-display text-xl font-black text-white cursor-pointer" onClick={() => navigate('/')}>
              <div className="h-8.5 w-8.5 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-blue-400" />
              </div>
              <span>HomeConnect</span>
            </div>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-sm">
              Connecting homes with trusted professionals in your neighborhood. AI-matching technology, secure real-time verification, and local expertise.
            </p>
            
            {/* Social link icons */}
            <div className="flex items-center gap-3 pt-2">
              {['facebook', 'instagram', 'twitter', 'linkedin'].map((social) => (
                <button 
                  key={social} 
                  onClick={() => addToast(`Opening ${social} account...`, 'info')}
                  className="h-8 w-8 bg-white/5 hover:bg-white/10 hover:text-white rounded-full flex items-center justify-center text-slate-400 border border-white/10 transition-all text-xs font-bold uppercase"
                >
                  {social[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Directory column: Homeowners */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">For Homeowners</h4>
            <nav className="flex flex-col gap-2.5 text-xs font-semibold">
              <a href="#services" className="hover:text-white transition-colors">Find Services</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
              <button onClick={() => addToast('Safety & Trust guidelines updated.', 'info')} className="hover:text-white transition-colors text-left font-semibold">Safety & Trust</button>
              <button onClick={() => addToast('Help Center opening...', 'info')} className="hover:text-white transition-colors text-left font-semibold">Help Center</button>
            </nav>
          </div>

          {/* Directory column: Workers */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">For Professionals</h4>
            <nav className="flex flex-col gap-2.5 text-xs font-semibold">
              <button onClick={() => navigate('/auth')} className="hover:text-white transition-colors text-left font-semibold">Find Jobs</button>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
              <button onClick={() => addToast('Resources library loading...', 'info')} className="hover:text-white transition-colors text-left font-semibold">Resources</button>
              <button onClick={() => addToast('Help Center opening...', 'info')} className="hover:text-white transition-colors text-left font-semibold">Help Center</button>
            </nav>
          </div>

          {/* Directory column: Company */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Company</h4>
            <nav className="flex flex-col gap-2.5 text-xs font-semibold">
              <button onClick={() => addToast('About Us text loading...', 'info')} className="hover:text-white transition-colors text-left font-semibold">About Us</button>
              <button onClick={() => addToast('Careers page opening...', 'info')} className="hover:text-white transition-colors text-left font-semibold">Careers</button>
              <button onClick={() => addToast('Blog entries loading...', 'info')} className="hover:text-white transition-colors text-left font-semibold">Blog</button>
              <button onClick={() => addToast('Terms of service page...', 'info')} className="hover:text-white transition-colors text-left font-semibold">Terms of Service</button>
            </nav>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row md:items-center justify-between text-xs font-semibold text-slate-400 gap-4">
          <div>&copy; {new Date().getFullYear()} HomeConnect. All rights reserved.</div>
          <div className="flex gap-6">
            <button onClick={() => addToast('Privacy policy...', 'info')} className="hover:text-white">Privacy Policy</button>
            <button onClick={() => addToast('Terms of use...', 'info')} className="hover:text-white">Terms of Use</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
export { LandingPage };
