import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, CheckCircle, X, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface JobDocumentUploadProps {
  onUploadSuccess: (assetId: string, publicUrl: string) => void;
  assetType?: 'resume' | 'portfolio' | 'certificate' | 'experience_letter' | 'other';
  label?: string;
  maxSizeMB?: number;
}

export default function JobDocumentUpload({
  onUploadSuccess,
  assetType = 'resume',
  label = 'Upload Resume',
  maxSizeMB = 10
}: JobDocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    // Validate type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/webp'
    ];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PDF, DOC, DOCX, or Image.');
      return;
    }

    setError(null);
    setIsUploading(true);
    setFileName(file.name);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Authentication required');

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.session.user.id}/${assetType}_${Date.now()}.${fileExt}`;

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('job-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Register in Database via RPC
      const { data: assetId, error: rpcError } = await supabase.rpc('register_job_document_asset', {
        p_asset_type: assetType,
        p_storage_path: filePath,
        p_file_name: file.name,
        p_file_size: file.size,
        p_mime_type: file.type
      });

      if (rpcError) throw rpcError;

      // 3. Get Public URL (if needed, but bucket is private, so we might need signed URL later)
      // For now, we just pass the assetId back
      const { data: { publicUrl } } = supabase.storage
        .from('job-documents')
        .getPublicUrl(filePath);

      setSuccess(true);
      onUploadSuccess(assetId, publicUrl);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setFileName(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
      />

      {!success ? (
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 transition-all ${
            isUploading ? 'bg-slate-50 border-blue-200' : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">Uploading {fileName}...</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Please do not close this window</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500">PDF, DOC, DOCX or Image (Max {maxSizeMB}MB)</p>
              </div>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-bold"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-emerald-900 truncate">{fileName}</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Upload successful</p>
            </div>
          </div>
          <button 
            onClick={reset}
            className="p-2 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
