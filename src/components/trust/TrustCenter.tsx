import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  FileText, 
  HelpCircle, 
  MessageSquare,
  Lock,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface TrustCenterProps {
  navigateTo: (path: string) => void;
}

export default function TrustCenter({ navigateTo }: TrustCenterProps) {
  const legalPages = [
    { id: 'privacy-policy', title: 'Privacy Policy', path: '/privacy-policy' },
    { id: 'terms-and-conditions', title: 'Terms & Conditions', path: '/terms-and-conditions' },
    { id: 'refund-cancellation-policy', title: 'Refund & Cancellation Policy', path: '/refund-cancellation-policy' },
    { id: 'data-deletion-policy', title: 'Data Deletion Policy', path: '/data-deletion-policy' }
  ];

  const appPolicies = [
    { id: 'owner-policy', title: 'Shop Owner Policy', path: '/owner-policy' },
    { id: 'growth-partner-policy', title: 'Growth Partner Policy', path: '/growth-partner-policy' },
    { id: 'brand-distributor-policy', title: 'Brand & Distributor Policy', path: '/brand-distributor-policy' },
    { id: 'job-portal-policy', title: 'Job Portal Policy', path: '/job-portal-policy' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-blue-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Nexora Trust Center</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            Policies, safety rules aur support — sab ek jagah.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Quick Support Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/20 md:col-span-2 flex flex-col md:flex-row gap-6 items-center justify-between"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                <HelpCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Need Help?</h2>
                <p className="text-sm text-slate-500 font-medium">Browse our Help Center or create a support ticket.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button 
                onClick={() => navigateTo('/help')}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                Help Center
              </button>
              <button 
                onClick={() => navigateTo('/support')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                Contact Support <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Legal Policies */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Lock className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-black text-slate-900">Legal Policies</h3>
            </div>
            <div className="space-y-2">
              {legalPages.map(page => (
                <button
                  key={page.id}
                  onClick={() => navigateTo(page.path)}
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 group text-left"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                    <span className="font-bold text-slate-700 group-hover:text-slate-900">{page.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* App Guidelines */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <ShieldCheck className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-black text-slate-900">Platform Rules</h3>
            </div>
            <div className="space-y-2">
              {appPolicies.map(page => (
                <button
                  key={page.id}
                  onClick={() => navigateTo(page.path)}
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 group text-left"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                    <span className="font-bold text-slate-700 group-hover:text-slate-900">{page.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                </button>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
