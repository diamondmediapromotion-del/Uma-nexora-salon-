import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  CheckCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContactProps {
  navigateTo: (path: string) => void;
}

export default function Contact({ navigateTo }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message || !formData.email) {
      setErrorMsg("Please fill all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      
      const { data, error } = await supabase.rpc('submit_contact_inquiry', {
        p_name: formData.name,
        p_mobile: formData.mobile,
        p_email: formData.email,
        p_subject: formData.subject,
        p_message: formData.message
      });

      if (error) {
        console.error("Contact submission error:", error);
        setErrorMsg("Failed to submit inquiry. Please try again.");
      } else {
        setSubmittedId(data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigateTo('/trust')}
            className="p-2 hover:bg-slate-100 rounded-xl transition flex items-center gap-2 text-slate-600 font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trust Center
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Get in touch</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Have questions about Nexora? Fill out the form and our team will get back to you shortly.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 mt-1">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Headquarters</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Jaipur, Rajasthan<br/>
                  India (Launch Focus)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 mt-1">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Email Support</h4>
                <p className="text-sm text-slate-500 mt-1">support@nexora.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 mt-1">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Phone / WhatsApp</h4>
                <p className="text-sm text-slate-500 mt-1">+91 98765 43210</p>
                <p className="text-xs text-slate-400 mt-1">Mon-Fri, 10am - 6pm IST</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/20">
            {submittedId ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Message Sent!</h3>
                <p className="text-slate-500">Your message has been submitted successfully.</p>
                <div className="inline-block px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-700 mt-4">
                  Inquiry ID: {submittedId}
                </div>
                <div className="pt-8">
                  <button 
                    onClick={() => setSubmittedId(null)}
                    className="text-blue-600 font-bold text-sm hover:text-blue-700"
                  >
                    Send another message
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {errorMsg && (
                  <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold border border-rose-100">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mobile Number</label>
                    <input 
                      type="tel" 
                      value={formData.mobile}
                      onChange={e => setFormData({...formData, mobile: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address *</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Subject *</label>
                  <select 
                    required
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  >
                    <option value="">Select a topic...</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Shop Partnership">Shop Partnership</option>
                    <option value="Growth Partner">Growth Partner</option>
                    <option value="Brand Inquiry">Brand Inquiry</option>
                    <option value="Feedback">Feedback</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Message *</label>
                  <textarea 
                    required
                    rows={5}
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-5 h-5" /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
