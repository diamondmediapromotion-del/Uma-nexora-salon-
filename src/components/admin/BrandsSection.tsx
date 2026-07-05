import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Package, 
  BarChart3, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  MoreVertical,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BrandProfile {
  id: string;
  display_name: string;
  brand_code: string;
  business_type: string;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  city: string;
  created_at: string;
}

interface Product {
  id: string;
  brand_id: string;
  product_name: string;
  category: string;
  status: string;
  wholesale_price: number;
  created_at: string;
  brand_profiles?: {
    display_name: string;
  };
}

interface Campaign {
  id: string;
  brand_id: string;
  title: string;
  campaign_type: string;
  status: string;
  impressions: number;
  clicks: number;
  leads: number;
  brand_profiles?: {
    display_name: string;
  };
}

interface Lead {
  id: string;
  brand_id: string;
  salon_name: string;
  contact_name: string;
  contact_phone: string;
  message: string;
  status: string;
  created_at: string;
  brand_profiles?: {
    display_name: string;
  };
}

export default function BrandsSection() {
  const [activeTab, setActiveTab] = useState<'profiles' | 'products' | 'campaigns' | 'leads'>('profiles');
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // UI States
  const [selectedBrand, setSelectedBrand] = useState<BrandProfile | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'profiles') {
        const { data } = await supabase.from('brand_profiles').select('*').order('created_at', { ascending: false });
        setProfiles(data || []);
      } else if (activeTab === 'products') {
        const { data } = await supabase
          .from('brand_products')
          .select('*, brand_profiles(display_name)')
          .order('created_at', { ascending: false });
        setProducts(data || []);
      } else if (activeTab === 'campaigns') {
        const { data } = await supabase
          .from('sponsored_campaigns')
          .select('*, brand_profiles(display_name)')
          .order('created_at', { ascending: false });
        setCampaigns(data || []);
      } else if (activeTab === 'leads') {
        const { data } = await supabase
          .from('brand_leads')
          .select('*, brand_profiles(display_name)')
          .order('created_at', { ascending: false });
        setLeads(data || []);
      }
    } catch (err) {
      console.error('Error fetching admin brand data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBrandControls = async (brandId: string, status: string, isVerified: boolean, isFeatured: boolean) => {
    setProcessing(true);
    try {
      const { error } = await supabase.rpc('admin_update_brand_profile_admin_controls', {
        p_brand_id: brandId,
        p_status: status,
        p_is_verified: isVerified,
        p_is_featured: isFeatured,
        p_admin_note: 'Updated by Super Admin'
      });
      if (error) throw error;
      setProfiles(profiles.map(p => p.id === brandId ? { ...p, status, is_verified: isVerified, is_featured: isFeatured } : p));
      setSelectedBrand(null);
    } catch (err) {
      console.error('Error updating brand controls:', err);
    } finally {
      setProcessing(false);
    }
  };

  const updateProductStatus = async (productId: string, status: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase.rpc('admin_update_brand_product_status', {
        p_product_id: productId,
        p_status: status,
        p_rejection_reason: status === 'rejected' ? rejectionReason : null
      });
      if (error) throw error;
      setProducts(products.map(p => p.id === productId ? { ...p, status } : p));
      setSelectedProduct(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Error updating product status:', err);
    } finally {
      setProcessing(false);
    }
  };

  const filteredProfiles = profiles.filter(p => p.display_name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight">Brands & Distributors</h2>
          <p className="text-slate-500 text-xs font-medium">B2B supply chain management and sponsored placement controls.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {[
            { id: 'profiles', label: 'Profiles', icon: Building2 },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'campaigns', label: 'Sponsored', icon: BarChart3 },
            { id: 'leads', label: 'Leads', icon: MessageSquare },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        {/* Sub-header with search */}
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading brand data...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Details</th>
                  {activeTab === 'profiles' && (
                    <>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Controls</th>
                    </>
                  )}
                  {activeTab === 'products' && (
                    <>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Brand</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    </>
                  )}
                  {activeTab === 'campaigns' && (
                    <>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Metrics</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    </>
                  )}
                  {activeTab === 'leads' && (
                    <>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Brand</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    </>
                  )}
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeTab === 'profiles' && profiles.map(brand => (
                  <tr key={brand.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-xs uppercase border border-slate-200">
                          {brand.display_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold text-sm leading-none mb-1">{brand.display_name}</p>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{brand.brand_code} • {brand.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        brand.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        brand.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {brand.status}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        {brand.is_verified && (
                          <div className="p-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100" title="Verified">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {brand.is_featured && (
                          <div className="p-1 bg-amber-50 text-amber-600 rounded-md border border-amber-100" title="Featured">
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedBrand(brand)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {activeTab === 'products' && products.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-slate-900 font-bold text-sm leading-none mb-1">{product.product_name}</p>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{product.category}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-slate-500 font-bold text-xs">
                      {product.brand_profiles?.display_name || 'N/A'}
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        product.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        product.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {product.status.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedProduct(product)}
                        className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 transition-all"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {activeTab === 'campaigns' && campaigns.map(campaign => (
                  <tr key={campaign.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-slate-900 font-bold text-sm leading-none mb-1">{campaign.title}</p>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{campaign.campaign_type}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-6">
                        <div className="text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Impr.</p>
                          <p className="text-slate-900 font-black text-sm">{campaign.impressions || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clicks</p>
                          <p className="text-slate-900 font-black text-sm">{campaign.clicks || 0}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        campaign.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {campaign.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-bold text-[10px] text-slate-400">
                      {campaign.brand_profiles?.display_name}
                    </td>
                  </tr>
                ))}

                {activeTab === 'leads' && leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-slate-900 font-bold text-sm leading-none mb-1">{lead.salon_name}</p>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{lead.contact_name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-slate-500 font-bold text-xs">
                      {lead.brand_profiles?.display_name || 'N/A'}
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        lead.status === 'processed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {lead.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right text-slate-400 text-[10px] font-bold">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Brand Controls Modal */}
      <AnimatePresence>
        {selectedBrand && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBrand(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-[32px] p-10 max-w-lg w-full shadow-2xl border border-slate-100 space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black text-slate-900">Brand Controls</h3>
                <p className="text-slate-500 text-sm">Managing: <span className="font-bold text-slate-900">{selectedBrand.display_name}</span></p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Registration Status</label>
                  <div className="flex gap-2">
                    {['pending_review', 'approved', 'rejected', 'suspended'].map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedBrand({ ...selectedBrand, status: s })}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                          selectedBrand.status === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setSelectedBrand({ ...selectedBrand, is_verified: !selectedBrand.is_verified })}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                      selectedBrand.is_verified ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Verified Badge</span>
                  </button>
                  <button 
                    onClick={() => setSelectedBrand({ ...selectedBrand, is_featured: !selectedBrand.is_featured })}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                      selectedBrand.is_featured ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}
                  >
                    <Star className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Featured Listing</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setSelectedBrand(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl text-xs hover:bg-slate-200 transition-colors">Cancel</button>
                <button 
                  disabled={processing}
                  onClick={() => updateBrandControls(selectedBrand.id, selectedBrand.status, selectedBrand.is_verified, selectedBrand.is_featured)} 
                  className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                  {processing ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Review Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-[32px] p-10 max-w-lg w-full shadow-2xl border border-slate-100 space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black text-slate-900">Product Review</h3>
                <p className="text-slate-500 text-sm">Product: <span className="font-bold text-slate-900">{selectedProduct.product_name}</span></p>
                <p className="text-slate-400 text-xs">Brand: {selectedProduct.brand_profiles?.display_name}</p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <button 
                    onClick={() => updateProductStatus(selectedProduct.id, 'approved')}
                    className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button 
                    onClick={() => updateProductStatus(selectedProduct.id, 'inactive')}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl text-xs hover:bg-slate-200 transition-colors"
                  >
                    Mark Inactive
                  </button>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rejection Reason (if rejecting)</label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:ring-2 focus:ring-rose-500/20 outline-none resize-none transition-all"
                      placeholder="Specify why the product is rejected..."
                      rows={3}
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                    ></textarea>
                  </div>
                  <button 
                    disabled={!rejectionReason || processing}
                    onClick={() => updateProductStatus(selectedProduct.id, 'rejected')}
                    className="w-full py-4 bg-rose-50 text-rose-600 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> {processing ? "Processing..." : "Confirm Rejection"}
                  </button>
                </div>
              </div>

              <button onClick={() => setSelectedProduct(null)} className="w-full py-3 text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors">Close Review</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
