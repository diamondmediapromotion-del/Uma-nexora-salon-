import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { CheckCircle2, ChevronRight, Store, AlertCircle, Clock, MapPin, Phone, User, Globe, Sparkles, Upload, Trash2, Camera, Check } from "lucide-react";

interface OwnerRegisterProps {
  navigateTo: (path: string) => void;
}

export default function OwnerRegister({ navigateTo }: OwnerRegisterProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  // Form State
  const [ownerName, setOwnerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");

  const [shopName, setShopName] = useState("");
  const [category, setCategory] = useState("hair_salon");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [weeklyOff, setWeeklyOff] = useState("None");

  const [template, setTemplate] = useState("modern_salon");

  const [services, setServices] = useState<{ service_name: string; price: string; duration_minutes: string }[]>([
    { service_name: "", price: "", duration_minutes: "" },
    { service_name: "", price: "", duration_minutes: "" },
    { service_name: "", price: "", duration_minutes: "" }
  ]);


  const [currentStep, setCurrentStep] = useState(1);
  const [draftStatus, setDraftStatus] = useState<string | null>(null);
  const [agreeToPolicies, setAgreeToPolicies] = useState(false);

  // Profile Photo State
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Draft Save Effect
  useEffect(() => {
    if (loading) return; // Don't overwrite draft while loading

    setDraftStatus("saving");
    const timeout = setTimeout(() => {
      const draft = {
        ownerName, mobileNumber, email, shopName, category, district, city, area, address, whatsapp,
        openingTime, closingTime, weeklyOff, template, services, profilePhotoUrl
      };
      localStorage.setItem("nexora_owner_registration_draft", JSON.stringify(draft));
      setDraftStatus("saved");
    }, 500);

    return () => clearTimeout(timeout);
  }, [ownerName, mobileNumber, email, shopName, category, district, city, area, address, whatsapp, openingTime, closingTime, weeklyOff, template, services, profilePhotoUrl, loading]);

  const clearDraft = () => {
    localStorage.removeItem("nexora_owner_registration_draft");
    setOwnerName("");
    setMobileNumber("");
    setEmail("");
    setShopName("");
    setCategory("hair_salon");
    setDistrict("");
    setCity("");
    setArea("");
    setAddress("");
    setWhatsapp("");
    setOpeningTime("");
    setClosingTime("");
    setWeeklyOff("None");
    setTemplate("modern_salon");
    setServices([
      { service_name: "", price: "", duration_minutes: "" },
      { service_name: "", price: "", duration_minutes: "" },
      { service_name: "", price: "", duration_minutes: "" }
    ]);
    setProfilePhotoUrl("");
    setDraftStatus("cleared");
  };

  const handleUseAccountEmail = () => {
    if (user?.email) {
      setEmail(user.email);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          setEmail(session.user.email);
        }
      });
    }
  };


  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAuthError(true);
        setTimeout(() => {
            navigateTo("/login");
        }, 2000);
        return;
      }
      setUser(session.user);
      
      let loadedFromDraft = false;
      const draftStr = localStorage.getItem("nexora_owner_registration_draft");
      if (draftStr) {
        try {
          const draft = JSON.parse(draftStr);
          if (draft && typeof draft === 'object') {
            if (draft.ownerName !== undefined) setOwnerName(draft.ownerName);
            if (draft.mobileNumber !== undefined) setMobileNumber(draft.mobileNumber);
            if (draft.email !== undefined) setEmail(draft.email);
            if (draft.shopName !== undefined) setShopName(draft.shopName);
            if (draft.category !== undefined) setCategory(draft.category);
            if (draft.district !== undefined) setDistrict(draft.district);
            if (draft.city !== undefined) setCity(draft.city);
            if (draft.area !== undefined) setArea(draft.area);
            if (draft.address !== undefined) setAddress(draft.address);
            if (draft.whatsapp !== undefined) setWhatsapp(draft.whatsapp);
            if (draft.openingTime !== undefined) setOpeningTime(draft.openingTime);
            if (draft.closingTime !== undefined) setClosingTime(draft.closingTime);
            if (draft.weeklyOff !== undefined) setWeeklyOff(draft.weeklyOff);
            if (draft.template !== undefined) setTemplate(draft.template);
            if (draft.services !== undefined && Array.isArray(draft.services)) setServices(draft.services);
            if (draft.profilePhotoUrl !== undefined) setProfilePhotoUrl(draft.profilePhotoUrl);
            loadedFromDraft = true;
          }
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }

      if (!loadedFromDraft) {
        // Fetch existing shop owner profile from public.shop_owner_profiles if available
        try {
          const { data: ownerProfile } = await supabase
            .from("shop_owner_profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (ownerProfile) {
            setOwnerName(ownerProfile.owner_full_name || "");
            setMobileNumber(ownerProfile.mobile_number || "");
            setEmail(ownerProfile.email_address || "");
            setWhatsapp(ownerProfile.business_whatsapp_number || "");
            if (ownerProfile.profile_photo_url) {
              setProfilePhotoUrl(ownerProfile.profile_photo_url);
            }
          } else {
            // New owner, keep fields completely blank!
            setOwnerName("");
            setMobileNumber("");
            setEmail("");
            setWhatsapp("");
          }
        } catch (err) {
          console.log("No existing owner profile found:", err);
          // New owner, keep fields completely blank!
          setOwnerName("");
          setMobileNumber("");
          setEmail("");
          setWhatsapp("");
        }
      } else {
         // Show restored message shortly
         setTimeout(() => setDraftStatus("restored"), 100);
         setTimeout(() => setDraftStatus("saved"), 3000);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setAuthError(true);
      setTimeout(() => {
          navigateTo("/login");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // 1. Validate file format (JPG, PNG, WEBP)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    // 2. Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo size must be less than 5MB.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("Authentication session not found. Please log in again.");
      }

      const fileExt = file.name.split('.').pop() || "jpg";
      const filePath = `${session.user.id}/profile-photo.${fileExt}`;

      // Upload image to 'shop-owner-avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('shop-owner-avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Photo upload failed. Please try again.");
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('shop-owner-avatars')
        .getPublicUrl(filePath);

      setProfilePhotoUrl(publicUrl);
    } catch (err: any) {
      console.error("Photo upload process error:", err);
      setError(err.message || "Photo upload failed. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhotoUrl("");
  };

  const handleServiceChange = (index: number, field: string, value: string) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    setServices(newServices);
  };

  const addService = () => {
    if (services.length < 5) {
      setServices([...services, { service_name: "", price: "", duration_minutes: "" }]);
    }
  };

  const removeService = (index: number) => {
    if (services.length > 3) {
      const newServices = [...services];
      newServices.splice(index, 1);
      setServices(newServices);
    }
  };

  const validateForm = () => {
    if (!ownerName || !mobileNumber || !email) return "Owner details are required.";
    if (!shopName || !category || !city || !area || !address || !whatsapp) return "Business details are required.";
    if (!openingTime || !closingTime) return "Business timing is required.";
    if (!template) return "Website template selection is required.";
    
    let validServicesCount = 0;
    for (const srv of services) {
      if (srv.service_name && srv.price && srv.duration_minutes) {
        validServicesCount++;
      }
    }
    if (validServicesCount < 3) return "Please add at least 3 valid services.";

    return null;
  };

  const insertWithRetry = async (tableName: string, payload: any) => {
    let currentPayload = { ...payload };
    while (true) {
      const { data, error } = await supabase.from(tableName).insert(currentPayload).select().single();
      if (error) {
        if (error.code === '42703' || (error.message && error.message.includes('column') && error.message.includes('does not exist'))) {
          const match = error.message.match(/column "([^"]+)"/);
          if (match && match[1] && currentPayload[match[1]] !== undefined) {
             console.warn(`Warning: Column '${match[1]}' does not exist in '${tableName}'. Skipping it.`);
             delete currentPayload[match[1]];
             continue;
          }
        }
        throw error;
      }
      return data;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreeToPolicies) {
      setError("Please agree to the Shop Owner Policy, Terms & Conditions, and Privacy Policy.");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      // 1. Get current logged-in user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !currentUser) {
        throw new Error("Could not retrieve current authenticated user. Please log in again.");
      }

      // 2. Insert role into public.user_roles
      // Use ignore duplicate / select first logic
      const { data: existingRoles } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("role", "shop_owner");

      if (!existingRoles || existingRoles.length === 0) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: currentUser.id,
            role: "shop_owner"
          });
        if (roleError) {
          console.warn("Could not insert shop_owner role:", roleError);
        }
      }

      // 3. Upsert into public.shop_owner_profiles (Do NOT update public.profiles)
      const { error: shopOwnerProfileError } = await supabase
        .from("shop_owner_profiles")
        .upsert({
          id: currentUser.id, // Primary key
          user_id: currentUser.id,
          owner_full_name: ownerName,
          mobile_number: mobileNumber,
          email_address: email,
          business_whatsapp_number: whatsapp,
          profile_photo_url: profilePhotoUrl || null,
          kyc_status: "pending",
          is_active: true
        });

      if (shopOwnerProfileError) {
         throw shopOwnerProfileError;
      }

      // 4. Insert Shop
      const generatedSlug = shopName.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      const shopPayload = {
        owner_id: currentUser.id,
        shop_name: shopName,
        slug: generatedSlug,
        category,
        district,
        city,
        area,
        address,
        phone: mobileNumber,
        whatsapp_number: whatsapp,
        whatsapp: whatsapp, // fallback for schema differences
        opening_time: openingTime,
        closing_time: closingTime,
        weekly_off_day: weeklyOff,
        selected_template: template,
        approval_status: "pending",
        is_active: false
      };

      const shopData = await insertWithRetry("shops", shopPayload);

      if (!shopData || !shopData.id) {
        throw new Error("Failed to insert shop data successfully.");
      }

      // 5. Insert Services (with is_active: true)
      const validServices = services.filter(s => s.service_name && s.price && s.duration_minutes);
      
      for (const srv of validServices) {
         const servicePayload = {
            shop_id: shopData.id,
            service_name: srv.service_name,
            price: parseFloat(srv.price),
            duration_minutes: parseInt(srv.duration_minutes, 10),
            category: category, // Inherit from shop category
            is_active: true
         };
         try {
            await insertWithRetry("shop_services", servicePayload);
         } catch (err) {
            console.error("Failed to insert service:", err);
         }
      }

      // Record consent
      await supabase.rpc('accept_policy_consent', {
        p_policy_slug: 'owner-policy',
        p_version: '1.0.0'
      });

      setSuccess(true);
      localStorage.removeItem("nexora_owner_registration_draft");
      localStorage.removeItem("nexora_owner_registration_draft");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Something went wrong during registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Authentication Required</h2>
          <p className="text-slate-500 text-sm">Please login to register your business.</p>
          <div className="mt-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Your business registration has been submitted.</h2>
          <p className="text-slate-500 text-sm mb-8">Nexora team will review and approve your shop soon.</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigateTo("/owner-dashboard")}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition cursor-pointer shadow-md shadow-blue-500/20"
            >
              Go to Owner Dashboard
            </button>
            <button 
              onClick={() => navigateTo("/")}
              className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <header className="bg-white px-4 py-4 border-b border-slate-100 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Nexora Owner</h1>
        </div>
        <button onClick={() => navigateTo("/")} className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer">
          Cancel
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Register Your Business</h1>
          <p className="text-slate-500 text-sm">Create your Nexora SalonOS shop profile and start building your free website.</p>
        </div>

        
        {/* Progress Stepper & Draft Status */}
        <div className="mb-8 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 px-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registration Progress</span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                {draftStatus === "saving" && <><span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> Saving draft...</>}
                {draftStatus === "saved" && <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Draft saved</>}
                {draftStatus === "restored" && <><Sparkles className="w-3.5 h-3.5 text-blue-500" /> Draft restored</>}
                {draftStatus === "cleared" && <><AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Draft cleared</>}
              </span>
              {(draftStatus === "saved" || draftStatus === "restored") && (
                <button type="button" onClick={clearDraft} className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer bg-rose-50 px-3 py-1 rounded-full">
                  Clear All
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar pb-2 px-2 snap-x">
            {[
              { id: 1, label: "Owner Details" },
              { id: 2, label: "Business Details" },
              { id: 3, label: "Timing" },
              { id: 4, label: "Website Setup" },
              { id: 5, label: "Services" },
            ].map((step, idx) => {
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-center shrink-0 snap-start">
                  <div className={"flex flex-col items-center gap-2 " + (isActive ? 'opacity-100' : isCompleted ? 'opacity-100' : 'opacity-40')}>
                    <div className={"w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 " +
                      (isActive ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20' : 
                        isCompleted ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 
                        'bg-slate-50 border-slate-200 text-slate-400')
                    }>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                    </div>
                    <span className={"text-[10px] font-bold uppercase tracking-wider " + (isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400')}>
                      {step.label}
                    </span>
                  </div>
                  {idx < 4 && (
                    <div className={"w-8 sm:w-16 h-[2px] mx-2 sm:mx-4 rounded-full " + (isCompleted ? 'bg-emerald-200' : 'bg-slate-100')} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        
        {/* Progress Stepper & Draft Status */}
        <div className="mb-8 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 px-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registration Progress</span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                {draftStatus === "saving" && <><span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> Saving draft...</>}
                {draftStatus === "saved" && <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Draft saved</>}
                {draftStatus === "restored" && <><Sparkles className="w-3.5 h-3.5 text-blue-500" /> Draft restored</>}
                {draftStatus === "cleared" && <><AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Draft cleared</>}
              </span>
              {(draftStatus === "saved" || draftStatus === "restored") && (
                <button type="button" onClick={clearDraft} className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer bg-rose-50 px-3 py-1 rounded-full">
                  Clear Draft
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar pb-2 px-2 snap-x">
            {[
              { id: 1, label: "Owner Details" },
              { id: 2, label: "Business Details" },
              { id: 3, label: "Timing" },
              { id: 4, label: "Website Setup" },
              { id: 5, label: "Services" },
            ].map((step, idx) => {
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-center shrink-0 snap-start">
                  <div className={"flex flex-col items-center gap-2 " + (isActive ? 'opacity-100' : isCompleted ? 'opacity-100' : 'opacity-40')}>
                    <div className={"w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 " +
                      (isActive ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20' : 
                        isCompleted ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 
                        'bg-slate-50 border-slate-200 text-slate-400')
                    }>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                    </div>
                    <span className={"text-[10px] font-bold uppercase tracking-wider " + (isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400')}>
                      {step.label}
                    </span>
                  </div>
                  {idx < 4 && (
                    <div className={"w-8 sm:w-16 h-[2px] mx-2 sm:mx-4 rounded-full " + (isCompleted ? 'bg-emerald-200' : 'bg-slate-100')} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-start gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Owner Details */}
          <section onClickCapture={() => setCurrentStep(1)} onFocusCapture={() => setCurrentStep(1)} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">1. Owner Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profile Photo Upload */}
              <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-md flex items-center justify-center shrink-0">
                  {profilePhotoUrl ? (
                    <img 
                      src={profilePhotoUrl} 
                      alt="Owner Profile" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center">
                      <Camera className="w-8 h-8 mb-1" />
                    </div>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col items-center sm:items-start gap-2">
                  <span className="text-sm font-bold text-slate-800">Owner Profile Photo</span>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <label className={"px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-2 " + (uploadingPhoto ? "opacity-50 pointer-events-none" : "")}>
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp" 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                        disabled={uploadingPhoto}
                      />
                    </label>
                    
                    {profilePhotoUrl && (
                      <button 
                        type="button" 
                        onClick={handleRemovePhoto} 
                        disabled={uploadingPhoto}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer border border-rose-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove Photo
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 mt-1 text-center sm:text-left">
                    Accepted formats: JPG, PNG, WEBP. Max size: 5MB.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Owner Full Name</label>
                <input required type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Mobile Number</label>
                <input required type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="+91 9876543210" />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <button
                    type="button"
                    onClick={handleUseAccountEmail}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold transition flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
                  >
                    Use my account email
                  </button>
                </div>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="owner@example.com" />
              </div>
            </div>
          </section>

          {/* Section 2: Business Details */}
          <section onClickCapture={() => setCurrentStep(2)} onFocusCapture={() => setCurrentStep(2)} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Store className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">2. Business Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Shop Name</label>
                <input required type="text" value={shopName} onChange={e => setShopName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Luxe Hair & Spa" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Business Category</label>
                <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all">
                  <option value="hair_salon">Hair Salon</option>
                  <option value="beauty_parlour">Beauty Parlour</option>
                  <option value="barber">Barber Shop</option>
                  <option value="spa">Spa Center</option>
                  <option value="massage">Massage Center</option>
                  <option value="tattoo">Tattoo Studio</option>
                  <option value="nail_art">Nail Art Studio</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Business WhatsApp Number</label>
                <input required type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">District</label>
                <input type="text" value={district} onChange={e => setDistrict(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Jaipur" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">City</label>
                <input required type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Jaipur" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Area</label>
                <input required type="text" value={area} onChange={e => setArea(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Malviya Nagar" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Full Address</label>
                <textarea required value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all resize-none min-h-[80px]" placeholder="Shop 10, Main Street..." />
              </div>
            </div>
          </section>

          {/* Section 3: Business Timing */}
          <section onClickCapture={() => setCurrentStep(3)} onFocusCapture={() => setCurrentStep(3)} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">3. Business Timing</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Opening Time</label>
                <input required type="time" value={openingTime} onChange={e => setOpeningTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Closing Time</label>
                <input required type="time" value={closingTime} onChange={e => setClosingTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Weekly Off Day</label>
                <select value={weeklyOff} onChange={e => setWeeklyOff(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all">
                  <option>None</option>
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                  <option>Saturday</option>
                  <option>Sunday</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 4: Website Setup */}
          <section onClickCapture={() => setCurrentStep(4)} onFocusCapture={() => setCurrentStep(4)} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Globe className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">4. Website Setup</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Royal Luxe */}
              <div 
                onClick={() => setTemplate("royal_luxe")}
                className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${template === "royal_luxe" ? "border-blue-600 bg-blue-50/30" : "border-slate-100 bg-white hover:border-slate-200"}`}
              >
                {template === "royal_luxe" && (
                   <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                     <CheckCircle2 className="w-3 h-3" /> Selected
                   </div>
                )}
                <div className="w-full h-32 bg-slate-900 rounded-xl p-3 flex flex-col gap-2 overflow-hidden border border-slate-800 mb-4 pointer-events-none">
                  <div className="w-full h-8 bg-slate-800 rounded flex items-center justify-between px-2">
                    <div className="w-12 h-2 bg-slate-700 rounded"></div>
                    <div className="w-8 h-2 bg-amber-500 rounded"></div>
                  </div>
                  <div className="w-2/3 h-4 bg-slate-700 rounded mt-2"></div>
                  <div className="w-1/2 h-2 bg-slate-600 rounded"></div>
                  <div className="flex gap-2 mt-auto">
                    <div className="w-8 h-8 bg-slate-800 rounded-md shrink-0"></div>
                    <div className="w-8 h-8 bg-slate-800 rounded-md shrink-0"></div>
                    <div className="w-8 h-8 bg-slate-800 rounded-md shrink-0"></div>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Royal Luxe</h3>
                <p className="text-xs text-slate-500 mb-2">Dark luxury preview with gold accent</p>
                <div className="text-[10px] font-semibold text-amber-600 bg-amber-50 inline-block px-2 py-1 rounded-md">
                  Best for: Premium Salon, Luxury Spa, High-End Beauty Studio
                </div>
              </div>

              {/* Modern Salon */}
              <div 
                onClick={() => setTemplate("modern_salon")}
                className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${template === "modern_salon" ? "border-blue-600 bg-blue-50/30" : "border-slate-100 bg-white hover:border-slate-200"}`}
              >
                {template === "modern_salon" && (
                   <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                     <CheckCircle2 className="w-3 h-3" /> Selected
                   </div>
                )}
                <div className="w-full h-32 bg-slate-50 rounded-xl p-3 flex flex-col gap-2 overflow-hidden border border-slate-200 mb-4 pointer-events-none">
                  <div className="w-full h-8 bg-white rounded flex items-center justify-between px-2 shadow-sm">
                    <div className="w-12 h-2 bg-slate-200 rounded"></div>
                    <div className="w-8 h-2 bg-blue-600 rounded"></div>
                  </div>
                  <div className="w-2/3 h-4 bg-slate-300 rounded mt-2"></div>
                  <div className="w-1/2 h-2 bg-slate-200 rounded"></div>
                  <div className="flex gap-2 mt-auto">
                    <div className="w-8 h-8 bg-white rounded-md shrink-0 shadow-sm"></div>
                    <div className="w-8 h-8 bg-white rounded-md shrink-0 shadow-sm"></div>
                    <div className="w-8 h-8 bg-white rounded-md shrink-0 shadow-sm"></div>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Modern Salon</h3>
                <p className="text-xs text-slate-500 mb-2">Clean white modern preview with blue accent</p>
                <div className="text-[10px] font-semibold text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded-md">
                  Best for: Hair Salon, Barber Shop, Unisex Salon
                </div>
              </div>

              {/* Professional Beauty */}
              <div 
                onClick={() => setTemplate("professional_beauty")}
                className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${template === "professional_beauty" ? "border-blue-600 bg-blue-50/30" : "border-slate-100 bg-white hover:border-slate-200"}`}
              >
                {template === "professional_beauty" && (
                   <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                     <CheckCircle2 className="w-3 h-3" /> Selected
                   </div>
                )}
                <div className="w-full h-32 bg-fuchsia-50 rounded-xl p-3 flex flex-col gap-2 overflow-hidden border border-fuchsia-100 mb-4 pointer-events-none">
                  <div className="w-full h-8 bg-white/60 rounded flex items-center justify-center px-2">
                    <div className="w-16 h-2 bg-fuchsia-200 rounded"></div>
                  </div>
                  <div className="w-full h-4 bg-fuchsia-300 rounded mt-2"></div>
                  <div className="w-3/4 h-2 bg-fuchsia-200 rounded mx-auto"></div>
                  <div className="w-16 h-6 bg-fuchsia-600 rounded-full mx-auto mt-auto"></div>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Professional Beauty</h3>
                <p className="text-xs text-slate-500 mb-2">Soft beauty preview with elegant pink/purple accent</p>
                <div className="text-[10px] font-semibold text-fuchsia-600 bg-fuchsia-50 inline-block px-2 py-1 rounded-md">
                  Best for: Beauty Parlour, Nail Art, Makeup Studio
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Top Services */}
          <section onClickCapture={() => setCurrentStep(5)} onFocusCapture={() => setCurrentStep(5)} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">5. Top Services</h2>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{services.length}/5</span>
            </div>
            
            <p className="text-xs text-slate-500 mb-4">Add minimum 3 and maximum 5 services for your initial profile.</p>

            <div className="space-y-4">
              {services.map((srv, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 relative group">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-3xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Service Name</label>
                      <input required type="text" value={srv.service_name} onChange={e => handleServiceChange(idx, "service_name", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" placeholder="e.g. Haircut" />
                    </div>
                    <div>
                      <label className="block text-3xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Price (₹)</label>
                      <input required type="number" min="0" value={srv.price} onChange={e => handleServiceChange(idx, "price", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" placeholder="500" />
                    </div>
                    <div>
                      <label className="block text-3xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Duration (mins)</label>
                      <input required type="number" min="0" value={srv.duration_minutes} onChange={e => handleServiceChange(idx, "duration_minutes", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" placeholder="30" />
                    </div>
                  </div>
                  {services.length > 3 && (
                    <button type="button" onClick={() => removeService(idx)} className="absolute -top-3 -right-3 w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center font-bold shadow-sm cursor-pointer hover:bg-rose-200 transition-colors">
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {services.length < 5 && (
              <button type="button" onClick={addService} className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 font-bold rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm">
                + Add Another Service
              </button>
            )}
          </section>

          <div className="flex justify-center mb-4">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              {draftStatus === "saving" && <><span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> Saving draft...</>}
              {draftStatus === "saved" && <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Draft saved</>}
              {draftStatus === "restored" && <><Sparkles className="w-3.5 h-3.5 text-blue-500" /> Draft restored</>}
              {draftStatus === "cleared" && <><AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Draft cleared</>}
            </span>
          </div>
          
          <div className="pt-4 border-t border-slate-100 mt-4 mb-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                <input 
                  type="checkbox" 
                  checked={agreeToPolicies}
                  onChange={(e) => setAgreeToPolicies(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded-md border-2 border-slate-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium leading-relaxed select-none">
                I agree to the <a href="/owner-policy" target="_blank" className="text-blue-600 hover:underline">Shop Owner Policy</a>, <a href="/terms-and-conditions" target="_blank" className="text-blue-600 hover:underline">Terms & Conditions</a>, and <a href="/privacy-policy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</a>.
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 text-base transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit for Approval"} <ChevronRight className="w-5 h-5" />
          </button>
        </form>
      </main>
    </div>
  );
}
