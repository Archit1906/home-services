import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, ShieldCheck, Mail, Phone, Calendar, Clock, DollarSign, MessageSquare, Award, ThumbsUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';
import { useChatStore } from '../store/chatStore.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';

export default function JobMatches() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { addToast } = useToastStore();
  const { startConversation } = useChatStore();

  const [job, setJob] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hiringId, setHiringId] = useState(null);

  const fetchJobDataAndMatches = async () => {
    setLoading(true);
    try {
      // 1. Fetch Job info
      const jobRes = await fetch(`/api/jobs/${jobId}`);
      const jobData = await jobRes.json();
      if (!jobRes.ok) throw new Error(jobData.message || 'Failed to fetch job info');
      setJob(jobData.job);

      // 2. Fetch matches
      const matchesRes = await fetch(`/api/jobs/${jobId}/matches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const matchesData = await matchesRes.json();
      if (!matchesRes.ok) throw new Error(matchesData.message || 'Failed to fetch matches');
      setMatches(matchesData.matches || []);
    } catch (err) {
      addToast(err.message || 'Failed to load match recommendation listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobDataAndMatches();
    }
  }, [jobId]);

  const handleHire = async (workerId, workerName) => {
    setHiringId(workerId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/hire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workerId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Hiring action failed');

      addToast(`Congratulations! You hired ${workerName} for this job.`, 'success');
      fetchJobDataAndMatches(); // Reload status
    } catch (err) {
      addToast(err.message || 'Failed to complete hiring selection', 'error');
    } finally {
      setHiringId(null);
    }
  };

  const handleStartChat = async (recipientId) => {
    try {
      const conv = await startConversation(recipientId, jobId);
      addToast('Conversation initialized!', 'success');
      navigate(`/messages/${conv.id}`);
    } catch (err) {
      addToast(err.message || 'Failed to start chat session', 'error');
    }
  };

  const renderCompatibilityMeter = (percentage) => {
    const radius = 24;
    const strokeWidth = 5;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const strokeColor = percentage >= 80 
      ? 'stroke-emerald-500' 
      : percentage >= 60 
        ? 'stroke-amber-500' 
        : 'stroke-rose-500';

    return (
      <div className="relative flex items-center justify-center h-16 w-16 flex-shrink-0">
        <svg className="h-full w-full transform -rotate-95">
          <circle
            className="stroke-slate-200 dark:stroke-slate-800"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx="32"
            cy="32"
          />
          <motion.circle
            className={strokeColor}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            strokeLinecap="round"
            r={radius}
            cx="32"
            cy="32"
          />
        </svg>
        <span className="absolute text-[11px] font-black tracking-tight">{percentage}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 max-w-6xl mx-auto space-y-6">
        <Skeleton height="80px" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton height="350px" />
          <div className="md:col-span-2 space-y-4">
            <Skeleton height="150px" />
            <Skeleton height="150px" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-text-primary dark:text-text-darkPrimary p-6 md:p-12">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/dashboard/home')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-bold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        <Badge variant={job?.status === 'assigned' ? 'success' : 'primary'}>
          Status: {job?.status}
        </Badge>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Job Info Sidebar (Left) */}
        <div className="space-y-6">
          <Card className="bg-white/70 dark:bg-slate-900/70 border border-border/10">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant={job?.isEmergency ? 'danger' : 'primary'}>{job?.serviceType}</Badge>
                {job?.isEmergency && <Badge variant="danger" className="animate-pulse">Urgent</Badge>}
              </div>
              <h2 className="text-xl font-display font-black leading-snug">{job?.title}</h2>
              <p className="text-sm text-text-secondary dark:text-text-darkSecondary leading-relaxed">
                {job?.description}
              </p>

              <div className="border-t border-border/10 pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <DollarSign className="h-4 w-4 text-primary" /> Budget
                  </span>
                  <span className="font-bold text-primary">₹{job?.budget}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <Clock className="h-4 w-4 text-primary" /> Duration
                  </span>
                  <span className="font-semibold">{job?.hours} Hours</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <Award className="h-4 w-4 text-primary" /> Min Experience
                  </span>
                  <span className="font-semibold">{job?.experience} Yrs</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Recommendations Listings (Right) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-display font-extrabold flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-primary" /> AI Match Analysis Recommended candidates
          </h2>

          {matches.length === 0 ? (
            <Card className="text-center py-16 flex flex-col items-center gap-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-text-secondary">
                <Star className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-text-secondary max-w-sm">
                No compatibility candidates matched yet. Try adjusting requirements.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <Card
                  key={match.worker.id}
                  className="hover:shadow-elevated transition-shadow duration-300 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                    
                    {/* Worker Overview Profile */}
                    <div className="flex items-start gap-4">
                      <Avatar
                        src={match.worker.user.photoURL}
                        name={match.worker.user.name}
                        size="md"
                      />
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm flex items-center gap-1.5">
                          {match.worker.user.name}
                          {match.worker.verificationStatus === 'verified' && (
                            <ShieldCheck className="h-4 w-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950/20" />
                          )}
                        </h3>
                        <p className="text-xs text-text-secondary font-medium leading-relaxed">
                          {match.worker.headline}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded font-bold uppercase text-text-secondary">
                            {match.worker.experience} Years Experience
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Compatibility Meter */}
                    {renderCompatibilityMeter(match.score)}

                  </div>

                  {/* AI Explanation dialog */}
                  <div className="bg-slate-50 dark:bg-slate-900 border border-border/10 rounded-xl p-3.5 mt-4 text-xs text-text-secondary leading-normal">
                    <span className="font-bold text-primary uppercase text-[9px] block mb-1">AI Recommendation Context</span>
                    {match.explanation}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-border/10 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<MessageSquare className="h-4 w-4" />}
                      onClick={() => handleStartChat(match.worker.user.id)}
                    >
                      Chat with Pro
                    </Button>
                    
                    {job?.status !== 'assigned' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleHire(match.worker.id, match.worker.user.name)}
                        loading={hiringId === match.worker.id}
                      >
                        Hire Professional
                      </Button>
                    ) : (
                      <Badge variant="success" className="py-2 px-4 rounded-xl normal-case">
                        Booking Assigned
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
export { JobMatches };
