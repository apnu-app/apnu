import React, { useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";

const PRIMARY = "#ff385c";
const LIKE_COLOR = "#00c46a";
const PASS_COLOR = "#ff385c";
const SUPER_COLOR = "#428bff";

export interface SwipeCardProfile {
  userId: string;
  name: string;
  age: number;
  bio?: string | null;
  photos?: string[] | null;
  college?: string | null;
  course?: string | null;
  year?: number | null;
  city?: string | null;
}

interface SwipeCardProps {
  profile: SwipeCardProfile;
  onSwipe: (direction: "like" | "pass" | "superlike") => void;
  isTop: boolean;
  stackIndex: number; // 0 = top, 1 = second, 2 = third
}

const SPRING = { damping: 14, stiffness: 120 };

export function SwipeCard({ profile, onSwipe, isTop, stackIndex }: SwipeCardProps) {
  const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();
  const CARD_H = SCREEN_H * 0.72;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [photoIndex, setPhotoIndex] = React.useState(0);

  const photos = profile.photos ?? [];
  const hasPhotos = photos.length > 0;

  const triggerSwipe = useCallback(
    (dir: "like" | "pass" | "superlike") => {
      onSwipe(dir);
    },
    [onSwipe]
  );

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const { translationX, translationY, velocityX } = e;
      const snapRight = translationX > SCREEN_W * 0.4 || velocityX > 800;
      const snapLeft = translationX < -(SCREEN_W * 0.4) || velocityX < -800;
      const snapUp = translationY < -(SCREEN_H * 0.25);

      if (snapRight) {
        translateX.value = withSpring(SCREEN_W * 1.5, SPRING, () =>
          runOnJS(triggerSwipe)("like")
        );
      } else if (snapLeft) {
        translateX.value = withSpring(-SCREEN_W * 1.5, SPRING, () =>
          runOnJS(triggerSwipe)("pass")
        );
      } else if (snapUp) {
        translateY.value = withSpring(-SCREEN_H * 1.5, SPRING, () =>
          runOnJS(triggerSwipe)("superlike")
        );
      } else {
        // Spring back to center
        translateX.value = withSpring(0, SPRING);
        translateY.value = withSpring(0, SPRING);
      }
    });

  // Scale and translateY for depth illusion on non-top cards
  const scaleValues = [1, 0.95, 0.9];
  const yOffsets = [0, -14, -28];

  const cardStyle = useAnimatedStyle(() => {
    if (!isTop) {
      return {
        transform: [
          { scale: scaleValues[stackIndex] ?? 0.9 },
          { translateY: yOffsets[stackIndex] ?? -28 },
        ],
      };
    }
    const rotate = interpolate(translateX.value, [-SCREEN_W, 0, SCREEN_W], [-15, 0, 15]);
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  // Overlay visibility
  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SCREEN_W * 0.3], [0, 1], "clamp"),
  }));
  const passOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-(SCREEN_W * 0.3), 0], [1, 0], "clamp"),
  }));
  const superOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [-(SCREEN_H * 0.2), 0], [1, 0], "clamp"),
  }));

  const initials = profile.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SCREEN_W - 32,
            height: CARD_H,
            borderRadius: 20,
            borderCurve: "continuous",
            overflow: "hidden",
            backgroundColor: "#fff",
            boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
            zIndex: 10 - stackIndex,
          },
          cardStyle,
        ]}
      >
        {/* Photo area */}
        {hasPhotos ? (
          <View style={{ flex: 1 }}>
            <Animated.Image
              source={{ uri: photos[photoIndex] }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
        ) : (
          // Initials placeholder
          <View
            style={{
              flex: 1,
              backgroundColor: "#f2f2f2",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: PRIMARY,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 44, fontWeight: "800" }}>
                {initials}
              </Text>
            </View>
          </View>
        )}

        {/* Photo dot indicators */}
        {photos.length > 1 && (
          <View
            style={{
              position: "absolute",
              top: 12,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "center",
              gap: 5,
            }}
          >
            {photos.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === photoIndex ? 22 : 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: i === photoIndex ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              />
            ))}
          </View>
        )}

        {/* Tap zones: left 30% = prev, right 70% = next */}
        {isTop && hasPhotos && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: "35%",
              flexDirection: "row",
            }}
          >
            <Pressable
              style={{ width: "30%", height: "100%" }}
              onPress={() => setPhotoIndex((i) => Math.max(0, i - 1))}
            />
            <Pressable
              style={{ flex: 1, height: "100%" }}
              onPress={() =>
                setPhotoIndex((i) => Math.min(photos.length - 1, i + 1))
              }
            />
          </View>
        )}

        {/* Bottom gradient overlay — dark scrim on bottom portion */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "45%",
            // Solid semi-transparent scrim; expo-linear-gradient would give true gradient
            backgroundColor: "rgba(0,0,0,0.0)",
          }}
          pointerEvents="none"
        />
        {/* Darker scrim near bottom for text legibility */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "30%",
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
          pointerEvents="none"
        />

        {/* Card info */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 20,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 28,
              fontWeight: "800",
              marginBottom: 4,
            }}
          >
            {profile.name}, {profile.age}
          </Text>
          {(profile.college || profile.course) && (
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                fontWeight: "500",
                opacity: 0.9,
                marginBottom: 4,
              }}
            >
              {[profile.college, profile.course].filter(Boolean).join(" · ")}
            </Text>
          )}
          {profile.bio && (
            <Text
              numberOfLines={2}
              style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: "400",
                opacity: 0.8,
              }}
            >
              {profile.bio}
            </Text>
          )}
        </View>

        {/* Direction overlays */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: 52,
              left: 20,
              borderWidth: 3,
              borderRadius: 8,
              borderColor: LIKE_COLOR,
              paddingHorizontal: 12,
              paddingVertical: 6,
              transform: [{ rotate: "-15deg" }],
            },
            likeOverlayStyle,
          ]}
        >
          <Text style={{ color: LIKE_COLOR, fontSize: 28, fontWeight: "800" }}>
            ♥ LIKE
          </Text>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: 52,
              right: 20,
              borderWidth: 3,
              borderRadius: 8,
              borderColor: PASS_COLOR,
              paddingHorizontal: 12,
              paddingVertical: 6,
              transform: [{ rotate: "15deg" }],
            },
            passOverlayStyle,
          ]}
        >
          <Text style={{ color: PASS_COLOR, fontSize: 28, fontWeight: "800" }}>
            ✗ NOPE
          </Text>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: 52,
              alignSelf: "center",
              left: 0,
              right: 0,
              alignItems: "center",
              borderWidth: 3,
              borderRadius: 8,
              borderColor: SUPER_COLOR,
              marginHorizontal: 60,
              paddingHorizontal: 12,
              paddingVertical: 6,
            },
            superOverlayStyle,
          ]}
        >
          <Text style={{ color: SUPER_COLOR, fontSize: 28, fontWeight: "800" }}>
            ★ SUPER
          </Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
