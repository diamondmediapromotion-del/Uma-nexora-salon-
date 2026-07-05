import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Filter, 
  Heart, 
  ChevronRight, 
  Star, 
  Sparkles, 
  Clock, 
  TrendingUp,
  X,
  Layout,
  User,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Job } from '../../types';

interface JobPortalProps {
  navigateTo: (path: string) => void;
}

export default function JobPortal({ navigateTo }: JobPortalProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [user, setUser] = useState<any>(null);

  const categories = ['All', 'Hair Stylist', 'Beautician', 'Nail Artist', 'Salon Manager', 'Makeup Artist', 'Front Desk'];

  useEffect(() => {
    checkUser();
    fetchJobs();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('job_posts')
        .select(`
          *,
          saved_jobs (id)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Transform data to match Job interface and check if saved by current user
      const formattedJobs = (data || []).map((j: any) => ({
        ...j,
        is_saved: j.saved_jobs && j.saved_jobs.length > 0
      }));

      setJobs(formattedJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    if (!user) {
      alert('Please login to save jobs');
      return;
    }

    try {
      const { data: isSaved, error } = await supabase.rpc('toggle_saved_job', { p_job_id: jobId });
      if (error) throw error;

      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_saved: isSaved } : j));
    } catch (err) {
      console.error('Error toggling saved job:', err);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.salon_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Hero Section */}
      <div className="bg-slate-900 pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-600/10 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest"
          >
            <Sparkles className="w-3 h-3" />
            Nexora Careers Portal
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight"
          >
            Jaipur's #1 Beauty <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">Job Marketplace</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg font-medium max-w-2xl mx-auto"
          >
            Connect with 500+ verified salons. Get set salaries, PF, incentives, and clean accommodation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <button 
              onClick={() => navigateTo('/my-job-applications')}
              className="px-6 py-3.5 bg-white text-slate-900 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2"
            >
              <Layout className="w-4 h-4" />
              My Applications
            </button>
            <button 
              onClick={() => navigateTo('/job-seeker-dashboard')}
              className="px-6 py-3.5 bg-blue-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              Seeker Dashboard
            </button>
          </motion.div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Job title, salon name, or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2 font-bold text-sm"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all">
              Search
            </button>
          </div>
        </div>

        {/* Categories Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                selectedCategory === cat 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-5xl mx-auto px-6 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Recommended Jobs
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {filteredJobs.length} Positions Available
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 4, 5].map(i => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse space-y-4">
                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                <div className="h-6 bg-slate-100 rounded w-2/3"></div>
                <div className="flex gap-2">
                  <div className="h-4 bg-slate-100 rounded w-16"></div>
                  <div className="h-4 bg-slate-100 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigateTo(`/jobs/${job.id}`)}
                  className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {job.job_type}
                        </p>
                        {job.category && (
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            • {job.category}
                          </p>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-sm font-bold text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.salon_name} • {job.location}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => handleToggleSave(e, job.id)}
                      className={`p-3 rounded-2xl transition-all ${
                        job.is_saved 
                          ? 'bg-rose-50 text-rose-500 border border-rose-100' 
                          : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${job.is_saved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 mb-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Salary</p>
                      <p className="text-sm font-black text-slate-900">{job.salary_range}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Exp. Required</p>
                      <p className="text-sm font-black text-slate-900">{job.experience_level}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Staff${i + idx}`} alt="Applicant" />
                        </div>
                      ))}
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[8px] font-black text-white">
                        +12
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      Active Hiring
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">No jobs found</h3>
              <p className="text-sm text-slate-500 font-medium">Try adjusting your search filters or check back later.</p>
            </div>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
              className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Post a Job CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-3xl p-8 text-white relative overflow-hidden group mt-12"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-black tracking-tight">Hiring for your salon?</h2>
              <p className="text-blue-100 font-medium">Post a job today and find the best beauty talent in Jaipur.</p>
            </div>
            <button 
              onClick={() => navigateTo('/owner-register')}
              className="px-8 py-4 bg-white text-blue-600 font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              Post a Job
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
