import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { useStats } from '../context/StatContext';
import { formatNumber } from '../utils/numberFormat';

const RADAR_GRID_LEVELS = 4;
const RADAR_COLORS = {
  panel: '#f8fbff',
  border: '#dbe7fb',
  grid: '#c8d6f0',
  axis: '#9fb6dc',
  stroke: '#0b3d91',
  fill: 'rgba(11, 61, 145, 0.14)',
  point: '#0b3d91',
  label: '#52637a',
  center: '#0b3d91',
};

function shortenCoreLabel(name) {
  const words = name.split(' ').filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.map((word) => word[0]).join('').slice(0, 3).toUpperCase();
}

function buildRadarPoints(cores, radius, centerX, centerY, scale) {
  return cores
    .map((core, index) => {
      const angle = (-Math.PI / 2) + (index * Math.PI * 2) / cores.length;
      const valueRadius = radius * scale(core);
      const x = centerX + Math.cos(angle) * valueRadius;
      const y = centerY + Math.sin(angle) * valueRadius;
      return `${x},${y}`;
    })
    .join(' ');
}

export default function HomeScreen({ navigation }) {
  const {
    cores,
    loading,
    totalScoreTarget,
    averageScoreTarget,
    compactNumbers,
    updateScoreTargets,
  } = useStats();
  const { width: windowWidth } = useWindowDimensions();
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
  const radarChart = useMemo(() => {
    const chartSize = Math.max(220, Math.min(windowWidth - 64, 280));
    const center = chartSize / 2;
    const radius = chartSize * 0.3;
    const labelRadius = radius + 28;
    const maxScore = Math.max(...cores.map((core) => core.totalScore || 0), 1);
    const scale = (core) => (core.totalScore || 0) / maxScore;

    return {
      chartSize,
      center,
      radius,
      labelRadius,
      maxScore,
      scale,
      polygonPoints: buildRadarPoints(cores, radius, center, center, scale),
    };
  }, [cores, windowWidth]);

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

        <View style={styles.radarCard}>
          <Text style={styles.radarTitle}>Hero Attribute Radar</Text>
          <Text style={styles.radarSubtitle}>
            Each axis maps your current core score relative to your strongest core.
          </Text>

          {cores.length < 3 ? (
            <View style={styles.radarEmptyState}>
              <Text style={styles.radarEmptyTitle}>Add at least 3 cores to shape the radar.</Text>
              <Text style={styles.radarEmptyText}>
                Your current cores still appear below and remain tappable.
              </Text>
            </View>
          ) : (
            <View style={styles.radarStage}>
              <Svg width={radarChart.chartSize} height={radarChart.chartSize}>
                {Array.from({ length: RADAR_GRID_LEVELS }, (_, index) => {
                  const ringRadius = radarChart.radius * ((index + 1) / RADAR_GRID_LEVELS);
                  const ringPoints = buildRadarPoints(
                    cores,
                    ringRadius,
                    radarChart.center,
                    radarChart.center,
                    () => 1,
                  );

                  return (
                    <Polygon
                      key={`ring-${index + 1}`}
                      points={ringPoints}
                      fill="none"
                      stroke={RADAR_COLORS.grid}
                      strokeWidth={index + 1 === RADAR_GRID_LEVELS ? 1.6 : 1}
                    />
                  );
                })}

                {cores.map((core, index) => {
                  const angle = (-Math.PI / 2) + (index * Math.PI * 2) / cores.length;
                  const axisX = radarChart.center + Math.cos(angle) * radarChart.radius;
                  const axisY = radarChart.center + Math.sin(angle) * radarChart.radius;

                  return (
                    <Line
                      key={`axis-${core.id}`}
                      x1={radarChart.center}
                      y1={radarChart.center}
                      x2={axisX}
                      y2={axisY}
                      stroke={RADAR_COLORS.axis}
                      strokeWidth="1"
                    />
                  );
                })}

                <Polygon
                  points={radarChart.polygonPoints}
                  fill={RADAR_COLORS.fill}
                  stroke={RADAR_COLORS.stroke}
                  strokeWidth="3"
                />

                <Circle
                  cx={radarChart.center}
                  cy={radarChart.center}
                  r="4"
                  fill={RADAR_COLORS.center}
                />

                {cores.map((core, index) => {
                  const angle = (-Math.PI / 2) + (index * Math.PI * 2) / cores.length;
                  const labelX = radarChart.center + Math.cos(angle) * radarChart.labelRadius;
                  const labelY = radarChart.center + Math.sin(angle) * radarChart.labelRadius;
                  const pointX =
                    radarChart.center + Math.cos(angle) * radarChart.radius * radarChart.scale(core);
                  const pointY =
                    radarChart.center + Math.sin(angle) * radarChart.radius * radarChart.scale(core);

                  return (
                    <React.Fragment key={core.id}>
                      <Circle cx={pointX} cy={pointY} r="4.5" fill={RADAR_COLORS.point} />
                      <SvgText
                        x={labelX}
                        y={labelY}
                        fill={RADAR_COLORS.label}
                        fontSize="12"
                        fontWeight="700"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                      >
                        {shortenCoreLabel(core.name)}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
              </Svg>
            </View>
          )}

          <View style={styles.radarLegend}>
            {cores.map((core, index) => (
              <TouchableOpacity
                key={core.id}
                style={[styles.radarLegendItem, index > 0 ? styles.radarLegendItemSpaced : null]}
                onPress={() => navigation.navigate('CoreDetail', { id: core.id })}
              >
                <View style={[styles.radarLegendSwatch, { backgroundColor: core.color || '#3b82f6' }]} />
                <View style={styles.radarLegendText}>
                  <Text style={styles.radarLegendName}>{core.name}</Text>
                  <Text style={styles.radarLegendHint}>Tap to manage this core</Text>
                </View>
                <View style={styles.radarLegendScoreBadge}>
                  <Text style={styles.radarLegendScore}>
                    {formatNumber(core.totalScore || 0, { compact: compactNumbers })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {cores.length >= 3 ? (
            <Text style={styles.radarMeta}>
              Strongest core:{' '}
              {formatNumber(radarChart.maxScore, { compact: compactNumbers })} points
            </Text>
          ) : null}
        </View>
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
  radarCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e6eefb',
  },
  radarTitle: { fontSize: 18, fontWeight: '800', color: '#102a43' },
  radarSubtitle: { marginTop: 6, fontSize: 13, lineHeight: 19, color: '#52637a' },
  radarStage: {
    marginTop: 16,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RADAR_COLORS.panel,
    borderWidth: 1,
    borderColor: RADAR_COLORS.border,
  },
  radarEmptyState: {
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#dbe7fb',
  },
  radarEmptyTitle: { fontSize: 15, fontWeight: '700', color: '#102a43' },
  radarEmptyText: { marginTop: 6, fontSize: 13, lineHeight: 19, color: '#52637a' },
  radarLegend: { marginTop: 14 },
  radarLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#e6eefb',
  },
  radarLegendItemSpaced: { marginTop: 10 },
  radarLegendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginRight: 12,
  },
  radarLegendText: { flex: 1 },
  radarLegendName: { fontSize: 15, fontWeight: '700', color: '#102a43' },
  radarLegendHint: { marginTop: 2, fontSize: 12, color: '#7b8794' },
  radarLegendScoreBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 78,
  },
  radarLegendScore: { fontSize: 15, fontWeight: '800', color: '#0b3d91' },
  radarMeta: { marginTop: 14, fontSize: 12, fontWeight: '700', color: '#7b8794' },
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
