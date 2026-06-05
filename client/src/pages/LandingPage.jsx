import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wrench, Zap, Sparkles, Sprout, Hammer, Paintbrush, ShieldCheck, Star, Users, MessageSquare } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';

const CATEGORIES = [
  { name: 'Plumbing', icon: <Wrench className="h-6 w-6" />, count: 124, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
  { name: 'Electrical', icon: <Zap className="h-6 w-6" />, count: 98, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
  { name: 'Cleaning', icon: <Sparkles className="h-6 w-6" />, count: 215, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20' },
  { name: 'Gardening', icon: <Sprout className="h-6 w-6" />, count: 86, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
  { name: 'Carpentry', icon: <Hammer className="h-6 w-6" />, count: 62, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' },
  { name: 'Painting', icon: <Paintbrush className="h-6 w-6" />, count: 75, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('homeowner');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-text-primary dark:text-text-darkPrimary">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full glass border-b border-border/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span>HomeConnect</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
            Log In
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/get-started')}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-6 max-w-6xl mx-auto flex flex-col items-center text-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="absolute top-20 -right-40 w-96 h-96 bg-secondary/15 rounded-full blur-3xl"
        />

        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-primary-light dark:bg-blue-950/30 text-primary dark:text-blue-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-primary/20"
        >
          AI-Powered Neighborhood Service Marketplace
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-display font-black tracking-tight max-w-4xl leading-tight"
        >
          Find Trusted Professionals for{' '}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Every Home Need
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-text-secondary dark:text-text-darkSecondary text-lg md:text-xl max-w-2xl font-medium"
        >
          Connect with verified local experts in plumbing, electrical, cleaning, and more. Instant matching, real-time chats, and smart reviews.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center"
        >
          <Button variant="primary" size="lg" onClick={() => navigate('/get-started')}>
            Hire a Professional
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/get-started')}>
            Join as a Worker
          </Button>
        </motion.div>
      </section>

      {/* Trust Stats Section */}
      <section className="bg-white/40 dark:bg-slate-900/40 border-y border-border/20 py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div className="text-3xl font-display font-black">10,000+</div>
            <div className="text-sm font-semibold text-text-secondary dark:text-text-darkSecondary uppercase tracking-wider">
              Happy Homeowners
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-secondary/10 p-3 rounded-full text-secondary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="text-3xl font-display font-black">5,000+</div>
            <div className="text-sm font-semibold text-text-secondary dark:text-text-darkSecondary uppercase tracking-wider">
              Verified Service Pros
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-amber-500/10 p-3 rounded-full text-amber-500">
              <Star className="h-6 w-6" />
            </div>
            <div className="text-3xl font-display font-black">4.9/5</div>
            <div className="text-sm font-semibold text-text-secondary dark:text-text-darkSecondary uppercase tracking-wider">
              Average Review Rating
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-display font-extrabold text-center mb-12">
          Explore Popular Services
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="glass border border-border/20 rounded-card p-6 flex flex-col items-center gap-4 cursor-pointer text-center bg-white/50 dark:bg-slate-900/50 shadow-default"
              onClick={() => {
                navigate('/auth');
              }}
            >
              <div className={`p-4 rounded-2xl ${cat.color}`}>{cat.icon}</div>
              <div>
                <h3 className="font-bold text-sm mb-1">{cat.name}</h3>
                <p className="text-xs text-text-secondary dark:text-text-darkSecondary font-medium">
                  {cat.count} listings
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* User Benefits Tabs Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="flex justify-center gap-4 mb-12 bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-full max-w-xs mx-auto">
          <button
            onClick={() => setActiveTab('homeowner')}
            className={`flex-1 py-2.5 px-6 rounded-full text-sm font-bold transition-all duration-300 ${
              activeTab === 'homeowner'
                ? 'bg-primary text-white shadow-default'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            For Homeowners
          </button>
          <button
            onClick={() => setActiveTab('worker')}
            className={`flex-1 py-2.5 px-6 rounded-full text-sm font-bold transition-all duration-300 ${
              activeTab === 'worker'
                ? 'bg-primary text-white shadow-default'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            For Professionals
          </button>
        </div>

        <Card className="p-8">
          {activeTab === 'homeowner' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-display font-black mb-4">
                  Find the perfect helper in minutes
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="bg-emerald-100 dark:bg-emerald-950/30 p-1 rounded-full text-emerald-600 mt-1">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Background Checked Pros</h4>
                      <p className="text-xs text-text-secondary">All workers are validated against identity and certificates.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-emerald-100 dark:bg-emerald-950/30 p-1 rounded-full text-emerald-600 mt-1">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Real-time Negotiation</h4>
                      <p className="text-xs text-text-secondary">Chat directly, negotiate pricing, and coordinate schedules.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-card aspect-video flex items-center justify-center p-6 border border-primary/10">
                <span className="font-display font-black text-center text-primary dark:text-secondary">
                  Homeowner Dashboard Preview
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-display font-black mb-4">
                  Grow your business & find clients
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="bg-emerald-100 dark:bg-emerald-950/30 p-1 rounded-full text-emerald-600 mt-1">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Keep 100% Earnings</h4>
                      <p className="text-xs text-text-secondary">No hidden commission cuts. Direct client payments.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-emerald-100 dark:bg-emerald-950/30 p-1 rounded-full text-emerald-600 mt-1">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Instant Job Alerts</h4>
                      <p className="text-xs text-text-secondary">Get notified when homeowners post jobs in your area and category.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-card aspect-video flex items-center justify-center p-6 border border-secondary/10">
                <span className="font-display font-black text-center text-secondary dark:text-primary">
                  Worker Dashboard Preview
                </span>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-8 px-6 text-center text-sm text-text-secondary">
        &copy; {new Date().getFullYear()} HomeConnect Inc. All rights reserved.
      </footer>
    </div>
  );
}
export { LandingPage };
