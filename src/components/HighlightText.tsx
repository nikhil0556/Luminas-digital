import React from 'react';
import { getHighlightedChunks } from '../utils/searchEngine';

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  query,
  className = '',
  highlightClassName = 'bg-indigo-500/25 text-indigo-200 font-semibold px-0.5 rounded'
}) => {
  if (!query || !query.trim() || !text) {
    return <span className={className}>{text}</span>;
  }

  const chunks = getHighlightedChunks(text, query);

  return (
    <span className={className}>
      {chunks.map((chunk, index) =>
        chunk.match ? (
          <mark key={index} className={highlightClassName}>
            {chunk.text}
          </mark>
        ) : (
          <React.Fragment key={index}>{chunk.text}</React.Fragment>
        )
      )}
    </span>
  );
};
