import React from "react";
import { ArrowLeft, HelpCircle } from "lucide-react";

interface ForgotPasswordProps {
  navigateTo: (path: string) => void;
}

const ForgotPassword = ({ navigateTo }: ForgotPasswordProps) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 premium-shadow space-y-6 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-sm mb-4">
            <HelpCircle className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-display font-black text-slate-900 tracking-tight">
          Forgot Password
        </h1>

        <p className="text-slate-500 text-sm leading-relaxed">
          “This module will be built in next steps.”
        </p>

        <button
          onClick={() => navigateTo("/login")}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
