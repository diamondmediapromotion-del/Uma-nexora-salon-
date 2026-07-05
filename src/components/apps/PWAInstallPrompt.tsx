import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Smartphone } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PWAInstallPromptProps {
  appKey?: string;
}

export default function PWAInstallPrompt({ appKey = 'customer_app' }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    const dismissedSession = sessionStorage.getItem(`pwa_dismissed_${appKey}`);
    if (dismissedSession) {
      setHasDismissed(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      if (!hasDismissed) {
        setShowPrompt(true);
        trackEvent('prompt_shown');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Track successful installation
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      trackEvent('installed');
      console.log('PWA was installed');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [hasDismissed, appKey]);

  const trackEvent = async (eventType: string) => {
    try {
      await supabase.rpc('track_pwa_install_event', {
        p_app_key: appKey,
        p_event_type: eventType,
        p_platform: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        p_user_agent: navigator.userAgent
      });
    } catch (e) {
      console.error('Failed to track PWA event:', e);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      // 'installed' event will be tracked by 'appinstalled' listener
    } else {
      console.log('User dismissed the install prompt');
      trackEvent('dismissed');
      setHasDismissed(true);
      sessionStorage.setItem(`pwa_dismissed_${appKey}`, 'true');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setHasDismissed(true);
    sessionStorage.setItem(`pwa_dismissed_${appKey}`, 'true');
    trackEvent('dismissed');
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 bg-white rounded-2xl shadow-2xl border border-blue-100 z-50 p-4 flex gap-4 items-start"
      >
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <Smartphone className="w-6 h-6" />
        </div>
        
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-black text-slate-900 tracking-tight">Install Nexora App</h4>
          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            Install this app on your device for a faster, app-like experience.
          </p>
          <div className="pt-2 flex items-center gap-2">
            <button 
              onClick={handleInstallClick}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-colors"
            >
              Install Now
            </button>
            <button 
              onClick={handleDismiss}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
        
        <button 
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
