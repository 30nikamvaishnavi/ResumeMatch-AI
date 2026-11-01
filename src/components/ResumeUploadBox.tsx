import React, { useState, useRef } from 'react';
import { FileText, Upload, AlertTriangle, Check, Loader2, Sparkles } from 'lucide-react';
import { parseCandidateBullets } from '../utils/verifier.ts';

interface ResumeUploadBoxProps {
  resumeText: string;
  onChange: (text: string) => void;
  onClearSample?: () => void;
}

export const ResumeUploadBox: React.FC<ResumeUploadBoxProps> = ({
  resumeText,
  onChange,
  onClearSample,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = resumeText.length;
  const isTooLong = charCount > 25000;
  const candidateBullets = parseCandidateBullets(resumeText);

  const handleFileProcess = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);

    try {
      if (file.name.endsWith('.txt')) {
        const text = await file.text();
        onChange(text);
        if (onClearSample) onClearSample();
      } else if (file.name.endsWith('.pdf')) {
        // Send base64 to server endpoint /api/extract-pdf
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1];
            const res = await fetch('/api/extract-pdf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ base64 }),
            });

            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || 'Failed to extract text from PDF.');
            }

            const data = await res.json();
            onChange(data.text);
            if (onClearSample) onClearSample();
          } catch (e: any) {
            setUploadError(e.message || 'PDF extraction failed.');
          } finally {
            setIsUploading(false);
          }
        };
        reader.readAsDataURL(file);
        return;
      } else {
        throw new Error('Unsupported format. Please upload a .pdf or .txt file.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'File upload error.');
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Candidate Resume</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
              {candidateBullets.length} bullet(s) detected
            </span>
            <span className={`text-xs ${isTooLong ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
              {charCount.toLocaleString()} chars
            </span>
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`mb-3 p-3 rounded-xl border border-dashed transition-all flex items-center justify-between gap-3 text-xs ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center gap-2">
            {isUploading ? (
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 text-slate-500" />
            )}
            <span className="text-slate-600">
              {isUploading
                ? 'Parsing PDF content...'
                : 'Upload resume (.pdf, .txt) or drag & drop'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            Browse File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
          />
        </div>

        {uploadError && (
          <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {isTooLong && (
          <div className="mb-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Warning:</strong> Very long text ({charCount.toLocaleString()} chars). For optimal accuracy, text beyond 25,000 characters will be truncated.
            </span>
          </div>
        )}

        {/* Text Area */}
        <textarea
          value={resumeText}
          onChange={(e) => {
            onChange(e.target.value);
            if (onClearSample) onClearSample();
          }}
          placeholder="Paste candidate resume with Experience, Projects, Education, and Skills..."
          className="w-full min-h-[220px] p-3 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all leading-relaxed resize-y"
        />
      </div>
    </div>
  );
};
