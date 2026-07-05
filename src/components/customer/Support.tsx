import React, { useState, useMemo } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  Search, 
  Clock, 
  Star, 
  User, 
  MessageCircle, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Calendar, 
  Scissors, 
  Wallet, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink
} from "lucide-react";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

interface SupportProps {
  navigateTo: (path: string) => void;
}

const FAQ_DATA = [
  {
    id: 1,
    question: "Is Nexora free for customers?",
    answer: "Yes, customer discovery and booking experience is free to use."
  },
  {
    id: 2,
    question: "How does 60 second booking work?",
    answer: "Customer selects salon, service, staff, date and time, then confirms booking."
  },
  {
    id: 3,
    question: "Can I choose my favourite staff?",
    answer: "Yes, staff selection is part of the customer booking flow."
  },
  {
    id: 4,
    question: "How do rewards work?",
    answer: "Rewards will be connected with Nexora QR payment module in upcoming backend steps."
  },
  {
    id: 5,
    question: "Can I cancel or reschedule booking?",
    answer: "Booking management UI is available. Real cancellation/reschedule will be connected later."
  },
  {
    id: 6,
    question: "How do I update my profile?",
    answer: "Go to Profile → Edit Profile and update your basic details."
  }
];

const HELP_CATEGORIES = [
  {
    icon: Calendar,
    title: "Booking Help",
    text: "Issues with booking, reschedule, cancellation",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: Scissors,
    title: "Salon Visit Issue",
    text: "Problem during salon visit or service",
    color: "bg-purple-50 text-purple-600"
  },
  {
    icon: Star,
    title: "Rewards & QR Help",
    text: "Reward points, QR benefits and referral help",
    color: "bg-amber-50 text-amber-600"
  },
  {
    icon: ShieldCheck,
    title: "Account & Profile",
    text: "Login, profile, mobile number and personal details",
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    icon: Wallet,
    title: "Payment / Refund",
    text: "Payment and refund support will be connected later",
    color: "bg-rose-50 text-rose-600"
  },
  {
    icon: HelpCircle,
    title: "General Question",
    text: "Anything else about Nexora",
    color: "bg-slate-50 text-slate-600"
  }
];

const Support = ({ navigateTo }: SupportProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [formState, setFormState] = useState({
    category: "",
    subject: "",
    description: ""
  });

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleContactClick = () => {
    alert("Support contact will be connected later.");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.category || !formState.subject || !formState.description) {
      alert("Please fill in all fields.");
      return;
    }
    alert("Support request UI ready. Real ticket system will be connected later.");
    setFormState({ category: "", subject: "", description: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <TopBar 
        title="Help & Support" 
        subtitle="We are here to help with your Nexora experience"
        onBack={() => navigateTo("/profile")} 
        showHome={true}
        onHome={() => navigateTo("/customer")}
        showMainSite={true}
        onMainSite={() => navigateTo("/")}
      />

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Quick Help Cards */}
        <div className="grid grid-cols-2 gap-3">
          {HELP_CATEGORIES.map((cat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-start gap-3 hover:border-blue-100 transition cursor-pointer group">
              <div className={`p-2 rounded-xl ${cat.color} group-hover:scale-110 transition`}>
                <cat.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1">{cat.title}</h3>
                <p className="text-[9px] text-slate-500 leading-tight">{cat.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Search */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 ml-1">Frequently Asked Questions</h3>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <div key={faq.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm transition">
                  <button 
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
                  >
                    <span className="text-xs font-bold text-slate-700">{faq.question}</span>
                    {expandedFaq === faq.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-5 pb-4 text-[11px] text-slate-500 leading-relaxed border-t border-slate-50 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-medium">No help topics found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-lg shadow-blue-500/20">
          <h3 className="font-black text-lg mb-1">Need more help?</h3>
          <p className="text-[10px] opacity-80 mb-6">Our support team is available to assist you with any questions or issues.</p>
          
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={handleContactClick}
              className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-2xl backdrop-blur-md hover:bg-white/20 transition"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[9px] font-bold">Chat</span>
            </button>
            <button 
              onClick={handleContactClick}
              className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-2xl backdrop-blur-md hover:bg-white/20 transition"
            >
              <Phone className="w-5 h-5" />
              <span className="text-[9px] font-bold">Call</span>
            </button>
            <button 
              onClick={handleContactClick}
              className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-2xl backdrop-blur-md hover:bg-white/20 transition"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="text-[9px] font-bold">WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Raise Issue Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><MessageCircle className="w-4 h-4" /></div>
            <h3 className="text-sm font-bold text-slate-900">Submit Support Request</h3>
          </div>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Issue Category</label>
              <select 
                value={formState.category}
                onChange={(e) => setFormState({...formState, category: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition appearance-none"
              >
                <option value="">Select a category</option>
                <option value="booking">Booking Issue</option>
                <option value="payment">Payment & Refund</option>
                <option value="rewards">Rewards & Referral</option>
                <option value="account">Account & Login</option>
                <option value="salon">Salon Service Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Subject</label>
              <input 
                type="text"
                value={formState.subject}
                onChange={(e) => setFormState({...formState, subject: e.target.value})}
                placeholder="What can we help with?"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Description</label>
              <textarea 
                rows={4}
                value={formState.description}
                onChange={(e) => setFormState({...formState, description: e.target.value})}
                placeholder="Provide details about your issue..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition"
            >
              Submit Support Request
            </button>
          </form>
        </div>
      </div>

      <BottomNav currentPath="/support" navigateTo={navigateTo} />
    </div>
  );
};

export default Support;
