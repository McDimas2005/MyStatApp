import React, { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

function shortenLabel(name) {
  const words = name.split(' ').filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 6);
  return words.map((word) => word[0]).join('').slice(0, 3).toUpperCase();
}

export default function CoreBarChart({ cores, values, valueFormatter, yAxisSuffix = '' }) {
  const { width: windowWidth } = useWindowDimensions();

  const chart = useMemo(() => {
    const width = Math.max(260, Math.min(windowWidth - 72, 360));
    const height = 240;
    const paddingTop = 28;
    const paddingBottom = 42;
    const paddingHorizontal = 14;
    const usableHeight = height - paddingTop - paddingBottom;
    const barGap = 12;
    const barWidth = Math.max(
      22,
      (width - paddingHorizontal * 2 - Math.max(0, cores.length - 1) * barGap) /
        Math.max(cores.length, 1),
    );
    const maxValue = Math.max(...values, 1);
    const gridValues = Array.from({ length: 4 }, (_, index) => maxValue * ((index + 1) / 4));

    return {
      width,
      height,
      paddingTop,
      paddingBottom,
      paddingHorizontal,
      usableHeight,
      barGap,
      barWidth,
      maxValue,
      gridValues,
    };
  }, [cores.length, values, windowWidth]);

  return (
    <View style={styles.stage}>
      <Svg width={chart.width} height={chart.height}>
        {chart.gridValues.map((gridValue) => {
          const y = chart.paddingTop + chart.usableHeight * (1 - gridValue / chart.maxValue);
          return (
            <Line
              key={`grid-${gridValue}`}
              x1={chart.paddingHorizontal}
              y1={y}
              x2={chart.width - chart.paddingHorizontal}
              y2={y}
              stroke="#dbe7fb"
              strokeWidth="1"
            />
          );
        })}

        {cores.map((core, index) => {
          const value = values[index] || 0;
          const height = chart.usableHeight * (value / chart.maxValue);
          const x = chart.paddingHorizontal + index * (chart.barWidth + chart.barGap);
          const y = chart.paddingTop + chart.usableHeight - height;

          return (
            <React.Fragment key={core.id}>
              <Rect
                x={x}
                y={y}
                width={chart.barWidth}
                height={Math.max(height, 4)}
                rx={10}
                fill={core.color || '#3b82f6'}
              />
              <SvgText
                x={x + chart.barWidth / 2}
                y={Math.max(y - 8, 14)}
                fill={core.color || '#3b82f6'}
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
              >
                {valueFormatter(value)}
              </SvgText>
              <SvgText
                x={x + chart.barWidth / 2}
                y={chart.height - 14}
                fill="#52637a"
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
              >
                {shortenLabel(core.name)}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>

      <Text style={styles.axisHint}>Each bar uses its core color{yAxisSuffix ? ` · Values shown in ${yAxisSuffix}` : ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  axisHint: {
    marginTop: 2,
    fontSize: 12,
    color: '#6b7a90',
  },
});
