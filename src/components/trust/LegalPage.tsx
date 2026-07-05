import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, FileText, Loader2, AlertCircle } from 'lucide-react';

interface LegalPageProps {
  slug: string;
  navigateTo: (path: string) => void;
}

export default function LegalPage({ slug, navigateTo }: LegalPageProps) {
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_public_legal_page', { p_slug: slug });
      
      if (error) {
        console.error("Error fetching legal page:", error);
      } else {
        setPageData(data);
      }
    } catch (err) {
      console.error("Failed to fetch legal page:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Fallback content if page not found or not published
  const fallbackTitle = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigateTo('/trust')}
            className="p-2 hover:bg-slate-100 rounded-xl transition flex items-center gap-2 text-slate-600 font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trust Center
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 mt-12">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-xl shadow-slate-200/20">
          
          <div className="bg-blue-50 text-blue-700 p-4 rounded-xl flex items-start gap-3 mb-8 border border-blue-100">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong>Draft Notice:</strong> This policy is for platform information. Final legal wording may be updated before the official launch.
            </div>
          </div>

          {!pageData ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h1 className="text-2xl font-black text-slate-900 mb-2">{fallbackTitle}</h1>
              <p className="text-slate-500">This policy is currently being updated or is not available publicly.</p>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-100 pb-8 mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
                  {pageData.title}
                </h1>
                {pageData.subtitle && (
                  <p className="text-lg text-slate-500 font-medium">{pageData.subtitle}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 mt-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
                  <span>Version {pageData.version}</span>
                  {pageData.effective_date && (
                    <>
                      <span>•</span>
                      <span>Effective: {new Date(pageData.effective_date).toLocaleDateString()}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>Updated: {new Date(pageData.updated_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="prose prose-slate prose-blue max-w-none">
                {/* Simple markdown render or preserve whitespace */}
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
                  {pageData.content_markdown || 'No content provided.'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
