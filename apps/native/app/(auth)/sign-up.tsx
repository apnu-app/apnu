import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SignUp } from '@/components/sign-up';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const TINDER_PINK = "#fd267a";
const TINDER_ORANGE = "#ff6036";

export default function SignUpScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Immersive Gradient Background */}
      <LinearGradient
        colors={[TINDER_ORANGE, TINDER_PINK]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Let's get you set up to start track your analytics.</Text>
          
          <View style={styles.formContainer}>
            <SignUp />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: 'white',
    marginTop: 20,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 10,
    marginBottom: 40,
    lineHeight: 22,
    fontWeight: '500',
  },
  formContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  }
});
