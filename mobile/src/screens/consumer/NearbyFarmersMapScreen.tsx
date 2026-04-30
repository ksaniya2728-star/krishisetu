import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { consumerService } from '../../services/consumerService';
import { colors, radii, spacing, shadows } from '../../theme';

export function NearbyFarmersMapScreen() {
  const navigation = useNavigation<any>();
  const { location } = useCurrentLocation();
  const [farmers, setFarmers] = useState<any[]>([]);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const result = await consumerService.getNearbyProduce(
          location ? { lat: location.latitude, lng: location.longitude, distanceKm: 50 } : {}
        );
        
        // Deduplicate farmers
        const uniqueFarmers = new Map();
        result.produce?.forEach((p: any) => {
          if (p.farmerId && p.location?.coordinates) {
            uniqueFarmers.set(p.farmerId._id, {
              ...p.farmerId,
              coordinates: {
                latitude: p.location.coordinates[1],
                longitude: p.location.coordinates[0],
              }
            });
          }
        });
        setFarmers(Array.from(uniqueFarmers.values()));
      } catch (e) {
        console.warn('Failed to load map data');
      }
    };
    void fetchFarmers();
  }, [location]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 23.0225,
          longitude: location?.longitude || 72.5714,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation
      >
        {farmers.map(farmer => (
          <Marker
            key={farmer._id}
            coordinate={farmer.coordinates}
            title={farmer.farmName || farmer.fullName}
            description="Tap to view produce"
          >
            <View style={styles.markerContainer}>
              <Ionicons name="leaf" size={16} color={colors.white} />
            </View>
          </Marker>
        ))}

        {location && farmers.length > 0 && (
          <Polyline
            coordinates={[
              { latitude: location.latitude, longitude: location.longitude },
              farmers[0].coordinates, // Show route to nearest farmer
            ]}
            strokeColor={colors.primary}
            strokeWidth={3}
            lineDashPattern={[10, 10]}
          />
        )}
      </MapView>

      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Nearby Farms</Text>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{farmers.length} Farms found nearby</Text>
          <Text style={styles.infoSubtitle}>Connecting you directly to fresh harvest</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  
  markerContainer: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.soft,
  },

  header: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.card,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
    overflow: 'hidden',
    ...shadows.card,
  },

  cardContainer: {
    position: 'absolute',
    bottom: 40,
    left: spacing.lg,
    right: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  infoSubtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  }
});
