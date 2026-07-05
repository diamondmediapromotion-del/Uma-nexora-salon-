import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut, 
  Upload, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Clock, 
  TrendingUp, 
  MousePointer2, 
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Video,
  Image as ImageIcon,
  MoreVertical,
  X,
  FileText
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AppOnboardingChecklist from '../apps/AppOnboardingChecklist';

interface BrandProfile {
  id: string;
  brand_code: string;
  display_name: string;
  logo_url: string;
  banner_url: string;
  intro_video_url: string;
  business_type: string;
  city: string;
  state: string;
  about: string;
  product_categories: string[];
  website_url: string;
  instagram_handle: string;
  whatsapp_number: string;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  admin_note?: string;
}

interface Product {
  id: string;
  product_name: string;
  category: string;
  sub_category: string;
  image_url: string;
  status: string;
  mrp: number;
  wholesale_price: number;
  min_order_quantity: number;
  rejection_reason?: string;
}

interface Campaign {
  id: string;
  title: string;
  campaign_type: string;
  status: string;
  start_date: string;
  end_date: string;
  budget_amount: number;
  impressions: number;
  clicks: number;
  leads: number;
}

interface Lead {
  id: string;
  salon_name: string;
  contact_name: string;
  contact_phone: string;
  message: string;
  status: string;
  created_at: string;
  product_name?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BrandDashboardProps {
  navigateTo: (path: string) => void;
}

export default function BrandDashboard({ navigateTo }: BrandDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'products' | 'leads' | 'campaigns'>('overview');
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<'logo' | 'banner' | 'video' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase.rpc('get_my_brand_profile');
      if (profileError) throw profileError;
      setProfile(profileData);

      if (profileData) {
        // 2. Fetch Products
        const { data: productsData } = await supabase
          .from('brand_products')
          .select('*')
          .eq('brand_id', profileData.id)
          .order('created_at', { ascending: false });
        setProducts(productsData || []);

        // 3. Fetch Campaigns
        const { data: campaignsData } = await supabase
          .from('sponsored_campaigns')
          .select('*')
          .eq('brand_id', profileData.id)
          .order('created_at', { ascending: false });
        setCampaigns(campaignsData || []);

        // 4. Fetch Leads
        const { data: leadsData } = await supabase
          .from('brand_leads')
          .select('*, brand_products(product_name)')
          .eq('brand_id', profileData.id)
          .order('created_at', { ascending: false });
        
        const mappedLeads = (leadsData || []).map(l => ({
          ...l,
          product_name: l.brand_products?.product_name
        }));
        setLeads(mappedLeads);
      }

      // 5. Fetch Categories
      const { data: categoriesData } = await supabase
        .from('brand_product_categories')
        .select('*')
        .eq('is_active', true);
      setCategories(categoriesData || []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner' | 'video') => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setUploading(type);
    setUploadProgress(10);
    
    try {
      const bucket = type === 'video' ? 'brand-videos' : 'brand-assets';
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${type}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) throw error;
      setUploadProgress(60);

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Register Media Asset
      await supabase.rpc('register_brand_media_asset', {
        p_asset_type: type,
        p_storage_path: filePath,
        p_public_url: publicUrl,
        p_file_name: file.name,
        p_file_size: file.size,
        p_mime_type: file.type
      });

      // Update Profile URL
      const updateData: any = {};
      if (type === 'logo') updateData.logo_url = publicUrl;
      if (type === 'banner') updateData.banner_url = publicUrl;
      if (type === 'video') updateData.intro_video_url = publicUrl;

      const { error: updateError } = await supabase
        .from('brand_profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, ...updateData } : null);
      setUploadProgress(100);
      setTimeout(() => {
        setUploading(null);
        setUploadProgress(0);
      }, 1000);

    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please try again.');
      setUploading(null);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !profile) return;

    try {
      const isNew = !editingProduct.id;
      const productData = {
        ...editingProduct,
        brand_id: profile.id,
        status: editingProduct.status === 'rejected' ? 'draft' : (editingProduct.status || 'draft')
      };

      let result;
      if (isNew) {
        result = await supabase.from('brand_products').insert(productData).select().single();
      } else {
        result = await supabase.from('brand_products').update(productData).eq('id', editingProduct.id).select().single();
      }

      if (result.error) throw result.error;

      if (isNew) {
        setProducts([result.data, ...products]);
      } else {
        setProducts(products.map(p => p.id === result.data.id ? result.data : p));
      }

      setShowProductModal(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const submitProductForReview = async (productId: string) => {
    try {
      const { error } = await supabase.rpc('submit_brand_product_for_review', {
        p_product_id: productId
      });
      if (error) throw error;
      setProducts(products.map(p => p.id === productId ? { ...p, status: 'pending_review' } : p));
    } catch (err) {
      console.error('Error submitting for review:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p className="text-sm text-slate-400 font-medium tracking-widest uppercase">Initializing Brand Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex text-slate-300">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-lg tracking-tight leading-none">BrandOS</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Management Suite</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'profile', label: 'Brand Profile', icon: Settings },
            { id: 'products', label: 'Product Manager', icon: Package },
            { id: 'campaigns', label: 'Sponsored Ads', icon: BarChart3 },
            { id: 'leads', label: 'Inquiries', icon: MessageSquare },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button 
            onClick={() => {
              supabase.auth.signOut();
              navigateTo('/');
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <header className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-bold text-lg">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
              profile?.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
              profile?.status === 'pending_review' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
              'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {profile?.status}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-white font-bold text-sm leading-none">{profile?.display_name}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">ID: {profile?.brand_code}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
              <img src={profile?.logo_url || ''} alt="" className="w-full h-full object-contain" />
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl">
          
          <AppOnboardingChecklist appKey="brand_app" />

          <AnimatePresence mode="wait">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Products', value: products.length, icon: Package, color: 'text-blue-500' },
                    { label: 'Total Impressions', value: campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0), icon: Eye, color: 'text-indigo-500' },
                    { label: 'Total Clicks', value: campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0), icon: MousePointer2, color: 'text-violet-500' },
                    { label: 'Business Leads', value: campaigns.reduce((acc, c) => acc + (c.leads || 0), 0), icon: MessageSquare, color: 'text-emerald-500' },
                  ].map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                      <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                        <div className={`w-10 h-10 ${kpi.color} bg-slate-800 rounded-xl flex items-center justify-center`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{kpi.label}</p>
                          <h4 className="text-3xl font-display font-black text-white">{kpi.value}</h4>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Status Banner */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 relative overflow-hidden flex flex-col justify-between min-h-[240px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10 space-y-2">
                      <h3 className="text-2xl font-display font-black text-white">Nexora Brand Partnership</h3>
                      <p className="text-blue-100 text-sm max-w-md">Your brand storefront is the primary way salon owners discover your beauty supply catalog across Rajasthan.</p>
                    </div>
                    <div className="relative z-10 flex gap-4 pt-6">
                      <button onClick={() => navigateTo(`/brands/${profile?.brand_code}`)} className="px-6 py-3 bg-white text-slate-950 font-bold rounded-xl text-xs hover:bg-slate-100 transition-colors flex items-center gap-2">
                        View Public Profile <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Profile Completion */}
                  <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 space-y-6">
                    <h4 className="text-white font-bold text-sm">Storefront Setup</h4>
                    <div className="space-y-4">
                      {[
                        { label: 'Brand Logo', done: !!profile?.logo_url },
                        { label: 'Banner Image', done: !!profile?.banner_url },
                        { label: 'Intro Video', done: !!profile?.intro_video_url },
                        { label: 'Wholesale Products', done: products.length >= 3 },
                      ].map((task, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className={`text-xs font-medium ${task.done ? 'text-slate-300' : 'text-slate-500'}`}>{task.label}</span>
                          {task.done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-slate-600" />}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab('profile')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors">
                      Complete Setup
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden">
                  {/* Banner Upload */}
                  <div className="h-64 relative group">
                    <img 
                      src={profile?.banner_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1600'} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-slate-950 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        {uploading === 'banner' ? `Uploading ${uploadProgress}%` : 'Replace Banner'}
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'banner')} disabled={!!uploading} />
                      </label>
                    </div>
                  </div>

                  <div className="p-10 pt-0 -mt-20 relative z-10 flex flex-col md:flex-row gap-10 items-start">
                    {/* Logo Upload */}
                    <div className="relative group">
                      <div className="w-40 h-40 rounded-[32px] border-8 border-slate-900 bg-slate-800 overflow-hidden flex items-center justify-center p-2 shadow-2xl">
                        <img src={profile?.logo_url || ''} alt="" className="w-full h-full object-contain" />
                      </div>
                      <label className="absolute inset-0 rounded-[32px] bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Upload className="w-6 h-6 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} disabled={!!uploading} />
                      </label>
                    </div>

                    <div className="flex-1 pt-24 space-y-2">
                      <h3 className="text-2xl font-display font-black text-white">{profile?.display_name}</h3>
                      <div className="flex gap-4">
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{profile?.business_type}</p>
                        <span className="text-slate-700">|</span>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{profile?.city}, {profile?.state}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Basic Info Form (Read Only for now) */}
                  <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 space-y-6">
                    <h4 className="text-white font-bold text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      Brand Details
                    </h4>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Brand Code</label>
                          <div className="bg-slate-950 px-4 py-3 rounded-xl text-slate-400 text-sm font-bold border border-slate-800">{profile?.brand_code}</div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Business Type</label>
                          <div className="bg-slate-950 px-4 py-3 rounded-xl text-slate-400 text-sm font-bold border border-slate-800">{profile?.business_type}</div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">About Brand</label>
                        <div className="bg-slate-950 px-4 py-3 rounded-xl text-slate-400 text-sm leading-relaxed border border-slate-800 min-h-[100px]">
                          {profile?.about || "No about description provided yet."}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Media & Verification Section */}
                  <div className="space-y-8">
                    {/* Intro Video */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 space-y-6">
                      <h4 className="text-white font-bold text-sm flex items-center gap-2">
                        <Video className="w-4 h-4 text-rose-500" />
                        Brand Intro Video
                      </h4>
                      {profile?.intro_video_url ? (
                        <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden relative group">
                          <video src={profile.intro_video_url} className="w-full h-full object-cover"></video>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer bg-white text-slate-950 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                              Replace Video
                              <input type="file" className="hidden" accept="video/*" onChange={e => handleFileUpload(e, 'video')} disabled={!!uploading} />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="aspect-video bg-slate-950 rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500 transition-colors group">
                          <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Video className="w-6 h-6 text-slate-500" />
                          </div>
                          <div className="text-center">
                            <p className="text-slate-300 text-xs font-bold">Upload Brand Story Video</p>
                            <p className="text-slate-600 text-[10px] mt-1">MP4 or WebM preferred (Max 50MB)</p>
                          </div>
                          <input type="file" className="hidden" accept="video/*" onChange={e => handleFileUpload(e, 'video')} disabled={!!uploading} />
                        </label>
                      )}
                    </div>

                    {/* Verification Status */}
                    <div className={`bg-slate-900 border ${profile?.is_verified ? 'border-emerald-500/20' : 'border-slate-800'} rounded-[32px] p-8 flex items-center gap-6`}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${profile?.is_verified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-white font-bold text-sm">Verification Badge</h4>
                        <p className="text-slate-500 text-[11px] leading-tight">
                          {profile?.is_verified 
                            ? "Verified badge is active on your public profile. This builds trust with salon owners." 
                            : "Your brand is not verified yet. Verification is handled by Nexora Super Admin."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-display font-black text-white">Wholesale Catalog</h3>
                    <p className="text-slate-500 text-xs">Manage products visible to partner salons.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingProduct({ product_name: '', mrp: 0, wholesale_price: 0, min_order_quantity: 1, unit: 'pcs', category: categories[0]?.name });
                      setShowProductModal(true);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/50">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Product Details</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Pricing</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {products.map(product => (
                          <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex-shrink-0 overflow-hidden">
                                  <img src={product.image_url || ''} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="text-white font-bold text-sm leading-none mb-1">{product.product_name}</p>
                                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{product.category} • {product.sub_category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="space-y-0.5">
                                <p className="text-white font-black text-sm">₹{product.wholesale_price}</p>
                                <p className="text-slate-600 text-[10px] font-bold">MRP: ₹{product.mrp}</p>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="space-y-1">
                                <div className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                  product.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                  product.status === 'pending_review' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                  product.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                  'bg-slate-800 text-slate-400 border-slate-700'
                                }`}>
                                  {product.status.replace('_', ' ')}
                                </div>
                                {product.status === 'rejected' && product.rejection_reason && (
                                  <p className="text-rose-500 text-[9px] max-w-[150px] italic">Note: {product.rejection_reason}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setShowProductModal(true);
                                  }}
                                  className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {product.status === 'draft' && (
                                  <button 
                                    onClick={() => submitProductForReview(product.id)}
                                    className="px-3 py-2 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                                  >
                                    Submit
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {products.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                        <Package className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-500 text-sm italic">No products listed. Start by adding your first wholesale item.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* CAMPAIGNS TAB */}
            {activeTab === 'campaigns' && (
              <motion.div
                key="campaigns"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-display font-black text-white">Sponsored Analytics</h3>
                    <p className="text-slate-500 text-xs">Track real-time performance of your campaign ads.</p>
                  </div>
                  <button 
                    onClick={() => alert("Campaign creation request is handled via Nexora Support Desk.")}
                    className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Campaign Request
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {campaigns.map(campaign => (
                    <div key={campaign.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="text-white font-bold text-sm">{campaign.title}</h4>
                          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{campaign.campaign_type} • {campaign.status}</p>
                        </div>
                        <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          campaign.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {campaign.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                        <div className="text-center space-y-1">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Impressions</p>
                          <p className="text-white font-black text-lg">{campaign.impressions || 0}</p>
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Clicks</p>
                          <p className="text-white font-black text-lg">{campaign.clicks || 0}</p>
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">CTR</p>
                          <p className="text-indigo-400 font-black text-lg">
                            {campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-500 uppercase tracking-widest">Budget Utilization</span>
                          <span className="text-white">65%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {campaigns.length === 0 && (
                    <div className="col-span-full bg-slate-900 border border-slate-800 rounded-3xl p-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                        <BarChart3 className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-500 text-sm italic">No active campaigns. Contact admin to start sponsored listing.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* LEADS TAB */}
            {activeTab === 'leads' && (
              <motion.div
                key="leads"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-1">
                  <h3 className="text-2xl font-display font-black text-white">Business Inquiries</h3>
                  <p className="text-slate-500 text-xs">Manage direct purchase leads from salon owners.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/50">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Salon Details</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Inquiry About</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Message</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {leads.map(lead => (
                          <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-8 py-6">
                              <div className="space-y-1">
                                <p className="text-white font-bold text-sm leading-none">{lead.salon_name}</p>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{lead.contact_name} • {lead.contact_phone}</p>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-slate-300 text-xs font-medium">{lead.product_name || "General Inquiry"}</p>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-slate-500 text-xs line-clamp-2 max-w-xs">{lead.message}</p>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                lead.status === 'processed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              }`}>
                                {lead.status}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-slate-600 text-[10px] font-bold">{new Date(lead.created_at).toLocaleDateString()}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {leads.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                        <MessageSquare className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-500 text-sm italic">No inquiries received yet. They will appear here once salons contact you.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProductModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-black text-white">{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
                  <p className="text-slate-500 text-xs">Specify wholesale details for salon procurement.</p>
                </div>
                <button onClick={() => setShowProductModal(false)} className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Product Name</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      placeholder="e.g. Premium Keratin Serum"
                      value={editingProduct.product_name}
                      onChange={e => setEditingProduct({ ...editingProduct, product_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      value={editingProduct.category}
                      onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    >
                      {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Short Description</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      placeholder="Catchy summary for catalog"
                      value={editingProduct.short_description || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Image URL</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      placeholder="https://..."
                      value={editingProduct.image_url || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">MRP (₹)</label>
                    <input 
                      required
                      type="number"
                      className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      value={editingProduct.mrp}
                      onChange={e => setEditingProduct({ ...editingProduct, mrp: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Wholesale (₹)</label>
                    <input 
                      required
                      type="number"
                      className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      value={editingProduct.wholesale_price}
                      onChange={e => setEditingProduct({ ...editingProduct, wholesale_price: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Min Order</label>
                    <div className="flex gap-2">
                      <input 
                        required
                        type="number"
                        className="flex-1 bg-slate-800 border-none rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        value={editingProduct.min_order_quantity}
                        onChange={e => setEditingProduct({ ...editingProduct, min_order_quantity: parseInt(e.target.value) })}
                      />
                      <input 
                        type="text"
                        className="w-16 bg-slate-800 border-none rounded-xl py-3 px-2 text-white text-center text-sm outline-none"
                        value={editingProduct.unit}
                        onChange={e => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
