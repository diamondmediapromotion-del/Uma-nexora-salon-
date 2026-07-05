import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building, Sparkles } from "lucide-react";

interface FloatingCTAProps {
  onTrigger: () => void;
}

export default function FloatingCTA({ onTrigger }: FloatingCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when scrolled down more than 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-40"
        >
          <button
            id="sticky-register-salon-cta"
            onClick={onTrigger}
            className="flex items-center gap-2 px-5 py-3.5 bg-slate-900 text-white hover:bg-slate-800 active:scale-95 text-xs font-bold rounded-full shadow-xl shadow-slate-900/10 border border-slate-800 transition-all duration-200 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <Building className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
              <Sparkles className="w-2 h-2 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span>Register Your Salon</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
