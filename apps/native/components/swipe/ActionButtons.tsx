import React from "react";
import { View, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ActionButtonsProps {
  onPass: () => void;
  onSuperlike: () => void;
  onLike: () => void;
}

export function ActionButtons({ onPass, onSuperlike, onLike }: ActionButtonsProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
        paddingBottom: 8,
      }}
    >
      {/* Pass */}
      <Pressable
        onPress={onPass}
        style={({ pressed }) => ({
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
          boxShadow: "0px 4px 12px rgba(0,0,0,0.12)",
        })}
      >
        <Ionicons name="close" size={28} color="#ff385c" />
      </Pressable>

      {/* Superlike (smaller, center) */}
      <Pressable
        onPress={onSuperlike}
        style={({ pressed }) => ({
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
          boxShadow: "0px 4px 12px rgba(0,0,0,0.12)",
        })}
      >
        <Ionicons name="star" size={22} color="#428bff" />
      </Pressable>

      {/* Like */}
      <Pressable
        onPress={onLike}
        style={({ pressed }) => ({
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
          boxShadow: "0px 4px 12px rgba(0,0,0,0.12)",
        })}
      >
        <Ionicons name="heart" size={26} color="#00c46a" />
      </Pressable>
    </View>
  );
}
