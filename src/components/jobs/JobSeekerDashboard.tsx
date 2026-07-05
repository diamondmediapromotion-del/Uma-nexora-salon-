import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layout, 
  FileText, 
  Heart, 
  Calendar, 
  CheckCircle, 
  Bell, 
  User, 
  ChevronRight, 
  Sparkles, 
  Briefcase, 
  Clock, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  X,
  Plus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Job } from '../../types';
import AppOnboardingChecklist from '../apps/AppOnboardingChecklist';

interface DashboardSummary {
  total_applications: number;
  saved_jobs: number;
  shortlisted: number;
  interviews: number;
  selected: number;
  unread_notifications: number;
  has_profile: boolean;
}

interface Application {
  id: string;
  status: string;
  created_at: string;
  job_posts: {
    id: string;
    title: string;
    salon_name: string;
    location: string;
  };
}

interface JobPortalProps {
  navigateTo: (path: string) => void;
}

export default function JobSeekerDashboard({ navigateTo }: JobPortalProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'saved' | 'interviews' | 'notifications'>('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Summary via RPC
      const { data: summaryData, error: summaryError } = await supabase.rpc('get_job_seeker_dashboard_summary');
      if (summaryError) throw summaryError;
      setSummary(summaryData);

      // 2. Fetch Recent Applications
      const { data: appsData } = await supabase
        .from('job_applications')
        .select(`
          id, status, created_at,
          job_posts (id, title, salon_name, location)
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentApps(appsData || []);

      // 3. Fetch Notifications
      const { data: notifsData } = await supabase
        .from('job_notifications')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setNotifications(notifsData || []);

      // 4. Fetch Upcoming Interviews
      const { data: interviewsData } = await supabase
        .from('job_interviews')
        .select(`
          *,
          job_posts (title, salon_name)
        `)
        .eq('candidate_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('status', 'scheduled')
        .order('interview_at', { ascending: true });
      setInterviews(interviewsData || []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await supabase.rpc('mark_job_notification_read', { p_notification_id: id });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 px-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header */}
      <div className="bg-slate-900 pt-32 pb-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-black text-white tracking-tight">Job Seeker Dashboard</h1>
            <p className="text-slate-400 font-medium">Manage your applications, saved jobs, and interviews in one place.</p>
          </div>
          <button 
            onClick={() => navigateTo('/jobs')}
            className="px-6 py-3 bg-blue-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" />
            Find New Jobs
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8">
        
        {/* Onboarding Checklist */}
        <div className="mt-8">
          <AppOnboardingChecklist appKey="jobs_app" />
        </div>

        {/* Profile CTA */}
        {!summary?.has_profile && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-600/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black tracking-tight">Complete your Seeker Profile</h3>
                <p className="text-emerald-50 text-sm font-medium">Add your skills and experience to get better job recommendations.</p>
              </div>
            </div>
            <button 
              onClick={() => navigateTo('/job-seeker-profile')}
              className="px-6 py-3 bg-white text-emerald-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all whitespace-nowrap"
            >
              Create Profile Now
            </button>
          </motion.div>
        )}

        {/* Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {[
            { label: 'Applications', value: summary?.total_applications || 0, icon: FileText, color: 'blue' },
            { label: 'Shortlisted', value: summary?.shortlisted || 0, icon: Sparkles, color: 'emerald' },
            { label: 'Interviews', value: summary?.interviews || 0, icon: Calendar, color: 'violet' },
            { label: 'Selected', value: summary?.selected || 0, icon: CheckCircle, color: 'rose' },
            { label: 'Saved Jobs', value: summary?.saved_jobs || 0, icon: Heart, color: 'amber' },
            { label: 'Alerts', value: summary?.unread_notifications || 0, icon: Bell, color: 'slate' },
          ].map((card, idx) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center transition-colors ${
                card.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                card.color === 'violet' ? 'bg-violet-50 text-violet-600' :
                card.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                card.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                'bg-slate-50 text-slate-600'
              }`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Dashboard Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Applications */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-blue-600" />
                  Recent Applications
                </h2>
                <button 
                  onClick={() => navigateTo('/my-job-applications')}
                  className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {recentApps.length > 0 ? recentApps.map(app => (
                  <div key={app.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-black text-slate-900">{app.job_posts.title}</h3>
                      <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        app.status === 'selected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        app.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        app.status === 'shortlisted' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {app.status}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {app.job_posts.salon_name} • {app.job_posts.location}
                      </p>
                      <p>{new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-500">No applications yet</p>
                    <button onClick={() => navigateTo('/jobs')} className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">Browse Jobs</button>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Interviews */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-violet-600" />
                  Upcoming Interviews
                </h2>
              </div>
              <div className="p-6">
                {interviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {interviews.map(interview => (
                      <div key={interview.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-1">Interview Scheduled</p>
                            <h3 className="text-sm font-black text-slate-900">{interview.job_posts.title}</h3>
                            <p className="text-xs font-bold text-slate-500">{interview.job_posts.salon_name}</p>
                          </div>
                          <div className="p-2 bg-white rounded-xl shadow-sm text-center min-w-[50px]">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(interview.interview_at).toLocaleString('default', { month: 'short' })}</p>
                            <p className="text-sm font-black text-slate-900">{new Date(interview.interview_at).getDate()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-600 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(interview.interview_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {interview.location || 'In-Person'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-500">No interviews scheduled yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Notifications */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full max-h-[600px]">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  Notifications
                </h2>
                {notifications.some(n => !n.is_read) && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-50">
                {notifications.length > 0 ? notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => !notif.is_read && markRead(notif.id)}
                    className={`p-5 transition-all cursor-pointer ${notif.is_read ? 'opacity-60 hover:bg-slate-50/50' : 'bg-amber-50/30 hover:bg-amber-50/50'}`}
                  >
                    <div className="flex gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        notif.notification_type === 'application_viewed' ? 'bg-blue-100 text-blue-600' :
                        notif.notification_type === 'shortlisted' ? 'bg-emerald-100 text-emerald-600' :
                        notif.notification_type === 'interview_scheduled' ? 'bg-violet-100 text-violet-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-900 leading-tight">{notif.title}</p>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{notif.message}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-1">{new Date(notif.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                      <Bell className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-500">All caught up!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => navigateTo('/job-seeker-profile')}
                  className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                >
                  <span className="text-sm font-bold">Update Profile</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </button>
                <button 
                  onClick={() => navigateTo('/job-alert-preferences')}
                  className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                >
                  <span className="text-sm font-bold">Job Alert Settings</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
