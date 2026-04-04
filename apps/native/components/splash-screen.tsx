import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const TINDER_PINK = "#fd267a";
const TINDER_ORANGE = "#ff6036";

export const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[TINDER_ORANGE, TINDER_PINK]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.centerContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.logoRow}>
            <Text style={styles.brandTitle}>apnu</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.fromLabel}>from</Text>
        <View style={styles.companyRow}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="white">
            <Path d="M12 2L2 7L12 12L22 7L12 2Z" />
            <Path d="M2 17L12 22L22 17" />
            <Path d="M2 12L12 17L22 12" />
          </Svg>
          <Text style={styles.companyName}>ApnuLabs</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TINDER_PINK,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -1,
    fontFamily: "System",
  },
  footer: {
    position: "absolute",
    bottom: 50,
    alignItems: "center",
    width: "100%",
  },
  fromLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
    fontWeight: "500",
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
});
