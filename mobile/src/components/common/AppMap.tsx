import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { colors, radii } from '../../theme';
import type { LatLng } from '../../hooks/useCurrentLocation';

export type AppMapMarker = {
  id: string;
  coordinate: LatLng;
  title?: string;
  pinColor?: string;
};

type Props = {
  loading?: boolean;
  permissionDenied?: boolean;
  errorText?: string | null;
  onRetry?: () => void;
  initialRegion?: Region;
  markers?: AppMapMarker[];
  polyline?: LatLng[];
  showUserLocation?: boolean;
  height?: number;
  onPressCoordinate?: (coordinate: LatLng) => void;
};

export function AppMap({
  loading,
  permissionDenied,
  errorText,
  onRetry,
  initialRegion,
  markers = [],
  polyline,
  showUserLocation = false,
  height = 260,
  onPressCoordinate,
}: Props) {
  const fallbackRegion = useMemo<Region>(
    () =>
      initialRegion || {
        latitude: 23.0225,
        longitude: 72.5714,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      },
    [initialRegion]
  );

  if (permissionDenied) {
    return (
      <View style={[styles.stateCard, { height }]}>
        <Text style={styles.stateTitle}>Location permission needed</Text>
        <Text style={styles.stateText}>Enable location access to show maps and nearby farms.</Text>
        {onRetry ? (
          <Pressable style={styles.retry} onPress={onRetry}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.stateCard, { height }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.stateText, { marginTop: 10 }]}>Loading map…</Text>
      </View>
    );
  }

  if (errorText) {
    return (
      <View style={[styles.stateCard, { height }]}>
        <Text style={styles.stateTitle}>Map unavailable</Text>
        <Text style={styles.stateText}>{errorText}</Text>
        {onRetry ? (
          <Pressable style={styles.retry} onPress={onRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={fallbackRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton
        onPress={
          onPressCoordinate
            ? (e) => {
                onPressCoordinate(e.nativeEvent.coordinate);
              }
            : undefined
        }
      >
        {markers.map((m) => (
          <Marker key={m.id} coordinate={m.coordinate} title={m.title} pinColor={m.pinColor} />
        ))}
        {polyline && polyline.length >= 2 ? (
          <Polyline coordinates={polyline} strokeColor={colors.primary} strokeWidth={4} />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  stateCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 20,
  },
  stateTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  stateText: {
    color: colors.muted,
    lineHeight: 20,
    textAlign: 'center',
  },
  retry: {
    backgroundColor: colors.lightGreen,
    borderRadius: 999,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    color: colors.primary,
    fontWeight: '800',
  },
});

