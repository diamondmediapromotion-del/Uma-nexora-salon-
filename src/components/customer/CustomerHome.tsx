import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { Sparkles, Search, Bell, MapPin, User, LogOut, Star, Mic, Zap, ShieldCheck, QrCode, Clock, Percent, Menu, AlertCircle, TrendingUp, Heart } from "lucide-react";
import BottomNav from "./BottomNav";
import LoadingState from "./LoadingState";
import TopBar from "./TopBar";
import { Shop } from "../../types";
import { getShopImage } from "../../lib/shopUtils";

interface CustomerHomeProps {
  navigateTo: (path: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  hair_salon: "Hair Salon",
  beauty_parlour: "Beauty Parlour",
  barber: "Barber",
  spa: "Spa",
  massage: "Massage",
  tattoo: "Tattoo",
  nail_art: "Nail Art"
};

const matchesAudience = (category: string, audience: string): boolean => {
  if (audience === "Men") {
    return category === "barber" || ["hair_salon", "spa", "massage", "tattoo"].includes(category);
  }
  if (audience === "Women") {
    return ["beauty_parlour", "nail_art"].includes(category) || ["hair_salon", "spa", "massage", "tattoo"].includes(category);
  }
  if (audience === "Child") {
    return ["hair_salon", "spa", "massage", "tattoo"].includes(category);
  }
  if (audience === "Unisex") {
    return ["hair_salon", "spa", "massage", "tattoo"].includes(category);
  }
  return true;
};

const getShopCoordinates = (shopId: string) => {
  let hash = 0;
  for (let i = 0; i < shopId.length; i++) {
    hash = shopId.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Deterministic coords around Jaipur (26.9124, 75.7873) within ~10km radius
  const latOffset = ((hash % 100) / 1000) * (hash % 2 === 0 ? 1 : -1);
  const lonOffset = (((hash >> 8) % 100) / 1000) * ((hash >> 4) % 2 === 0 ? 1 : -1);
  return {
    latitude: 26.9124 + latOffset,
    longitude: 75.7873 + lonOffset
  };
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
};

const BASE_TRENDING_KEYWORDS = [
  "Bridal Makeup",
  "Hair Spa",
  "Haircut",
  "Beard Grooming",
  "Facial",
  "Nail Art",
  "Massage",
  "Hair Color"
];

const isShopMatchKeyword = (
  shop: Shop,
  keyword: string,
  services: { service_name: string; category: string }[]
): boolean => {
  const query = keyword.toLowerCase().trim();
  if (!query) return true;

  const shopCategoryLabel = CATEGORY_LABELS[shop.category] || shop.category;
  const nameMatch = shop.shop_name.toLowerCase().includes(query);
  const catMatch = shopCategoryLabel.toLowerCase().includes(query);
  const areaMatch = shop.area ? shop.area.toLowerCase().includes(query) : false;
  const cityMatch = shop.city ? shop.city.toLowerCase().includes(query) : false;
  const descMatch = shop.description ? shop.description.toLowerCase().includes(query) : false;

  const serviceMatch = services.some(srv => {
    const srvNameMatch = srv.service_name ? srv.service_name.toLowerCase().includes(query) : false;
    const srvCatMatch = srv.category ? srv.category.toLowerCase().includes(query) : false;
    return srvNameMatch || srvCatMatch;
  });

  const matchesMenAudience = query === "men" && (shop.category === "barber" || ["hair_salon", "spa", "massage", "tattoo"].includes(shop.category));
  const matchesWomenAudience = query === "women" && (["beauty_parlour", "nail_art"].includes(shop.category) || ["hair_salon", "spa", "massage", "tattoo"].includes(shop.category));
  const matchesChildAudience = query === "child" && ["hair_salon", "spa", "massage", "tattoo"].includes(shop.category);
  const matchesUnisexAudience = query === "unisex" && ["hair_salon", "spa", "massage", "tattoo"].includes(shop.category);

  return nameMatch || catMatch || areaMatch || cityMatch || descMatch || serviceMatch || matchesMenAudience || matchesWomenAudience || matchesChildAudience || matchesUnisexAudience;
};

const CustomerHome = ({ navigateTo }: CustomerHomeProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [rewardData, setRewardData] = useState<any>(null); // Added
  const [membership, setMembership] = useState<any>(null); // Added
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopServices, setShopServices] = useState<Record<string, { service_name: string; category: string; price: number; duration: number; }[]>>({});
  const [aiRecommendations, setAiRecommendations] = useState<{service_name: string; category: string; price: number; duration: number; count: number}[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [rawTrendingKeywords, setRawTrendingKeywords] = useState<string[]>(BASE_TRENDING_KEYWORDS);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [savedShopIds, setSavedShopIds] = useState<string[]>([]);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [quickRebooks, setQuickRebooks] = useState<{service_name: string; shop_name: string; shop_id: string;}[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('nexora_recent_customer_searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    const q = query.trim();
    if (!q) return;

    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== q.toLowerCase());
      const updated = [q, ...filtered].slice(0, 3);
      localStorage.setItem('nexora_recent_customer_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearRecent = () => {
    localStorage.removeItem('nexora_recent_customer_searches');
    setRecentSearches([]);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // 1. Fetch Profile, Rewards & Membership
        if (user) {
          const [profileRes, rewardRes, membershipRes] = await Promise.all([
            supabase.from("profiles").select("full_name, email, phone, city, area, role").eq("id", user.id).single(),
            supabase.from("customer_reward_wallets").select('*').eq('customer_id', user.id).maybeSingle(),
            supabase.from("customer_memberships").select("*, membership_plans(*)").eq("customer_id", user.id).maybeSingle()
          ]);
          
          if (profileRes.data) setProfile(profileRes.data);
          if (rewardRes.data) setRewardData(rewardRes.data);
          if (membershipRes.data) setMembership(membershipRes.data);
          else {
              await supabase.rpc("ensure_customer_membership", { customer_id: user.id });
              const { data } = await supabase.from('customer_memberships').select('*, membership_plans(*)').eq('customer_id', user.id).maybeSingle();
              setMembership(data);
          }

          const { data: favData } = await supabase
            .from("customer_favourites")
            .select("shop_id")
            .eq("customer_id", user.id);
          
          if (favData) {
            setSavedShopIds(favData.map(f => f.shop_id));
          }

          const { data: recentBookings } = await supabase
            .from("customer_bookings")
            .select(`
              id,
              shop_id,
              created_at,
              shops ( shop_name ),
              customer_booking_services ( service_name )
            `)
            .eq("customer_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5);

          if (recentBookings) {
            const extractedServices: {service_name: string; shop_name: string; shop_id: string;}[] = [];
            const seenCombos = new Set<string>();

            for (const b of recentBookings) {
              const shopObj = b.shops as any;
              const shopName = shopObj?.shop_name || "Salon";
              const shopId = b.shop_id;
              
              if (b.customer_booking_services && Array.isArray(b.customer_booking_services)) {
                for (const s of b.customer_booking_services) {
                  const srvName = (s as any).service_name;
                  if (!srvName) continue;
                  
                  const combo = `${shopId}-${srvName}`;
                  if (!seenCombos.has(combo)) {
                    seenCombos.add(combo);
                    extractedServices.push({ service_name: srvName, shop_name: shopName, shop_id: shopId });
                  }
                }
              }
            }
            setQuickRebooks(extractedServices.slice(0, 3));
          }
        }

        // 2. Fetch Shops
        const { data: shopsData, error: shopsError } = await supabase
          .from("shops")
          .select("*")
          .eq("is_active", true);
        
        if (shopsError) throw shopsError;
        
        if (shopsData) {
          // Sort verified first, then rating, then price
          const sortedShops = [...shopsData].sort((a, b) => {
            if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1;
            if (b.rating !== a.rating) return b.rating - a.rating;
            return a.starting_price - b.starting_price;
          });
          setShops(sortedShops);
        }

        // 3. Fetch Shop Services
        let servicesMap: Record<string, { service_name: string; category: string; price: number; duration: number; }[]> = {};
        let allAvailableServices: { service_name: string; category: string; price: number; duration: number; shop_id: string }[] = [];
        
        try {
          const { data: sData } = await supabase
            .from("shop_services")
            .select("shop_id, service_name, category, price, duration_minutes")
            .eq("is_active", true);
          if (sData) {
            sData.forEach((srv: any) => {
              if (!servicesMap[srv.shop_id]) {
                servicesMap[srv.shop_id] = [];
              }
              const serviceData = {
                service_name: srv.service_name || "",
                category: srv.category || "",
                price: srv.price || 0,
                duration: srv.duration_minutes || 0
              };
              servicesMap[srv.shop_id].push(serviceData);
              allAvailableServices.push({ ...serviceData, shop_id: srv.shop_id });
            });
          }
        } catch (serviceErr) {
          console.error("Error fetching shop services:", serviceErr);
        }
        setShopServices(servicesMap);

        // 4. Fetch Dynamic Trending Searches
        try {
          const { data: trendData, error: trendError } = await supabase
            .from("customer_trending_searches")
            .select("keyword")
            .eq("is_active", true)
            .order("display_order", { ascending: true });

          if (!trendError && trendData && trendData.length > 0) {
            const dbKeywords = trendData.map((t: any) => t.keyword);
            const merged = Array.from(new Set([...dbKeywords, ...BASE_TRENDING_KEYWORDS]));
            setRawTrendingKeywords(merged);
          } else {
            setRawTrendingKeywords(BASE_TRENDING_KEYWORDS);
          }
        } catch (trendErr) {
          console.error("Error fetching customer_trending_searches table:", trendErr);
          setRawTrendingKeywords(BASE_TRENDING_KEYWORDS);
        }

        // 5. AI Recommendations
        if (user) {
          const { data: pastBookings } = await supabase
            .from("customer_bookings")
            .select(`
              shop_id,
              status,
              customer_booking_services ( service_name )
            `)
            .eq("customer_id", user.id)
            .in("status", ["confirmed", "completed"]);

          const serviceMap = new Map<string, {service_name: string; category: string; price: number; duration: number; count: number}>();
          const usedCategories = new Set<string>();

          if (pastBookings && pastBookings.length > 0) {
            pastBookings.forEach((b: any) => {
              if (b.customer_booking_services && Array.isArray(b.customer_booking_services)) {
                b.customer_booking_services.forEach((s: any) => {
                   const srvName = s.service_name;
                   const srv = allAvailableServices.find(a => a.service_name === srvName);
                   if (srv && srv.category) {
                     usedCategories.add(srv.category);
                   }
                });
              }
            });

            allAvailableServices.forEach(srv => {
              if (usedCategories.has(srv.category)) {
                if (!serviceMap.has(srv.service_name)) {
                  serviceMap.set(srv.service_name, { service_name: srv.service_name, category: srv.category, price: srv.price, duration: srv.duration, count: 1 });
                } else {
                  serviceMap.get(srv.service_name)!.count++;
                }
              }
            });
          }

          let finalTrendKeywords = BASE_TRENDING_KEYWORDS;
          try {
            const { data: trendData } = await supabase
              .from("customer_trending_searches")
              .select("keyword")
              .eq("is_active", true)
              .order("display_order", { ascending: true });
            if (trendData && trendData.length > 0) {
               finalTrendKeywords = Array.from(new Set([...trendData.map(t => t.keyword), ...BASE_TRENDING_KEYWORDS]));
            }
          } catch (e) {}

          if (serviceMap.size < 6) {
             for (const kw of finalTrendKeywords) {
                const matches = allAvailableServices.filter(srv => 
                   srv.service_name.toLowerCase().includes(kw.toLowerCase()) || 
                   srv.category.toLowerCase().includes(kw.toLowerCase())
                );
                matches.forEach(srv => {
                  if (!serviceMap.has(srv.service_name)) {
                    serviceMap.set(srv.service_name, { service_name: srv.service_name, category: srv.category, price: srv.price, duration: srv.duration, count: 1 });
                  } else {
                    serviceMap.get(srv.service_name)!.count++;
                  }
                });
             }
          }

          const recommendedServices = Array.from(serviceMap.values())
             .sort((a, b) => b.count - a.count || a.price - b.price)
             .slice(0, 6);
          setAiRecommendations(recommendedServices);
        }

      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError("Unable to load salons. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigateTo("/login");
  };

  const toggleSaveShop = async (e: React.MouseEvent, shopId: string) => {
    e.stopPropagation();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigateTo("/login");
      return;
    }

    const isSaved = savedShopIds.includes(shopId);

    if (isSaved) {
      setSavedShopIds(prev => prev.filter(id => id !== shopId));
      setLocalMessage("Salon removed from saved.");
      try {
        await supabase
          .from("customer_favourites")
          .delete()
          .eq("customer_id", user.id)
          .eq("shop_id", shopId);
      } catch (err) {
        console.error("Error removing favourite", err);
      }
    } else {
      setSavedShopIds(prev => [...prev, shopId]);
      setLocalMessage("Salon saved.");
      try {
        await supabase
          .from("customer_favourites")
          .insert({
            customer_id: user.id,
            shop_id: shopId
          });
      } catch (err) {
        console.error("Error adding favourite", err);
      }
    }
    
    setTimeout(() => {
      setLocalMessage(null);
    }, 3000);
  };

  const categories = Object.values(CATEGORY_LABELS);
  const audienceOptions = ["Men", "Women", "Child", "Unisex"];
  const quickFilters = ["Nearby", "Top Rated", "Open Now", "Offers", "Price Low to High"];

  // Filter trending keywords locally so we only display ones with at least one matching shop/service
  const trendingKeywords = useMemo(() => {
    return rawTrendingKeywords.filter(keyword => {
      return shops.some(shop => {
        const services = shopServices[shop.id] || [];
        return isShopMatchKeyword(shop, keyword, services);
      });
    });
  }, [rawTrendingKeywords, shops, shopServices]);

  const handleTrendingClick = (keyword: string) => {
    // 1. Set main search input to that keyword
    setSearchQuery(keyword);
    saveRecentSearch(keyword);

    // 2. Clear category filter, audience filter, and quick filters (reset to "All" / null)
    setSelectedCategory(null);
    setSelectedAudience(null);
    setSelectedFilter(null);

    // 3. Keep location filter only if it still has matching salons.
    // If location filter causes 0 result, also clear location filter.
    const hasMatchesWithLocation = shops.some(shop => {
      // Must match keyword
      const services = shopServices[shop.id] || [];
      const matchesKeyword = isShopMatchKeyword(shop, keyword, services);
      if (!matchesKeyword) return false;

      // Must also match location if active
      let matchesLoc = true;
      if (locationSearch) {
        const locQuery = locationSearch.toLowerCase().trim();
        if (locQuery !== "near me (gps)") {
          const areaMatch = shop.area ? shop.area.toLowerCase().includes(locQuery) : false;
          const cityMatch = shop.city ? shop.city.toLowerCase().includes(locQuery) : false;
          const addressMatch = shop.address ? shop.address.toLowerCase().includes(locQuery) : false;
          const nameMatch = shop.shop_name ? shop.shop_name.toLowerCase().includes(locQuery) : false;
          matchesLoc = areaMatch || cityMatch || addressMatch || nameMatch;
        }
      }
      return matchesLoc;
    });

    if (!hasMatchesWithLocation) {
      setLocationSearch("");
      setUserCoords(null);
      setLocationMessage(null);
    }
  };
  
  const benefits = [
    { icon: ShieldCheck, label: "Verified Salons" },
    { icon: Zap, label: "60s Booking" },
    { icon: Percent, label: "Price Transparency" },
    { icon: QrCode, label: "Rewards on QR" },
  ];

  const handleUseMyLocation = () => {
    setIsDetectingLocation(true);
    setLocationMessage("Requesting GPS coordinates...");
    
    if (!navigator.geolocation) {
      setLocationMessage("Geolocation is not supported by your browser.");
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ latitude, longitude });
        setLocationSearch("Near Me (GPS)");
        setLocationMessage(`Detected location! coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setIsDetectingLocation(false);
        setSelectedFilter("Nearby");
      },
      (error) => {
        console.warn("Geolocation error, using simulated coords:", error);
        // Fallback to simulated location for a smooth experience
        const mockLat = 26.9124;
        const mockLon = 75.7873;
        setUserCoords({ latitude: mockLat, longitude: mockLon });
        setLocationSearch("Near Me (GPS)");
        setLocationMessage("Location access denied or timeout. Using center coordinates.");
        setIsDetectingLocation(false);
        setSelectedFilter("Nearby");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const showingNearText = useMemo(() => {
    if (userCoords && locationSearch === "Near Me (GPS)") {
      return `Showing salons near your coordinates (${userCoords.latitude.toFixed(4)}, ${userCoords.longitude.toFixed(4)})`;
    }
    if (locationSearch.trim()) {
      return `Showing salons near “${locationSearch.trim()}”`;
    }
    if (profile?.area || profile?.city) {
      const parts = [profile.area, profile.city].filter(Boolean);
      return `Showing salons near ${parts.join(", ")}`;
    }
    return "Showing salons across Jaipur";
  }, [locationSearch, profile, userCoords]);

  const isAnyFilterActive = useMemo(() => {
    return !!(searchQuery || locationSearch || selectedCategory || selectedAudience || selectedFilter || userCoords);
  }, [searchQuery, locationSearch, selectedCategory, selectedAudience, selectedFilter, userCoords]);

  const shopsWithDistance = useMemo(() => {
    return shops.map(s => {
      const shopCoords = getShopCoordinates(s.id);
      let distance: number | null = null;
      if (userCoords) {
        distance = calculateDistance(userCoords.latitude, userCoords.longitude, shopCoords.latitude, shopCoords.longitude);
      }
      return {
        ...s,
        distance
      };
    });
  }, [shops, userCoords]);

  const filteredShops = useMemo(() => {
    let result = shopsWithDistance;

    // 1. Search Query Match
    if (searchQuery) {
      result = result.filter(s => {
        const services = shopServices[s.id] || [];
        return isShopMatchKeyword(s, searchQuery, services);
      });
    }

    // 2. Category Match
    if (selectedCategory) {
      result = result.filter(s => {
        const shopCategoryLabel = CATEGORY_LABELS[s.category] || s.category;
        return shopCategoryLabel === selectedCategory;
      });
    }

    // 3. Location Search Match
    if (locationSearch) {
      const locQuery = locationSearch.toLowerCase().trim();
      if (locQuery !== "near me (gps)") {
        result = result.filter(s => {
          const areaMatch = s.area ? s.area.toLowerCase().includes(locQuery) : false;
          const cityMatch = s.city ? s.city.toLowerCase().includes(locQuery) : false;
          const addressMatch = s.address ? s.address.toLowerCase().includes(locQuery) : false;
          const nameMatch = s.shop_name ? s.shop_name.toLowerCase().includes(locQuery) : false;
          return areaMatch || cityMatch || addressMatch || nameMatch;
        });
      }
    }

    // 4. Audience Match
    if (selectedAudience) {
      result = result.filter(s => matchesAudience(s.category, selectedAudience));
    }

    // 5. Quick Filters Match
    if (selectedFilter === "Nearby") {
      result = [...result].sort((a, b) => {
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        return 0;
      });
    } else if (selectedFilter === "Top Rated") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (selectedFilter === "Open Now") {
      result = result.filter(s => s.is_open);
    } else if (selectedFilter === "Offers") {
      result = []; // UI filter only, show empty state if no offer data
    } else if (selectedFilter === "Price Low to High") {
      result = [...result].sort((a, b) => a.starting_price - b.starting_price);
    }

    // Default to sorting by distance if coordinates are detected and no sorting filter is explicitly chosen
    if (userCoords && !selectedFilter) {
      result = [...result].sort((a, b) => {
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        return 0;
      });
    }

    return result;
  }, [shopsWithDistance, searchQuery, locationSearch, selectedCategory, selectedAudience, selectedFilter, shopServices, userCoords]);

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Error</h2>
        <p className="text-slate-500 text-sm mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs font-sans"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <TopBar 
        title="Nexora" 
        showBack={false}
        showMainSite={true}
        onMainSite={() => navigateTo("/")}
        showLogout={true}
        onLogout={handleLogout}
      />

      <div className="max-w-5xl mx-auto">
        {localMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-fade-in pointer-events-none">
            <div className="bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-slate-900/20">
              {localMessage}
            </div>
          </div>
        )}
        <section className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Hi, {profile?.full_name || "Nexora User"}</h2>
          <p className="text-slate-500 text-sm mb-4">Salon ja rahe ho? Nexora kiya kya?</p>
          <div className="flex gap-4">
             <p className="text-xs text-blue-600 font-bold flex items-center gap-1">
               <MapPin className="w-3.5 h-3.5" /> {showingNearText}
             </p>
             <button onClick={() => navigateTo("/profile")} className="text-xs text-emerald-600 font-bold flex items-center gap-1">
               <Sparkles className="w-3.5 h-3.5" /> Rewards: ₹{rewardData?.balance || 0}
             </button>
          </div>
        </section>

        {/* Referral CTA */}
        <section className="px-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
                {membership && (
                    <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
                        <h3 className="font-bold text-sm mb-1">{membership.membership_plans.name}</h3>
                        <p className="text-[10px] opacity-90 mb-2">{membership.membership_plans.discount_percent}% Off</p>
                        <button 
                          onClick={() => navigateTo("/profile")}
                          className="bg-white/10 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold"
                        >
                            View
                        </button>
                    </div>
                )}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
                    <h3 className="font-bold text-sm mb-1">Invite Friends</h3>
                    <p className="text-[10px] opacity-90 mb-2">Earn rewards!</p>
                    <button 
                      onClick={() => navigateTo("/profile")}
                      className="bg-white text-blue-700 px-3 py-1.5 rounded-xl text-[10px] font-black"
                    >
                        Invite
                    </button>
                </div>
            </div>
        </section>

        {/* Search & Location Selection Container */}
        <section className="px-6 mb-6 space-y-4">
          {/* Main search bar */}
          <div className="relative bg-white rounded-3xl p-2 shadow-sm border border-slate-100 flex items-center">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveRecentSearch(searchQuery);
                }
              }}
              onBlur={() => {
                if (searchQuery.trim()) {
                  saveRecentSearch(searchQuery);
                }
              }}
              className="w-full px-4 py-3 text-sm focus:outline-none bg-transparent" 
              placeholder="Search salon, service, category..." 
            />
            <button className="p-2 text-slate-400 hover:text-blue-600"><Mic className="w-5 h-5" /></button>
          </div>

          {/* Location input and 'Use My Location' CTA */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Location Search / Area Input</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center p-1">
                <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
                <input 
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-transparent focus:outline-none" 
                  placeholder="Enter area, landmark, or city" 
                />
              </div>
              <button 
                type="button"
                disabled={isDetectingLocation}
                onClick={handleUseMyLocation}
                className={`w-full sm:w-auto px-5 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  isDetectingLocation ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                <Sparkles className={`w-4 h-4 ${isDetectingLocation ? "animate-spin" : ""}`} />
                {isDetectingLocation ? "Detecting..." : "Use My Location"}
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-slate-400">
                Example: Jhotwara, Mansarovar, Jaipur, near me
              </span>
              {locationMessage && (
                <span className="text-[11px] text-blue-600 font-bold animate-fade-in flex items-center gap-1">
                  ✨ {locationMessage}
                </span>
              )}
            </div>
          </div>

          {/* Trending Searches section */}
          <div className="flex items-center gap-2 pt-1 px-1 -mx-6 md:mx-0 overflow-x-auto no-scrollbar">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0 pl-6 md:pl-0">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              Trending:
            </span>
            <div className="flex gap-1.5 pr-6 md:pr-0">
              {trendingKeywords.map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => handleTrendingClick(keyword)}
                  className={`px-3 py-1.5 rounded-full text-2xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                    searchQuery.toLowerCase() === keyword.toLowerCase()
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
          
          {/* Recent Searches section */}
          {recentSearches.length > 0 && (
            <div className="flex items-center gap-2 pt-1 px-1 -mx-6 md:mx-0 overflow-x-auto no-scrollbar">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0 pl-6 md:pl-0">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Recent:
              </span>
              <div className="flex items-center gap-1.5 pr-6 md:pr-0">
                {recentSearches.map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => {
                      setSearchQuery(keyword);
                      saveRecentSearch(keyword);
                    }}
                    className={`px-3 py-1.5 rounded-full text-2xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                      searchQuery.toLowerCase() === keyword.toLowerCase()
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:text-blue-700 hover:bg-blue-50"
                    }`}
                  >
                    {keyword}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClearRecent}
                  className="px-2 py-1.5 ml-1 text-2xs font-bold text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Quick Rebook section */}
          {quickRebooks.length > 0 && (
            <div className="pt-5 px-1 -mx-6 md:mx-0">
              <div className="flex items-center gap-1.5 pl-6 md:pl-0 mb-3">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick Rebook</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 px-6 md:px-0 no-scrollbar">
                {quickRebooks.map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm min-w-[200px] shrink-0 flex flex-col justify-between">
                    <div className="mb-4">
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.service_name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{item.shop_name}</p>
                    </div>
                    <button 
                      onClick={() => navigateTo(`/booking/${item.shop_id}`)}
                      className="w-full py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Rebook
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI-Recommended Services section */}
          {aiRecommendations.length > 0 && (
            <div className="pt-5 px-1 -mx-6 md:mx-0">
              <div className="flex items-center gap-1.5 pl-6 md:pl-0 mb-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">AI-Recommended Services</span>
              </div>
              <p className="text-xs text-slate-500 pl-6 md:pl-0 mb-3">
                {quickRebooks.length > 0 ? "Smart picks based on your bookings and trending services." : "Popular services customers are booking right now."}
              </p>
              <div className="flex gap-3 overflow-x-auto pb-4 px-6 md:px-0 no-scrollbar">
                {aiRecommendations.map((item, idx) => {
                   const matchingShop = shops.find(s => {
                      const shopServicesList = shopServices[s.id] || [];
                      return shopServicesList.some(srv => srv.service_name === item.service_name);
                   });

                   return (
                  <div key={idx} className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-2xl border border-purple-100 shadow-sm min-w-[220px] max-w-[220px] shrink-0 flex flex-col justify-between">
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-1">
                         <h4 className="font-bold text-slate-900 text-sm line-clamp-2 pr-2">{item.service_name}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-wider mb-2">{CATEGORY_LABELS[item.category] || item.category}</p>
                      <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                        <span>₹{item.price}</span>
                        <span className="text-slate-300">•</span>
                        <span>{item.duration} mins</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (matchingShop) {
                          setSearchQuery(item.service_name);
                          setSelectedCategory(null);
                          setSelectedAudience(null);
                          setSelectedFilter(null);
                          saveRecentSearch(item.service_name);
                        }
                      }}
                      className="w-full py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors cursor-pointer"
                    >
                      Book Now
                    </button>
                  </div>
                )})}
              </div>
            </div>
          )}
        </section>

        {/* Category horizontal chips scroll */}
        <section className="px-6 mb-4">
          <div className="text-3xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
            Categories
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
            <button 
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${selectedCategory === null ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-200'}`}
            >
              All
            </button>
            {categories.map(c => (
              <button 
                key={c} 
                onClick={() => setSelectedCategory(selectedCategory === c ? null : c)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${selectedCategory === c ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-200'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Audience horizontal chips scroll */}
        <section className="px-6 mb-4">
          <div className="text-3xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
            Audience
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
            <button 
              type="button"
              onClick={() => setSelectedAudience(null)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${selectedAudience === null ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-200'}`}
            >
              All
            </button>
            {audienceOptions.map(aud => (
              <button 
                key={aud} 
                onClick={() => setSelectedAudience(selectedAudience === aud ? null : aud)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${selectedAudience === aud ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-200'}`}
              >
                {aud}
              </button>
            ))}
          </div>
        </section>

        {/* Quick filters scroll */}
        <section className="px-6 mb-6">
          <div className="text-3xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
            Quick Filters
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
            <button 
              type="button"
              onClick={() => setSelectedFilter(null)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${selectedFilter === null ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
            >
              All
            </button>
            {quickFilters.map(f => (
              <button 
                key={f} 
                onClick={() => setSelectedFilter(selectedFilter === f ? null : f)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${selectedFilter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        <section className="px-6 mb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {benefits.map((b, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-2">
              <b.icon className="w-6 h-6 text-blue-600" />
              <span className="text-[10px] font-bold text-slate-700">{b.label}</span>
            </div>
          ))}
        </section>

        <section className="px-6 space-y-4 pb-10">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">
              {filteredShops.length} {filteredShops.length === 1 ? "Salon" : "Salons"} Found
            </h3>
            {isAnyFilterActive && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setLocationSearch("");
                  setSelectedCategory(null);
                  setSelectedAudience(null);
                  setSelectedFilter(null);
                  setLocationMessage(null);
                  setUserCoords(null);
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>

          {filteredShops.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShops.map((s) => (
                <div key={s.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all">
                  <div className="relative h-44 bg-slate-100">
                    <img 
                      src={getShopImage(s)} 
                      alt={s.shop_name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {s.is_verified && (
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                      {s.is_open ? (
                        <span className="bg-emerald-500 text-white px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider">Open</span>
                      ) : (
                        <span className="bg-slate-500 text-white px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider">Closed</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => toggleSaveShop(e, s.id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-sm transition-all z-10 cursor-pointer"
                    >
                      <Heart 
                        className={`w-4 h-4 ${savedShopIds.includes(s.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} 
                      />
                    </button>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{s.shop_name}</h3>
                        <p className="text-[11px] text-slate-500 font-medium mt-1 uppercase tracking-wide flex flex-wrap items-center gap-1">
                          <span>{CATEGORY_LABELS[s.category] || s.category}</span>
                          <span>•</span>
                          <span>{s.area}</span>
                          {s.distance !== null && s.distance !== undefined && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded text-[9px] normal-case">
                                {s.distance.toFixed(1)} km away
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <div className="bg-amber-50 text-amber-600 px-2 py-1 rounded-lg flex items-center gap-1 shrink-0">
                        <Star className="w-3 h-3 fill-amber-600" />
                        <span className="text-xs font-bold">{s.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                      {s.description || "Premium beauty and grooming services at Nexora partner salon."}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Starting from</p>
                        <p className="font-black text-slate-900">₹{s.starting_price}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                         <p className="text-[10px] font-bold text-slate-700">{s.city}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => navigateTo(`/salon/${s.id}`)} 
                        className="flex-1 py-3 text-xs font-bold border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => navigateTo(`/booking/${s.id}`)} 
                        className="flex-1 py-3 text-xs font-bold bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 cursor-pointer"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No salons found</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">Try another area, category, or search keyword.</p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setLocationSearch("");
                  setSelectedCategory(null);
                  setSelectedAudience(null);
                  setSelectedFilter(null);
                  setLocationMessage(null);
                }}
                className="mt-6 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </div>

      <BottomNav currentPath={window.location.pathname} navigateTo={navigateTo} />
    </div>
  );
};

export default CustomerHome;

