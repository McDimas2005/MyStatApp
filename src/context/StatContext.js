// src/context/StatContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { KEYS, loadList, saveList } from '../utils/storage';

const StatContext = createContext();

const DEFAULT_CORES = [
  { id: 'core-intelligence', name: 'Intelligence', color: '#3b82f6', totalScore: 0 },
  { id: 'core-spiritual', name: 'Spiritual', color: '#8b5cf6', totalScore: 0 },
  { id: 'core-social', name: 'Social', color: '#22c55e', totalScore: 0 },
  { id: 'core-health', name: 'Health', color: '#f97316', totalScore: 0 },
  { id: 'core-selfcontrol', name: 'Self-Control', color: '#ec4899', totalScore: 0 },
];

const DEFAULT_SKILLS = [
  // Intelligence
  { id: 'skill-coding', coreId: 'core-intelligence', name: 'Coding', totalScore: 0 },
  { id: 'skill-problem-solving', coreId: 'core-intelligence', name: 'Problem Solving', totalScore: 0 },
  { id: 'skill-workspeed', coreId: 'core-intelligence', name: 'Workspeed', totalScore: 0 },
  // Spiritual
  { id: 'skill-reflective', coreId: 'core-spiritual', name: 'Reflective', totalScore: 0 },
  { id: 'skill-religious', coreId: 'core-spiritual', name: 'Religious', totalScore: 0 },
  { id: 'skill-calmness', coreId: 'core-spiritual', name: 'Calmness', totalScore: 0 },
  // Social
  { id: 'skill-language', coreId: 'core-social', name: 'Language', totalScore: 0 },
  { id: 'skill-leadership', coreId: 'core-social', name: 'Leadership', totalScore: 0 },
  // Health
  { id: 'skill-stamina', coreId: 'core-health', name: 'Stamina', totalScore: 0 },
  { id: 'skill-sleep', coreId: 'core-health', name: 'Sleep', totalScore: 0 },
  // Self-Control
  { id: 'skill-discipline', coreId: 'core-selfcontrol', name: 'Discipline', totalScore: 0 },
  { id: 'skill-agere-contra', coreId: 'core-selfcontrol', name: 'Agere-Contra', totalScore: 0 },
];

function todayDate() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function isYesterday(prevDay, currDay) {
  if (!prevDay) return false;
  const prev = new Date(prevDay + 'T00:00:00Z');
  const curr = new Date(currDay + 'T00:00:00Z');
  const diffMs = curr - prev;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays === 1;
}

export function StatProvider({ children }) {
  const [cores, setCores] = useState([]);
  const [skills, setSkills] = useState([]);
  const [habits, setHabits] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial load + seeding
  useEffect(() => {
    (async () => {
      try {
        const [loadedCores, loadedSkills, loadedHabits, loadedEvents] = await Promise.all([
          loadList(KEYS.cores),
          loadList(KEYS.skills),
          loadList(KEYS.habits),
          loadList(KEYS.events),
        ]);

        let nextCores = loadedCores;
        let nextSkills = loadedSkills;

        if (!loadedCores.length) {
          nextCores = DEFAULT_CORES.map((c) => ({
            ...c,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }

        if (!loadedSkills.length) {
          nextSkills = DEFAULT_SKILLS.map((s) => ({
            ...s,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }

        setCores(nextCores);
        setSkills(nextSkills);
        setHabits(loadedHabits);
        setEvents(loadedEvents);

        // Persist seeds if they were just created
        if (!loadedCores.length) await saveList(KEYS.cores, nextCores);
        if (!loadedSkills.length) await saveList(KEYS.skills, nextSkills);
      } catch (e) {
        console.warn('Failed to load domain data', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Persist changes (simple approach, ok for MVP)
  useEffect(() => {
    if (loading) return;
    saveList(KEYS.cores, cores).catch((e) => console.warn('Failed to save cores', e));
  }, [cores, loading]);

  useEffect(() => {
    if (loading) return;
    saveList(KEYS.skills, skills).catch((e) => console.warn('Failed to save skills', e));
  }, [skills, loading]);

  useEffect(() => {
    if (loading) return;
    saveList(KEYS.habits, habits).catch((e) => console.warn('Failed to save habits', e));
  }, [habits, loading]);

  useEffect(() => {
    if (loading) return;
    saveList(KEYS.events, events).catch((e) => console.warn('Failed to save events', e));
  }, [events, loading]);

  // ID helpers
  const createId = (prefix, name) =>
    `${prefix}-${name.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}-${Date.now()}`;

  // --- Core CRUD ---
  function createCore({ name, color }) {
    const now = new Date().toISOString();
    const core = {
      id: createId('core', name),
      name: name.trim(),
      color: color || '#3b82f6',
      totalScore: 0,
      createdAt: now,
      updatedAt: now,
    };
    setCores((prev) => [...prev, core]);
    return core;
  }

  function updateCore(id, patch) {
    const now = new Date().toISOString();
    setCores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: now } : c)),
    );
  }

  function removeCore(id) {
    // Simple cascade: remove skills & habits under this core
    const skillIds = skills.filter((s) => s.coreId === id).map((s) => s.id);
    const habitIds = habits.filter((h) => skillIds.includes(h.skillId)).map((h) => h.id);

    setCores((prev) => prev.filter((c) => c.id !== id));
    setSkills((prev) => prev.filter((s) => s.coreId !== id));
    setHabits((prev) => prev.filter((h) => !habitIds.includes(h.id)));
    setEvents((prev) => prev.filter((e) => !habitIds.includes(e.habitId)));
  }

  // --- Skill CRUD ---
  function createSkill({ coreId, name }) {
    const now = new Date().toISOString();
    const skill = {
      id: createId('skill', name),
      coreId,
      name: name.trim(),
      totalScore: 0,
      createdAt: now,
      updatedAt: now,
    };
    setSkills((prev) => [...prev, skill]);
    return skill;
  }

  function updateSkill(id, patch) {
    const now = new Date().toISOString();
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: now } : s)),
    );
  }

  function removeSkill(id) {
    const habitIds = habits.filter((h) => h.skillId === id).map((h) => h.id);
    setSkills((prev) => prev.filter((s) => s.id !== id));
    setHabits((prev) => prev.filter((h) => h.skillId !== id));
    setEvents((prev) => prev.filter((e) => !habitIds.includes(e.habitId)));
  }

  // --- Habit CRUD ---
  function createHabit({ name, description, metric, skillId, scale }) {
    const now = new Date().toISOString();
    const habit = {
      id: createId('habit', name),
      name: name.trim(),
      description: description?.trim() || '',
      metric: metric.trim(),
      skillId,
      scale: Number(scale),
      countDays: 0,
      streak: 0,
      bestStreak: 0,
      totalScore: 0,
      createdAt: now,
      updatedAt: now,
      lastDoneDate: undefined,
    };
    setHabits((prev) => [...prev, habit]);
    return habit;
  }

  function updateHabit(id, patch) {
    const now = new Date().toISOString();
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...patch, updatedAt: now } : h)),
    );
  }

  function removeHabit(id) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setEvents((prev) => prev.filter((e) => e.habitId !== id));
  }

  // --- Log Habit (scoring + streak) ---
  function logHabit(habitId, rawAmount) {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) {
      throw new Error('Habit not found');
    }
    const skill = skills.find((s) => s.id === habit.skillId);
    if (!skill) {
      throw new Error('Skill not found for habit');
    }
    const core = cores.find((c) => c.id === skill.coreId);
    if (!core) {
      throw new Error('Core not found for skill');
    }

    const amount = Number(rawAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error('Amount must be a non-negative number');
    }
    if (!habit.scale || habit.scale <= 0) {
      throw new Error('Habit scale must be positive');
    }

    const scaled = amount * habit.scale;
    const points = Math.max(0, Math.ceil(scaled));
    const at = new Date().toISOString();
    const day = todayDate();

    // Count days: only if no event for this habit on this day yet
    const hasEventToday = events.some((e) => e.habitId === habitId && e.day === day);
    const nextCountDays = habit.countDays + (hasEventToday ? 0 : 1);

    // Streak logic
    let nextStreak;
    if (!habit.lastDoneDate) {
      nextStreak = 1;
    } else if (habit.lastDoneDate === day) {
      nextStreak = habit.streak || 1;
    } else if (isYesterday(habit.lastDoneDate, day)) {
      nextStreak = (habit.streak || 0) + 1;
    } else {
      nextStreak = 1;
    }
    const nextBestStreak = Math.max(habit.bestStreak || 0, nextStreak);

    // Update habit totals
    const nextHabitTotal = (habit.totalScore || 0) + points;
    const nextSkillTotal = (skill.totalScore || 0) + points;
    const nextCoreTotal = (core.totalScore || 0) + points;

    const newEvent = {
      id: createId('event', habit.name),
      habitId: habit.id,
      skillId: skill.id,
      coreId: core.id,
      rawAmount: amount,
      scaled,
      points,
      at,
      day,
    };

    setEvents((prev) => [...prev, newEvent]);

    setHabits((prev) =>
      prev.map((h) =>
        h.id === habit.id
          ? {
              ...h,
              totalScore: nextHabitTotal,
              countDays: nextCountDays,
              streak: nextStreak,
              bestStreak: nextBestStreak,
              lastDoneDate: day,
              updatedAt: at,
            }
          : h,
      ),
    );

    setSkills((prev) =>
      prev.map((s) =>
        s.id === skill.id
          ? { ...s, totalScore: nextSkillTotal, updatedAt: at }
          : s,
      ),
    );

    setCores((prev) =>
      prev.map((c) =>
        c.id === core.id
          ? { ...c, totalScore: nextCoreTotal, updatedAt: at }
          : c,
      ),
    );

    return { points };
  }

  function resetAll() {
    setCores([]);
    setSkills([]);
    setHabits([]);
    setEvents([]);
    // On next reload, seeds will be applied again
  }

  const value = useMemo(
    () => ({
      loading,
      cores,
      skills,
      habits,
      events,
      createCore,
      updateCore,
      removeCore,
      createSkill,
      updateSkill,
      removeSkill,
      createHabit,
      updateHabit,
      removeHabit,
      logHabit,
      resetAll,
    }),
    [loading, cores, skills, habits, events],
  );

  return <StatContext.Provider value={value}>{children}</StatContext.Provider>;
}

export function useStats() {
  const ctx = useContext(StatContext);
  if (!ctx) throw new Error('useStats must be used within StatProvider');
  return ctx;
}
