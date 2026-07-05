import React, { useState, useEffect } from "react";
import { ArrowLeft, Sparkles, Search, Clock, Star, User, Camera, Save, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

interface EditProfileProps {
  navigateTo: (path: string) => void;
}

const EditProfile = ({ navigateTo }: EditProfileProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    city: "",
    area: "",
    email: "",
    role: "",
    avatar_url: ""
  });

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, phone, city, area, email, role, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setFormData({
            full_name: data.full_name || "",
            phone: data.phone || "",
            city: data.city || "",
            area: data.area || "",
            email: data.email || "",
            role: data.role || "Customer",
            avatar_url: data.avatar_url || ""
          });
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setMessage(null);

      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];

      // 1. Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Please upload a JPEG, PNG or WebP image.");
      }

      // 2. Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB.");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const fileExt = file.name.split('.').pop() || "jpg";
      const timestamp = Date.now();
      const filePath = `${user.id}/avatar-${timestamp}.${fileExt}`;

      // 3. Upload image to 'profile-avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Photo upload failed. Please try again.");
      }

      // 4. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(filePath);

      // 5. Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setFormData({ ...formData, avatar_url: publicUrl });
      setMessage({ type: "success", text: "Profile photo updated successfully." });
    } catch (error: any) {
      console.error("Avatar upload process error:", error);
      setMessage({ type: "error", text: error.message || "Photo upload failed. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone || !formData.city || !formData.area) {
      setMessage({ type: "error", text: "All fields are required." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          city: formData.city,
          area: formData.area
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Profile updated successfully." });
      setTimeout(() => navigateTo("/profile"), 1500);
    } catch (err) {
      setMessage({ type: "error", text: "Profile update failed. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <TopBar 
        title="Edit Profile" 
        subtitle="Update your Nexora customer details"
        onBack={() => navigateTo("/profile")} 
        showHome={true}
        onHome={() => navigateTo("/customer")}
        showMainSite={true}
        onMainSite={() => navigateTo("/")}
      />

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center py-4">
          <div className="relative group">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-3xl border-4 border-white shadow-sm overflow-hidden">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{formData.full_name ? formData.full_name[0] : "N"}</span>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full shadow-lg hover:scale-110 transition cursor-pointer">
              <Camera className="w-4 h-4" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
          {message && (
            <div className={`p-3 rounded-xl text-xs font-bold text-center ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Full Name</label>
              <input 
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Mobile Number</label>
              <input 
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                placeholder="Enter mobile number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">City</label>
                <input 
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                  placeholder="Jaipur"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Area</label>
                <input 
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                  placeholder="C-Scheme"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-50">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Email (Read Only)</label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-400 cursor-not-allowed">
                {formData.email}
              </div>
              <p className="text-[9px] text-slate-400 mt-1 ml-1 italic">Email cannot be changed here.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Role</label>
              <div className="inline-flex px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">
                {formData.role}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={() => navigateTo("/profile")}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <BottomNav currentPath="/profile/edit" navigateTo={navigateTo} />
    </div>
  );
};

export default EditProfile;
