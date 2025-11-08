import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { loadStats, saveStats } from '../utils/storage';

const StatContext = createContext();

export function StatProvider({ children }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await loadStats();
        setStats(data);
      } catch (e) {
        console.warn('Failed to load stats', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Persist whenever stats change
  useEffect(() => {
    if (loading) return; // Avoid saving initial empty state over existing data
    saveStats(stats).catch(e => console.warn('Failed to save stats', e));
  }, [stats, loading]);

  const actions = useMemo(
    () => ({
      addStat: stat => setStats(prev => [...prev, stat]),
      updateStat: (id, patch) =>
        setStats(prev =>
          prev.map(s =>
            s.id === id
              ? { ...s, ...patch, updatedAt: new Date().toISOString() }
              : s,
          ),
        ),
      removeStat: id => setStats(prev => prev.filter(s => s.id !== id)),
      resetAll: () => setStats([]),
    }),
    [],
  );

  const value = useMemo(
    () => ({ stats, loading, ...actions }),
    [stats, loading, actions],
  );

  return <StatContext.Provider value={value}>{children}</StatContext.Provider>;
}

export function useStats() {
  const ctx = useContext(StatContext);
  if (!ctx) throw new Error('useStats must be used within StatProvider');
  return ctx;
}
