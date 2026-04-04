import React from "react";
import { View, Text, StyleSheet, Dimensions, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const TINDER_PINK = "#fd267a";
const TINDER_ORANGE = "#ff6036";

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Background with Tinder Gradient */}
      <LinearGradient
        colors={[TINDER_ORANGE, TINDER_PINK]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.centerContainer}>
        {/* Main Logo */}
        <View style={styles.logoRow}>
          <Text style={styles.brandTitle}>apnu</Text>
        </View>
      </View>

      <View style={styles.bottomSection}>
        {/* Legal text exactly like Tinder */}
        <Text style={styles.legalText}>
          By tapping 'Create account' or 'Sign in' you agree to our{" "}
          <Text style={styles.underlineText}>Terms</Text>. Learn how we process
          your data in our{" "}
          <Text style={styles.underlineText}>Privacy Policy</Text> and{" "}
          <Text style={styles.underlineText}>Cookies Policy</Text>.
        </Text>

        <View style={styles.buttonGroup}>
          <Link href="/sign-up" asChild>
            <Pressable style={styles.authButton}>
              <Ionicons
                name="person-add-outline"
                size={20}
                color={TINDER_PINK}
                style={styles.buttonIcon}
              />
              <Text style={styles.authButtonText}>CREATE ACCOUNT</Text>
            </Pressable>
          </Link>

          <Link href="/sign-in" asChild>
            <Pressable style={styles.authButton}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={TINDER_PINK}
                style={styles.buttonIcon}
              />
              <Text style={styles.authButtonText}>SIGN IN WITH EMAIL</Text>
            </Pressable>
          </Link>

          <Pressable style={styles.troubleButton}>
            <Text style={styles.troubleText}>Trouble signing in?</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 64,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -2,
  },
  bottomSection: {
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  legalText: {
    fontSize: 13,
    color: "white",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 18,
    fontWeight: "500",
  },
  underlineText: {
    textDecorationLine: "underline",
    fontWeight: "700",
  },
  buttonGroup: {
    gap: 12,
  },
  authButton: {
    backgroundColor: "#ffffff",
    height: 54,
    borderRadius: 27,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    position: "absolute",
    left: 24,
  },
  authButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#444",
  },
  troubleButton: {
    marginTop: 10,
    alignItems: "center",
  },
  troubleText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
