import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Clock, 
  MapPin, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ArrowLeft,
  MessageSquare,
  Zap,
  Building2,
  Trash2,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Application {
  id: string;
  status: string;
  created_at: string;
  owner_note: string | null;
  job_posts: {
    id: string;
    title: string;
    salon_name: string;
    location: string;
  };
  job_application_events: {
    id: string;
    event_type: string;
    event_message: string;
    created_at: string;
  }[];
  job_interviews?: {
    id: string;
    interview_at: string;
    interview_location: string;
    status: string;
  }[];
}

interface MyApplicationsProps {
  onBack: () => void;
}

export default function MyApplications({ onBack }: MyApplicationsProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_posts (id, title, salon_name, location),
          job_application_events (*),
          job_interviews (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;

    setWithdrawingId(appId);
    try {
      const { error } = await supabase.rpc('job_seeker_withdraw_application', { p_application_id: appId });
      if (error) throw error;
      
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: 'withdrawn' } : app));
    } catch (err) {
      console.error('Withdraw failed:', err);
      alert('Withdrawal failed. Please try again.');
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selected': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'rejected': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'withdrawn': return 'text-slate-400 bg-slate-50 border-slate-100';
      case 'shortlisted': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'interview_scheduled': return 'text-violet-600 bg-violet-50 border-violet-100';
      case 'viewed': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 px-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header */}
      <div className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 z-30 flex items-center justify-between px-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-50 rounded-xl text-slate-600 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-bold">Back</span>
        </button>
        <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">My Applications</h1>
        <div className="w-10"></div>
      </div>

      <div className="pt-24 max-w-4xl mx-auto px-6 space-y-6">
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map(app => (
              <div 
                key={app.id} 
                className={`bg-white rounded-[32px] border transition-all overflow-hidden ${
                  expandedId === app.id ? 'border-blue-200 shadow-xl shadow-slate-200/50' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div 
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                  className="p-6 cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{app.job_posts.title}</h3>
                        <p className="text-sm font-bold text-slate-500">{app.job_posts.salon_name} • {app.job_posts.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(app.status)}`}>
                        {app.status.replace('_', ' ')}
                      </div>
                      {expandedId === app.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Applied {new Date(app.created_at).toLocaleDateString()}
                    </div>
                    {app.status !== 'withdrawn' && app.status !== 'selected' && app.status !== 'rejected' && (
                      <button 
                        onClick={(e) => handleWithdraw(e, app.id)}
                        disabled={withdrawingId === app.id}
                        className="text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {withdrawingId === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === app.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="border-t border-slate-50 bg-slate-50/30"
                    >
                      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Timeline */}
                        <div className="space-y-6">
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-600" />
                            Application Timeline
                          </h4>
                          <div className="space-y-4">
                            {app.job_application_events?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((event, idx) => (
                              <div key={event.id} className="relative pl-6 pb-2 last:pb-0">
                                {idx !== app.job_application_events.length - 1 && (
                                  <div className="absolute left-[3px] top-4 bottom-0 w-[2px] bg-slate-100"></div>
                                )}
                                <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full border-2 border-white ${idx === 0 ? 'bg-blue-600 scale-125' : 'bg-slate-300'}`}></div>
                                <div className="space-y-0.5">
                                  <p className={`text-[11px] font-black uppercase tracking-widest ${idx === 0 ? 'text-blue-600' : 'text-slate-500'}`}>
                                    {event.event_type.replace('_', ' ')}
                                  </p>
                                  <p className="text-xs text-slate-500 font-medium">{event.event_message}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(event.created_at).toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Details/Next Steps */}
                        <div className="space-y-6">
                          {app.job_interviews && app.job_interviews.length > 0 && (
                            <div className="p-5 bg-violet-50 rounded-2xl border border-violet-100 space-y-3">
                              <h4 className="text-xs font-black text-violet-700 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Interview Scheduled
                              </h4>
                              <div className="space-y-2">
                                <p className="text-sm font-black text-slate-900">
                                  {new Date(app.job_interviews[0].interview_at).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                                </p>
                                <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  {app.job_interviews[0].interview_location || 'Salon Location'}
                                </p>
                              </div>
                            </div>
                          )}

                          {app.owner_note && (
                            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                              <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Note from Owner
                              </h4>
                              <p className="text-xs text-slate-700 font-medium leading-relaxed italic">"{app.owner_note}"</p>
                            </div>
                          )}

                          <div className="p-5 bg-white rounded-2xl border border-slate-100 space-y-3">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Next Steps</h4>
                            <ul className="space-y-2">
                              <li className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                Review owner notes if any
                              </li>
                              <li className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                Keep notifications on
                              </li>
                              <li className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                Bring your portfolio to interview
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 border border-slate-100 text-center space-y-4 shadow-sm shadow-slate-100/50">
            <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto text-slate-300">
              <FileText className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">No applications yet</h3>
              <p className="text-sm text-slate-500 font-medium">Start your beauty career journey by applying to top salons.</p>
            </div>
            <button 
              onClick={onBack}
              className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
            >
              Browse Beauty Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
