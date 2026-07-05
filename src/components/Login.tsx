import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Sparkles, ArrowLeft, Eye, EyeOff, Mail, Lock } from "lucide-react";

interface LoginProps {
  navigateTo: (path: string) => void;
}

const Login = ({ navigateTo }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("No user returned");

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const userRoleList = new Set(roles ? roles.map((r: any) => r.role) : []);
      if (profile?.role) {
        userRoleList.add(profile.role);
      }
      
      const rolesArray = Array.from(userRoleList);

      if (rolesArray.length > 1) {
        navigateTo("/apps");
      } else if (rolesArray.includes("super_admin")) {
        navigateTo("/admin");
      } else if (rolesArray.includes("shop_owner")) {
        navigateTo("/owner-dashboard");
      } else if (rolesArray.includes("growth_partner")) {
        navigateTo("/growth-partner");
      } else if (rolesArray.includes("distributor") || rolesArray.includes("brand_partner")) {
        navigateTo("/distributor-brand");
      } else {
        navigateTo("/apps"); // Let apps page handle default
      }
    } catch (err: any) {
      setErrorMessage("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 premium-shadow space-y-6">
        <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-sm mb-4">
                <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-display font-black text-slate-900 tracking-tight">
                SalonOS Login Portal
            </h1>
            <p className="text-slate-500 text-sm">
                Login to continue your Nexora journey.
            </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="you@salon.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMessage && <p className="text-xs text-rose-500 font-bold">{errorMessage}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="space-y-3 text-center text-sm">
            <button onClick={() => navigateTo("/forgot-password")} className="block w-full text-slate-500 hover:text-blue-600 text-xs font-semibold">Forgot Password?</button>
            <button onClick={() => navigateTo("/sign-up")} className="block w-full text-slate-900 hover:text-blue-600 text-xs font-bold">Don’t have an account? Sign Up</button>
            <button onClick={() => navigateTo("/")} className="block w-full text-slate-400 hover:text-slate-600 text-xs font-semibold pt-4 border-t border-slate-100">Back to Home</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
