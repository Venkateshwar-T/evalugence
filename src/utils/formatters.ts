export function formatModelName(modelId: string): string {
  if (!modelId) return '';
  
  // Try to get from metadata first
  if (typeof window !== 'undefined') {
    try {
      const meta = JSON.parse(localStorage.getItem('evalugence_model_metadata') || '{}');
      if (meta[modelId] && meta[modelId].name) {
        return meta[modelId].name;
      }
    } catch (e) {
      // Ignore
    }
  }
  
  // Fallback heuristic:
  let name = modelId;
  
  // 1. Remove provider prefix if it has a slash (e.g. "anthropic/claude-3-opus")
  if (name.includes('/')) {
    name = name.split('/').pop() || name;
  }
  
  // 2. Replace hyphens and underscores with spaces
  name = name.replace(/[-_]/g, ' ');
  
  // 3. Replace colons
  name = name.replace(/:/g, ' ');
  
  // 4. Capitalize words
  name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  return name;
}
