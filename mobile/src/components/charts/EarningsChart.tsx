import React from 'react';
import { Dimensions, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, radii } from '../../theme';

type Props = {
  labels: string[];
  values: number[];
};

export function EarningsChart({ labels, values }: Props) {
  return (
    <View>
      <LineChart
        data={{
          labels,
          datasets: [{ data: values.length ? values : [0, 0, 0, 0, 0, 0, 0] }],
        }}
        width={Dimensions.get('window').width - 64}
        height={220}
        withShadow={false}
        withInnerLines={false}
        withOuterLines={false}
        bezier
        chartConfig={{
          backgroundColor: colors.white,
          backgroundGradientFrom: colors.white,
          backgroundGradientTo: colors.white,
          decimalPlaces: 0,
          color: () => colors.secondary,
          labelColor: () => colors.muted,
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: colors.primary,
          },
        }}
        style={{ borderRadius: radii.lg }}
      />
    </View>
  );
}

