import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Plus, 
  FileText, 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  ChevronRight, 
  AlertCircle,
  MapPin,
  MessageSquare,
  Search,
  ExternalLink,
  Download,
  Award,
  Loader2,
  Trash2,
  Edit2,
  Sparkles,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AppOnboardingChecklist from '../apps/AppOnboardingChecklist';

interface JobSummary {
  total_posts: number;
  pending_jobs: number;
  active_jobs: number;
  closed_jobs: number;
  total_applications: number;
  new_applications: number;
  shortlisted: number;
  interviews_scheduled: number;
}

export default function JobsManagement() {
  const [summary, setSummary] = useState<JobSummary | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'posts' | 'applications' | 'interviews'>('overview');
  
  // Job Post Form State
  const [isPosting, setIsPosting] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  
  // Application Management State
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Summary
      const { data: summaryData } = await supabase.rpc('get_owner_job_dashboard_summary');
      setSummary(summaryData);

      // 2. Fetch Jobs
      const { data: jobsData } = await supabase
        .from('job_posts')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      setJobs(jobsData || []);

      // 3. Fetch Applications for all owner's jobs
      const { data: appsData } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_posts (title),
          job_document_assets (id, storage_path, file_name, asset_type),
          job_application_events (*)
        `)
        .in('job_id', jobsData?.map(j => j.id) || [])
        .order('created_at', { ascending: false });
      setApplications(appsData || []);

    } catch (err) {
      console.error('Error fetching owner job data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, status: string, note?: string, interviewAt?: string, location?: string) => {
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase.rpc('owner_update_job_application_status', {
        p_application_id: appId,
        p_new_status: status,
        p_owner_note: note,
        p_interview_at: interviewAt,
        p_interview_location: location
      });

      if (error) throw error;
      
      await fetchData(); // Refresh
      setSelectedApp(null);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDownloadResume = async (asset: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('job-documents')
        .createSignedUrl(asset.storage_path, 60);
      
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to access resume. Please contact support.');
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Jobs Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Onboarding Checklist */}
      <AppOnboardingChecklist appKey="owner_app" />

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'posts', label: 'Job Posts', icon: Briefcase },
          { id: 'applications', label: 'Applicants', icon: Users },
          { id: 'interviews', label: 'Interviews', icon: Calendar },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeSubTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Jobs', value: summary?.active_jobs || 0, icon: Briefcase, color: 'blue' },
                { label: 'New Applicants', value: summary?.new_applications || 0, icon: Users, color: 'emerald' },
                { label: 'Shortlisted', value: summary?.shortlisted || 0, icon: Sparkles, color: 'amber' },
                { label: 'Interviews', value: summary?.interviews_scheduled || 0, icon: Calendar, color: 'violet' },
              ].map(card => (
                <div key={card.label} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${
                    card.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                    card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                    card.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                    'bg-violet-50 text-violet-600'
                  }`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                  <p className="text-2xl font-black text-slate-900">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Activity / Next Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => {setIsPosting(true); setActiveSubTab('posts');}}
                    className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-slate-900">Post New Job</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Find beauty talent</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-300 group-hover:text-blue-600 transition-colors" />
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('applications')}
                    className="w-full p-4 bg-emerald-50 hover:bg-emerald-100 rounded-2xl flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-slate-900">Review Applicants</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{summary?.new_applications} new candidates</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-emerald-300 group-hover:text-emerald-600 transition-colors" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl text-white space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Hiring Tip</h3>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">
                    Salons that respond to applicants within 24 hours have a <span className="text-white font-black underline decoration-blue-500 underline-offset-4">4x higher chance</span> of hiring top-rated stylists.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveSubTab('applications')}
                  className="w-full py-3 bg-white text-slate-900 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all mt-2"
                >
                  Go to Applicants
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'posts' && (
          <motion.div 
            key="posts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Active Job Posts</h3>
              <button 
                onClick={() => setIsPosting(true)}
                className="px-6 py-3 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Post New Job
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {jobs.length > 0 ? jobs.map(job => (
                <div key={job.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-slate-900">{job.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                          job.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          job.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.job_type}</span>
                        <span className="flex items-center gap-1 text-blue-600"><Users className="w-3 h-3" /> {applications.filter(a => a.job_id === job.id).length} Apps</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-500">You haven't posted any jobs yet.</p>
                  <button 
                    onClick={() => setIsPosting(true)}
                    className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
                  >
                    Post your first job
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeSubTab === 'applications' && (
          <motion.div 
            key="applications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Candidate Pool</h3>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                  {summary?.new_applications} New
                </span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                  {summary?.shortlisted} Shortlisted
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {applications.length > 0 ? applications.map(app => (
                <div 
                  key={app.id} 
                  onClick={() => setSelectedApp(app)}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${app.id}`} 
                          alt="Candidate" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-slate-900">{app.candidate_id.slice(0, 8)}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                            app.status === 'selected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            app.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            app.status === 'shortlisted' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-500">Applying for: <span className="text-slate-900 font-black">{app.job_posts.title}</span></p>
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {app.experience_years}y Exp</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(app.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 bg-slate-50 text-slate-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
                        View Resume
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all">
                        Action
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-500">No applications received yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Candidate Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shrink-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedApp.id}`} alt="Candidate" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Candidate Profile</h2>
                    <p className="text-sm font-bold text-slate-500">Application for {selectedApp.job_posts.title}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedApp(null)} className="p-2 bg-slate-100 rounded-xl text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto no-scrollbar space-y-8">
                {/* Candidate Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience</p>
                    <p className="text-sm font-black text-slate-900">{selectedApp.experience_years} Years</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Skills</p>
                    <p className="text-sm font-black text-slate-900">{selectedApp.candidate_skills?.join(', ') || 'General Beauty'}</p>
                  </div>
                </div>

                {/* Cover Message */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    Cover Message
                  </h4>
                  <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 text-sm font-medium text-slate-700 leading-relaxed italic">
                    "{selectedApp.cover_message || 'The candidate did not provide a message.'}"
                  </div>
                </div>

                {/* Resume Asset */}
                {selectedApp.job_document_assets && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Candidate Resume
                    </h4>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-emerald-900">{selectedApp.job_document_assets.file_name}</p>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Verified Document</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDownloadResume(selectedApp.job_document_assets)}
                        className="px-4 py-2 bg-white text-emerald-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100 flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        View / Download
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Manage Application Status</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button 
                      onClick={() => handleUpdateStatus(selectedApp.id, 'viewed', 'Application viewed by owner')}
                      disabled={isUpdatingStatus}
                      className="py-3 bg-slate-50 text-slate-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200"
                    >
                      Mark Viewed
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedApp.id, 'shortlisted', 'Your profile has been shortlisted!')}
                      disabled={isUpdatingStatus}
                      className="py-3 bg-blue-50 text-blue-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100"
                    >
                      Shortlist
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedApp.id, 'rejected', 'Thank you for your interest. We have decided to move forward with other candidates.')}
                      disabled={isUpdatingStatus}
                      className="py-3 bg-rose-50 text-rose-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedApp.id, 'selected', 'Congratulations! We would like to offer you the position.')}
                      disabled={isUpdatingStatus}
                      className="py-3 bg-emerald-50 text-emerald-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100 shadow-lg shadow-emerald-500/10"
                    >
                      Hire
                    </button>
                  </div>
                  
                  {/* Schedule Interview Special Button */}
                  <button 
                    onClick={() => {
                      const dt = prompt('Enter Interview Date/Time (e.g. 2024-07-10 10:00 AM)');
                      const loc = prompt('Enter Interview Location', 'Salon Location');
                      if (dt) handleUpdateStatus(selectedApp.id, 'interview_scheduled', 'Interview scheduled!', dt, loc);
                    }}
                    disabled={isUpdatingStatus}
                    className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Interview
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
