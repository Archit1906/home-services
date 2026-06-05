import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Wrench, AlertTriangle, Check, X, ShieldAlert, Award, FileText, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { useToastStore } from '../store/toastStore.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { addToast } = useToastStore();

  const [stats, setStats] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  
  const [activeTab, setActiveTab] = useState('verifications');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (!statsRes.ok) throw new Error(statsData.message);
      setStats(statsData.stats);

      // 2. Fetch Pending Verifications
      const verRes = await fetch('/api/admin/verifications?status=pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const verData = await verRes.json();
      if (!verRes.ok) throw new Error(verData.message);
      setVerifications(verData.verifications || []);

      // 3. Fetch Fraud Alerts
      const fraudRes = await fetch('/api/admin/fraud', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const fraudData = await fraudRes.json();
      if (!fraudRes.ok) throw new Error(fraudData.message);
      setFraudAlerts(fraudData.alerts || []);
    } catch (err) {
      addToast(err.message || 'Error fetching admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    } else {
      addToast('Not authorized to access Admin panel', 'error');
      navigate('/');
    }
  }, [user]);

  const handleVerify = async (verificationId, status) => {
    setActionLoadingId(verificationId);
    try {
      const res = await fetch(`/api/admin/verifications/${verificationId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          rejectionReason: status === 'rejected' ? 'Document details mismatch with profile information' : ''
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      addToast(`Worker verification marked as: ${status}`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Verification update failed', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResolveAlert = async (alertId, status) => {
    setActionLoadingId(alertId);
    try {
      const res = await fetch(`/api/admin/fraud/${alertId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          resolutionNotes: `Resolved/Dismissed by admin on review.`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      addToast(`Fraud alert marked as: ${status}`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Alert resolution failed', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 max-w-6xl mx-auto space-y-6">
        <Skeleton height="100px" />
        <Skeleton height="400px" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-text-primary dark:text-text-darkPrimary p-6 md:p-12">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 border-b border-border/20 pb-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight">Admin Operations Center</h1>
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider mt-1">HomeConnect Marketplace Moderation</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/home')}>
          Exit Panel
        </Button>
      </header>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/70 dark:bg-slate-900/70 p-5 border border-border/10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Total Users</span>
              <div className="text-3xl font-display font-black text-primary">{stats?.users?.total || 0}</div>
            </div>
            <Users className="h-8 w-8 text-primary/45" />
          </div>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-900/70 p-5 border border-border/10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Open Service Jobs</span>
              <div className="text-3xl font-display font-black text-secondary">{stats?.jobs?.open || 0}</div>
            </div>
            <Wrench className="h-8 w-8 text-secondary/45" />
          </div>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-900/70 p-5 border border-border/10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Pending approvals</span>
              <div className="text-3xl font-display font-black text-amber-500">{stats?.verifications?.pending || 0}</div>
            </div>
            <Award className="h-8 w-8 text-amber-500/45" />
          </div>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-900/70 p-5 border border-border/10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Open Fraud Alerts</span>
              <div className="text-3xl font-display font-black text-rose-500">{stats?.fraud?.open || 0}</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-rose-500/45" />
          </div>
        </Card>
      </div>

      {/* Tabs selectors */}
      <div className="flex bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-full max-w-md mb-8">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all ${
            activeTab === 'verifications' ? 'bg-primary text-white shadow-default' : 'text-text-secondary'
          }`}
        >
          Verification Approvals ({verifications.length})
        </button>
        <button
          onClick={() => setActiveTab('fraud')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all ${
            activeTab === 'fraud' ? 'bg-primary text-white shadow-default' : 'text-text-secondary'
          }`}
        >
          Spam / Fraud logs ({fraudAlerts.length})
        </button>
      </div>

      {/* Tab panel contents */}
      <Card className="bg-white/70 dark:bg-slate-900/70 border border-border/10 p-6 overflow-hidden">
        {activeTab === 'verifications' ? (
          <div>
            <h2 className="text-lg font-display font-black mb-4">Pending Pro Verification Requests</h2>
            {verifications.length === 0 ? (
              <div className="text-center py-12 text-sm text-text-secondary">
                No pending verification reviews. All caught up!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border/20 text-xs font-bold text-text-secondary uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
                      <th className="py-3 px-4">Pro Candidate</th>
                      <th className="py-3 px-4">headline</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map((v) => (
                      <tr key={v.id} className="border-b border-border/10 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                        <td className="py-4 px-4 font-bold text-text-primary">{v.worker?.user?.name}</td>
                        <td className="py-4 px-4 text-xs text-text-secondary leading-relaxed">{v.worker?.headline}</td>
                        <td className="py-4 px-4 text-xs">{v.worker?.user?.city}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              className="px-3.5 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 border-none"
                              icon={<Check className="h-3.5 w-3.5" />}
                              onClick={() => handleVerify(v.id, 'verified')}
                              loading={actionLoadingId === v.id}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              className="px-3.5 py-1.5 text-xs font-bold"
                              icon={<X className="h-3.5 w-3.5" />}
                              onClick={() => handleVerify(v.id, 'rejected')}
                              loading={actionLoadingId === v.id}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-display font-black mb-4">Flagged Spam & Fraud logs</h2>
            {fraudAlerts.length === 0 ? (
              <div className="text-center py-12 text-sm text-text-secondary">
                No active fraud alerts. Security systems stable.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border/20 text-xs font-bold text-text-secondary uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
                      <th className="py-3 px-4">Target Candidate</th>
                      <th className="py-3 px-4">Alert Reason</th>
                      <th className="py-3 px-4">Risk Severity</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fraudAlerts.map((a) => (
                      <tr key={a.id} className="border-b border-border/10 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                        <td className="py-4 px-4 font-bold text-text-primary">
                          {a.user?.name || 'Unknown User'} ({a.user?.role})
                        </td>
                        <td className="py-4 px-4 text-xs text-text-secondary leading-normal">{a.reason}</td>
                        <td className="py-4 px-4">
                          <Badge variant={a.severity === 'high' ? 'danger' : 'warning'}>
                            {a.severity}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          {a.status === 'open' ? (
                            <div className="flex gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                className="px-3.5 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 border-none"
                                onClick={() => handleResolveAlert(a.id, 'resolved')}
                                loading={actionLoadingId === a.id}
                              >
                                Resolve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="px-3.5 py-1.5 text-xs font-bold border border-border"
                                onClick={() => handleResolveAlert(a.id, 'dismissed')}
                                loading={actionLoadingId === a.id}
                              >
                                Dismiss
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                              <CheckCircle className="h-4 w-4 text-emerald-500" /> resolved
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
export { AdminPanel };
