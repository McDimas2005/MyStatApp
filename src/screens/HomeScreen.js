import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useStats } from '../context/StatContext';
import { formatNumber, formatPercent } from '../utils/numberFormat';

export default function HomeScreen({ navigation }) {
  const {
    cores,
    loading,
    totalScoreTarget,
    averageScoreTarget,
    compactNumbers,
    updateScoreTargets,
  } = useStats();
  const [editingTarget, setEditingTarget] = useState(null);
  const [targetInput, setTargetInput] = useState('');

  const totalScore = useMemo(
    () => cores.reduce((sum, core) => sum + (core.totalScore || 0), 0),
    [cores],
  );
  const averageScore = useMemo(
    () => (cores.length ? totalScore / cores.length : 0),
    [cores.length, totalScore],
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const openTargetEditor = (targetKey) => {
    const currentValue =
      targetKey === 'totalScoreTarget' ? totalScoreTarget : averageScoreTarget;

    setEditingTarget(targetKey);
    setTargetInput(String(currentValue));
  };

  const closeTargetEditor = () => {
    setEditingTarget(null);
    setTargetInput('');
  };

  const handleSaveTarget = () => {
    const nextValue = Number(targetInput);

    if (!Number.isFinite(nextValue) || nextValue <= 0) {
      return Alert.alert('Error', 'Target must be a positive number.');
    }

    if (editingTarget === 'totalScoreTarget') {
      updateScoreTargets({ totalScoreTarget: nextValue });
    }

    if (editingTarget === 'averageScoreTarget') {
      updateScoreTargets({ averageScoreTarget: nextValue });
    }

    closeTargetEditor();
  };

  const renderCore = ({ item, index }) => {
    const score = item.totalScore || 0;
    const ratio = averageScoreTarget > 0 ? score / averageScoreTarget : 0;
    const percentage = formatPercent(ratio * 100);
    const barWidth = `${Math.min(100, score > 0 ? Math.max(8, ratio * 100) : 0)}%`;

    return (
      <TouchableOpacity
        style={styles.coreCard}
        onPress={() => navigation.navigate('CoreDetail', { id: item.id })}
      >
        <View style={styles.coreCardTop}>
          <View style={[styles.coreIcon, { backgroundColor: item.color || '#3b82f6' }]}>
            <Text style={styles.coreIconText}>{String(index + 1).padStart(2, '0')}</Text>
          </View>

          <View style={styles.coreHeader}>
            <Text style={styles.coreName}>{item.name}</Text>
            <Text style={styles.coreHint}>Tap to manage this core</Text>
          </View>

          <View style={styles.coreScoreBadge}>
            <Text style={styles.coreScore}>{formatNumber(score, { compact: compactNumbers })}</Text>
            <Text style={styles.coreScoreLabel}>score</Text>
          </View>
        </View>

        <View style={styles.coreProgressMeta}>
          <Text style={styles.coreProgressLabel}>vs Average Score Target</Text>
          <Text style={styles.coreProgressValue}>{percentage}</Text>
        </View>

        <View style={styles.barBackground}>
          <View
            style={[styles.barFill, { width: barWidth, backgroundColor: item.color || '#3b82f6' }]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>MyStat Dashboard</Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatNumber}>{formatNumber(totalScore, { compact: compactNumbers })}</Text>
              <Text style={styles.heroStatLabel}>Total Score</Text>
            </View>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatNumber}>{formatNumber(averageScore, { compact: compactNumbers })}</Text>
              <Text style={styles.heroStatLabel}>Average Score</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.targetCardFull}
            onPress={() => openTargetEditor('totalScoreTarget')}
          >
            <Text style={styles.targetLabel}>Total Score Target</Text>
            <Text style={styles.targetValue}>{formatNumber(totalScoreTarget, { compact: compactNumbers })}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.targetCardFull}
            onPress={() => openTargetEditor('averageScoreTarget')}
          >
            <Text style={styles.targetLabel}>Average Score Target</Text>
            <Text style={styles.targetValue}>{formatNumber(averageScoreTarget, { compact: compactNumbers })}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.primaryActionCard}
            onPress={() => navigation.navigate('AddCore')}
          >
            <Text style={styles.primaryActionEyebrow}>Structure</Text>
            <Text style={styles.primaryActionTitle}>New Core</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Core Stats (Your Hero Attributes)</Text>
        </View>

        <FlatList
          data={cores}
          keyExtractor={(item) => item.id}
          renderItem={renderCore}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      </ScrollView>

      <TouchableOpacity style={styles.quickLogFab} onPress={() => navigation.navigate('QuickLog')}>
        <Text style={styles.quickLogFabLabel}>Quick Log</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent
        visible={Boolean(editingTarget)}
        onRequestClose={closeTargetEditor}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeTargetEditor}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalEyebrow}>Score Target</Text>
            <Text style={styles.modalTitle}>
              {editingTarget === 'totalScoreTarget' ? 'Total Score Target' : 'Average Score Target'}
            </Text>

            <TextInput
              style={styles.modalInput}
              value={targetInput}
              onChangeText={setTargetInput}
              keyboardType="number-pad"
              placeholder="Enter target"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondaryButton} onPress={closeTargetEditor}>
                <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimaryButton} onPress={handleSaveTarget}>
                <Text style={styles.modalPrimaryButtonText}>Save Target</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fd' },
  content: { padding: 16, paddingBottom: 112 },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: '#dbe7fb',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  heroEyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef4ff',
    color: '#0b3d91',
    borderRadius: 999,
    overflow: 'hidden',
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  heroStatCard: {
    width: '48%',
    backgroundColor: '#f8fbff',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#edf2fb',
  },
  heroStatNumber: { fontSize: 26, fontWeight: '800', color: '#0b3d91' },
  heroStatLabel: { marginTop: 4, fontSize: 12, fontWeight: '700', color: '#52637a' },
  targetCardFull: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#dbe7fb',
    marginTop: 12,
  },
  targetLabel: { fontSize: 11, fontWeight: '700', color: '#7b8794', textTransform: 'uppercase' },
  targetValue: { marginTop: 8, fontSize: 24, fontWeight: '800', color: '#102a43' },
  actionRow: { marginTop: 16, marginBottom: 8 },
  primaryActionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe7fb',
  },
  primaryActionEyebrow: { fontSize: 11, fontWeight: '700', color: '#7b8794', textTransform: 'uppercase' },
  primaryActionTitle: { marginTop: 6, fontSize: 18, fontWeight: '700', color: '#0b3d91' },
  sectionHeader: { marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#102a43' },
  listContent: { paddingTop: 6 },
  coreCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e6eefb',
  },
  coreCardTop: { flexDirection: 'row', alignItems: 'center' },
  coreIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  coreIconText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  coreHeader: { flex: 1 },
  coreName: { fontSize: 17, fontWeight: '700', color: '#102a43' },
  coreHint: { marginTop: 4, fontSize: 12, color: '#7b8794' },
  coreScoreBadge: {
    backgroundColor: '#f8fbff',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 72,
  },
  coreScore: { fontSize: 20, fontWeight: '800', color: '#0b3d91' },
  coreScoreLabel: { marginTop: 2, fontSize: 11, fontWeight: '700', color: '#7b8794' },
  coreProgressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  coreProgressLabel: { fontSize: 12, fontWeight: '700', color: '#7b8794', textTransform: 'uppercase' },
  coreProgressValue: { fontSize: 12, fontWeight: '700', color: '#102a43' },
  barBackground: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#e8effa',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  quickLogFab: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    backgroundColor: '#0b3d91',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  quickLogFabLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    justifyContent: 'center',
    padding: 20,
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dbe7fb',
  },
  modalEyebrow: { fontSize: 11, fontWeight: '700', color: '#7b8794', textTransform: 'uppercase' },
  modalTitle: { marginTop: 8, fontSize: 22, fontWeight: '800', color: '#102a43' },
  modalInput: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#c8d6f0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    fontWeight: '700',
    color: '#102a43',
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 },
  modalSecondaryButton: {
    backgroundColor: '#eef4ff',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  modalSecondaryButtonText: { color: '#0b3d91', fontWeight: '700' },
  modalPrimaryButton: {
    backgroundColor: '#0b3d91',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalPrimaryButtonText: { color: '#fff', fontWeight: '700' },
});
