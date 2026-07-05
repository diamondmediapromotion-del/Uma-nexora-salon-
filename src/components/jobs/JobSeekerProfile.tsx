import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Award, 
  FileText, 
  CheckCircle, 
  Save, 
  Loader2, 
  Plus, 
  X,
  Bell,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import JobDocumentUpload from './JobDocumentUpload';

interface SeekerProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  current_location: string;
  preferred_categories: string[];
  skills: string[];
  experience_years: number;
  bio: string;
  resume_asset_id: string | null;
}

export default function JobSeekerProfile() {
  const [profile, setProfile] = useState<SeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'alerts'>('info');

  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [expYears, setExpYears] = useState(0);
  const [bio, setBio] = useState('');
  const [prefCats, setPrefCats] = useState<string[]>([]);
  
  // Alert Preferences
  const [alertCats, setAlertCats] = useState<string[]>([]);
  const [alertCities, setAlertCities] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState(0);
  const [isAlertActive, setIsAlertActive] = useState(true);

  const categories = ['Hair Stylist', 'Beautician', 'Nail Artist', 'Salon Manager', 'Makeup Artist', 'Front Desk'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('job_seeker_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
        setEmail(profileData.email || '');
        setPhone(profileData.phone || '');
        setLocation(profileData.current_location || '');
        setSkills(profileData.skills?.join(', ') || '');
        setExpYears(profileData.experience_years || 0);
        setBio(profileData.bio || '');
        setPrefCats(profileData.preferred_categories || []);
      }

      // 2. Fetch Alert Preferences
      const { data: alertData } = await supabase
        .from('job_alert_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (alertData) {
        setAlertCats(alertData.preferred_categories || []);
        setAlertCities(alertData.preferred_cities || []);
        setMinSalary(alertData.min_salary || 0);
        setIsAlertActive(alertData.is_active);
      }

    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const profilePayload = {
        id: user.id,
        full_name: fullName,
        email: email,
        phone: phone,
        current_location: location,
        skills: skills.split(',').map(s => s.trim()).filter(s => s !== ''),
        experience_years: expYears,
        bio: bio,
        preferred_categories: prefCats,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('job_seeker_profiles')
        .upsert(profilePayload);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAlerts = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('job_alert_preferences')
        .upsert({
          user_id: user.id,
          preferred_categories: alertCats,
          preferred_cities: alertCities,
          min_salary: minSalary,
          is_active: isAlertActive,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Alerts save failed:', err);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setPrefCats(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
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
      <div className="bg-slate-900 pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-4">
          <h1 className="text-3xl font-black text-white tracking-tight">Job Seeker Profile</h1>
          <p className="text-slate-400 font-medium">Build your professional beauty profile and attract top salons.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
            {[
              { id: 'info', label: 'Basic Info', icon: User },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'alerts', label: 'Job Alerts', icon: Bell },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[120px] py-5 px-6 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'info' && (
                <motion.form 
                  key="info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSaveProfile}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          required
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                          placeholder="Ex: Anjali Sharma"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                          placeholder="anjali@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="tel" 
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current City (Jaipur Only)</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          required
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                          placeholder="Ex: Mansarovar, Jaipur"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Job Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            prefCats.includes(cat) 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/10' 
                              : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-600'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Core Skills</label>
                      <div className="relative">
                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          value={skills}
                          onChange={e => setSkills(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                          placeholder="Ex: Hair Coloring, Bridal Makeup, Spa Therapy"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Exp. (Years)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={expYears}
                        onChange={e => setExpYears(parseInt(e.target.value))}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Bio</label>
                    <textarea 
                      rows={4}
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium resize-none"
                      placeholder="Write a brief intro about your experience and career goals..."
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    {success && (
                      <div className="flex items-center gap-2 text-emerald-600 text-xs font-black uppercase tracking-widest">
                        <CheckCircle className="w-4 h-4" />
                        Profile Saved!
                      </div>
                    )}
                    <button 
                      type="submit"
                      disabled={saving}
                      className="ml-auto px-10 py-4 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Profile
                    </button>
                  </div>
                </motion.form>
              )}

              {activeTab === 'documents' && (
                <motion.div 
                  key="documents"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Resume</label>
                        {profile?.resume_asset_id && (
                          <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest border border-emerald-100">Uploaded</span>
                        )}
                      </div>
                      <JobDocumentUpload 
                        onUploadSuccess={async (id) => {
                          const { data: { user } } = await supabase.auth.getUser();
                          if (user) await supabase.from('job_seeker_profiles').update({ resume_asset_id: id }).eq('id', user.id);
                        }}
                        assetType="resume"
                        label="Upload Latest Resume"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Certificates (Optional)</label>
                      <JobDocumentUpload 
                        onUploadSuccess={() => {}}
                        assetType="certificate"
                        label="Upload Beauty Certificate"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Experience Letter</label>
                      <JobDocumentUpload 
                        onUploadSuccess={() => {}}
                        assetType="experience_letter"
                        label="Upload Experience Letter"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Portfolio (Optional)</label>
                      <JobDocumentUpload 
                        onUploadSuccess={() => {}}
                        assetType="portfolio"
                        label="Upload Work Portfolio"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-900">Why upload documents?</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Salons are 3x more likely to call candidates who have uploaded verified certificates and a clean resume. Your documents are stored securely and only visible to salons you apply to.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'alerts' && (
                <motion.div 
                  key="alerts"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Job Alert Preferences</h3>
                      <p className="text-xs text-slate-500 font-medium">Get notified when new jobs matching your criteria are posted.</p>
                    </div>
                    <button 
                      onClick={() => setIsAlertActive(!isAlertActive)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${isAlertActive ? 'bg-blue-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAlertActive ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alert Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setAlertCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                              alertCats.includes(cat) 
                                ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/10' 
                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-amber-300 hover:text-amber-600'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Cities (Comma separated)</label>
                        <input 
                          type="text" 
                          value={alertCities.join(', ')}
                          onChange={e => setAlertCities(e.target.value.split(',').map(s => s.trim()).filter(s => s !== ''))}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                          placeholder="Ex: Jaipur, Delhi, Mumbai"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Minimum Monthly Salary</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                          <input 
                            type="number" 
                            step="5000"
                            value={minSalary}
                            onChange={e => setMinSalary(parseInt(e.target.value))}
                            className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    {success && (
                      <div className="flex items-center gap-2 text-emerald-600 text-xs font-black uppercase tracking-widest">
                        <CheckCircle className="w-4 h-4" />
                        Preferences Saved!
                      </div>
                    )}
                    <button 
                      onClick={handleSaveAlerts}
                      disabled={saving}
                      className="ml-auto px-10 py-4 bg-amber-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/10 flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Preferences
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
