import React from "react";
import { ArrowLeft } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  navigateTo: (path: string) => void;
  backPath?: string;
}

const PlaceholderPage = ({ title, navigateTo, backPath = "/profile" }: PlaceholderPageProps) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black text-slate-900 mb-4">{title}</h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-xs">
          “This customer module will be built in next steps.”
        </p>
        <button 
          onClick={() => navigateTo(backPath)} 
          className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
    </div>
  );
};

export default PlaceholderPage;
