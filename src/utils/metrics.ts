/**
 * Utility functions for calculating message metrics (Tokens, Time, Speed)
 */

// Basic word/character based token estimator since perfect tokenization varies heavily by model
// and requires heavy client-side libraries.
// Average token rule of thumb: 1 token ~= 4 chars in English, or 1 token ~= 0.75 words.
export const estimateTokens = (text: string): number => {
  if (!text) return 0;
  // A somewhat more accurate approximation using both words and character length
  const wordCount = text.split(/\s+/).length;
  const charCount = text.length;
  
  // Blend both rules for a slightly smoother estimate
  const charBased = charCount / 4;
  const wordBased = wordCount / 0.75;
  
  return Math.max(1, Math.round((charBased + wordBased) / 2));
};

export const formatSpeed = (tokens: number, timeMs: number): string => {
  if (timeMs === 0 || tokens === 0) return '0 t/s';
  const seconds = timeMs / 1000;
  const speed = tokens / seconds;
  return `${speed.toFixed(1)} t/s`;
};

export const formatTime = (timeMs: number): string => {
  if (timeMs < 1000) return `${timeMs}ms`;
  return `${(timeMs / 1000).toFixed(2)}s`;
};
