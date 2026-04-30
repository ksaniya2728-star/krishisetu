import React from 'react';
import { colors } from '../../theme';
import { AppMap } from '../common/AppMap';
import type { LatLng } from '../../hooks/useCurrentLocation';

type Props = {
  farmer: LatLng;
  consumer: LatLng;
  distributor?: LatLng;
};

export function DeliveryMap({ farmer, consumer, distributor }: Props) {
  const polyline = distributor ? [farmer, distributor, consumer] : [farmer, consumer];

  return (
    <AppMap
      initialRegion={{
        latitude: (farmer.latitude + consumer.latitude) / 2,
        longitude: (farmer.longitude + consumer.longitude) / 2,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
      markers={[
        { id: 'farmer', coordinate: farmer, title: 'Farmer', pinColor: colors.primary },
        { id: 'consumer', coordinate: consumer, title: 'Consumer', pinColor: '#F57C00' },
        ...(distributor
          ? [{ id: 'distributor', coordinate: distributor, title: 'Delivery Agent', pinColor: '#1976D2' }]
          : []),
      ]}
      polyline={polyline}
    />
  );
}

