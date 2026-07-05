import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Subtitles, 
  Sparkles, 
  Laptop, 
  Calendar, 
  QrCode, 
  BarChart3, 
  MessageSquare,
  CheckCircle,
  Clock,
  ArrowRight
} from "lucide-react";

interface Scene {
  id: number;
  title: string;
  subtitle: string;
  duration: number; // in seconds
  caption: string;
  icon: React.ComponentType<any>;
}

const SCENES: Scene[] = [
  {
    id: 1,
    title: "1. AI Instant Website Builder",
    subtitle: "Launch a fully booking-ready website in 30 seconds",
    duration: 15,
    caption: "SalonOS analyzes your services, brand colors, and preferences to immediately deploy a beautiful, custom-themed website on your own sub-domain.",
    icon: Laptop
  },
  {
    id: 2,
    title: "2. Visual CRM & Calendar",
    subtitle: "Real-time appointment slots & client profiles",
    duration: 15,
    caption: "Say goodbye to manual books. View open chairs, drag-and-drop bookings, and automatically fire off SMS confirmations directly to your clients.",
    icon: Calendar
  },
  {
    id: 3,
    title: "3. Direct QR Loyalty & Cashback",
    subtitle: "Turn one-time guests into permanent regulars",
    duration: 15,
    caption: "Customers simply scan your customized counter QR code to claim loyalty cashback points, entirely eliminating paper stamp cards.",
    icon: QrCode
  },
  {
    id: 4,
    title: "4. Premium Analytics & Business Insights",
    subtitle: "Monitor revenue growth and retention rates",
    duration: 15,
    caption: "Track your average ticket size, busiest salon hours, and monthly staff performance in a highly digestible graphical dashboard.",
    icon: BarChart3
  }
];

export default function DemoVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [muted, setMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  
  // Simulation Interactive states
  // Scene 1: Website customizations
  const [webColor, setWebColor] = useState("rose");
  const [webDevice, setWebDevice] = useState<"desktop" | "mobile">("desktop");
  // Scene 2: Appointments list
  const [appts, setAppts] = useState([
    { id: 1, name: "Priya Sharma", service: "Gel Manicure", time: "11:00 AM", status: "Pending" },
    { id: 2, name: "Amit Verma", service: "Classic Haircut", time: "11:45 AM", status: "Pending" }
  ]);
  // Scene 3: Scan points counter
  const [points, setPoints] = useState(350);
  const [isScanning, setIsScanning] = useState(false);
  // Scene 4: Selected analytics metric
  const [activeMetric, setActiveMetric] = useState<"sales" | "users">("sales");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Scene transition logic
  useEffect(() => {
    if (isPlaying) {
      const activeScene = SCENES[currentSceneIdx];
      const tickRate = 100; // ms
      const totalSteps = (activeScene.duration * 1000) / tickRate;
      const stepIncrement = 100 / totalSteps;

      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Move to next scene or loop back
            if (currentSceneIdx < SCENES.length - 1) {
              setCurrentSceneIdx(currentSceneIdx + 1);
              return 0;
            } else {
              // End of walkthrough
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + stepIncrement;
        });
      }, tickRate);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentSceneIdx]);

  // Reset progress when scene manually changed
  const handleSelectScene = (idx: number) => {
    setCurrentSceneIdx(idx);
    setProgress(0);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (progress >= 100 && currentSceneIdx === SCENES.length - 1) {
      // Re-run from beginning
      setCurrentSceneIdx(0);
      setProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentSceneIdx(0);
    setProgress(0);
    setIsPlaying(false);
  };

  // Automated simulator triggers to make the video look "alive"
  useEffect(() => {
    if (!isPlaying) return;

    // Simulate interactions depending on the scene index
    let simulationTimer: NodeJS.Timeout;

    if (currentSceneIdx === 0) {
      // Cycle colors to show the website customizer in action
      const colors = ["rose", "indigo", "amber", "emerald"];
      let colorIdx = 0;
      simulationTimer = setInterval(() => {
        colorIdx = (colorIdx + 1) % colors.length;
        setWebColor(colors[colorIdx]);
        setWebDevice(prev => prev === "desktop" ? "mobile" : "desktop");
      }, 3000);
    } else if (currentSceneIdx === 1) {
      // Add or approve appointments
      simulationTimer = setInterval(() => {
        setAppts(prev => {
          const updated = [...prev];
          const pendingIdx = updated.findIndex(a => a.status === "Pending");
          if (pendingIdx !== -1) {
            updated[pendingIdx] = { ...updated[pendingIdx], status: "Confirmed" };
          } else {
            // reset
            return [
              { id: 1, name: "Priya Sharma", service: "Gel Manicure", time: "11:00 AM", status: "Pending" },
              { id: 2, name: "Amit Verma", service: "Classic Haircut", time: "11:45 AM", status: "Pending" }
            ];
          }
          return updated;
        });
      }, 4000);
    } else if (currentSceneIdx === 2) {
      // Simulate scanning points increment
      simulationTimer = setInterval(() => {
        setIsScanning(true);
        setTimeout(() => {
          setIsScanning(false);
          setPoints(prev => prev + 50);
        }, 1200);
      }, 5000);
    } else if (currentSceneIdx === 3) {
      // Alternate metrics tab
      simulationTimer = setInterval(() => {
        setActiveMetric(prev => prev === "sales" ? "users" : "sales");
      }, 4000);
    }

    return () => {
      if (simulationTimer) clearInterval(simulationTimer);
    };
  }, [isPlaying, currentSceneIdx]);

  return (
    <section id="demo-video-walkthrough" className="py-24 bg-slate-50/50 border-t border-b border-slate-100 scroll-mt-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-3xs font-extrabold uppercase tracking-widest border border-blue-100">
            Interactive Walkthrough
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            See <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SalonOS in Action</span>
          </h2>
          <p className="text-slate-500 text-sm md:text-base font-body font-light">
            Explore our beautiful simulated dashboard tour. Click play to run the interactive walkthrough or select any feature below.
          </p>
        </div>

        {/* Video Player & Dashboard Simulator Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Side Menu: Scene Selectors */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <span className="text-4xs font-extrabold uppercase tracking-widest text-slate-400 block px-2 mb-1">
                Walkthrough Navigation
              </span>
              {SCENES.map((scene, idx) => {
                const Icon = scene.icon;
                const isSelected = currentSceneIdx === idx;
                return (
                  <button
                    key={scene.id}
                    onClick={() => handleSelectScene(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 group relative cursor-pointer ${
                      isSelected
                        ? "bg-white border-blue-200 shadow-sm"
                        : "bg-transparent border-transparent hover:bg-white hover:border-slate-200/60"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-600 rounded-l-xl" />
                    )}
                    <div className={`p-2 rounded-lg ${
                      isSelected 
                        ? "bg-blue-50 text-blue-600" 
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/50 group-hover:text-slate-700"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className={`text-xs font-bold leading-none ${
                        isSelected ? "text-slate-950" : "text-slate-600 group-hover:text-slate-900"
                      }`}>
                        {scene.title}
                      </p>
                      <p className="text-4xs text-slate-400 font-medium">
                        {scene.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Platform Quick Specs */}
            <div className="p-5 rounded-2xl bg-white border border-slate-150/70 premium-shadow mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-2xs font-extrabold text-slate-900 uppercase tracking-wider">No Download Needed</span>
              </div>
              <p className="text-3xs text-slate-500 font-light leading-relaxed">
                SalonOS runs entirely on the web, optimizing automatically for both mobile touch registers and desktop reception monitors.
              </p>
              <div className="flex items-center gap-3 text-4xs text-slate-400 font-bold">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Web App
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Offline Sync
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> QR Ready
                </span>
              </div>
            </div>
          </div>

          {/* Video / Interactive Dashboard Viewer Canvas */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl min-h-[440px]">
            
            {/* Top Bar (Fake Mac Window Chrome) */}
            <div className="bg-slate-900/95 px-4 py-3 border-b border-slate-800/80 flex items-center justify-between z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="px-3 py-0.5 rounded bg-slate-950 border border-slate-800/50 text-4xs text-slate-400 font-mono tracking-tight flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-blue-500 animate-ping" />
                <span>demo_walkthrough_h264.mp4</span>
              </div>
              <div className="w-12" />
            </div>

            {/* Display Viewport - Houses Simulated Interactive Screens */}
            <div className="flex-1 flex items-center justify-center relative p-6 bg-radial-dark overflow-hidden">
              <AnimatePresence mode="wait">
                
                {/* 1. Play Button Overlay when paused & not started */}
                {!isPlaying && progress === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20 cursor-pointer"
                    onClick={handlePlayPause}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-4 hover:bg-blue-500 transition-colors"
                    >
                      <Play className="w-6 h-6 fill-white ml-1" />
                    </motion.div>
                    <h4 className="text-sm font-bold text-white tracking-tight">Play Demo Walkthrough</h4>
                    <p className="text-5xs text-slate-400 mt-1.5 max-w-xs">
                      See how easy it is to customize websites, manage slots, and issue QR coupons with SalonOS.
                    </p>
                  </motion.div>
                )}

                {/* SCENE 1: Website Builder */}
                {currentSceneIdx === 0 && (
                  <motion.div
                    key="scene-1"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl text-left"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-blue-400" />
                        <span className="text-4xs font-mono font-bold text-slate-300">nexora.in/voguehair</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-5xs font-bold uppercase tracking-wider">
                        Online
                      </span>
                    </div>

                    {/* Interactive website mock frame */}
                    <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 relative overflow-hidden space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className={`w-16 h-2 rounded ${
                            webColor === "rose" ? "bg-rose-500/30" :
                            webColor === "indigo" ? "bg-indigo-500/30" :
                            webColor === "amber" ? "bg-amber-500/30" :
                            "bg-emerald-500/30"
                          }`} />
                          <div className="w-24 h-1 rounded bg-slate-700" />
                        </div>
                        <div className={`px-2 py-1 rounded-md border text-5xs font-bold ${
                          webColor === "rose" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                          webColor === "indigo" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                          webColor === "amber" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                          "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        }`}>
                          Book Now
                        </div>
                      </div>

                      {/* Mock services list */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/60">
                        <div className="flex items-center justify-between">
                          <div className="w-16 h-1.5 bg-slate-800 rounded" />
                          <div className="w-6 h-1.5 bg-slate-800 rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="w-20 h-1.5 bg-slate-800 rounded" />
                          <div className="w-6 h-1.5 bg-slate-800 rounded" />
                        </div>
                      </div>

                      <div className="text-center pt-2">
                        <p className="text-5xs text-slate-500 font-mono">Theme applied: Vogue {webColor.toUpperCase()}</p>
                      </div>
                    </div>

                    {/* Simulation Settings */}
                    <div className="flex items-center justify-between text-5xs bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-bold">Simulation: Change brand theme</span>
                      <div className="flex gap-1">
                        {["rose", "indigo", "amber", "emerald"].map((col) => (
                          <button
                            key={col}
                            onClick={() => setWebColor(col)}
                            className={`w-3.5 h-3.5 rounded-full border ${
                              webColor === col ? "ring-1 ring-white" : ""
                            } ${
                              col === "rose" ? "bg-rose-500" :
                              col === "indigo" ? "bg-indigo-500" :
                              col === "amber" ? "bg-amber-500" :
                              "bg-emerald-500"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SCENE 2: CRM & Calendar */}
                {currentSceneIdx === 1 && (
                  <motion.div
                    key="scene-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl text-left"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <span className="text-4xs font-bold text-slate-200">Receptions Desk Planner</span>
                      </div>
                      <span className="text-5xs text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Today (10:00 AM - 6:00 PM)
                      </span>
                    </div>

                    {/* Booking queue simulator */}
                    <div className="space-y-2">
                      {appts.map((appt) => (
                        <div key={appt.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-4xs font-bold text-slate-100">{appt.name}</p>
                            <p className="text-5xs text-slate-400 font-medium flex items-center gap-1">
                              <span>{appt.service}</span> • <span className="font-mono">{appt.time}</span>
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            {appt.status === "Confirmed" ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-5xs font-bold flex items-center gap-1 animate-pulse">
                                <CheckCircle className="w-2.5 h-2.5" /> Approved
                              </span>
                            ) : (
                              <button 
                                onClick={() => {
                                  setAppts(prev => prev.map(a => a.id === appt.id ? { ...a, status: "Confirmed" } : a));
                                }}
                                className="px-2 py-1 text-5xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer"
                              >
                                Approve Slot
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notification trigger simulation */}
                    <div className="p-2 bg-indigo-500/5 rounded-lg border border-indigo-500/15 flex items-center gap-2">
                      <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-5xs font-bold text-indigo-400">Nexora SMS-Engine Active</p>
                        <p className="text-5xs text-slate-400">Clients automatically receive reminder messages 2h before.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SCENE 3: QR Cashback */}
                {currentSceneIdx === 2 && (
                  <motion.div
                    key="scene-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="w-full max-w-sm bg-slate-900 rounded-2xl border border-slate-800 p-5 text-center space-y-6 shadow-xl"
                  >
                    <div className="space-y-1.5">
                      <span className="text-5xs font-extrabold uppercase tracking-widest text-slate-400">Instant Customer Scan</span>
                      <h4 className="text-xs font-bold text-slate-200">Jaipur Rewards Program</h4>
                    </div>

                    {/* Simulated scanning device frame */}
                    <div className="relative mx-auto w-32 h-32 rounded-2xl bg-slate-950 border border-slate-800/80 p-2 flex items-center justify-center overflow-hidden">
                      {isScanning && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 animate-bounce shadow-md shadow-blue-500" />
                      )}
                      
                      <div className="p-2 bg-white rounded-xl">
                        <QrCode className="w-20 h-20 text-slate-950" />
                      </div>
                    </div>

                    {/* Customer loyalty wallet panel */}
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-5xs text-slate-400">Customer Wallet Balance:</span>
                        <span className="text-4xs font-bold text-blue-400">{points} pts</span>
                      </div>
                      
                      {/* Interactive button to scan again */}
                      <button 
                        onClick={() => {
                          setIsScanning(true);
                          setTimeout(() => {
                            setIsScanning(false);
                            setPoints(prev => prev + 50);
                          }, 1000);
                        }}
                        disabled={isScanning}
                        className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-5xs rounded-lg border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isScanning ? "Scanning Coupon..." : "Scan simulated QR Counter"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* SCENE 4: Analytics */}
                {currentSceneIdx === 3 && (
                  <motion.div
                    key="scene-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl text-left"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        <span className="text-4xs font-bold text-slate-200">Executive Performance Hub</span>
                      </div>
                      <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800 text-5xs font-bold">
                        <button 
                          onClick={() => setActiveMetric("sales")}
                          className={`px-2 py-0.5 rounded ${activeMetric === "sales" ? "bg-slate-850 text-white" : "text-slate-400"}`}
                        >
                          Sales
                        </button>
                        <button 
                          onClick={() => setActiveMetric("users")}
                          className={`px-2 py-0.5 rounded ${activeMetric === "users" ? "bg-slate-850 text-white" : "text-slate-400"}`}
                        >
                          Clients
                        </button>
                      </div>
                    </div>

                    {/* Chart simulation layout */}
                    <div className="space-y-3">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-base font-bold text-white">
                          {activeMetric === "sales" ? "₹45,800" : "148 new"}
                        </span>
                        <span className="text-5xs font-extrabold text-emerald-400">+18% this week</span>
                      </div>

                      {/* Mock Chart Columns */}
                      <div className="h-24 flex items-end gap-2.5 pt-4 border-b border-slate-800/60 pb-1">
                        <div className="flex-1 bg-slate-800 hover:bg-blue-600/20 rounded-t h-[40%] transition-all" />
                        <div className="flex-1 bg-slate-800 hover:bg-blue-600/20 rounded-t h-[55%] transition-all" />
                        <div className="flex-1 bg-slate-800 hover:bg-blue-600/20 rounded-t h-[45%] transition-all" />
                        <div className="flex-1 bg-slate-800 hover:bg-blue-600/20 rounded-t h-[75%] transition-all" />
                        <div className="flex-1 bg-slate-800 hover:bg-blue-600/20 rounded-t h-[60%] transition-all" />
                        <div className="flex-1 bg-blue-600 rounded-t h-[90%] transition-all shadow-md shadow-blue-500/10" />
                      </div>
                      
                      <div className="flex justify-between text-5xs text-slate-500 font-mono px-0.5">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat (Peak)</span>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Custom Video Controls Panel */}
            <div className="bg-slate-900/90 border-t border-slate-800/80 px-4 py-3.5 space-y-3 z-10">
              
              {/* Media Timeline Bar */}
              <div className="relative h-1 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
                <div 
                  className="absolute top-0 bottom-0 left-0 bg-blue-500 transition-all duration-100 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Control Buttons row */}
              <div className="flex items-center justify-between">
                
                <div className="flex items-center gap-4">
                  {/* Play / Pause */}
                  <button
                    onClick={handlePlayPause}
                    className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-white" />
                    )}
                  </button>

                  {/* Reset */}
                  <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Restart"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {/* Time Indicator */}
                  <span className="text-4xs font-mono font-bold text-slate-400">
                    {`00:${Math.floor((progress / 100) * SCENES[currentSceneIdx].duration).toString().padStart(2, "0")} / 00:${SCENES[currentSceneIdx].duration}`}
                  </span>
                </div>

                {/* Caption indicators */}
                <div className="text-4xs font-bold text-blue-400 uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Scene {currentSceneIdx + 1}: {SCENES[currentSceneIdx].title.split(". ")[1]}</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Subtitles CC Toggle */}
                  <button
                    onClick={() => setShowCaptions(!showCaptions)}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      showCaptions ? "text-blue-400" : "text-slate-500 hover:text-white"
                    }`}
                    title="Toggle Subtitles"
                  >
                    <Subtitles className="w-4 h-4" />
                  </button>

                  {/* Mute toggle */}
                  <button
                    onClick={() => setMuted(!muted)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={muted ? "Unmute" : "Mute"}
                  >
                    {muted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

              </div>
            </div>

            {/* Simulated Voiceover Captions */}
            {showCaptions && (
              <div className="bg-slate-950/95 border-t border-slate-800/40 p-4 min-h-[64px] flex items-center justify-center text-center">
                <p className="text-4xs text-slate-200 leading-relaxed max-w-xl font-medium tracking-wide">
                  <span className="text-blue-400 mr-1">[AI Voice]:</span>
                  "{SCENES[currentSceneIdx].caption}"
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
