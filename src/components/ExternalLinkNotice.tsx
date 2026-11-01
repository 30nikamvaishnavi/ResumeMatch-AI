import React from 'react';
import { ExternalLink, Info } from 'lucide-react';

interface ExternalLinkNoticeProps {
  detectedUrls: string[];
}

export const ExternalLinkNotice: React.FC<ExternalLinkNoticeProps> = ({ detectedUrls }) => {
  if (!detectedUrls || detectedUrls.length === 0) return null;

  return (
    <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sky-900 flex items-start gap-3">
      <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg shrink-0 mt-0.5">
        <ExternalLink className="w-4 h-4" />
      </div>
      <div className="text-sm">
        <div className="font-semibold text-sky-950 flex items-center gap-2">
          <span>External links detected in resume text</span>
          <span className="text-xs bg-sky-200 text-sky-800 font-mono px-2 py-0.5 rounded">
            {detectedUrls.join(', ')}
          </span>
        </div>
        <p className="mt-1 text-sky-800 leading-relaxed">
          <strong>Notice:</strong> External websites, GitHub repositories, or portfolio pages were not crawled or reviewed. All skills, metrics, and rewrites are evaluated strictly against the text submitted in the resume.
        </p>
      </div>
    </div>
  );
};
