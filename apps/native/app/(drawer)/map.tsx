import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, Linking, Pressable, Platform } from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import Animated, { SlideInDown, SlideOutDown, FadeIn, FadeOut } from "react-native-reanimated";
import { env } from "@apnu/env/native";
import { authClient } from "@/lib/auth-client";

interface NearbyUser {
  userId: string;
  name: string;
  image?: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
}

const RADIUS_OPTIONS = [1, 3, 5, 10];
const PRIMARY_COLOR = "#ff385c";

export default function MapScreen() {
  const { data: session } = authClient.useSession();
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [radius, setRadius] = useState(5);
  const [ghostMode, setGhostMode] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);

  const fetchUsersRef = useRef<NodeJS.Timeout | null>(null);
  const updateLocationRef = useRef<NodeJS.Timeout | null>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  const syncBackendLocation = async (lat: number, lng: number, isVisible: boolean) => {
    try {
      await fetch(`${env.EXPO_PUBLIC_SERVER_URL}/api/location/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng, isVisible }),
      });
    } catch (e) {
      console.warn("Failed to update location", e);
    }
  };

  const fetchNearbyUsers = useCallback(async (lat: number, lng: number, rad: number) => {
    if (!session) return;
    try {
      const res = await fetch(`${env.EXPO_PUBLIC_SERVER_URL}/api/location/nearby?lat=${lat}&lng=${lng}&radius=${rad}`);
      if (res.ok) {
        const data = await res.json();
        setNearbyUsers(data.users || []);
      }
    } catch (e) {
      console.warn("Failed to fetch nearby", e);
    }
  }, [session]);

  const initLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        "Location Required",
        "Please enable location services in Settings to use the map feature.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Settings", onPress: () => Linking.openSettings() }
        ]
      );
      setErrorMessage("Permission to access location was denied");
      return;
    }

    const currentLoc = await Location.getCurrentPositionAsync({});
    setLocation(currentLoc);
    
    // Initial fetches
    await syncBackendLocation(currentLoc.coords.latitude, currentLoc.coords.longitude, !ghostMode);
    fetchNearbyUsers(currentLoc.coords.latitude, currentLoc.coords.longitude, radius);

    // Watch position
    locationSubRef.current = await Location.watchPositionAsync(
      { distanceInterval: 50 },
      (newLoc) => {
        setLocation(newLoc);
      }
    );

    // Intevals for syncing
    updateLocationRef.current = setInterval(() => {
      if (location) {
        syncBackendLocation(location.coords.latitude, location.coords.longitude, !ghostMode);
      }
    }, 30000);

    fetchUsersRef.current = setInterval(() => {
      if (location) {
        fetchNearbyUsers(location.coords.latitude, location.coords.longitude, radius);
      }
    }, 30000);
  };

  useEffect(() => {
    initLocation();
    
    return () => {
      if (locationSubRef.current) locationSubRef.current.remove();
      if (updateLocationRef.current) clearInterval(updateLocationRef.current);
      if (fetchUsersRef.current) clearInterval(fetchUsersRef.current);
    };
  }, []); // Only run once on mount

  // Watch for radius or ghostMode changes to trigger immediate fetch/update
  useEffect(() => {
    if (location) {
      fetchNearbyUsers(location.coords.latitude, location.coords.longitude, radius);
    }
  }, [radius, location?.coords.latitude, location?.coords.longitude]);

  useEffect(() => {
    if (location) {
      syncBackendLocation(location.coords.latitude, location.coords.longitude, !ghostMode);
    }
  }, [ghostMode]);

  const handleRecenter = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  if (errorMessage) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Finding you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        showsUserLocation={true}
        showsMyLocationButton={false}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={() => setSelectedUser(null)}
      >
        <Circle
          center={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          radius={radius * 1000}
          strokeColor="transparent"
          fillColor="rgba(255, 56, 92, 0.15)"
        />

        {nearbyUsers.map(u => (
          <Marker
            key={u.userId}
            coordinate={{ latitude: u.latitude, longitude: u.longitude }}
            onPress={() => setSelectedUser(u)}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerInner} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Floating Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.statsText}>
          {nearbyUsers.length} nearby  |  {radius}km radius
        </Text>
      </View>

      {/* Ghost Mode Toggle */}
      <Pressable 
        style={styles.ghostToggle} 
        onPress={() => setGhostMode(!ghostMode)}
      >
        <Ionicons 
          name={ghostMode ? "eye-off-outline" : "eye-outline"} 
          size={24} 
          color={ghostMode ? "#6a6a6a" : PRIMARY_COLOR} 
        />
        {ghostMode && <Text style={styles.ghostText}>Ghost Mode</Text>}
      </Pressable>

      {/* Radius Chips */}
      <View style={styles.radiusContainer}>
        {RADIUS_OPTIONS.map(rad => (
          <Pressable
            key={rad}
            style={[styles.radiusChip, radius === rad && styles.radiusChipActive]}
            onPress={() => setRadius(rad)}
          >
            <Text style={[styles.radiusText, radius === rad && styles.radiusTextActive]}>
              {rad}km
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Recenter Button */}
      <Pressable style={styles.recenterButton} onPress={handleRecenter}>
        <Ionicons name="locate-outline" size={24} color="#222" />
      </Pressable>

      {/* User Card */}
      {selectedUser && (
        <Animated.View 
          entering={SlideInDown} 
          exiting={SlideOutDown} 
          style={styles.userCard}
        >
          <View style={styles.userInfoRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{selectedUser.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{selectedUser.name}</Text>
              <Text style={styles.userDistance}>
                {selectedUser.distanceKm < 1 
                  ? `${Math.round(selectedUser.distanceKm * 1000)} meters away`
                  : `${selectedUser.distanceKm.toFixed(1)} km away`}
              </Text>
            </View>
          </View>
          <Pressable style={styles.waveButton}>
            <Text style={styles.waveButtonText}>👋 Wave</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 12,
    color: '#6a6a6a',
    fontSize: 16,
    fontWeight: '500',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  statsCard: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsText: {
    color: '#222',
    fontWeight: '700',
    fontSize: 14,
  },
  ghostToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 70,
    right: 20,
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  ghostText: {
    fontSize: 10,
    color: '#6a6a6a',
    fontWeight: '600',
    marginTop: 2,
  },
  radiusContainer: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  radiusChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  radiusChipActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  radiusText: {
    color: '#444',
    fontWeight: '600',
    fontSize: 14,
  },
  radiusTextActive: {
    color: '#fff',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  userDetails: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  userDistance: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6a6a6a',
  },
  waveButton: {
    backgroundColor: 'rgba(255, 56, 92, 0.1)',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  waveButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },
  markerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
  },
  markerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: PRIMARY_COLOR,
    borderWidth: 2,
    borderColor: '#fff',
  }
});
