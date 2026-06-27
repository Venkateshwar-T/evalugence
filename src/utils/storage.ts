import { get, set, del } from 'idb-keyval';
import { estimateTokens } from './metrics';

export interface SessionData {
  id: string;
  type: 'test' | 'compare';
  timestamp: number;
  models: { id: string; name: string; logo: string; providerId: string }[];
  messages: any[];
  metrics?: Record<string, { timeMs: number; tokens: number; ttftMs?: number }>;
  compareModelMessages?: Record<string, any[]>;
}

export interface ModelGlobalStats {
  totalRuns: number;
  totalTokens: number;
  totalTimeMs: number;
  avgSpeedTokS: number;
  providerId: string;
  totalTtftMs?: number;
  totalTtftRuns?: number;
}

export interface GlobalMetrics {
  totalTokensProcessed: number;
  totalSessionsRun: number;
  modelStats: Record<string, ModelGlobalStats>;
}

// Ensure safe access to localStorage
const getLocalStorage = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setLocalStorage = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }
};

// --- Running Aggregator --- //
export const getGlobalMetrics = (): GlobalMetrics => {
  return getLocalStorage('evalugence_global_metrics', {
    totalTokensProcessed: 0,
    totalSessionsRun: 0,
    modelStats: {}
  });
};

const updateGlobalMetrics = (session: SessionData) => {
  const metrics = getGlobalMetrics();
  metrics.totalSessionsRun += 1;

  let sessionTokens = 0;

  // Process User Prompts
  session.messages.filter(m => m.role === 'user').forEach(m => {
    const text = m.content || (m.parts ? m.parts.map((p: any) => p.text || p.content || '').join('') : '');
    sessionTokens += estimateTokens(text);
  });

  // Process AI Responses & speeds
  if (session.type === 'test' && session.metrics && session.models.length > 0) {
    const model = session.models[0];
    const msgs = session.messages.filter(m => m.role === 'assistant');
    
    let modelTimeMs = 0;
    let modelTokens = 0;

    let modelTtftMs = 0;
    let modelTtftRuns = 0;

    msgs.forEach(m => {
      const msgMetrics = session.metrics![m.id];
      if (msgMetrics) {
        modelTimeMs += msgMetrics.timeMs;
        modelTokens += msgMetrics.tokens;
        if (msgMetrics.ttftMs) {
          modelTtftMs += msgMetrics.ttftMs;
          modelTtftRuns += 1;
        }
      }
    });

    sessionTokens += modelTokens;

    if (modelTokens > 0) {
      updateModelStats(metrics, model, modelTokens, modelTimeMs, modelTtftMs, modelTtftRuns);
    }
  } else if (session.type === 'compare') {
    // In Compare Mode, we will manually calculate this when saving or if the structure allows.
    // For now we just add a flat estimate if detailed metrics aren't perfectly aligned
    session.messages.filter(m => m.role === 'assistant').forEach(m => {
      const text = m.content || (m.parts ? m.parts.map((p: any) => p.text || p.content || '').join('') : '');
      sessionTokens += estimateTokens(text);
    });
  }

  metrics.totalTokensProcessed += sessionTokens;
  setLocalStorage('evalugence_global_metrics', metrics);
};

export const updateCompareModelStats = (model: { id: string; name: string; providerId: string }, metricsObj: Record<string, { timeMs: number; tokens: number; ttftMs?: number }>) => {
  const metrics = getGlobalMetrics();
  
  let modelTimeMs = 0;
  let modelTokens = 0;
  let modelTtftMs = 0;
  let modelTtftRuns = 0;

  Object.values(metricsObj).forEach(m => {
    modelTimeMs += m.timeMs;
    modelTokens += m.tokens;
    if (m.ttftMs) {
      modelTtftMs += m.ttftMs;
      modelTtftRuns += 1;
    }
  });

  if (modelTokens > 0) {
    updateModelStats(metrics, model, modelTokens, modelTimeMs, modelTtftMs, modelTtftRuns);
    metrics.totalTokensProcessed += modelTokens;
    setLocalStorage('evalugence_global_metrics', metrics);
  }
};

const updateModelStats = (
  metrics: GlobalMetrics, 
  model: { id: string; name: string; providerId: string }, 
  tokens: number, 
  timeMs: number,
  ttftMs: number = 0,
  ttftRuns: number = 0
) => {
  if (!metrics.modelStats[model.id]) {
    metrics.modelStats[model.id] = {
      totalRuns: 0,
      totalTokens: 0,
      totalTimeMs: 0,
      avgSpeedTokS: 0,
      providerId: model.providerId,
      totalTtftMs: 0,
      totalTtftRuns: 0
    };
  }

  const stat = metrics.modelStats[model.id];
  stat.totalRuns += 1;
  stat.totalTokens += tokens;
  stat.totalTimeMs += timeMs;
  if (ttftMs > 0) {
    stat.totalTtftMs = (stat.totalTtftMs || 0) + ttftMs;
    stat.totalTtftRuns = (stat.totalTtftRuns || 0) + ttftRuns;
  }
  stat.avgSpeedTokS = stat.totalTimeMs > 0 ? (stat.totalTokens / (stat.totalTimeMs / 1000)) : 0;
};

// --- IndexedDB Session Storage --- //
const SESSION_PREFIX = 'session_';

export const saveSession = async (session: SessionData) => {
  // Always update aggregate numbers (speeds, tokens, counts) regardless of history setting
  updateGlobalMetrics(session);

  const enableHistory = getLocalStorage('evalugence_enable_history', false);
  if (enableHistory === false || enableHistory === 'false') return;

  try {
    const key = `${SESSION_PREFIX}${session.id}`;
    await set(key, session);
    
    // Maintain a lightweight list of session metadata in localStorage for fast rendering
    const recentSessions = getLocalStorage('evalugence_recent_sessions', []);
    
    // Remove if already exists to update it to the top
    const filtered = recentSessions.filter((s: any) => s.id !== session.id);
    
    filtered.unshift({
      id: session.id,
      type: session.type,
      timestamp: session.timestamp,
      models: session.models.map(m => m.name),
      preview: (() => {
        const firstUser = session.messages.find(m => m.role === 'user');
        if (!firstUser) return 'Empty prompt';
        const text = firstUser.content || (firstUser.parts ? firstUser.parts.map((p: any) => p.text || p.content || '').join('') : '');
        return text.substring(0, 60) || 'Empty prompt';
      })()
    });
    // Keep only last 50 to prevent localStorage bloat
    setLocalStorage('evalugence_recent_sessions', filtered.slice(0, 50));

  } catch (error) {
    console.error('Failed to save session to IndexedDB:', error);
  }
};

export const getSession = async (id: string): Promise<SessionData | undefined> => {
  try {
    return await get(`${SESSION_PREFIX}${id}`);
  } catch (error) {
    console.error('Failed to get session from IndexedDB:', error);
    return undefined;
  }
};

export const deleteSession = async (id: string) => {
  try {
    await del(`${SESSION_PREFIX}${id}`);
    const recentSessions = getLocalStorage('evalugence_recent_sessions', []);
    const filtered = recentSessions.filter((s: any) => s.id !== id);
    setLocalStorage('evalugence_recent_sessions', filtered);
    return filtered;
  } catch (error) {
    console.error('Failed to delete session:', error);
    return null;
  }
};

export const getRecentSessionMetadata = () => {
  return getLocalStorage('evalugence_recent_sessions', []);
};
