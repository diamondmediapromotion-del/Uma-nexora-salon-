import React from "react";
import { MapPin, Mail, Sparkles, ShieldCheck } from "lucide-react";
import { dispatchPopState } from "../utils/navigation";

interface FooterProps {
  onOpenModal: (type: "login" | "register" | "book" | "partner" | "distributor" | "jobs") => void;
  onNavigateSection?: (sectionId: string) => void;
}

export default function Footer({ onOpenModal, onNavigateSection }: FooterProps) {
  const handleLinkAction = (path: string) => {
    // Intercept with our client-side routing if navigating
    window.history.pushState({}, "", path);
    dispatchPopState();
    window.scrollTo(0, 0);
  };

  const footerLinks = [
    {
      title: "Company",
      links: [
        { label: "About", path: "/" },
        { label: "Trust Center", path: "/trust" },
        { label: "Contact", path: "/contact" }
      ]
    },
    {
      title: "For Users",
      links: [
        { label: "Customer App", path: "/customer" },
        { label: "Shop Owner App", path: "/owner-dashboard" },
        { label: "Growth Partner", path: "/partner-dashboard" },
        { label: "Brands & Distributors", path: "/brand-dashboard" },
        { label: "Jobs", path: "/jobs" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", path: "/help" },
        { label: "Create Support Ticket", path: "/support" }
      ]
    },
    {
      title: "Policies",
      links: [
        { label: "Privacy Policy", path: "/privacy-policy" },
        { label: "Terms & Conditions", path: "/terms-and-conditions" },
        { label: "Refund & Cancellation", path: "/refund-cancellation-policy" },
        { label: "Data Deletion", path: "/data-deletion-policy" }
      ]
    }
  ];

  return (
    <footer className="bg-white border-t border-slate-200/60 pt-16 pb-10 relative overflow-hidden text-slate-700">
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-blue-100/10 via-indigo-100/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Upper Brand grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-slate-100">
          
          {/* Brand Presentation */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleLinkAction("/")}>
              <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-blue-500/25">
                N
              </div>
              <div>
                <span className="font-display font-bold text-lg tracking-tight text-slate-900 flex items-center gap-1">
                  Nexora <span className="text-blue-600 text-xs font-semibold px-1.5 py-0.5 bg-blue-50 rounded-md border border-blue-100">SalonOS</span>
                </span>
                <span className="block text-[9px] text-slate-400 font-medium tracking-wider uppercase -mt-1">
                  India's Beauty SaaS
                </span>
              </div>
            </div>

            <p className="text-slate-500 text-xs font-body leading-relaxed max-w-sm">
              Nexora SalonOS is built for India’s Beauty Industry. An integrated beauty growth ecosystem connecting customers, salon owners, and beauty professionals.
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-500">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-700">Jaipur Launch Headquarters, C-Scheme</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-500">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-700">support@nexorasalon.in</span>
              </div>
            </div>
          </div>

          {/* Pilot notification block */}
          <div className="lg:col-span-7 bg-slate-50/50 p-6 md:p-8 rounded-3xl border border-slate-100/60 flex flex-col justify-center space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-blue-800 font-extrabold uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" /> Jaipur Pilot Rollout
            </div>
            <h4 className="text-base font-bold text-slate-900">Get notified of regional partner events & launch milestones</h4>
            <p className="text-slate-500 text-xs">
              Connect with local salon networks, verified cosmetologists, and regional suppliers across key Rajasthan clusters.
            </p>
          </div>

        </div>

        {/* Links Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-4">
          {footerLinks.map((col, idx) => (
            <div key={idx} className="space-y-4">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                {col.title}
              </h5>
              <ul className="space-y-2.5 text-xs">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <button
                      onClick={() => handleLinkAction(link.path)}
                      className="text-slate-500 hover:text-blue-600 transition-colors font-semibold hover:underline cursor-pointer text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Legal bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-semibold">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>© 2026 Nexora Tech. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-2xs text-slate-400">
            <span>Built for India's Beauty Industry</span>
            <span>•</span>
            <span>Jaipur Pilot Phase 1</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
