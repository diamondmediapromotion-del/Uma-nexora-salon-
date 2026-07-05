import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Eye, 
  Settings, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  PieChart,
  BarChart,
  MapPin,
  AlertCircle,
  Download,
  ExternalLink,
  Tag,
  BarChart3,
  Users2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface JobAdminSummary {
  total_job_posts: number;
  pending_jobs: number;
  active_jobs: number;
  closed_jobs: number;
  total_applications: number;
  new_applications: number;
  shortlisted_count: number;
  interviews_scheduled: number;
  total_job_seekers: number;
  total_views: number;
}

export default function JobPortalAdmin() {
  const [summary, setSummary] = useState<JobAdminSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'applications' | 'interviews' | 'seekers' | 'views' | 'categories'>('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const fetchSummary = async () => {
    try {
      const { data, error } = await supabase.rpc('admin_get_job_portal_summary');
      if (error) throw error;
      setSummary(data);
    } catch (err) {
      console.error('Error fetching admin summary:', err);
    }
  };

  const fetchTabData = async () => {
    setLoading(true);
    try {
      let query;
      switch (activeTab) {
        case 'posts':
          query = supabase.from('job_posts').select('*, shops(shop_name)').order('created_at', { ascending: false });
          break;
        case 'applications':
          query = supabase.from('job_applications').select('*, job_posts(title), job_application_events(*)').order('created_at', { ascending: false });
          break;
        case 'interviews':
          query = supabase.from('job_interviews').select('*, job_applications(*, job_posts(title))').order('interview_at', { ascending: false });
          break;
        case 'seekers':
          query = supabase.from('job_seeker_profiles').select('*').order('created_at', { ascending: false });
          break;
        case 'views':
          query = supabase.from('job_post_views').select('*, job_posts(title)').order('viewed_at', { ascending: false });
          break;
        case 'categories':
          query = supabase.from('job_categories').select('*').order('name', { ascending: true });
          break;
        default:
          setLoading(false);
          return;
      }

      const { data: result, error } = await query;
      if (error) throw error;
      setData(result || []);
    } catch (err) {
      console.error(`Error fetching ${activeTab}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveJob = async (jobId: string) => {
    try {
      const { error } = await supabase.from('job_posts').update({ status: 'active', approved_at: new Date().toISOString() }).eq('id', jobId);
      if (error) throw error;
      await fetchTabData();
      await fetchSummary();
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const handleRejectJob = async (jobId: string) => {
    try {
      const { error } = await supabase.from('job_posts').update({ status: 'rejected' }).eq('id', jobId);
      if (error) throw error;
      await fetchTabData();
      await fetchSummary();
    } catch (err) {
      console.error('Rejection failed:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Job Portal Control</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Global Marketplace Oversight</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { fetchSummary(); fetchTabData(); }}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:text-blue-600 transition-all shadow-sm"
          >
            <Clock className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Admin Sub-tabs */}
      <div className="flex items-center gap-2 p-1 bg-white border border-slate-100 rounded-2xl w-fit overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: PieChart },
          { id: 'posts', label: 'Job Posts', icon: Briefcase },
          { id: 'applications', label: 'Applications', icon: Users },
          { id: 'interviews', label: 'Interviews', icon: Calendar },
          { id: 'seekers', label: 'Job Seekers', icon: Users2 },
          { id: 'views', label: 'Views', icon: Eye },
          { id: 'categories', label: 'Categories', icon: Tag },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${
              activeTab === tab.id 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Total Jobs', value: summary?.total_job_posts || 0, color: 'blue' },
                { label: 'Pending', value: summary?.pending_jobs || 0, color: 'amber' },
                { label: 'Applications', value: summary?.total_applications || 0, color: 'emerald' },
                { label: 'Interviews', value: summary?.interviews_scheduled || 0, color: 'violet' },
                { label: 'Seekers', value: summary?.total_job_seekers || 0, color: 'rose' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{kpi.label}</p>
                  <p className={`text-2xl font-black ${
                    kpi.color === 'blue' ? 'text-blue-600' :
                    kpi.color === 'amber' ? 'text-amber-600' :
                    kpi.color === 'emerald' ? 'text-emerald-600' :
                    kpi.color === 'violet' ? 'text-violet-600' :
                    'text-rose-600'
                  }`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Analytics Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Application Funnel</h3>
                  <BarChart3 className="w-4 h-4 text-slate-300" />
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Applications', value: summary?.total_applications || 0, total: summary?.total_applications || 1, color: 'blue' },
                    { label: 'Shortlisted', value: summary?.shortlisted_count || 0, total: summary?.total_applications || 1, color: 'amber' },
                    { label: 'Interviewed', value: summary?.interviews_scheduled || 0, total: summary?.total_applications || 1, color: 'violet' },
                  ].map(bar => (
                    <div key={bar.label} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">{bar.label}</span>
                        <span className="text-slate-900">{bar.value}</span>
                      </div>
                      <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(bar.value / bar.total) * 100}%` }}
                          className={`h-full rounded-full ${
                            bar.color === 'blue' ? 'bg-blue-500' :
                            bar.color === 'amber' ? 'bg-amber-500' :
                            'bg-violet-500'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl text-white space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="flex items-center justify-between relative">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Market Reach</h3>
                  <Eye className="w-4 h-4 text-blue-400" />
                </div>
                <div className="space-y-1 relative">
                  <p className="text-4xl font-black">{summary?.total_views || 0}</p>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Total Job Post Views</p>
                </div>
                <div className="pt-4 flex items-center gap-4 border-t border-white/10 relative">
                  <div>
                    <p className="text-lg font-black">{summary?.active_jobs || 0}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Jobs</p>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div>
                    <p className="text-lg font-black">{( (summary?.total_applications || 0) / (summary?.total_views || 1) * 100 ).toFixed(1)}%</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Conv. Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab !== 'overview' && (
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* Data Table / List */}
            <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
              {loading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching global records...</p>
                </div>
              ) : data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50 bg-slate-50/30">
                        {activeTab === 'posts' && (
                          <>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Job Details</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Shop</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                          </>
                        )}
                        {activeTab === 'applications' && (
                          <>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Applicant</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Job</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Applied At</th>
                          </>
                        )}
                        {activeTab === 'interviews' && (
                          <>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Candidate</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Job</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Scheduled For</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                          </>
                        )}
                        {/* Add more cases for other tabs */}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          {activeTab === 'posts' && (
                            <>
                              <td className="px-6 py-4">
                                <p className="text-sm font-black text-slate-900">{item.title}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">{item.location} • {item.job_type}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-xs font-bold text-slate-700">{item.shops?.shop_name || 'N/A'}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                  item.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                  item.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                  'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  {item.status === 'pending' && (
                                    <>
                                      <button 
                                        onClick={() => handleApproveJob(item.id)}
                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => handleRejectJob(item.id)}
                                        className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                  <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                          {activeTab === 'applications' && (
                            <>
                              <td className="px-6 py-4">
                                <p className="text-sm font-black text-slate-900">Applicant {item.candidate_id.slice(0, 8)}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Exp: {item.experience_years}y</p>
                              </td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-700">{item.job_posts?.title}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                  item.status === 'selected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                  item.status === 'shortlisted' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                  'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-[10px] font-mono text-slate-400 uppercase">
                                {new Date(item.created_at).toLocaleDateString()}
                              </td>
                            </>
                          )}
                          {activeTab === 'interviews' && (
                            <>
                              <td className="px-6 py-4">
                                <p className="text-sm font-black text-slate-900">Applicant {item.job_applications?.candidate_id.slice(0, 8)}</p>
                              </td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-700">{item.job_applications?.job_posts?.title}</td>
                              <td className="px-6 py-4">
                                <p className="text-xs font-black text-slate-900">{new Date(item.interview_at).toLocaleString()}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{item.location}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-100">
                                  {item.status}
                                </span>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto">
                    <Filter className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-500 tracking-tight">No records found for this section.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
