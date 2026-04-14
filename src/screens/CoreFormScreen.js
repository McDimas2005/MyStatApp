import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useStats } from '../context/StatContext';

const CORE_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f97316', '#ec4899', '#0f766e'];

export default function CoreFormScreen({ navigation, route }) {
  const { coreId } = route.params ?? {};
  const { cores, createCore, updateCore } = useStats();
  const existingCore = coreId ? cores.find((core) => core.id === coreId) : null;
  const isEdit = Boolean(existingCore);

  const [name, setName] = useState(existingCore?.name ?? '');
  const [color, setColor] = useState(existingCore?.color ?? CORE_COLORS[0]);

  if (coreId && !existingCore) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Core not found</Text>
        <Text style={styles.emptyText}>The core you are trying to edit no longer exists.</Text>
      </View>
    );
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      return Alert.alert('Error', 'Core name is required.');
    }

    if (isEdit) {
      updateCore(existingCore.id, { name: name.trim(), color });
      Alert.alert('Core updated', `"${name.trim()}" has been updated.`, [
        { text: 'OK', onPress: () => navigation.replace('CoreDetail', { id: existingCore.id }) },
      ]);
      return;
    }

    const nextCore = createCore({ name: name.trim(), color });
    Alert.alert('Core created', `"${name.trim()}" has been added.`, [
      { text: 'OK', onPress: () => navigation.replace('CoreDetail', { id: nextCore.id }) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isEdit ? 'Edit Core' : 'Create Core'}</Text>
      <Text style={styles.subtitle}>Define the top-level attribute bucket that will hold your skills.</Text>

      <Text style={styles.label}>Core Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Intelligence"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Accent Color</Text>
      <View style={styles.colorRow}>
        {CORE_COLORS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.colorSwatch,
              { backgroundColor: option },
              color === option ? styles.colorSwatchSelected : null,
            ]}
            onPress={() => setColor(option)}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>{isEdit ? 'Save Core' : 'Create Core'}</Text>
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
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 999,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: { borderColor: '#0f172a' },
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
  emptyText: { marginTop: 8, fontSize: 14, color: '#4a5568', textAlign: 'center' },
});
