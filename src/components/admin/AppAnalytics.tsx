import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Smartphone, 
  Download, 
  MousePointer2, 
  TrendingUp, 
  Loader2 
} from 'lucide-react';

export default function AppAnalytics() {
  const [loading, setLoading] = useState(true);
  const [installStats, setInstallStats] = useState<any[]>([]);
  const [usageStats, setUsageStats] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Very basic fetch directly from tables, since we didn't add a specific RPC for admin
      const { data: installs, error: err1 } = await supabase
        .from('pwa_install_events')
        .select('app_key, event_type, count(*)', { count: 'exact' });

      // The count logic is slightly tricky without group by in standard Supabase JS unless using RPC
      // So we just fetch all and group in JS (assuming low volume for now)
      
      const { data: allInstalls } = await supabase.from('pwa_install_events').select('*');
      const { data: allUsages } = await supabase.from('app_usage_events').select('*').limit(1000);

      // Group Installs
      const installSummary = (allInstalls || []).reduce((acc: any, curr: any) => {
        if (!acc[curr.app_key]) acc[curr.app_key] = { prompts: 0, installed: 0, dismissed: 0 };
        if (curr.event_type === 'prompt_shown') acc[curr.app_key].prompts++;
        if (curr.event_type === 'installed') acc[curr.app_key].installed++;
        if (curr.event_type === 'dismissed') acc[curr.app_key].dismissed++;
        return acc;
      }, {});

      setInstallStats(Object.keys(installSummary).map(k => ({ app_key: k, ...installSummary[k] })));

      // Group Usages
      const usageSummary = (allUsages || []).reduce((acc: any, curr: any) => {
        if (!acc[curr.app_key]) acc[curr.app_key] = 0;
        acc[curr.app_key]++;
        return acc;
      }, {});

      setUsageStats(Object.keys(usageSummary).map(k => ({ app_key: k, opens: usageSummary[k] })));
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">App Ecosystem Analytics</h2>
          <p className="text-sm text-slate-500 font-medium">PWA Installation & Usage Metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PWA Installs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Download className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">PWA Installations</h3>
          </div>
          
          <div className="space-y-3">
            {installStats.length === 0 ? (
              <p className="text-xs text-slate-500">No install data available yet.</p>
            ) : (
              installStats.map(stat => (
                <div key={stat.app_key} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-bold text-slate-700">{stat.app_key}</span>
                  <div className="flex gap-4 text-xs font-medium">
                    <span className="text-slate-500">Prompts: {stat.prompts}</span>
                    <span className="text-emerald-600 font-bold">Installs: {stat.installed}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* App Usage */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <MousePointer2 className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">App Usage (Opens)</h3>
          </div>
          
          <div className="space-y-3">
            {usageStats.length === 0 ? (
              <p className="text-xs text-slate-500">No usage data available yet.</p>
            ) : (
              usageStats.sort((a, b) => b.opens - a.opens).map(stat => (
                <div key={stat.app_key} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-bold text-slate-700">{stat.app_key}</span>
                  <span className="text-indigo-600 font-bold text-sm bg-indigo-50 px-2 py-0.5 rounded-md">{stat.opens} Opens</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
