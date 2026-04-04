import React from "react";
import { SplashScreen } from "@/components/splash-screen";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function SplashRoute() {
  const router = useRouter();

  useEffect(() => {
    // Navigate home after 2.5 seconds
    const timer = setTimeout(() => {
      // Use replace so user can't go back to splash
      router.replace("/(drawer)");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return <SplashScreen />;
}
