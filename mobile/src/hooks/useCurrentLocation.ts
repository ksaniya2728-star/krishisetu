import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

export type LatLng = { latitude: number; longitude: number };

type State = {
  loading: boolean;
  location: LatLng | null;
  error: string | null;
  permissionStatus: Location.PermissionStatus | null;
};

export function useCurrentLocation(options?: { auto?: boolean }) {
  const auto = options?.auto ?? true;
  const [state, setState] = useState<State>({
    loading: auto,
    location: null,
    error: null,
    permissionStatus: null,
  });

  const inFlight = useRef(false);

  const requestAndFetch = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;

    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setState({
          loading: false,
          location: null,
          error: null,
          permissionStatus: perm.status,
        });
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setState({
        loading: false,
        location: {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        },
        error: null,
        permissionStatus: perm.status,
      });
    } catch (e: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e?.message || 'Unable to fetch location',
      }));
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    if (auto) void requestAndFetch();
  }, [auto, requestAndFetch]);

  return {
    ...state,
    refresh: requestAndFetch,
  };
}

