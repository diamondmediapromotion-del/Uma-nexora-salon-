import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Star, MapPin, BadgePercent, QrCode, Sparkles, SlidersHorizontal, ArrowRight, ShieldCheck, PhoneCall } from "lucide-react";
import { SALONS_DATA } from "../data";
import { Salon, Service } from "../types";

interface CustomerPreviewProps {
  onSelectService: (salon: Salon, service: Service) => void;
  onOpenModal: (type: "login" | "register" | "book" | "partner" | "distributor" | "jobs") => void;
}

export default function CustomerPreview({ onSelectService, onOpenModal }: CustomerPreviewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");

  const areas = ["All", "C-Scheme", "Vaishali Nagar", "Tonk Road", "Mansarovar"];
  const categories = ["All", "Hair", "Skin", "Nails"];

  // Filter logic
  const filteredSalons = SALONS_DATA.filter((salon) => {
    const matchesSearch =
      salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.services.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesArea = selectedArea === "All" || salon.area.includes(selectedArea);
    
    const matchesCategory =
      activeCategory === "All" ||
      salon.services.some((s) => s.category === activeCategory);

    return matchesSearch && matchesArea && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Search & Filter Header bar */}
      <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 premium-shadow space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Haircuts, Hydra Facials, Bridal Glow, Gel Nails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-sm font-medium transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:inline mr-1">
              Select Area:
            </span>
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedArea === area
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-50 overflow-x-auto pb-1 scrollbar-none">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">
            Service category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                activeCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Salons list rendering */}
      {filteredSalons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
          <p className="text-slate-500 font-medium">No verified salons found matching your criteria in Jaipur.</p>
          <button
            onClick={() => { setSearchTerm(""); setSelectedArea("All"); setActiveCategory("All"); }}
            className="mt-4 text-sm text-blue-600 font-bold hover:underline cursor-pointer"
          >
            Reset all search filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSalons.map((salon) => (
            <motion.div
              key={salon.id}
              layoutId={salon.id}
              className="bg-white rounded-3xl border border-slate-100 premium-shadow overflow-hidden flex flex-col hover:border-blue-100 hover:shadow-lg hover:shadow-slate-100/50 transition-all group"
            >
              {/* Salon Image banner */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={salon.image}
                  alt={salon.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                
                {/* Upper tags */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                  {salon.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-white/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white flex justify-between items-end">
                  <div>
                    <h3 className="font-display font-bold text-lg leading-tight flex items-center gap-1.5">
                      {salon.name}
                      <ShieldCheck className="w-5 h-5 text-blue-400 fill-white" />
                    </h3>
                    <p className="text-xs text-slate-200 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {salon.area}
                    </p>
                  </div>
                  <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 p-2 rounded-xl text-center">
                    <div className="flex items-center gap-0.5 justify-center">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold">{salon.rating}</span>
                    </div>
                    <span className="text-[9px] text-slate-300 block font-medium">{salon.reviewsCount} reviews</span>
                  </div>
                </div>
              </div>

              {/* Offer Strip if available */}
              {salon.hasOffer && salon.offerText && (
                <div className="bg-blue-50/50 px-5 py-3 border-b border-blue-50 flex items-center gap-2 text-xs text-blue-800 font-bold">
                  <BadgePercent className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                  <span>{salon.offerText}</span>
                  <span className="ml-auto bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded">
                    Jaipur VIP
                  </span>
                </div>
              )}

              {/* Service Menu */}
              <div className="p-5 md:p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Verified Express Services ({salon.services.length})
                  </h4>
                  <span className="text-2xs text-slate-500 font-medium">
                    {salon.distance}
                  </span>
                </div>

                <div className="space-y-3 divide-y divide-slate-50 flex-1">
                  {salon.services.map((service, idx) => {
                    // Match category
                    if (activeCategory !== "All" && service.category !== activeCategory) {
                      return null;
                    }
                    return (
                      <div
                        key={service.name}
                        className={`pt-3 first:pt-0 flex items-center justify-between group/service`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <h5 className="text-sm font-bold text-slate-900 group-hover/service:text-blue-600 transition-colors">
                              {service.name}
                            </h5>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 pl-3">
                            ⏱️ {service.duration} &nbsp;•&nbsp; <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md text-[10px] font-semibold">{service.category}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="block text-sm font-black text-slate-900">₹{service.price}</span>
                            <span className="text-[10px] font-bold text-emerald-600">
                              +₹{Math.round(service.price * 0.15)} cashback
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onSelectService(salon, service)}
                            className="px-4 py-2 bg-slate-50 hover:bg-slate-900 text-slate-800 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-100 hover:border-slate-900 hover:scale-103"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4.5 h-4.5 text-slate-400" />
                    <span className="text-[11px] font-semibold text-slate-500">
                      Scan QR at counter for rewards
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenModal("login")}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    View Wallet
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
