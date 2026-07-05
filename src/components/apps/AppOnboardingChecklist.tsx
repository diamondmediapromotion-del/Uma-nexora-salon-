import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AppOnboardingChecklistProps {
  appKey: string;
}

export default function AppOnboardingChecklist({ appKey }: AppOnboardingChecklistProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    fetchChecklist();
  }, [appKey]);

  const fetchChecklist = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return; // Only for logged-in users

      const { data, error } = await supabase.rpc('ensure_app_onboarding_checklist', {
        p_app_key: appKey
      });

      if (error) {
        console.error("Error fetching checklist:", error);
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error("Checklist fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (itemKey: string) => {
    try {
      // Optimistic update
      setItems(prev => prev.map(item => 
        item.item_key === itemKey ? { ...item, is_completed: true } : item
      ));

      await supabase.rpc('complete_app_checklist_item', {
        p_app_key: appKey,
        p_item_key: itemKey
      });
    } catch (err) {
      console.error("Failed to mark item complete:", err);
      // Revert if failed
      fetchChecklist();
    }
  };

  if (loading || items.length === 0) return null;

  const completedCount = items.filter(i => i.is_completed).length;
  const progress = (completedCount / items.length) * 100;
  const allCompleted = completedCount === items.length;

  if (allCompleted) return null; // Hide when fully done

  return (
    <div className="bg-white border border-blue-100 rounded-3xl overflow-hidden shadow-lg shadow-blue-500/5 mb-8">
      <div 
        className="p-5 flex items-center justify-between cursor-pointer bg-blue-50/50 hover:bg-blue-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="space-y-1">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            Get Started Checklist
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">
              {completedCount}/{items.length}
            </span>
          </h3>
          <div className="w-48 h-1.5 bg-blue-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-blue-50"
          >
            <div className="p-2 space-y-1">
              {items.map((item, idx) => (
                <div 
                  key={item.item_key}
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                    item.is_completed ? 'bg-slate-50 opacity-50' : 'hover:bg-blue-50/50'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!item.is_completed) handleMarkComplete(item.item_key);
                    }}
                    disabled={item.is_completed}
                    className="shrink-0"
                  >
                    {item.is_completed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-blue-500 transition-colors" />
                    )}
                  </button>
                  <span className={`text-sm font-bold ${item.is_completed ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
