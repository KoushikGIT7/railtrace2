import React from 'react';
import { Badge } from './Badge';
import { Button } from './Button';

interface ReportCardProps {
  title: string;
  category: string;
  period: string;
  generatedAt: Date;
  status: 'ready' | 'generating' | 'failed';
  onDownload?: () => void;
  icon: React.ReactNode;
  mediaUrl?: string;
  mediaAlt?: string;
}

export function ReportCard({ title, category, period, generatedAt, status, onDownload, icon, mediaUrl, mediaAlt }: ReportCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{title}</h4>
            <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-600">
              <span className="capitalize truncate max-w-[120px] sm:max-w-none">{category}</span>
              <span>•</span>
              <span className="truncate max-w-[140px] sm:max-w-none">{period}</span>
              <span>•</span>
              <span className="truncate max-w-[160px] sm:max-w-none">{generatedAt.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          <Badge variant={status === 'ready' ? 'success' : status === 'generating' ? 'warning' : 'error'} size="sm">
            {status}
          </Badge>
          {status === 'ready' && onDownload && (
            <Button variant="outline" size="sm" onClick={onDownload}>Download</Button>
          )}
        </div>
      </div>
      {mediaUrl && (
        <div className="w-full">
          <img src={mediaUrl} alt={mediaAlt || title} className="w-full h-48 sm:h-56 object-contain bg-gray-50" loading="lazy" />
        </div>
      )}
    </div>
  );
}


