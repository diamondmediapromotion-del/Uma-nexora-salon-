import React from "react";
import { ArrowLeft } from "lucide-react";

interface PlaceholderProps {
  title: string;
  navigateTo: (path: string) => void;
}

const Placeholder = ({ title, navigateTo }: PlaceholderProps) => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
    <h1 className="text-2xl font-black mb-4">{title}</h1>
    <p className="text-slate-500 text-sm mb-6">This module will be built in next steps.</p>
    <button onClick={() => navigateTo("/customer")} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center gap-2">
      <ArrowLeft className="w-4 h-4" /> Back to Customer Home
    </button>
  </div>
);

