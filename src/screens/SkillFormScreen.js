import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useStats } from '../context/StatContext';

export default function SkillFormScreen({ navigation, route }) {
  const { skillId, coreId: presetCoreId } = route.params ?? {};
  const { skills, cores, createSkill, updateSkill } = useStats();
  const existingSkill = skillId ? skills.find((skill) => skill.id === skillId) : null;
  const isEdit = Boolean(existingSkill);

  const [name, setName] = useState(existingSkill?.name ?? '');
  const [coreId, setCoreId] = useState(existingSkill?.coreId ?? presetCoreId ?? cores[0]?.id ?? '');

  useEffect(() => {
    if (!coreId && cores[0]?.id) {
      setCoreId(cores[0].id);
    }
  }, [coreId, cores]);

  if (skillId && !existingSkill) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Skill not found</Text>
        <Text style={styles.emptyText}>The skill you are trying to edit no longer exists.</Text>
      </View>
    );
  }

  if (!cores.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Create a core first</Text>
        <Text style={styles.emptyText}>
          Skills belong to a core, so you need at least one core before creating skills.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('AddCore')}>
          <Text style={styles.primaryButtonText}>Create Core</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      return Alert.alert('Error', 'Skill name is required.');
    }
    if (!coreId) {
      return Alert.alert('Error', 'Please choose a core.');
    }

    if (isEdit) {
      updateSkill(existingSkill.id, { name: name.trim(), coreId });
      Alert.alert('Skill updated', `"${name.trim()}" has been updated.`, [
        { text: 'OK', onPress: () => navigation.replace('SkillDetail', { id: existingSkill.id }) },
      ]);
      return;
    }

    const nextSkill = createSkill({ name: name.trim(), coreId });
    Alert.alert('Skill created', `"${name.trim()}" has been added.`, [
      { text: 'OK', onPress: () => navigation.replace('SkillDetail', { id: nextSkill.id }) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isEdit ? 'Edit Skill' : 'Create Skill'}</Text>
      <Text style={styles.subtitle}>Skills live under a core and hold the habits you actually track.</Text>

      <Text style={styles.label}>Skill Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Problem Solving"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Core</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={coreId} onValueChange={setCoreId}>
          {cores.map((core) => (
            <Picker.Item key={core.id} label={core.name} value={core.id} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>{isEdit ? 'Save Skill' : 'Create Skill'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fd' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '700', color: '#0b3d91' },
  subtitle: { marginTop: 6, fontSize: 14, color: '#4a5568', lineHeight: 20 },
  label: { marginTop: 18, marginBottom: 6, fontSize: 14, fontWeight: '600', color: '#243b53' },
  input: {
    borderWidth: 1,
    borderColor: '#c8d6f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#c8d6f0',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  primaryButton: {
    marginTop: 24,
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
