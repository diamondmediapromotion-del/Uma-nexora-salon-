import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Globe, 
  Layout, 
  Check, 
  ArrowLeft, 
  Sparkles, 
  Save, 
  Eye, 
  X, 
  Image as ImageIcon, 
  Link as LinkIcon,
  HelpCircle,
  AlertCircle,
  Trash2,
  Upload,
  Loader2,
  Plus
} from "lucide-react";
import PublicShopWebsite from "./PublicShopWebsite";

interface OwnerCreateWebsiteProps {
  navigateTo: (path: string) => void;
}

export default function OwnerCreateWebsite({ navigateTo }: OwnerCreateWebsiteProps) {
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Customization Form States
  const [shopName, setShopName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("modern_salon");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  // User and Loading Flags
  const [user, setUser] = useState<any>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  
  // Preview Drawer/Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    async function loadShop() {
      try {
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        if (userErr || !user) {
          navigateTo("/login");
          return;
        }
        setUser(user);

        // Fetch user's registered shop
        const { data, error } = await supabase
          .from("shops")
          .select("*")
          .eq("owner_id", user.id)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error loading shop:", error);
        } else if (data) {
          setShop(data);
          setShopName(data.shop_name || "");
          setSlug(data.slug || "");
          setTagline(data.tagline || "");
          setDescription(data.description || "");
          setTemplate(data.selected_template || "modern_salon");
          setCoverImageUrl(data.banner_url || data.cover_image_url || "");
          setLogoUrl(data.logo_url || "");
          setGalleryUrls(data.gallery_urls || []);
        }
      } catch (err) {
        console.error("Unexpected error loading builder:", err);
      } finally {
        setLoading(false);
      }
    }

    loadShop();
  }, [navigateTo]);

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    setSaving(true);
    setMessage(null);

    // Apply SLUG RULE:
    // If slug exists, use it. If slug missing, generate slug from shop_name on save
    let finalSlug = slug.trim();
    if (!finalSlug) {
      finalSlug = shopName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // remove special characters
        .trim()
        .replace(/\s+/g, "-"); // spaces to hyphen
    } else {
      finalSlug = finalSlug
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    }

    try {
      const { error } = await supabase
        .from("shops")
        .update({
          shop_name: shopName,
          slug: finalSlug,
          tagline,
          description,
          selected_template: template,
          cover_image_url: coverImageUrl || null,
          banner_url: coverImageUrl || null,
          logo_url: logoUrl || null,
          gallery_urls: galleryUrls
        })
        .eq("id", shop.id);

      if (error) throw error;

      setSlug(finalSlug);
      // Update local shop reference for previews
      setShop((prev: any) => ({
        ...prev,
        shop_name: shopName,
        slug: finalSlug,
        tagline,
        description,
        selected_template: template,
        cover_image_url: coverImageUrl,
        banner_url: coverImageUrl,
        logo_url: logoUrl,
        gallery_urls: galleryUrls
      }));

      setMessage({ type: "success", text: "Your salon website settings have been saved successfully!" });
    } catch (err: any) {
      console.error("Error saving website changes:", err);
      setMessage({ type: "error", text: err.message || "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  // --- FILE UPLOADS LOGIC ---

  const validateFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/)) {
      return "Image must be JPG, PNG or WEBP.";
    }
    if (file.size > 10 * 1024 * 1024) {
      return "Image size must be under 10MB.";
    }
    return null;
  };

  const getStoragePathFromUrl = (url: string) => {
    if (!url) return null;
    const part = "/public/shop-media/";
    const idx = url.indexOf(part);
    if (idx !== -1) {
      const rawPath = url.substring(idx + part.length).split("?")[0];
      return decodeURIComponent(rawPath);
    }
    return null;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !shop) return;

    const validationError = validateFile(file);
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setUploadingLogo(true);
    setMessage(null);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const filePath = `${user.id}/${shop.id}/logo.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("shop-media")
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: publicUrlData } = supabase.storage
        .from("shop-media")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: dbErr } = await supabase
        .from("shops")
        .update({ logo_url: publicUrl })
        .eq("id", shop.id);

      if (dbErr) throw dbErr;

      setLogoUrl(publicUrl);
      setShop((prev: any) => ({ ...prev, logo_url: publicUrl }));
      setMessage({ type: "success", text: "Logo uploaded successfully." });
    } catch (err: any) {
      console.error("Error uploading logo:", err);
      setMessage({ type: "error", text: "Unable to upload image. Please try again." });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoRemove = async () => {
    if (!shop || !logoUrl) return;
    setUploadingLogo(true);
    setMessage(null);

    try {
      const path = getStoragePathFromUrl(logoUrl);
      if (path) {
        await supabase.storage.from("shop-media").remove([path]);
      }

      const { error: dbErr } = await supabase
        .from("shops")
        .update({ logo_url: null })
        .eq("id", shop.id);

      if (dbErr) throw dbErr;

      setLogoUrl("");
      setShop((prev: any) => ({ ...prev, logo_url: null }));
      setMessage({ type: "success", text: "Logo removed successfully." });
    } catch (err: any) {
      console.error("Error removing logo:", err);
      setMessage({ type: "error", text: "Failed to remove logo." });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !shop) return;

    const validationError = validateFile(file);
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setUploadingBanner(true);
    setMessage(null);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const filePath = `${user.id}/${shop.id}/banner.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("shop-media")
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: publicUrlData } = supabase.storage
        .from("shop-media")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: dbErr } = await supabase
        .from("shops")
        .update({ banner_url: publicUrl, cover_image_url: publicUrl })
        .eq("id", shop.id);

      if (dbErr) throw dbErr;

      setCoverImageUrl(publicUrl);
      setShop((prev: any) => ({ ...prev, banner_url: publicUrl, cover_image_url: publicUrl }));
      setMessage({ type: "success", text: "Banner uploaded successfully." });
    } catch (err: any) {
      console.error("Error uploading banner:", err);
      setMessage({ type: "error", text: "Unable to upload image. Please try again." });
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleBannerRemove = async () => {
    if (!shop || !coverImageUrl) return;
    setUploadingBanner(true);
    setMessage(null);

    try {
      const path = getStoragePathFromUrl(coverImageUrl);
      if (path) {
        await supabase.storage.from("shop-media").remove([path]);
      }

      const { error: dbErr } = await supabase
        .from("shops")
        .update({ banner_url: null, cover_image_url: null })
        .eq("id", shop.id);

      if (dbErr) throw dbErr;

      setCoverImageUrl("");
      setShop((prev: any) => ({ ...prev, banner_url: null, cover_image_url: null }));
      setMessage({ type: "success", text: "Banner removed successfully." });
    } catch (err: any) {
      console.error("Error removing banner:", err);
      setMessage({ type: "error", text: "Failed to remove banner." });
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user || !shop) return;

    const currentCount = galleryUrls.length;
    if (currentCount >= 10) {
      setMessage({ type: "error", text: "You can upload a maximum of 10 gallery images." });
      return;
    }

    setUploadingGallery(true);
    setMessage(null);

    try {
      const newUrls = [...galleryUrls];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (newUrls.length >= 10) {
          setMessage({ type: "error", text: "Max 10 gallery images allowed. Some images were skipped." });
          break;
        }

        const validationError = validateFile(file);
        if (validationError) {
          setMessage({ type: "error", text: `${file.name}: ${validationError}` });
          continue;
        }

        const ext = file.name.split(".").pop()?.toLowerCase() || "png";
        const timestamp = Date.now() + i;
        const filePath = `${user.id}/${shop.id}/gallery/${timestamp}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("shop-media")
          .upload(filePath, file, { upsert: true });

        if (uploadErr) throw uploadErr;

        const { data: publicUrlData } = supabase.storage
          .from("shop-media")
          .getPublicUrl(filePath);

        newUrls.push(publicUrlData.publicUrl);
      }

      const { error: dbErr } = await supabase
        .from("shops")
        .update({ gallery_urls: newUrls })
        .eq("id", shop.id);

      if (dbErr) throw dbErr;

      setGalleryUrls(newUrls);
      setShop((prev: any) => ({ ...prev, gallery_urls: newUrls }));
      setMessage({ type: "success", text: "Gallery updated successfully." });
    } catch (err: any) {
      console.error("Error uploading gallery image:", err);
      setMessage({ type: "error", text: "Unable to upload image. Please try again." });
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleGalleryRemove = async (indexToRemove: number) => {
    if (!shop) return;
    const urlToRemove = galleryUrls[indexToRemove];
    if (!urlToRemove) return;

    setUploadingGallery(true);
    setMessage(null);

    try {
      const path = getStoragePathFromUrl(urlToRemove);
      if (path) {
        await supabase.storage.from("shop-media").remove([path]);
      }

      const updatedGallery = galleryUrls.filter((_, idx) => idx !== indexToRemove);

      const { error: dbErr } = await supabase
        .from("shops")
        .update({ gallery_urls: updatedGallery })
        .eq("id", shop.id);

      if (dbErr) throw dbErr;

      setGalleryUrls(updatedGallery);
      setShop((prev: any) => ({ ...prev, gallery_urls: updatedGallery }));
      setMessage({ type: "success", text: "Gallery updated successfully." });
    } catch (err: any) {
      console.error("Error removing gallery image:", err);
      setMessage({ type: "error", text: "Failed to remove gallery image." });
    } finally {
      setUploadingGallery(false);
    }
  };

  // Preview Button Action
  const handlePreview = () => {
    if (!shop) return;

    // Check approval status:
    const isApproved = shop.approval_status === "approved" && shop.is_active === true;

    if (isApproved && slug) {
      // Open in a new tab or navigate directly
      navigateTo(`/shop/${slug}`);
    } else {
      // Toggle preview mode inside the builder only
      setIsPreviewOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p className="text-sm text-slate-500 font-medium">Loading Website Builder...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
            <Globe className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900">No Registered Salon Found</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Please register your salon details first to generate and customize your free booking website.
            </p>
          </div>
          <button 
            onClick={() => navigateTo("/owner-register")}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-lg transition cursor-pointer"
          >
            Register Your Business
          </button>
        </div>
      </div>
    );
  }

  // Pre-configured elegant template presets
  const templatesList = [
    {
      id: "modern_salon",
      name: "Modern Salon",
      desc: "Clean light layout with sharp typography and digital professional vibe.",
      previewColor: "bg-blue-600"
    },
    {
      id: "royal_luxe",
      name: "Royal Luxe",
      desc: "Immersive luxury dark design styled with fine gold colors for premium salons.",
      previewColor: "bg-amber-500"
    },
    {
      id: "professional_beauty",
      name: "Professional Beauty",
      desc: "Elegant light design with organic curves and pink/soft cosmetics styling.",
      previewColor: "bg-rose-500"
    }
  ];

  const currentPreviewData = {
    ...shop,
    shop_name: shopName,
    slug: slug || "demo-slug",
    tagline,
    description,
    selected_template: template,
    cover_image_url: coverImageUrl,
    banner_url: coverImageUrl,
    logo_url: logoUrl,
    gallery_urls: galleryUrls
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* Header bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigateTo("/owner-dashboard")}
            className="p-2 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <span className="text-3xs font-black text-slate-400 uppercase tracking-widest block">Nexora SalonOS</span>
            <h1 className="text-base font-black text-slate-900">Website Builder</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePreview}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            Preview Website
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        
        {/* Status Alert Banner */}
        <div className="p-4 rounded-3xl bg-amber-50/50 border border-amber-100/60 flex gap-3 mb-8">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-amber-900">Approval Status: {shop.approval_status === "approved" ? "Approved" : "Pending Approval"}</span>
            <p className="text-amber-800 font-light">
              {shop.approval_status === "approved" && shop.is_active
                ? `Your website is fully live for customers at: /shop/${slug || "slug"}`
                : "Your salon details are currently being reviewed. Your website will be accessible publicly once approved by our admin team."}
            </p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-3xl border mb-6 text-xs font-bold flex items-center gap-2 ${
            message.type === "success" 
              ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
              : "bg-rose-50 text-rose-800 border-rose-100"
          }`}>
            <Check className="w-4 h-4" />
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Main Website Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">1. Website Identity</h3>
              <p className="text-2xs text-slate-400 mt-0.5">Define your brand domain and heading text details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-3xs font-black uppercase tracking-wider text-slate-400">Salon Name on Website</label>
                <input 
                  required
                  type="text" 
                  value={shopName} 
                  onChange={(e) => setShopName(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-blue-600 outline-none transition-all font-semibold"
                  placeholder="e.g. Vogue Salon & Spa"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-3xs font-black uppercase tracking-wider text-slate-400">Link Slug (Subdomain)</label>
                  <span className="text-[10px] text-slate-400 font-medium">Letters, numbers & hyphens</span>
                </div>
                <div className="flex rounded-xl bg-slate-100 overflow-hidden border border-slate-200/80">
                  <span className="bg-slate-100 px-3 py-3 text-3xs text-slate-400 font-bold border-r border-slate-200">/shop/</span>
                  <input 
                    type="text" 
                    value={slug} 
                    onChange={(e) => setSlug(e.target.value)} 
                    className="w-full bg-white px-4 py-3 text-xs focus:ring-2 focus:ring-blue-600 outline-none transition-all font-mono font-bold"
                    placeholder="vogue-salon"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-3xs font-black uppercase tracking-wider text-slate-400">Brand Tagline / Catchy Slogan</label>
                <input 
                  type="text" 
                  value={tagline} 
                  onChange={(e) => setTagline(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  placeholder="e.g. Elevating your hair design and aesthetic excellence"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-3xs font-black uppercase tracking-wider text-slate-400">About Salon (Description)</label>
                <textarea 
                  rows={4}
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-blue-600 outline-none transition-all resize-none"
                  placeholder="Tell customers about your salon's heritage, certified beauty therapists, hygiene focus, etc."
                />
              </div>
            </div>
          </div>

          {/* Template Style Selection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">2. Template Design</h3>
              <p className="text-2xs text-slate-400 mt-0.5">Select a look that aligns with your salon's brand identity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templatesList.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setTemplate(tpl.id)}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between space-y-4 transition-all cursor-pointer ${
                    template === tpl.id 
                      ? "border-blue-600 ring-2 ring-blue-600/10 bg-blue-50/20" 
                      : "border-slate-100 hover:border-slate-200 bg-white"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 rounded-full ${tpl.previewColor}`}></span>
                      <h4 className="font-bold text-xs text-slate-900">{tpl.name}</h4>
                    </div>
                    <p className="text-3xs text-slate-400 leading-relaxed font-light">{tpl.desc}</p>
                  </div>
                  {template === tpl.id && (
                    <div className="self-end bg-blue-600 text-white rounded-full p-1">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Media assets */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">3. Media Assets</h3>
              <p className="text-2xs text-slate-400 mt-0.5">Upload high-quality images to showcase your business on your public website.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Asset upload */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-3xs font-black uppercase tracking-wider text-slate-400">Salon Logo</label>
                    <span className="text-[10px] text-slate-400">Case-insensitive JPG, PNG, WEBP. Max 10MB</span>
                  </div>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={handleLogoRemove}
                      disabled={uploadingLogo}
                      className="text-3xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-100 cursor-pointer disabled:opacity-50 animate-fade-in"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-slate-200/80 bg-white flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                    {uploadingLogo ? (
                      <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white text-[10px] font-bold">
                        <Loader2 className="w-4 h-4 animate-spin text-white mb-1" />
                        Saving...
                      </div>
                    ) : logoUrl ? (
                      <img src={logoUrl} alt="Logo Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center font-black text-xl text-slate-400">
                        {shopName ? shopName[0].toUpperCase() : "L"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-3xs font-bold rounded-xl cursor-pointer shadow-sm transition">
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingLogo ? "Uploading..." : "Select Logo File"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 font-medium">Shows in headers & overlays</p>
                  </div>
                </div>
              </div>

              {/* Banner Asset upload */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-3xs font-black uppercase tracking-wider text-slate-400">Website Hero Banner</label>
                    <span className="text-[10px] text-slate-400">Wide format. Max 10MB</span>
                  </div>
                  {coverImageUrl && (
                    <button
                      type="button"
                      onClick={handleBannerRemove}
                      disabled={uploadingBanner}
                      className="text-3xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-100 cursor-pointer disabled:opacity-50 animate-fade-in"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="relative aspect-[21/9] w-full rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex items-center justify-center">
                    {uploadingBanner ? (
                      <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white text-[10px] font-bold z-10">
                        <Loader2 className="w-5 h-5 animate-spin text-white mb-1" />
                        Saving...
                      </div>
                    ) : coverImageUrl ? (
                      <img src={coverImageUrl} alt="Banner Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center opacity-15">
                        <ImageIcon className="w-8 h-8 text-white animate-pulse" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-3xs font-bold rounded-xl cursor-pointer shadow-sm transition">
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingBanner ? "Uploading..." : "Select Banner File"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleBannerUpload}
                        disabled={uploadingBanner}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 font-medium inline-block ml-2.5">Shows as cover image background</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Images Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-3xs font-black uppercase tracking-wider text-slate-400">Salon Image Gallery ({galleryUrls.length} / 10)</h4>
                  <span className="text-[10px] text-slate-400">Showcase beautiful images of your salon interior, hair treatments or staff works. Max 10.</span>
                </div>
                {galleryUrls.length < 10 && (
                  <label className="inline-flex items-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 text-3xs font-bold rounded-xl cursor-pointer shadow-sm transition">
                    <Plus className="w-3.5 h-3.5" />
                    Add Images
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleGalleryUpload}
                      disabled={uploadingGallery}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {uploadingGallery && (
                <div className="p-3 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-3xs font-bold flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating gallery images...
                </div>
              )}

              {galleryUrls.length === 0 ? (
                <div className="border-2 border-dashed border-slate-100 rounded-2xl py-8 text-center text-3xs text-slate-400 font-medium bg-slate-50/50">
                  No images uploaded yet. Create a stunning portfolio by uploading images.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {galleryUrls.map((url, index) => (
                    <div key={index} className="group relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-2xs">
                      <img src={url} alt={`Gallery ${index}`} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" />
                      <button
                        type="button"
                        onClick={() => handleGalleryRemove(index)}
                        className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Nexora Payment QR - Read Only section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">4. Salon QR & Payment Gateway</h3>
              <p className="text-2xs text-slate-400 mt-0.5">Configure how customers make payments at your salon.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-slate-900">Nexora SalonOS Payments Active</span>
                  <p className="text-slate-500 font-light leading-relaxed">
                    Your shop website will show Nexora SalonOS company QR after approval. Owner personal QR is not allowed. 
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200/80 pt-3 text-[10px] text-slate-400">
                <span className="font-bold text-slate-500 uppercase block mb-1">Company QR Policy Checklist</span>
                <ul className="list-disc list-inside space-y-1">
                  <li>Owner cannot upload or configure any personal QR codes.</li>
                  <li>All payments are securely processed and verified by Nexora.</li>
                  <li>Payments are credited to your owner wallet minus the 10% platform commission.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigateTo("/owner-dashboard")}
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition cursor-pointer"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-55 text-white text-xs font-bold rounded-2xl transition cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-500/15"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Changes..." : "Save Website Settings"}
            </button>
          </div>

        </form>
      </div>

      {/* Embedded Live Preview Modal inside the Builder */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
            
            {/* Live Preview Bar */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="inline-flex w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sandbox Preview Mode</span>
              </div>
              <p className="text-3xs text-slate-500 hidden md:block italic">
                Only visible inside the builder because the salon is pending admin approval.
              </p>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Live Web View */}
            <div className="flex-1 overflow-y-auto bg-slate-50">
              <PublicShopWebsite 
                previewData={currentPreviewData} 
                navigateTo={(path) => {
                  alert(`Interactions disabled in Builder Preview mode. Navigating to: ${path}`);
                }} 
              />
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
