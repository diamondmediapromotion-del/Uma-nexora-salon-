import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  ShieldCheck, 
  Star, 
  Globe, 
  Instagram, 
  MessageSquare,
  ChevronRight,
  ArrowLeft,
  Info,
  Package,
  CheckCircle2,
  AlertCircle,
  Play,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  product_name: string;
  category: string;
  sub_category: string;
  image_url: string;
  short_description: string;
  mrp: number;
  wholesale_price: number;
  min_order_quantity: number;
  unit: string;
}

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
  is_verified: boolean;
  is_featured: boolean;
}

interface PublicBrandDetailProps {
  brandCode: string;
  navigateTo: (path: string) => void;
}

export default function PublicBrandDetail({ brandCode, navigateTo }: PublicBrandDetailProps) {
  const [brand, setBrand] = useState<BrandProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    mobile: '',
    message: ''
  });

  useEffect(() => {
    fetchBrandDetails();
  }, [brandCode]);

  const fetchBrandDetails = async () => {
    setLoading(true);
    try {
      // Use RPC if available, or fallback to standard query
      const { data, error } = await supabase.rpc('get_public_brand_by_code', { 
        p_brand_code: brandCode 
      });

      if (error) {
        // Fallback for direct query
        const { data: directData, error: directError } = await supabase
          .from('brand_profiles')
          .select('*')
          .eq('brand_code', brandCode)
          .eq('status', 'approved')
          .single();
        
        if (directError) throw directError;
        setBrand(directData);
      } else {
        setBrand(data);
      }

      if (data || brand) {
        const brandId = data?.id || (brand as any)?.id;
        if (brandId) {
          const { data: productsData } = await supabase
            .from('brand_products')
            .select('*')
            .eq('brand_id', brandId)
            .eq('status', 'approved');
          setProducts(productsData || []);
        }
      }
    } catch (err) {
      console.error('Error fetching brand details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent, productId?: string) => {
    e.preventDefault();
    if (!brand) return;
    
    setInquiryLoading(true);
    try {
      const { error } = await supabase.rpc('create_brand_lead', {
        p_brand_id: brand.id,
        p_customer_name: inquiryForm.name,
        p_customer_mobile: inquiryForm.mobile,
        p_message: inquiryForm.message,
        p_product_id: productId
      });

      if (error) throw error;

      // Track lead event if this was a sponsored visit (simplified)
      const campaignId = new URLSearchParams(window.location.search).get('campaign_id');
      if (campaignId) {
        await supabase.rpc('track_sponsored_campaign_event', {
          p_campaign_id: campaignId,
          p_event_type: 'lead',
          p_page_url: window.location.href,
          p_idempotency_key: `lead_${campaignId}_${Date.now()}`
        });
      }

      setInquirySuccess(true);
      setInquiryForm({ name: '', mobile: '', message: '' });
      setTimeout(() => setInquirySuccess(false), 5000);
    } catch (err) {
      console.error('Error submitting inquiry:', err);
    } finally {
      setInquiryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p className="text-sm text-slate-500 font-medium">Loading Brand Details...</p>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Brand Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-xs">The brand you are looking for does not exist or has not been approved yet.</p>
        <button onClick={() => navigateTo('/brands')} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg">
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Dynamic Banner */}
      <div className="h-[300px] md:h-[400px] relative overflow-hidden">
        <img 
          src={brand.banner_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1600'} 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <button 
          onClick={() => navigateTo('/brands')}
          className="absolute top-8 left-6 md:left-12 p-3 bg-white/10 backdrop-blur-md text-white rounded-2xl hover:bg-white/20 transition-all border border-white/20 z-30"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {brand.intro_video_url && (
          <button 
            onClick={() => setShowVideoModal(true)}
            className="absolute bottom-12 right-6 md:right-12 px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-xl z-30 group"
          >
            <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
            Watch Intro Video
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Profile Header */}
        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 p-8 md:p-12 -mt-24 flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-[32px] border-8 border-white bg-white shadow-xl overflow-hidden flex items-center justify-center p-2 shrink-0">
            <img 
              src={brand.logo_url || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=400'} 
              alt="" 
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-1 space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tight">{brand.display_name}</h1>
                <div className="flex gap-2">
                  {brand.is_verified && (
                    <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                  {brand.is_featured && (
                    <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>
                  )}
                </div>
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{brand.business_type} • Since 2021</p>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                {brand.city}, {brand.state}
              </div>
              {brand.website_url && (
                <a href={brand.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                  <Globe className="w-4 h-4 text-slate-400" />
                  Official Website
                </a>
              )}
              {brand.instagram_handle && (
                <a href={`https://instagram.com/${brand.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-pink-600 transition-colors">
                  <Instagram className="w-4 h-4 text-slate-400" />
                  {brand.instagram_handle}
                </a>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">About the Brand</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-3xl">
                {brand.about || "Nexora's premium distributor focusing on high-quality beauty supplies and salon essentials across the Jaipur region."}
              </p>
            </div>

            <div className="pt-4 flex flex-wrap gap-2">
              {brand.product_categories?.map(cat => (
                <span key={cat} className="px-4 py-1.5 bg-slate-50 text-slate-600 text-[11px] font-bold rounded-full border border-slate-100">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content: Product Showcase */}
          <div className="lg:col-span-2 space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-black text-slate-900 flex items-center gap-3">
                <Package className="w-6 h-6 text-blue-600" />
                Product Showcase
              </h2>
              <span className="text-xs font-bold text-slate-400">{products.length} Items Available</span>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map(product => (
                  <motion.div 
                    key={product.id}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4 hover:shadow-xl transition-all"
                  >
                    <div className="h-48 rounded-2xl overflow-hidden relative group">
                      <img 
                        src={product.image_url || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=400'} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[9px] font-black uppercase tracking-widest text-blue-600 shadow-sm border border-blue-50">
                        {product.category}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{product.product_name}</h4>
                      <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">{product.short_description}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-slate-900">₹{product.wholesale_price}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">/ {product.unit}</span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400">MRP: ₹{product.mrp}</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Min Order</span>
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black">{product.min_order_quantity}+</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        const el = document.getElementById('inquiry-form');
                        el?.scrollIntoView({ behavior: 'smooth' });
                        setInquiryForm(prev => ({ ...prev, message: `Interested in ${product.product_name}. Please send wholesale details.` }));
                      }}
                      className="w-full py-3 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-900 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                    >
                      Request Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <Package className="w-8 h-8" />
                </div>
                <p className="text-slate-500 text-sm font-medium italic">No products listed yet.</p>
              </div>
            )}
          </div>

          {/* Sidebar: Inquiry Form */}
          <div id="inquiry-form" className="lg:col-span-1 space-y-8">
            <div className="bg-slate-900 rounded-[32px] p-8 space-y-6 sticky top-24 shadow-2xl border border-slate-800">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                  <MessageSquare className="w-3 h-3" /> B2B Inquiry
                </div>
                <h3 className="text-xl font-display font-black text-white">Send Business Inquiry</h3>
                <p className="text-slate-400 text-xs leading-relaxed">Nexora handles your inquiry with regional beauty supply priority.</p>
              </div>

              {inquirySuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl space-y-4 text-center"
                >
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-emerald-400 font-bold text-sm">Inquiry Sent!</p>
                    <p className="text-slate-400 text-[11px]">The brand will contact you shortly on your mobile.</p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      placeholder="e.g. Rahul Sharma"
                      value={inquiryForm.name}
                      onChange={e => setInquiryForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp / Mobile</label>
                    <input 
                      required
                      type="tel"
                      className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      placeholder="+91 98765 43210"
                      value={inquiryForm.mobile}
                      onChange={e => setInquiryForm(prev => ({ ...prev, mobile: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Message</label>
                    <textarea 
                      required
                      rows={4}
                      className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
                      placeholder="Specify your wholesale requirements..."
                      value={inquiryForm.message}
                      onChange={e => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                    ></textarea>
                  </div>
                  <button 
                    disabled={inquiryLoading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                  >
                    {inquiryLoading ? "Sending..." : "Submit Inquiry"}
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Info className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Verified B2B leads only. Spam accounts are auto-flagged.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVideoModal(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl shadow-2xl overflow-hidden border border-white/10"
            >
              <button 
                onClick={() => setShowVideoModal(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white hover:text-black transition-all z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <video 
                src={brand.intro_video_url} 
                autoPlay 
                controls 
                className="w-full h-full object-contain"
              ></video>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
