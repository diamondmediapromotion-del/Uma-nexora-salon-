import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Filter, 
  MapPin, 
  ShieldCheck, 
  Star, 
  ChevronRight, 
  MessageSquare,
  LayoutGrid,
  Info,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BrandProfile {
  id: string;
  brand_code: string;
  display_name: string;
  logo_url: string;
  banner_url: string;
  business_type: string;
  city: string;
  state: string;
  product_categories: string[];
  is_verified: boolean;
  is_featured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
}

interface PublicBrandListingProps {
  navigateTo: (path: string) => void;
}

export default function PublicBrandListing({ navigateTo }: PublicBrandListingProps) {
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_product_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchBrands = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('brand_profiles')
        .select('*')
        .eq('status', 'approved');

      if (selectedCategory) {
        query = query.contains('product_categories', [selectedCategory]);
      }

      const { data, error } = await query.order('is_featured', { ascending: false });
      
      if (error) throw error;
      setBrands(data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBrands = brands.filter(brand => 
    brand.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Hero Header */}
      <div className="bg-slate-900 pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Nexora Brand Directory
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-black text-white tracking-tight leading-tight"
          >
            Discover Premium Beauty <br />
            <span className="text-blue-500">Brands & Distributors</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate-400 text-sm md:text-base"
          >
            Connect directly with authorized beauty distributors across Jaipur and Rajasthan.
            Get wholesale rates, verified product lines, and seamless supply chains.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        {/* Search & Filters Bar */}
        <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by brand name or city..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${!selectedCategory ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat.name ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Grid */}
        <div className="mt-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 animate-pulse">
                  <div className="w-full h-48 bg-slate-100 rounded-2xl"></div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBrands.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBrands.map((brand, idx) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col"
                >
                  {/* Banner */}
                  <div className="h-40 relative overflow-hidden">
                    <img 
                      src={brand.banner_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800'} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    {brand.is_featured && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-6 flex-1 space-y-6">
                    <div className="flex gap-4 -mt-12 relative z-10">
                      <div className="w-16 h-16 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center p-1">
                        <img 
                          src={brand.logo_url || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=200'} 
                          alt="" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="pt-8">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-display font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                            {brand.display_name}
                          </h3>
                          {brand.is_verified && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                        </div>
                        <p className="text-slate-400 text-xs font-medium">{brand.business_type}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <MapPin className="w-3.5 h-3.5" />
                        {brand.city}, {brand.state}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {brand.product_categories?.slice(0, 3).map(cat => (
                          <span key={cat} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-md border border-slate-100">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center gap-3">
                      <button 
                        onClick={() => navigateTo(`/brands/${brand.brand_code}`)}
                        className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                      >
                        View Profile
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => navigateTo(`/brands/${brand.brand_code}?inquiry=true`)}
                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                        title="Send Inquiry"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 p-20 text-center space-y-6">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                <LayoutGrid className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">No brands found</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  We couldn't find any brands matching your criteria. Try resetting filters or searching for something else.
                </p>
              </div>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                }}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-500/20"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
