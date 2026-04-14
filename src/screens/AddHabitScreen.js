// src/screens/AddHabitScreen.js
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Text, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useStats } from '../context/StatContext';

export default function AddHabitScreen({ navigation, route }) {
  const { habitId, skillId: presetSkillId } = route.params ?? {};
  const { habits, skills, createHabit, updateHabit } = useStats();
  const existingHabit = habitId ? habits.find((habit) => habit.id === habitId) : null;
  const isEdit = Boolean(existingHabit);

  const [name, setName] = useState(existingHabit?.name ?? '');
  const [description, setDescription] = useState(existingHabit?.description ?? '');
  const [metric, setMetric] = useState(existingHabit?.metric ?? 'session');
  const [scale, setScale] = useState(existingHabit ? String(existingHabit.scale) : '0.2');
  const [skillId, setSkillId] = useState(existingHabit?.skillId ?? presetSkillId ?? skills[0]?.id ?? '');

  if (habitId && !existingHabit) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Habit not found</Text>
        <Text style={styles.emptyText}>The habit you are trying to edit no longer exists.</Text>
      </View>
    );
  }

  if (!skills.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Create a skill first</Text>
        <Text style={styles.emptyText}>
          Habits belong to a skill, so you need at least one skill before creating habits.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('AddSkill')}>
          <Text style={styles.primaryButtonText}>Create Skill</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSubmit = () => {
    if (!name.trim()) return Alert.alert('Error', 'Habit name is required');
    if (!metric.trim()) return Alert.alert('Error', 'Metric is required');
    if (!skillId) return Alert.alert('Error', 'Please select a skill');

    const scaleNum = Number(scale);
    if (!Number.isFinite(scaleNum) || scaleNum <= 0) {
      return Alert.alert('Error', 'Scale must be a positive number');
    }

    if (isEdit) {
      updateHabit(existingHabit.id, {
        name: name.trim(),
        description,
        metric: metric.trim(),
        skillId,
        scale: scaleNum,
      });
      Alert.alert('Habit updated', `"${name.trim()}" has been updated.`, [
        { text: 'OK', onPress: () => navigation.replace('HabitDetail', { id: existingHabit.id }) },
      ]);
      return;
    }

    const nextHabit = createHabit({
      name,
      description,
      metric,
      skillId,
      scale: scaleNum,
    });

    Alert.alert('Habit created', `"${name.trim()}" has been added.`, [
      { text: 'OK', onPress: () => navigation.replace('HabitDetail', { id: nextHabit.id }) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isEdit ? 'Edit Habit' : 'Create Habit'}</Text>
      <Text style={styles.subtitle}>
        Habits are the daily actions you log to build skill and core progress.
      </Text>

      <Text style={styles.label}>Habit Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Learn Korean"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Learn Korean from Duolingo daily"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Metric</Text>
      <TextInput
        style={styles.input}
        placeholder="Duolingo Session"
        value={metric}
        onChangeText={setMetric}
      />

      <Text style={styles.label}>Scale</Text>
      <TextInput
        style={styles.input}
        placeholder="0.2"
        keyboardType="decimal-pad"
        value={scale}
        onChangeText={setScale}
      />

      <Text style={styles.label}>Skill</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={skillId} onValueChange={setSkillId}>
          {skills.map((s) => (
            <Picker.Item
              key={s.id}
              label={`${s.name}`}
              value={s.id}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>{isEdit ? 'Save Habit' : 'Create Habit'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fd' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '700', color: '#0b3d91' },
  subtitle: { marginTop: 6, fontSize: 14, color: '#4a5568', lineHeight: 20 },
  label: { marginTop: 12, marginBottom: 4, fontSize: 14, color: '#243b53' },
  input: {
    borderWidth: 1,
    borderColor: '#c8d6f0',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
  },
  multiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#c8d6f0',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: '#0b3d91',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#f7f9fd',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#0b3d91' },
  emptyText: { marginTop: 8, fontSize: 14, color: '#4a5568', textAlign: 'center', lineHeight: 20 },
});
