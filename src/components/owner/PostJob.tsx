import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  Save, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Building2,
  Users,
  IndianRupee,
  ChevronRight,
  Plus,
  Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PostJobProps {
  navigateTo: (path: string) => void;
}

export default function PostJob({ navigateTo }: PostJobProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shops, setShops] = useState<any[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [submittedJob, setSubmittedJob] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    shop_id: '',
    title: '',
    category: 'Hair Stylist',
    job_type: 'Full-Time',
    experience_level: '1-2 Years',
    salary_range: '',
    location: '',
    description: '',
    perks: [] as string[],
    openings: 1
  });

  const categories = ['Hair Stylist', 'Beautician', 'Nail Artist', 'Salon Manager', 'Makeup Artist', 'Front Desk'];
  const jobTypes = ['Full-Time', 'Part-Time', 'Contract', 'Freelance'];
  const expLevels = ['Fresher', '1-2 Years', '3-5 Years', '5+ Years'];
  const commonPerks = ['Accommodation', 'PF/ESI', 'Incentives', 'Paid Leaves', 'Training'];

  useEffect(() => {
    fetchOwnerShops();
  }, []);

  const fetchOwnerShops = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shops')
        .select('id, shop_name, city, area')
        .eq('owner_id', user.id);

      if (error) throw error;
      setShops(data || []);
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, shop_id: data[0].id, location: `${data[0].area}, ${data[0].city}` }));
      }
    } catch (err) {
      console.error('Error fetching shops:', err);
    } finally {
      setLoadingShops(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const selectedShop = shops.find(s => s.id === formData.shop_id);

      const { data, error } = await supabase
        .from('job_posts')
        .insert([{
          ...formData,
          owner_id: user.id,
          salon_name: selectedShop?.shop_name || 'My Salon',
          status: 'pending_review',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setSubmittedJob(data);
      setSuccess(true);
    } catch (err) {
      console.error('Post job failed:', err);
      alert('Failed to post job. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  const togglePerk = (perk: string) => {
    setFormData(prev => ({
      ...prev,
      perks: prev.perks.includes(perk) 
        ? prev.perks.filter(p => p !== perk) 
        : [...prev.perks, perk]
    }));
  };

  if (success && submittedJob) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-6 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xl w-full bg-white rounded-[40px] p-10 text-center shadow-2xl shadow-slate-200/50 space-y-8 border border-emerald-100"
        >
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100 shadow-xl shadow-emerald-500/10">
            <CheckCircle className="w-12 h-12" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Job Posted Successfully!</h2>
            <p className="text-slate-500 font-medium">Your job post is now <span className="text-amber-600 font-bold">Pending Review</span>. Our team will approve it shortly to make it public.</p>
          </div>

          {/* Job Card Preview */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 w-fit">
                  Pending Review
                </p>
                <h3 className="text-xl font-black text-slate-900">{submittedJob.title}</h3>
                <p className="text-sm font-bold text-slate-500">{submittedJob.salon_name} • {submittedJob.location}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Salary Range</p>
                <p className="text-sm font-black text-slate-900">{submittedJob.salary_range}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience</p>
                <p className="text-sm font-black text-slate-900">{submittedJob.experience_level}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigateTo('/owner-dashboard')}
              className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
            >
              Go to Owner Dashboard
            </button>
            <button 
              onClick={() => { setSuccess(false); setSubmittedJob(null); setFormData({ ...formData, title: '' }); }}
              className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Post Another Job
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header Area */}
      <div className="bg-slate-900 pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">Post a New Job</h1>
            <p className="text-slate-400 font-medium">Reach the best beauty professionals in Jaipur.</p>
          </div>
          <button 
            onClick={() => navigateTo('/owner-dashboard')}
            className="p-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-10">
          
          {/* Shop Selection */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Salon Details</h2>
            </div>
            
            {loadingShops ? (
              <div className="h-16 bg-slate-50 rounded-2xl animate-pulse"></div>
            ) : shops.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Salon</label>
                  <select 
                    value={formData.shop_id}
                    onChange={(e) => {
                      const shop = shops.find(s => s.id === e.target.value);
                      setFormData(prev => ({ ...prev, shop_id: e.target.value, location: `${shop?.area}, ${shop?.city}` }));
                    }}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                  >
                    {shops.map(shop => (
                      <option key={shop.id} value={shop.id}>{shop.shop_name} ({shop.area})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Location</label>
                  <input 
                    type="text" 
                    readOnly
                    value={formData.location}
                    className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            ) : (
              <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                <p className="text-sm font-bold text-rose-600">You must register your salon website before posting jobs.</p>
                <button 
                  type="button"
                  onClick={() => navigateTo('/owner-register')}
                  className="text-xs font-black text-rose-700 uppercase tracking-widest underline"
                >
                  Register Salon Now
                </button>
              </div>
            )}
          </section>

          {/* Job Info */}
          <section className="space-y-6 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Job Information</h2>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Title</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Senior Hair Stylist (Female)"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Type</label>
                <select 
                  value={formData.job_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, job_type: e.target.value }))}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                >
                  {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Experience Level</label>
                <select 
                  value={formData.experience_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience_level: e.target.value }))}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                >
                  {expLevels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salary Range (Monthly)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₹</div>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: 25,000 - 35,000"
                    value={formData.salary_range}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary_range: e.target.value }))}
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Number of Openings</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.openings}
                  onChange={(e) => setFormData(prev => ({ ...prev, openings: parseInt(e.target.value) }))}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Description</label>
              <textarea 
                required
                rows={5}
                placeholder="List responsibilities, skills required, and what makes your salon a great place to work..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium resize-none"
              />
            </div>
          </section>

          {/* Benefits */}
          <section className="space-y-4 pt-4 border-t border-slate-50">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Benefits & Perks</label>
            <div className="flex flex-wrap gap-2">
              {commonPerks.map(perk => (
                <button
                  key={perk}
                  type="button"
                  onClick={() => togglePerk(perk)}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                    formData.perks.includes(perk) 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/10' 
                      : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-emerald-300 hover:text-emerald-600'
                  }`}
                >
                  {perk}
                </button>
              ))}
            </div>
          </section>

          <button 
            type="submit"
            disabled={loading || shops.length === 0}
            className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Post Job for Review
          </button>
        </form>
      </div>
    </div>
  );
}
