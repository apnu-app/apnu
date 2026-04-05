import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";

const PRIMARY = "#ff385c";
const SPRING = { damping: 14, stiffness: 100 };

interface MatchModalProps {
  visible: boolean;
  myName: string;
  matchedName: string;
  matchedPhotos?: string[] | null;
  onSendWave: () => void;
  onKeepSwiping: () => void;
}

export function MatchModal({
  visible,
  myName,
  matchedName,
  matchedPhotos,
  onSendWave,
  onKeepSwiping,
}: MatchModalProps) {
  const { width: W } = useWindowDimensions();
  const AVATAR_SIZE = 110;

  const myX = useSharedValue(-W);
  const otherX = useSharedValue(W);
  const fadeIn = useSharedValue(0);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (visible) {
      myX.value = withDelay(100, withSpring(0, SPRING));
      otherX.value = withDelay(100, withSpring(0, SPRING));
      fadeIn.value = withDelay(400, withSpring(1));
      // Auto-dismiss after 8 seconds
      dismissTimer.current = setTimeout(() => onKeepSwiping(), 8000);
    } else {
      myX.value = -W;
      otherX.value = W;
      fadeIn.value = 0;
    }
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [visible]);

  const myAvatarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: myX.value }],
  }));
  const otherAvatarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: otherX.value }],
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: (1 - fadeIn.value) * 20 }],
  }));

  const matchedPhoto = matchedPhotos?.[0];
  const myInitial = myName?.charAt(0).toUpperCase() ?? "?";
  const theirInitial = matchedName?.charAt(0).toUpperCase() ?? "?";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.87)",
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
        }}
      >
        {/* Overlapping avatars */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          {/* Me */}
          <Animated.View
            style={[
              {
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
                backgroundColor: PRIMARY,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 3,
                borderColor: "#fff",
                zIndex: 2,
                marginRight: -20,
              },
              myAvatarStyle,
            ]}
          >
            <Text style={{ color: "#fff", fontSize: 40, fontWeight: "800" }}>
              {myInitial}
            </Text>
          </Animated.View>

          {/* Them */}
          <Animated.View
            style={[
              {
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
                backgroundColor: "#555",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 3,
                borderColor: "#fff",
                zIndex: 1,
                overflow: "hidden",
              },
              otherAvatarStyle,
            ]}
          >
            {matchedPhoto ? (
              <Animated.Image
                source={{ uri: matchedPhoto }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ color: "#fff", fontSize: 40, fontWeight: "800" }}>
                {theirInitial}
              </Text>
            )}
          </Animated.View>
        </View>

        {/* Text + buttons */}
        <Animated.View style={[{ alignItems: "center", width: "100%" }, contentStyle]}>
          <Text
            style={{
              color: PRIMARY,
              fontSize: 36,
              fontWeight: "800",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            It's a Match!
          </Text>
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "400",
              textAlign: "center",
              opacity: 0.85,
              marginBottom: 40,
            }}
          >
            You and {matchedName} both liked each other
          </Text>

          <Pressable
            onPress={() => {
              if (dismissTimer.current) clearTimeout(dismissTimer.current);
              onSendWave();
            }}
            style={({ pressed }) => ({
              width: "100%",
              paddingVertical: 16,
              borderRadius: 16,
              borderCurve: "continuous",
              backgroundColor: PRIMARY,
              alignItems: "center",
              marginBottom: 14,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>
              👋 Send a Wave
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              if (dismissTimer.current) clearTimeout(dismissTimer.current);
              onKeepSwiping();
            }}
            style={({ pressed }) => ({
              width: "100%",
              paddingVertical: 16,
              borderRadius: 16,
              borderCurve: "continuous",
              borderWidth: 1.5,
              borderColor: "rgba(255,255,255,0.35)",
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "600" }}>
              Keep Swiping
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
