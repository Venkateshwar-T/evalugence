export function matchesSearch(query: string, target: string): boolean {
  if (!query) return true;
  if (!target) return false;

  // Normalize by replacing common separators with spaces and converting to lowercase
  const normalize = (s: string) => s.toLowerCase().replace(/[-/_.]/g, ' ');
  
  const searchWords = normalize(query).split(/\s+/).filter(w => w.length > 0);
  const targetStr = normalize(target);
  
  return searchWords.every(word => targetStr.includes(word));
}
