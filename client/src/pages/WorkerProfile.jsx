import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShieldCheck, Mail, Phone, Calendar, Clock, Image, Award, Heart, MessageSquare, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';
import { useChatStore } from '../store/chatStore.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';

export default function WorkerProfile() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { addToast } = useToastStore();
  const { startConversation } = useChatStore();

  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workers/${workerId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load profile');
      
      setWorker(data.worker);
      setReviews(data.reviews || []);
      setAiSummary(data.aiSummary || '');
    } catch (err) {
      addToast(err.message || 'Error loading profile details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workerId) {
      fetchProfile();
    }
  }, [workerId]);

  const handleStartChat = async () => {
    if (!worker?.user?.id) return;
    try {
      const conv = await startConversation(worker.user.id);
      addToast('Conversation started!', 'success');
      navigate(`/messages/${conv.id}`);
    } catch (err) {
      addToast(err.message || 'Failed to start chat session', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 max-w-4xl mx-auto space-y-6">
        <Skeleton height="150px" />
        <Skeleton height="300px" />
      </div>
    );
  }

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 'N/A';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-text-primary dark:text-text-darkPrimary p-6 md:p-12">
      {/* Top Navigation */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-bold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
        {worker?.verificationStatus === 'verified' && (
          <Badge variant="success" className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" /> ID Verified Pro
          </Badge>
        )}
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header Card */}
        <Card className="bg-white/70 dark:bg-slate-900/70 border border-border/10 p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            
            {/* Avatar & Basic details */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              <Avatar
                src={worker?.user?.photoURL}
                name={worker?.user?.name}
                size="xl"
                className="border-4 border-white dark:border-slate-800 shadow-default"
              />
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
                  {worker?.user?.name}
                  {worker?.verificationStatus === 'verified' && (
                    <ShieldCheck className="h-6 w-6 text-emerald-500 fill-emerald-100 dark:fill-emerald-950/20" />
                  )}
                </h1>
                <p className="text-sm font-semibold text-text-secondary leading-normal max-w-md">
                  {worker?.headline}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-semibold text-text-secondary flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-emerald-500" /> {worker?.user?.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-primary" /> {worker?.experience} Yrs Experience
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> {avgRating} ({reviews.length} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Direct CTA */}
            {worker?.userId !== user?.id && (
              <Button
                variant="primary"
                size="md"
                icon={<MessageSquare className="h-5 w-5" />}
                onClick={handleStartChat}
              >
                Hire & Chat
              </Button>
            )}

          </div>
        </Card>

        {/* AI Reviews Summary Highlights */}
        {aiSummary && (
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 p-6">
            <h3 className="flex items-center gap-2 font-display font-black text-sm uppercase tracking-wider text-primary mb-3">
              <Sparkles className="h-4 w-4 fill-current text-primary" /> AI Review Sentiment summary
            </h3>
            <p className="text-sm text-text-secondary dark:text-text-darkSecondary leading-relaxed italic">
              "{aiSummary}"
            </p>
          </Card>
        )}

        {/* Tab Selection */}
        <div className="flex bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-full max-w-md mx-auto md:mx-0">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
              activeTab === 'portfolio' ? 'bg-primary text-white shadow-default' : 'text-text-secondary'
            }`}
          >
            Portfolio & Projects
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
              activeTab === 'availability' ? 'bg-primary text-white shadow-default' : 'text-text-secondary'
            }`}
          >
            Availability Calendar
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
              activeTab === 'reviews' ? 'bg-primary text-white shadow-default' : 'text-text-secondary'
            }`}
          >
            Client Reviews ({reviews.length})
          </button>
        </div>

        {/* Tabs Content */}
        <div className="pt-2">
          {activeTab === 'portfolio' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {worker?.portfolio && worker.portfolio.length > 0 ? (
                worker.portfolio.map((item, idx) => (
                  <Card key={idx} className="p-0 overflow-hidden group hover:shadow-elevated transition-shadow duration-300">
                    <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <span className="text-white font-bold text-sm">{item.title}</span>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-sm text-text-secondary">
                  No portfolio images uploaded yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'availability' && (
            <Card className="p-6">
              <h3 className="font-bold text-sm uppercase tracking-wider text-text-secondary mb-4">Weekly Slots Availability</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {worker?.availabilityCalendar && worker.availabilityCalendar.length > 0 ? (
                  worker.availabilityCalendar.map((slot, idx) => (
                    <div key={idx} className="bg-slate-100 dark:bg-slate-850 p-4 rounded-2xl border border-border/10">
                      <div className="font-bold text-xs uppercase tracking-wider text-primary mb-2">
                        {slot.day}
                      </div>
                      <div className="space-y-1">
                        {slot.slots.map((s, sIdx) => (
                          <div key={sIdx} className="text-xs bg-white dark:bg-slate-900 border border-border/5 py-1 px-2.5 rounded font-semibold text-center text-text-secondary">
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-5 text-center py-12 text-sm text-text-secondary">
                    No weekly availability calendar configured.
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-sm text-text-secondary">
                  No reviews submitted for this service pro yet.
                </div>
              ) : (
                reviews.map((rev) => (
                  <Card key={rev.id} className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={rev.reviewer?.photoURL}
                          name={rev.reviewer?.name}
                          size="sm"
                        />
                        <div>
                          <h4 className="font-bold text-sm leading-none">{rev.reviewer?.name}</h4>
                          <span className="text-[10px] text-text-secondary">
                            Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                        <Star className="h-4 w-4 fill-current" /> {rev.rating}
                      </div>
                    </div>

                    <p className="text-sm text-text-secondary leading-relaxed pl-1">
                      "{rev.text}"
                    </p>

                    {rev.ownerResponse && (
                      <div className="bg-slate-50 dark:bg-slate-900/60 border border-border/10 rounded-xl p-3 text-xs text-text-secondary italic ml-4 mt-2">
                        <strong>Reply from {worker?.user?.name}:</strong> "{rev.ownerResponse}"
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
export { WorkerProfile };
