import React, { useState } from 'react';

interface CopyButtonProps {
  value: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function CopyButton({ value, className = '', size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors ${size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'} ${className}`}
      title={copied ? 'Copied!' : 'Copy'}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}


