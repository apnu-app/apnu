import React, { useEffect, useRef } from "react";
import { View, useWindowDimensions, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

function ShimmerBlock({ width, height, borderRadius = 12, style }: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0.4, { duration: 700 })
      ),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#e0e0e0",
        },
        animStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCards() {
  const { width: W, height: H } = useWindowDimensions();
  const CARD_H = H * 0.72;
  const CARD_W = W - 32;

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width: CARD_W,
            height: CARD_H,
            borderRadius: 20,
            borderCurve: "continuous",
            overflow: "hidden",
            backgroundColor: "#f2f2f2",
            transform: [
              { scale: i === 0 ? 1 : i === 1 ? 0.95 : 0.9 },
              { translateY: i === 0 ? 0 : i === 1 ? -14 : -28 },
            ],
            zIndex: 10 - i,
          }}
        >
          <ShimmerBlock width="100%" height={CARD_H * 0.7} borderRadius={0} />
          <View style={{ padding: 20, gap: 10 }}>
            <ShimmerBlock width={180} height={28} />
            <ShimmerBlock width={140} height={16} />
            <ShimmerBlock width={220} height={14} />
          </View>
        </View>
      ))}
    </View>
  );
}
