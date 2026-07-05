import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface HelpCenterProps {
  navigateTo: (path: string) => void;
}

const FAQ_SECTIONS = [
  {
    title: "Customer Help",
    items: [
      { q: "How booking works?", a: "You can search for nearby salons, select a service, choose a time slot, and confirm your booking. Payments can be made online or at the venue depending on the shop's policy." },
      { q: "How rewards work?", a: "Earn points for every completed booking. You can redeem these points for discounts on future services." },
      { q: "How refund request works?", a: "If you cancel before the policy deadline, your refund is automatically processed back to your original payment method within 5-7 business days." }
    ]
  },
  {
    title: "Shop Owner Help",
    items: [
      { q: "How free website works?", a: "Nexora automatically generates a customizable mini-website for your shop where customers can view services, staff, and book directly." },
      { q: "How payout works?", a: "Payments collected through Nexora are credited to your virtual wallet. Payouts to your linked bank account happen weekly or on-demand." },
      { q: "Why owner QR is not allowed?", a: "To ensure a secure, verifiable transaction and proper commission splits, all payments must go through the Nexora platform QR or online gateway." }
    ]
  },
  {
    title: "Payment & Refund Help",
    items: [
      { q: "Razorpay payment", a: "We use Razorpay to securely process all payments, supporting UPI, cards, and net banking." },
      { q: "Refund processing", a: "Refunds are processed automatically when cancellations meet the shop's criteria." },
      { q: "Wallet adjustment", a: "In case of manual refunds or disputes, wallet balances may be adjusted by admin with a clear transaction record." }
    ]
  },
  {
    title: "Growth Partner Help",
    items: [
      { q: "What is Growth Partner?", a: "Growth Partners onboard new salons to the Nexora platform and earn commissions on their success." },
      { q: "How commission works?", a: "You earn a percentage of the subscription or transaction fees for every active shop you bring to the platform." },
      { q: "Weekly payout foundation", a: "Commissions are calculated weekly and transferred to your registered payout account." }
    ]
  },
  {
    title: "Brand & Distributor Help",
    items: [
      { q: "How product showcase works?", a: "Brands can list their professional products for shop owners to browse and request bulk orders." },
      { q: "How leads work?", a: "When a shop expresses interest in a product, the brand receives a lead with contact details." },
      { q: "Sponsored campaigns", a: "Brands can boost visibility by running targeted campaigns visible to specific salon types." }
    ]
  },
  {
    title: "Jobs Help",
    items: [
      { q: "How to apply?", a: "Create a job seeker profile, upload your resume, and click 'Apply' on any matching job post." },
      { q: "How to post job?", a: "Shop owners can post jobs directly from their Owner Dashboard under the 'Jobs' tab." },
      { q: "Resume privacy", a: "Your resume is only visible to the owners of the jobs you apply for, unless you set your profile to public." }
    ]
  }
];

export default function HelpCenter({ navigateTo }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (q: string) => {
    setOpenItems(prev => ({ ...prev, [q]: !prev[q] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm border border-blue-500/30">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">How can we help?</h1>
          
          <div className="relative max-w-xl mx-auto mt-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-8">
        
        {/* Contact CTA Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/20 flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Still need help?</h3>
              <p className="text-sm text-slate-500 font-medium">Our support team is here for you.</p>
            </div>
          </div>
          <button 
            onClick={() => navigateTo('/support')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 w-full md:w-auto"
          >
            Create Support Ticket
          </button>
        </div>

        <div className="space-y-10">
          {FAQ_SECTIONS.map((section, idx) => {
            const filteredItems = section.items.filter(item => 
              item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
              item.a.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredItems.length === 0 && searchQuery) return null;

            return (
              <div key={idx} className="space-y-4">
                <h2 className="text-xl font-black text-slate-900">{section.title}</h2>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                  {filteredItems.map((item, itemIdx) => {
                    const isOpen = openItems[item.q];
                    return (
                      <div key={itemIdx}>
                        <button
                          onClick={() => toggleItem(item.q)}
                          className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition"
                        >
                          <span className="font-bold text-slate-800 pr-8">{item.q}</span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                          )}
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-5 pt-1 text-slate-600 font-medium leading-relaxed">
                                {item.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
