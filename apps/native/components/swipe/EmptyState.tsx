import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export function EmptyState() {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
      }}
    >
      <Text style={{ fontSize: 80, marginBottom: 24 }}>🎯</Text>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "700",
          color: "#222",
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        You've seen everyone nearby
      </Text>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "400",
          color: "#6a6a6a",
          textAlign: "center",
          marginBottom: 36,
          lineHeight: 22,
        }}
      >
        Check back later or expand your radius to discover more people
      </Text>
      <Pressable
        style={({ pressed }) => ({
          paddingVertical: 14,
          paddingHorizontal: 32,
          borderRadius: 100,
          borderWidth: 1.5,
          borderColor: "#e0e0e0",
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ color: "#444", fontSize: 15, fontWeight: "600" }}>
          Adjust Filters
        </Text>
      </Pressable>
    </Animated.View>
  );
}
