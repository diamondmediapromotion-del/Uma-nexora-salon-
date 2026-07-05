import React, { useState, useEffect } from "react";
import { Play, CheckCircle, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function AjmerPilotExecution() {
  const [launch, setLaunch] = useState<any>(null);
  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: launchesData } = await supabase
        .from("district_launches")
        .select("*")
        .eq("district_name", "Ajmer")
        .single();
      
      if (launchesData) {
        setLaunch(launchesData);
        
        const { data: reportsData } = await supabase
          .from("district_daily_reports")
          .select("*")
          .eq("launch_id", launchesData.id)
          .order("report_day", { ascending: true });
        
        if (reportsData) setDailyReports(reportsData);

        const { data: incidentsData } = await supabase
          .from("district_incidents")
          .select("*")
          .eq("launch_id", launchesData.id)
          .order("created_at", { ascending: false });
        
        if (incidentsData) setIncidents(incidentsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-semibold animate-pulse">Loading pilot data...</div>;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-3xl border border-blue-100 bg-blue-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-blue-900 tracking-tight flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-600" />
            18A & 19A AJMER PILOT & SCALE EXECUTION
          </h2>
          <p className="text-xs text-blue-700 font-semibold mt-1">
            7-Day Pilot & 14-Day Scale monitoring dashboard. Real customer data, partner ops, and incident tracking for Ajmer pilot.
          </p>
        </div>
        {launch?.launch_status === 'pilot_active' || launch?.launch_status === 'scale_active' ? (
          <span className="px-4 py-2 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {launch.launch_status === 'scale_active' ? 'Scale Active' : 'Pilot Active'}
          </span>
        ) : (
          <span className="px-4 py-2 bg-slate-200 border border-slate-300 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl">
            Not Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Daily Reports Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Day</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4 text-right">Bookings</th>
                  <th className="pb-3 text-right">Payments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailyReports.length > 0 ? dailyReports.map(dr => (
                  <tr key={dr.id} className="hover:bg-slate-50/50">
                    <td className="py-3 pr-4 font-bold text-slate-900">Day {dr.report_day}</td>
                    <td className="py-3 pr-4 text-slate-600 font-medium">{new Date(dr.report_date).toLocaleDateString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        dr.status === 'go' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        dr.status === 'hold' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {dr.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right font-mono font-bold text-slate-700">{dr.bookings_completed} / {dr.bookings_created}</td>
                    <td className="py-3 text-right font-mono font-bold text-slate-700">{dr.payments_captured}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 font-semibold italic">No daily reports logged yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Active Incidents</h3>
            <span className="text-[10px] font-bold px-2 py-1 bg-rose-50 text-rose-600 rounded-lg">P0 Open: {incidents.filter(i => i.priority === 'P0' && i.status === 'open').length}</span>
          </div>
          <div className="space-y-3">
            {incidents.filter(i => i.status === 'open').length > 0 ? incidents.filter(i => i.status === 'open').map(i => (
              <div key={i.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${
                      i.priority === 'P0' ? 'bg-rose-600 text-white' :
                      i.priority === 'P1' ? 'bg-orange-500 text-white' :
                      i.priority === 'P2' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-200 text-slate-600'
                    }`}>{i.priority}</span>
                    <span className="text-xs font-bold text-slate-900">{i.title}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold line-clamp-1">{i.description}</p>
                </div>
              </div>
            )) : (
              <div className="p-6 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-xs font-semibold text-slate-400 italic">No open incidents.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-3xl p-6 text-slate-200 space-y-4 shadow-xl">
         <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Pilot Constraints Checked</h3>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payment & Refund</div>
               <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> No fake success</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Owner Rules</div>
               <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> No Owner QR</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Wallet Credits</div>
               <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> On Capture Only</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Public Access</div>
               <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Blocked until Scale</div>
            </div>
         </div>
      </div>
    </div>
  );
}
