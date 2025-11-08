import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

export default function StatInput({ onSubmit }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [unit, setUnit] = useState('times');
  const [goal, setGoal] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      category,
      unit,
      goal: goal ? Number(goal) : null,
    });
    setName('');
    setCategory('General');
    setUnit('times');
    setGoal('');
  };

  return (
    <View style={styles.wrapper}>
      <TextInput
        placeholder="Name (e.g., Coding Practice)"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Category (e.g., Skill)"
        style={styles.input}
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        placeholder="Unit (e.g., hours)"
        style={styles.input}
        value={unit}
        onChangeText={setUnit}
      />
      <TextInput
        placeholder="Goal (optional)"
        style={styles.input}
        value={goal}
        onChangeText={setGoal}
        keyboardType="numeric"
      />
      <Button title="Add Stat" onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8, marginVertical: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#c8d6f0',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
  },
});
