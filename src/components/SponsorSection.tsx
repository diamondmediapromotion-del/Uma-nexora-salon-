import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ExternalLink, 
  Play, 
  ChevronRight, 
  ShieldCheck, 
  Star,
  Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Campaign {
  id: string;
  title: string;
  campaign_type: string;
  placement: string;
  media_url: string;
  target_url: string;
  brand_profiles?: {
    id: string;
    display_name: string;
    brand_code: string;
    logo_url: string;
  };
}

interface BrandProfile {
  id: string;
  brand_code: string;
  display_name: string;
  logo_url: string;
  is_verified: boolean;
  business_type: string;
}

export default function SponsorSection({ navigateTo }: { navigateTo: (path: string) => void }) {
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [featuredBrands, setFeaturedBrands] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      // 1. Fetch Active Campaigns
      const today = new Date().toISOString().split('T')[0];
      const { data: campaignData } = await supabase
        .from('sponsored_campaigns')
        .select('*, brand_profiles(id, display_name, brand_code, logo_url)')
        .eq('status', 'active')
        .lte('start_date', today)
        .gte('end_date', today);
      
      setActiveCampaigns(campaignData || []);

      // 2. Fetch Featured Brands
      const { data: brandData } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('status', 'approved')
        .eq('is_featured', true)
        .limit(6);
      
      setFeaturedBrands(brandData || []);

      // Track impressions for active campaigns
      if (campaignData && campaignData.length > 0) {
        campaignData.forEach(c => {
          supabase.rpc('track_sponsored_campaign_event', {
            p_campaign_id: c.id,
            p_event_type: 'impression',
            p_page_url: window.location.pathname,
            p_idempotency_key: `imp_${c.id}_${today}`
          });
        });
      }

    } catch (err) {
      console.error('Error fetching sponsors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignClick = (campaign: Campaign) => {
    supabase.rpc('track_sponsored_campaign_event', {
      p_campaign_id: campaign.id,
      p_event_type: 'click',
      p_page_url: window.location.pathname,
      p_idempotency_key: `clk_${campaign.id}_${Date.now()}`
    });

    if (campaign.target_url) {
      if (campaign.target_url.startsWith('/')) {
        navigateTo(campaign.target_url);
      } else {
        window.open(campaign.target_url, '_blank');
      }
    } else if (campaign.brand_profiles?.brand_code) {
      navigateTo(`/brands/${campaign.brand_profiles.brand_code}?campaign_id=${campaign.id}`);
    }
  };

  if (activeCampaigns.length === 0 && featuredBrands.length === 0) return null;

  return (
    <section className="py-20 bg-slate-900 overflow-hidden relative">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5" />
              Industry Sponsors
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight">
              Beauty Industry <span className="text-blue-500">Sponsors</span>
            </h2>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl font-medium leading-relaxed">
              Premium salon supply partnerships and verified brand distributors serving the Rajasthan beauty network.
            </p>
          </div>
          <button 
            onClick={() => navigateTo('/brands')}
            className="group flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest hover:text-blue-400 transition-colors"
          >
            Explore Brand Directory
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Sponsored Campaigns Grid */}
        {activeCampaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeCampaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                whileHover={{ y: -8 }}
                onClick={() => handleCampaignClick(campaign)}
                className="group relative bg-slate-800/50 rounded-[32px] border border-white/10 overflow-hidden cursor-pointer shadow-2xl"
              >
                {/* Sponsor Label */}
                <div className="absolute top-4 left-4 z-20 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md rounded-md text-[8px] font-black uppercase tracking-[0.2em] text-white/60 border border-white/5 flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  Sponsored
                </div>

                {/* Media Content */}
                <div className="aspect-[16/10] relative">
                  <img 
                    src={campaign.media_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800'} 
                    alt={campaign.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                </div>

                {/* Content Info */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white p-1 border border-white/10">
                      <img src={campaign.brand_profiles?.logo_url || ''} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm leading-none">{campaign.title}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">By {campaign.brand_profiles?.display_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.1em]">View Wholesale Details</span>
                    <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Featured Brands Carousel/Grid */}
        {featuredBrands.length > 0 && (
          <div className="space-y-8 pt-8 border-t border-white/5">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Featured Ecosystem Brands</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {featuredBrands.map((brand) => (
                <motion.div
                  key={brand.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigateTo(`/brands/${brand.brand_code}`)}
                  className="bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col items-center gap-4 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white p-2 overflow-hidden shadow-xl">
                    <img src={brand.logo_url} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-white font-bold text-xs truncate max-w-[100px]">{brand.display_name}</p>
                      {brand.is_verified && <ShieldCheck className="w-3 h-3 text-blue-500" />}
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{brand.business_type}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
