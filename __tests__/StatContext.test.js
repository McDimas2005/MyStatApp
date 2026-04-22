import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { StatProvider, useStats } from '../src/context/StatContext';
import { KEYS } from '../src/utils/storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

let latestStats;

function StatsProbe() {
  latestStats = useStats();
  return null;
}

async function flushReact() {
  await ReactTestRenderer.act(async () => {
    await Promise.resolve();
  });
}

async function waitFor(check, attempts = 20) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (check()) return;
    await flushReact();
  }

  throw new Error('Timed out while waiting for state to settle');
}

async function callWithAct(action) {
  let result;

  await ReactTestRenderer.act(async () => {
    result = await action();
  });

  return result;
}

async function mountProvider() {
  let renderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <StatProvider>
        <StatsProbe />
      </StatProvider>,
    );
    await Promise.resolve();
  });

  await waitFor(() => latestStats && latestStats.loading === false);
  return renderer;
}

async function unmountRenderer(renderer) {
  await ReactTestRenderer.act(async () => {
    renderer.unmount();
  });
}

describe('StatProvider', () => {
  beforeEach(async () => {
    latestStats = undefined;
    jest.useRealTimers();
    await AsyncStorage.clear();
  });

  it('seeds defaults and logs habits without double-counting the same day', async () => {
    const renderer = await mountProvider();

    expect(latestStats.cores).toHaveLength(5);
    expect(latestStats.skills.length).toBeGreaterThan(0);

    const skill = latestStats.skills[0];
    const core = latestStats.cores.find((entry) => entry.id === skill.coreId);

    const habit = await callWithAct(() =>
      latestStats.createHabit({
        name: 'Night Reading',
        description: 'Read before sleeping',
        metric: 'session',
        skillId: skill.id,
        scale: 0.5,
      }),
    );

    await waitFor(() => latestStats.habits.some((entry) => entry.id === habit.id));

    await expect(callWithAct(() => latestStats.logHabit(habit.id, 2))).resolves.toEqual({
      points: 1,
    });
    await waitFor(() => latestStats.events.length === 1);

    await expect(callWithAct(() => latestStats.logHabit(habit.id, 3))).resolves.toEqual({
      points: 2,
    });
    await waitFor(() => latestStats.events.length === 2);

    const nextHabit = latestStats.habits.find((entry) => entry.id === habit.id);
    const nextSkill = latestStats.skills.find((entry) => entry.id === skill.id);
    const nextCore = latestStats.cores.find((entry) => entry.id === core.id);
    const storedEvents = JSON.parse(await AsyncStorage.getItem(KEYS.events));

    expect(nextHabit.countDays).toBe(1);
    expect(nextHabit.streak).toBe(1);
    expect(nextHabit.bestStreak).toBe(1);
    expect(nextHabit.totalScore).toBe(3);
    expect(nextSkill.totalScore).toBe(3);
    expect(nextCore.totalScore).toBe(3);
    expect(storedEvents).toHaveLength(2);

    await unmountRenderer(renderer);
  });

  it('removes dependent skills, habits, and events when a core is deleted', async () => {
    const renderer = await mountProvider();
    const skill = latestStats.skills[0];
    const core = latestStats.cores.find((entry) => entry.id === skill.coreId);

    const habit = await callWithAct(() =>
      latestStats.createHabit({
        name: 'Sprint Drill',
        description: '',
        metric: 'reps',
        skillId: skill.id,
        scale: 1,
      }),
    );

    await waitFor(() => latestStats.habits.some((entry) => entry.id === habit.id));
    await callWithAct(() => latestStats.logHabit(habit.id, 4));
    await waitFor(() => latestStats.events.length === 1);

    await callWithAct(() => latestStats.removeCore(core.id));
    await waitFor(() => !latestStats.cores.some((entry) => entry.id === core.id));

    expect(latestStats.skills.some((entry) => entry.coreId === core.id)).toBe(false);
    expect(latestStats.habits.some((entry) => entry.skillId === skill.id)).toBe(false);
    expect(latestStats.events.some((entry) => entry.coreId === core.id)).toBe(false);

    await unmountRenderer(renderer);
  });

  it('can apply sample analytics data, restore saved data, reset progress, and persist settings', async () => {
    const renderer = await mountProvider();
    const skill = latestStats.skills[0];

    const habit = await callWithAct(() =>
      latestStats.createHabit({
        name: 'Morning Journal',
        description: '',
        metric: 'entry',
        skillId: skill.id,
        scale: 2,
      }),
    );

    await waitFor(() => latestStats.habits.some((entry) => entry.id === habit.id));
    await callWithAct(() => latestStats.logHabit(habit.id, 1));
    await waitFor(() => latestStats.events.length === 1);

    const snapshot = {
      habitIds: latestStats.habits.map((entry) => entry.id),
      eventCount: latestStats.events.length,
      coreTotals: latestStats.cores.map((entry) => entry.totalScore),
    };

    const sampleSummary = await callWithAct(() => latestStats.applyAnalyticsSampleData());
    await waitFor(() => latestStats.hasSampleBackup === true);

    expect(sampleSummary.habitCount).toBeGreaterThan(snapshot.habitIds.length);
    expect(sampleSummary.eventCount).toBeGreaterThan(0);
    expect(latestStats.events.length).toBe(sampleSummary.eventCount);

    await callWithAct(() => latestStats.restoreRealData());
    await waitFor(() => latestStats.hasSampleBackup === false);

    expect(latestStats.habits.map((entry) => entry.id)).toEqual(snapshot.habitIds);
    expect(latestStats.events).toHaveLength(snapshot.eventCount);
    expect(latestStats.cores.map((entry) => entry.totalScore)).toEqual(snapshot.coreTotals);

    await callWithAct(() => latestStats.resetProgress());
    await waitFor(() => latestStats.events.length === 0);

    expect(latestStats.habits.map((entry) => entry.id)).toEqual(snapshot.habitIds);
    expect(latestStats.habits.every((entry) => entry.totalScore === 0)).toBe(true);
    expect(latestStats.cores.every((entry) => entry.totalScore === 0)).toBe(true);

    await callWithAct(() => latestStats.updateSettings({ compactNumbers: false }));
    await waitFor(() => latestStats.compactNumbers === false);

    const storedSettings = JSON.parse(await AsyncStorage.getItem(KEYS.settings));
    expect(storedSettings.compactNumbers).toBe(false);

    await unmountRenderer(renderer);
  });
});
