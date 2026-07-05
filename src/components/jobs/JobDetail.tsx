import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Clock, 
  Calendar, 
  Star, 
  Share2, 
  Heart, 
  CheckCircle, 
  AlertCircle, 
  X,
  FileText,
  Smartphone,
  ChevronRight,
  Sparkles,
  Building2,
  Award,
  Zap,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Job } from '../../types';
import JobDocumentUpload from './JobDocumentUpload';

interface JobDetailProps {
  jobId: string;
  navigateTo: (path: string) => void;
  onBack: () => void;
}

export default function JobDetail({ jobId, navigateTo, onBack }: JobDetailProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [applyingLoading, setApplyingLoading] = useState(false);
  
  // Application Form States
  const [coverMessage, setCoverMessage] = useState('');
  const [resumeAssetId, setResumeAssetId] = useState<string | null>(null);
  const [skills, setSkills] = useState<string>('');
  const [expYears, setExpYears] = useState<number>(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchJob();
    trackView();
    checkUser();
  }, [jobId]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const fetchJob = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_posts')
        .select(`
          *,
          saved_jobs (id)
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;
      
      setJob({
        ...data,
        is_saved: data.saved_jobs && data.saved_jobs.length > 0
      });
    } catch (err) {
      console.error('Error fetching job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    const today = new Date().toISOString().split('T')[0];
    const idempotencyKey = `view_${jobId}_${today}`;
    
    // Check local storage first to avoid unnecessary RPC call in same session
    const tracked = localStorage.getItem(idempotencyKey);
    if (tracked) return;

    try {
      await supabase.rpc('track_job_post_view', {
        p_job_id: jobId,
        p_page_source: 'job_detail_page',
        p_idempotency_key: idempotencyKey
      });
      localStorage.setItem(idempotencyKey, 'true');
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to apply');
      return;
    }

    setApplyingLoading(true);
    try {
      const { data: appId, error } = await supabase.rpc('apply_to_job', {
        p_job_id: jobId,
        p_resume_asset_id: resumeAssetId,
        p_cover_message: coverMessage,
        p_candidate_skills: skills.split(',').map(s => s.trim()).filter(s => s !== ''),
        p_experience_years: expYears
      });

      if (error) throw error;

      setApplicationId(appId);
      setApplicationSuccess(true);
      setIsApplying(false);
    } catch (err) {
      console.error('Application failed:', err);
      alert('Application failed. Please try again.');
    } finally {
      setApplyingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 px-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full"
          />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Job Details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 text-center">
        <h2 className="text-2xl font-black text-slate-900">Job not found</h2>
        <button onClick={onBack} className="mt-4 text-blue-600 font-bold underline">Back to Jobs</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <div className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 z-30 flex items-center justify-between px-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-50 rounded-xl text-slate-600 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-bold">Back to Listings</span>
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-rose-500 transition-all">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="pt-24 pb-24 max-w-4xl mx-auto px-6">
        {/* Job Title & Summary */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100">
                {job.job_type}
              </span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
                Verified Salon
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
              {job.title}
            </h1>
            
            <div className="flex flex-wrap gap-y-3 gap-x-6">
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salon Name</p>
                  <p className="text-sm font-bold text-slate-900">{job.salon_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                  <p className="text-sm font-bold text-slate-900">{job.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Views</p>
                  <p className="text-sm font-bold text-slate-900">{job.views_count || 0} clicks</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Salary</p>
              <p className="text-base font-black text-slate-900">{job.salary_range}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience</p>
              <p className="text-base font-black text-slate-900">{job.experience_level}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Accommodation</p>
              <p className="text-base font-black text-slate-900">Available</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date Posted</p>
              <p className="text-base font-black text-slate-900">
                {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-6 pt-4">
            <div className="space-y-3">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Job Description
              </h2>
              <div className="text-slate-600 font-medium leading-relaxed space-y-4">
                {job.description ? (
                  <p>{job.description}</p>
                ) : (
                  <>
                    <p>We are looking for a highly skilled and professional individual to join our premium salon team in Jaipur. The ideal candidate should have a passion for the beauty industry and excellent customer service skills.</p>
                    <p>Key responsibilities include providing top-tier services to our clients, maintaining a clean and organized workspace, and contributing to a positive team environment.</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Benefits & Perks
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(job.perks || ['Competitive Salary', 'Provident Fund (PF)', 'Performance Incentives', 'Clean Accommodation', 'Paid Time Off', 'Training & Workshops']).map((perk, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl">
                    <div className="w-6 h-6 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Apply Bar */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 z-30 flex items-center justify-center">
        <div className="max-w-4xl w-full flex items-center justify-between gap-6">
          <div className="hidden md:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Salary</p>
            <p className="text-lg font-black text-slate-900">{job.salary_range}</p>
          </div>
          <button 
            onClick={() => setIsApplying(true)}
            className="flex-1 md:flex-none px-12 py-4 bg-slate-900 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* Application Drawer */}
      <AnimatePresence>
        {isApplying && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApplying(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-x-0 bottom-0 max-h-[90vh] bg-white rounded-t-[32px] overflow-y-auto no-scrollbar"
            >
              <div className="p-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900">Complete Application</h2>
                    <p className="text-sm text-slate-500 font-medium">Applying for {job.title} at {job.salon_name}</p>
                  </div>
                  <button onClick={() => setIsApplying(false)} className="p-2 bg-slate-100 rounded-xl text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleApply} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload Resume</label>
                      <JobDocumentUpload 
                        onUploadSuccess={(id) => setResumeAssetId(id)}
                        assetType="resume"
                        label="Upload Latest Resume"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Years of Exp.</label>
                        <input 
                          type="number"
                          required
                          min="0"
                          value={expYears}
                          onChange={(e) => setExpYears(parseInt(e.target.value))}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Key Skills (Comma separated)</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. Hair Coloring, Spa, Management"
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message to Owner (Optional)</label>
                      <textarea 
                        rows={4}
                        placeholder="Tell the salon owner why you are a great fit..."
                        value={coverMessage}
                        onChange={(e) => setCoverMessage(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium resize-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={applyingLoading}
                    className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {applyingLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {applicationSuccess && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-10 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100 shadow-xl shadow-emerald-500/10">
                <CheckCircle className="w-10 h-10" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Application Submitted!</h2>
                <p className="text-sm text-slate-500 font-medium">Your application for <span className="text-slate-900 font-bold">{job.title}</span> has been sent directly to the salon owner.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Application ID</p>
                <p className="text-sm font-black text-slate-900">APP-{applicationId?.slice(0, 8).toUpperCase() || 'PENDING'}</p>
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Status: Applied</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button 
                  onClick={() => navigateTo('/my-job-applications')}
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  View My Applications
                </button>
                <button 
                  onClick={onBack}
                  className="w-full py-4 bg-slate-50 text-slate-600 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Back to Jobs
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
