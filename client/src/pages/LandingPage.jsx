import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Search, MapPin, Droplet, Bolt, Snowflake, Sprout, Paintbrush, 
  Check, ArrowRight, ShieldCheck, Star, Users, MessageSquare, Bell, User, HelpCircle
} from 'lucide-react';
import { useToastStore } from '../store/toastStore.js';
import { useAuthStore } from '../store/authStore.js';

// Custom inline SVG icons
const SprayBottleIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 2h4M12 2v4M9 6h6v4H9z" />
    <path d="M9 10L6 14v7h12v-7l-3-4H9z" />
    <path d="M6 16h12" />
  </svg>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white font-body selection:bg-indigo-600/30">
      
      {/* 1. HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full bg-[#0c0c0e]/90 backdrop-blur-md border-b border-zinc-800/40 px-6 lg:px-16 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5 font-display text-lg font-black text-[#848bf4] cursor-pointer" onClick={() => navigate('/')}>
          <div className="h-9 w-9 bg-[#848bf4]/10 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-[#848bf4]" />
          </div>
          <span>HomeConnect</span>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-400">
          <a href="#services" className="text-white hover:text-white transition-colors">Find Pros</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <button onClick={() => addToast('Resources library loading...', 'info')} className="hover:text-white transition-colors font-bold uppercase tracking-wider">Resources</button>
        </nav>

        {/* Actions Menu */}
        <div className="flex items-center gap-4">
          <button onClick={() => addToast('No new notifications', 'info')} className="p-2 hover:bg-zinc-850 rounded-full transition-all text-slate-400 hover:text-white relative">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-rose-500 rounded-full" />
          </button>
          
          <button onClick={() => navigate('/auth')} className="p-2 hover:bg-zinc-850 rounded-full transition-all text-slate-400 hover:text-white">
            <MessageSquare className="h-4.5 w-4.5" />
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  if (user?.role === 'worker') {
                    navigate('/dashboard/worker');
                  } else if (user?.role === 'admin') {
                    navigate('/admin');
                  } else {
                    navigate('/dashboard/home');
                  }
                }}
                className="p-2 hover:bg-zinc-850 rounded-full transition-all text-slate-400 hover:text-white flex items-center justify-center"
              >
                <User className="h-4.5 w-4.5" />
              </button>
              <button 
                onClick={() => {
                  logout();
                  addToast('Logged out successfully', 'success');
                  navigate('/');
                }}
                className="bg-[#848bf4] hover:bg-[#7279e0] text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-lg text-white transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/auth')}
              className="bg-[#848bf4] hover:bg-[#7279e0] text-[10px] font-black uppercase tracking-wider px-5.5 py-2.5 rounded-lg text-white transition-all hover:scale-[1.02]"
            >
              Post a Job
            </button>
          )}
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden py-24 px-6 lg:px-16 text-center max-w-5xl mx-auto space-y-8">
        
        {/* Decorative subtle radial gradient behind hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#848bf4]/5 rounded-full blur-[120px] pointer-events-none" />

        <h1 className="text-5xl md:text-6.5xl font-display font-black tracking-tight leading-tight max-w-4xl mx-auto leading-none">
          Expert Home Services, <br />
          <span className="text-[#848bf4] font-black">Delivered.</span>
        </h1>

        <p className="text-slate-400 text-sm md:text-base max-w-2.5xl mx-auto font-medium leading-relaxed mt-6">
          The premium marketplace connecting high-end homeowners with certified professionals for maintenance, repairs, and bespoke home improvements.
        </p>

        {/* Search Input Panel */}
        <div className="max-w-3xl mx-auto bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-2xl flex flex-col md:flex-row gap-3 items-center shadow-2xl mt-12 relative z-10">
          <div className="relative flex-grow w-full">
            <Search className="h-4.5 w-4.5 text-zinc-550 absolute left-4 top-3.5" />
            <input 
              type="text" 
              placeholder="What service do you need?" 
              className="w-full bg-transparent border-0 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-zinc-550 focus:outline-none"
            />
          </div>
          <div className="hidden md:block h-6 w-px bg-zinc-800" />
          <div className="relative flex-grow w-full">
            <MapPin className="h-4.5 w-4.5 text-zinc-550 absolute left-4 top-3.5" />
            <input 
              type="text" 
              placeholder="Enter zip code" 
              className="w-full bg-transparent border-0 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-zinc-550 focus:outline-none"
            />
          </div>
          <button 
            onClick={() => navigate('/auth')}
            className="w-full md:w-auto bg-[#848bf4] hover:bg-[#7279e0] text-xs px-8 py-3.5 rounded-xl font-bold text-white transition-all flex-shrink-0 active:scale-95"
          >
            Search Pros
          </button>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section id="services" className="py-16 px-6 lg:px-16 max-w-6xl mx-auto space-y-8">
        <div>
          <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest pl-0.5">Categories</span>
          <div className="flex items-end justify-between mt-1">
            <h2 className="text-2xl font-display font-black text-white leading-tight uppercase tracking-wide">Premium Care for Every Corner</h2>
            <button onClick={() => navigate('/auth')} className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-all">
              View all services <ArrowRight className="h-4 w-4 text-[#848bf4]" />
            </button>
          </div>
        </div>

        {/* Categories Grid (6 Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {[
            { name: 'Plumbing', icon: Droplet, border: 'border-l-4 border-l-[#6b95d6]' },
            { name: 'Electrical', icon: Bolt, border: 'border-l-4 border-l-[#fb923c]' },
            { name: 'Cleaning', icon: SprayBottleIcon, border: 'border-l-4 border-l-[#4ade80]' },
            { name: 'HVAC', icon: Snowflake, border: 'border-l-4 border-l-[#848bf4]' },
            { name: 'Landscaping', icon: Sprout, border: 'border-l-4 border-l-emerald-500' },
            { name: 'Painting', icon: Paintbrush, border: 'border-l-4 border-l-rose-500' }
          ].map((cat, index) => {
            const CatIcon = cat.icon;
            return (
              <div 
                key={index} 
                onClick={() => navigate('/auth')}
                className={`p-6 bg-[#161619] rounded-2xl flex flex-col gap-4 items-start cursor-pointer hover:bg-zinc-850 hover:border-zinc-700 transition-all border border-zinc-850/40 shadow-sm ${cat.border} hover:scale-[1.02]`}
              >
                <div className="p-3 bg-zinc-900 rounded-xl text-slate-350">
                  <CatIcon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-white tracking-wide">{cat.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. ORCHESTRATING EXCELLENCE SECTION */}
      <section className="py-20 bg-[#121214]/40 border-y border-zinc-800/40 px-6 lg:px-16">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-display font-black uppercase tracking-wider text-white">Orchestrating Excellence</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Simple for you, seamless for pros.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Homeowners */}
            <div className="p-8 bg-[#161619] border border-zinc-850/60 rounded-3xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest block mb-2">For Homeowners</span>
                <h3 className="text-xl font-display font-black uppercase tracking-wide text-white mb-6">Stress-Free Maintenance</h3>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="h-6 w-6 rounded-full bg-zinc-900 text-zinc-350 flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
                    <div className="text-xs leading-relaxed text-slate-400">
                      <strong className="text-white block font-bold mb-0.5">Describe Your Task</strong>
                      Tell us what you need or upload a photo of the project.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-6 w-6 rounded-full bg-zinc-900 text-zinc-350 flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
                    <div className="text-xs leading-relaxed text-slate-400">
                      <strong className="text-white block font-bold mb-0.5">Match with Pros</strong>
                      Receive custom quotes from 5-star rated local experts.
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-6 w-6 rounded-full bg-zinc-900 text-zinc-350 flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
                    <div className="text-xs leading-relaxed text-slate-400">
                      <strong className="text-white block font-bold mb-0.5">Relax & Review</strong>
                      Pay securely through the platform only after the work is completed to your satisfaction.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professionals */}
            <div className="p-8 bg-[#848bf4] text-[#0f0f11] rounded-3xl flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[10px] text-[#2c2f6d] font-extrabold uppercase tracking-widest block mb-2">For Professionals</span>
                <h3 className="text-xl font-display font-black uppercase tracking-wide mb-3">Scale Your Business</h3>
                <p className="text-xs font-semibold leading-relaxed mb-6 opacity-90">
                  Join the elite network of home service providers. We handle the marketing and billing so you can focus on the craft.
                </p>

                <div className="space-y-4">
                  {[
                    'Get verified leads only',
                    'Zero-commission bidding',
                    'Instant digital payments'
                  ].map((pt, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-bold">
                      <div className="h-5 w-5 rounded-full bg-[#0f0f11]/10 flex items-center justify-center">
                        <Check className="h-3 w-3 text-[#0f0f11]" />
                      </div>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRUST & SAFETY SECTION */}
      <section className="py-20 px-6 lg:px-16 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Image */}
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600" 
            alt="Verified Pro" 
            className="w-full aspect-[4/3] rounded-3xl object-cover border border-zinc-800/60 shadow-lg"
          />
          <div className="absolute top-4 left-4 bg-[#161619] border border-zinc-800 px-3.5 py-1.5 rounded-full flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-white shadow">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Verified Professional
          </div>
        </div>

        {/* Right content */}
        <div className="space-y-6">
          <div>
            <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest block mb-1">Trust & Safety</span>
            <h2 className="text-3xl font-display font-black uppercase tracking-wide leading-tight">Your Peace of Mind is Our Priority</h2>
          </div>

          <div className="space-y-5 text-xs text-slate-400">
            <div className="flex gap-4">
              <div className="p-2.5 bg-zinc-900 border border-zinc-850 rounded-xl text-[#848bf4] flex-shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="leading-relaxed">
                <h4 className="font-bold text-white text-sm">Background Checked</h4>
                <p className="mt-0.5">Every professional undergoes a multi-point background check and credential verification before joining.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-2.5 bg-zinc-900 border border-zinc-850 rounded-xl text-[#848bf4] flex-shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div className="leading-relaxed">
                <h4 className="font-bold text-white text-sm">Fully Insured</h4>
                <p className="mt-0.5">All jobs booked through HomeConnect are covered by our ₹1.5 Crore Liability Protection and satisfaction guarantee.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-2.5 bg-zinc-900 border border-zinc-850 rounded-xl text-[#848bf4] flex-shrink-0">
                <Star className="h-5 w-5" />
              </div>
              <div className="leading-relaxed">
                <h4 className="font-bold text-white text-sm">Quality Audits</h4>
                <p className="mt-0.5">We perform periodic quality audits to ensure our network maintains the highest standard of craftsmanship.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTIONS PORTALS */}
      <section className="py-16 bg-[#121214]/30 border-t border-zinc-800/40 px-6 lg:px-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-[#161619] border border-zinc-850/60 rounded-3xl flex flex-col justify-between h-[200px] hover:border-zinc-700 transition-all">
            <div className="space-y-2">
              <div className="h-9 w-9 rounded-xl bg-zinc-900 text-[#848bf4] flex items-center justify-center border border-zinc-850"><Users className="h-4.5 w-4.5" /></div>
              <h4 className="font-display font-black uppercase text-sm leading-tight text-white mt-3">Looking for help?</h4>
              <p className="text-xs text-slate-400 leading-normal max-w-sm">Get matched with the best local talent and get your home projects finished today.</p>
            </div>
            <button 
              onClick={() => navigate('/auth')}
              className="bg-[#848bf4] hover:bg-[#7279e0] text-xs font-bold px-6 py-2.5 rounded-xl text-white self-start transition-all mt-4"
            >
              Hire a Pro
            </button>
          </div>

          <div className="p-8 bg-[#161619] border border-zinc-850/60 rounded-3xl flex flex-col justify-between h-[200px] hover:border-zinc-700 transition-all">
            <div className="space-y-2">
              <div className="h-9 w-9 rounded-xl bg-zinc-900 text-[#848bf4] flex items-center justify-center border border-zinc-850"><Bolt className="h-4.5 w-4.5" /></div>
              <h4 className="font-display font-black uppercase text-sm leading-tight text-white mt-3">Want to work?</h4>
              <p className="text-xs text-slate-400 leading-normal max-w-sm">Set your own schedule, find high-paying jobs, and grow your local service business.</p>
            </div>
            <button 
              onClick={() => navigate('/auth')}
              className="bg-transparent border border-zinc-800 hover:bg-zinc-850 text-xs font-bold px-6 py-2.5 rounded-xl text-white self-start transition-all mt-4"
            >
              Become a Worker
            </button>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-[#0c0c0e] text-slate-400 py-16 px-6 lg:px-16 border-t border-zinc-800/40">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-xs">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 font-display text-lg font-black text-white cursor-pointer" onClick={() => navigate('/')}>
              <div className="h-8.5 w-8.5 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="h-4.5 w-4.5 text-[#848bf4]" />
              </div>
              <span>HomeConnect</span>
            </div>
            <p className="leading-relaxed text-slate-500 font-medium">
              Elevating home maintenance through technology and elite professional craftsmanship.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold uppercase text-white tracking-wider">Services</h4>
            <nav className="flex flex-col gap-2 font-semibold">
              <a href="#services" className="hover:text-white transition-colors">Plumbing & HVAC</a>
              <button onClick={() => addToast('Electrical services details loading...', 'info')} className="hover:text-white transition-colors text-left font-semibold">Electrical & Smart Home</button>
              <button onClick={() => addToast('Interior Design profiles loading...', 'info')} className="hover:text-white transition-colors text-left font-semibold">Interior Design</button>
              <button onClick={() => addToast('Emergency support contact details...', 'info')} className="hover:text-white transition-colors text-left font-semibold">Emergency Services</button>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold uppercase text-white tracking-wider">Company</h4>
            <nav className="flex flex-col gap-2 font-semibold">
              <button onClick={() => addToast('About Us text loading...', 'info')} className="hover:text-white transition-colors text-left font-semibold">About Us</button>
              <button onClick={() => addToast('Careers page opening...', 'info')} className="hover:text-white transition-colors text-left font-semibold">Careers</button>
              <button onClick={() => addToast('Safety guidelines loaded.', 'info')} className="hover:text-white transition-colors text-left font-semibold">Trust & Safety</button>
              <button onClick={() => addToast('Press kit loading...', 'info')} className="hover:text-white transition-colors text-left font-semibold">Press Kit</button>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold uppercase text-white tracking-wider">Legal & Contact</h4>
            <nav className="flex flex-col gap-2 font-semibold">
              <button onClick={() => addToast('Privacy policy...', 'info')} className="hover:text-white">Privacy Policy</button>
              <button onClick={() => addToast('Terms of use...', 'info')} className="hover:text-white">Terms of Service</button>
              <button onClick={() => addToast('Insurance cover info...', 'info')} className="hover:text-white">Insurance Info</button>
              <button onClick={() => addToast('Opening contact parameters...', 'info')} className="hover:text-white">Contact Us</button>
            </nav>
          </div>

        </div>

        <div className="max-w-6xl mx-auto border-t border-zinc-800/40 mt-12 pt-8 flex flex-col md:flex-row md:items-center justify-between text-slate-500 font-semibold gap-4">
          <div>&copy; {new Date().getFullYear()} HomeConnect. Premium Services. All rights reserved.</div>
          <div className="flex gap-2.5">
            <span>United States (English)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
export { LandingPage };
