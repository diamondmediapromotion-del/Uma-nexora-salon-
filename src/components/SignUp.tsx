import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  Sparkles, 
  User, 
  Mail, 
  Lock, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Check, 
  ArrowLeft,
  AlertCircle,
  Phone,
  MapPin
} from "lucide-react";

interface SignUpProps {
  navigateTo: (path: string) => void;
}

export default function SignUp({ navigateTo }: SignUpProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer"); // Default to customer
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      localStorage.setItem("nexora_pending_referral_code", refCode);
    }
  }, []);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setter(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!agreeToTerms) {
      setErrorMessage("Please agree to the Terms & Conditions and Privacy Policy to register.");
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("Please enter your mobile number.");
      return;
    }

    if (!city.trim()) {
      setErrorMessage("Please enter your city.");
      return;
    }

    if (!area.trim()) {
      setErrorMessage("Please enter your area/locality.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password aur confirm password match nahi kar rahe.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password kam se kam 6 characters ka hona chahiye.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            city: city.trim(),
            area: area.trim(),
            role: role
          }
        }
      });

      console.log("Signup error:", error?.message);
      console.log("Signup user created:", Boolean(data?.user));

      if (data?.user) {
        // Record consent
        await supabase.rpc('accept_policy_consent', {
          p_policy_slug: 'terms-and-conditions',
          p_version: '1.0.0'
        });
      }

      if (error) {
        console.error("Supabase Signup Error:", error);
        if (error.message.toLowerCase().includes("already registered")) {
          setErrorMessage("This email address is already registered. Try logging in instead.");
        } else if (error.message.toLowerCase().includes("weak") || error.message.toLowerCase().includes("password")) {
          setErrorMessage("Password is too weak. Please choose a stronger password (use a mix of letters and numbers).");
        } else {
          setErrorMessage(`Signup failed: ${error.message}`);
        }
      } else if (data.user) {
        const pendingRef = localStorage.getItem("nexora_pending_referral_code");
        if (pendingRef) {
            await supabase.rpc("capture_customer_referral", {
                referred_customer_id: data.user.id,
                referral_code: pendingRef
            });
            localStorage.removeItem("nexora_pending_referral_code");
        }
        setSuccessMessage("Account created successfully. Please check your email if verification is required.");
        setFullName("");
        setEmail("");
        setPhone("");
        setCity("");
        setArea("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      console.error("Signup exception:", err);
      setErrorMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4 sm:p-6 text-left font-sans select-none">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6 animate-fade-in relative my-8 animate-fade-in">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-display font-black text-slate-900 tracking-tight text-center">
            Create your Nexora account
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto font-medium text-center">
            Join Nexora SalonOS as a customer, salon owner, growth partner, or brand/distributor.
          </p>
        </div>

        {/* Error and Success Banners */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 text-rose-900 rounded-2xl border border-rose-100 flex items-start gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-100 flex items-start gap-3">
            <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold leading-relaxed">{successMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 block">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={fullName}
                onChange={(e) => handleInputChange(setFullName, e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                autoComplete="username email"
                value={email}
                onChange={(e) => handleInputChange(setEmail, e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 block">
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                value={phone}
                onChange={(e) => handleInputChange(setPhone, e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* City and Area Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* City */}
            <div className="space-y-1.5">
              <label className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 block">
                City
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <MapPin className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="city"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => handleInputChange(setCity, e.target.value)}
                  placeholder="Jaipur"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Area */}
            <div className="space-y-1.5">
              <label className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 block">
                Area
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <MapPin className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="area"
                  autoComplete="address-line2"
                  value={area}
                  onChange={(e) => handleInputChange(setArea, e.target.value)}
                  placeholder="Malviya Nagar"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Join As */}
          <div className="space-y-1.5">
            <label className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 block">
              Join As
            </label>
            <div className="relative">
              <select
                name="role"
                value={role}
                onChange={(e) => handleInputChange(setRole, e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all appearance-none cursor-pointer"
                disabled={loading}
              >
                <option value="customer">Customer (Book & Save)</option>
                <option value="shop_owner">Salon Owner (Register Salon)</option>
                <option value="growth_partner">Growth Partner (Jaipur Program)</option>
                <option value="distributor">Distributor / Brand Storefront</option>
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 block">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  handleInputChange(setPassword, e.target.value);
                }}
                onBlur={() => {
                  if (password.length > 0 && password.length < 6) {
                    setErrorMessage("Password kam se kam 6 characters ka hona chahiye.");
                  } else {
                    setErrorMessage(null);
                  }
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password.length > 0 && password.length < 6 && (
              <p className="text-2xs text-rose-500 font-medium">Password kam se kam 6 characters ka hona chahiye.</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 block">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm-password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => handleInputChange(setConfirmPassword, e.target.value)}
                onBlur={() => {
                  if (confirmPassword !== password) {
                    setErrorMessage("Password aur confirm password match nahi kar rahe.");
                  } else {
                    setErrorMessage(null);
                  }
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && confirmPassword !== password && (
              <p className="text-2xs text-rose-500 font-medium">Password aur confirm password match nahi kar rahe.</p>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                <input 
                  type="checkbox" 
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded-md border-2 border-slate-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium leading-relaxed select-none">
                I agree to Nexora's <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigateTo('/terms-and-conditions'); }} className="text-blue-600 hover:underline">Terms & Conditions</span>, <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigateTo('/privacy-policy'); }} className="text-blue-600 hover:underline">Privacy Policy</span> and specific platform rules.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Separator / Footer Links */}
        <div className="space-y-3.5 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-semibold">
            Already have an account?{" "}
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                navigateTo("/login");
              }}
              className="text-blue-600 hover:underline"
            >
              Login
            </a>
          </p>

          <button
            onClick={() => navigateTo("/")}
            className="inline-flex items-center gap-1.5 text-2xs text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}
