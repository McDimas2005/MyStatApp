// src/screens/AddHabitScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useStats } from '../context/StatContext';

export default function AddHabitScreen({ navigation }) {
  const { skills, createHabit } = useStats();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [metric, setMetric] = useState('session');
  const [scale, setScale] = useState('0.2');
  const [skillId, setSkillId] = useState(skills[0]?.id || '');

  const handleSubmit = () => {
    if (!name.trim()) return Alert.alert('Error', 'Habit name is required');
    if (!metric.trim()) return Alert.alert('Error', 'Metric is required');
    if (!skillId) return Alert.alert('Error', 'Please select a skill');

    const scaleNum = Number(scale);
    if (!Number.isFinite(scaleNum) || scaleNum <= 0) {
      return Alert.alert('Error', 'Scale must be a positive number');
    }

    createHabit({
      name,
      description,
      metric,
      skillId,
      scale: scaleNum,
    });

    Alert.alert('Habit created', `"${name}" has been added.`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
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

      <Button title="Create Habit" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f9fd' },
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
});
