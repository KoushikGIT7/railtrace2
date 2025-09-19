import React, { useState } from 'react';

interface TruncatedTextProps {
  text: string;
  prefixLen?: number;
  suffixLen?: number;
  className?: string;
}

export function TruncatedText({ text, prefixLen = 10, suffixLen = 6, className = '' }: TruncatedTextProps) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = text.length > prefixLen + suffixLen + 3;
  const display = expanded || !shouldTruncate
    ? text
    : `${text.slice(0, prefixLen)}...${text.slice(-suffixLen)}`;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="font-mono truncate" title={text}>{display}</span>
      {shouldTruncate && (
        <button
          type="button"
          className="text-xs text-blue-600 hover:text-blue-800"
          onClick={() => setExpanded(v => !v)}
        >
          {expanded ? 'Hide' : 'Show'}
        </button>
      )}
    </span>
  );
}


