const DAY_MS = 24 * 60 * 60 * 1000;

const HABIT_VARIANTS = [
  {
    suffix: 'Practice',
    description: (skill) => `Dedicated practice block for ${skill.name}.`,
    metric: 'session',
    scale: () => Number((0.9 + Math.random() * 1.8).toFixed(2)),
    amount: () => randomInt(1, 4),
  },
  {
    suffix: 'Review',
    description: (skill) => `Review and sharpen ${skill.name}.`,
    metric: 'minutes',
    scale: () => Number((0.08 + Math.random() * 0.18).toFixed(2)),
    amount: () => randomInt(20, 75),
  },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chance(probability) {
  return Math.random() < probability;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function utcMiddayDaysAgo(daysAgo) {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date;
}

function dayString(date) {
  return date.toISOString().slice(0, 10);
}

function timestampForDay(dayIndex, eventIndex) {
  const date = utcMiddayDaysAgo(20 - dayIndex);
  date.setUTCHours(9 + eventIndex * 4, randomInt(0, 45), 0, 0);
  return date.toISOString();
}

function isYesterday(prevDay, currDay) {
  if (!prevDay) return false;
  const prev = new Date(`${prevDay}T00:00:00Z`);
  const curr = new Date(`${currDay}T00:00:00Z`);
  return (curr - prev) / DAY_MS === 1;
}

function createSampleHabits(skills) {
  const now = new Date().toISOString();

  return skills.flatMap((skill) =>
    HABIT_VARIANTS.map((variant) => ({
      id: `sample-habit-${slugify(skill.id)}-${slugify(variant.suffix)}`,
      name: `${skill.name} ${variant.suffix}`,
      description: variant.description(skill),
      metric: variant.metric,
      skillId: skill.id,
      scale: variant.scale(),
      countDays: 0,
      streak: 0,
      bestStreak: 0,
      totalScore: 0,
      createdAt: now,
      updatedAt: now,
      lastDoneDate: undefined,
    })),
  );
}

function createHabitActivity(daysCount = 21) {
  const activeDays = new Set();
  const trailingStreak = randomInt(0, 7);
  const blockedDay = trailingStreak > 0 ? daysCount - trailingStreak - 1 : -1;

  for (let offset = 0; offset < trailingStreak; offset += 1) {
    activeDays.add(daysCount - 1 - offset);
  }

  for (let dayIndex = 0; dayIndex < daysCount; dayIndex += 1) {
    if (dayIndex === blockedDay || activeDays.has(dayIndex)) continue;
    if (chance(0.42)) activeDays.add(dayIndex);
  }

  while (activeDays.size < 8) {
    const dayIndex = randomInt(0, daysCount - 1);
    if (dayIndex !== blockedDay) activeDays.add(dayIndex);
  }

  return [...activeDays].sort((left, right) => left - right);
}

function createEventSpecs(habits) {
  return habits.flatMap((habit) => {
    const activeDays = createHabitActivity();

    return activeDays.flatMap((dayIndex) => {
      const eventsForDay = chance(0.28) ? 2 : 1;

      return Array.from({ length: eventsForDay }, (_, eventIndex) => ({
        id: `sample-event-${slugify(habit.id)}-${dayIndex}-${eventIndex}`,
        habitId: habit.id,
        at: timestampForDay(dayIndex, eventIndex),
        day: dayString(utcMiddayDaysAgo(20 - dayIndex)),
        rawAmount:
          habit.metric === 'minutes'
            ? randomInt(20, 75)
            : randomInt(1, 4),
      }));
    });
  });
}

export function generateAnalyticsSampleData(baseCores, baseSkills) {
  const cores = baseCores.map((core) => ({ ...core, totalScore: 0 }));
  const skills = baseSkills.map((skill) => ({ ...skill, totalScore: 0 }));
  const habits = createSampleHabits(skills);
  const eventSpecs = createEventSpecs(habits).sort((left, right) => left.at.localeCompare(right.at));

  const coresById = new Map(cores.map((core) => [core.id, core]));
  const skillsById = new Map(skills.map((skill) => [skill.id, skill]));
  const habitsById = new Map(habits.map((habit) => [habit.id, habit]));
  const seenDays = new Set();
  const events = [];

  eventSpecs.forEach((eventSpec) => {
    const habit = habitsById.get(eventSpec.habitId);
    const skill = skillsById.get(habit.skillId);
    const core = coresById.get(skill.coreId);
    const points = Math.max(0, Math.ceil(eventSpec.rawAmount * habit.scale));
    const seenKey = `${habit.id}:${eventSpec.day}`;

    habit.totalScore += points;
    habit.updatedAt = eventSpec.at;

    if (!seenDays.has(seenKey)) {
      habit.countDays += 1;

      if (!habit.lastDoneDate) {
        habit.streak = 1;
      } else if (habit.lastDoneDate === eventSpec.day) {
        habit.streak = Math.max(habit.streak, 1);
      } else if (isYesterday(habit.lastDoneDate, eventSpec.day)) {
        habit.streak += 1;
      } else {
        habit.streak = 1;
      }

      habit.bestStreak = Math.max(habit.bestStreak, habit.streak);
      habit.lastDoneDate = eventSpec.day;
      seenDays.add(seenKey);
    }

    skill.totalScore += points;
    skill.updatedAt = eventSpec.at;

    core.totalScore += points;
    core.updatedAt = eventSpec.at;

    events.push({
      ...eventSpec,
      skillId: skill.id,
      coreId: core.id,
      scaled: Number((eventSpec.rawAmount * habit.scale).toFixed(2)),
      points,
    });
  });

  return { cores, skills, habits, events };
}
