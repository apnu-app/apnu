import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  Platform,
  ToastAndroid,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { env } from "@apnu/env/native";

import { SwipeCard, type SwipeCardProfile } from "@/components/swipe/SwipeCard";
import { ActionButtons } from "@/components/swipe/ActionButtons";
import { MatchModal } from "@/components/swipe/MatchModal";
import { SkeletonCards } from "@/components/swipe/SkeletonCards";
import { EmptyState } from "@/components/swipe/EmptyState";

const API_BASE = env.EXPO_PUBLIC_SERVER_URL;

interface MatchInfo {
  matchId: string;
  matchedProfile: {
    userId: string;
    name: string;
    photos?: string[] | null;
    college?: string | null;
  } | null;
}

export default function DiscoverScreen() {
  const { data: session } = authClient.useSession();
  const { height: SCREEN_H } = useWindowDimensions();

  const [profiles, setProfiles] = useState<SwipeCardProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // ─── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert("", msg, [{ text: "OK" }]);
    }
  };

  // ─── Fetch feed ─────────────────────────────────────────────────────────────
  const fetchFeed = useCallback(
    async (append = false) => {
      if (isFetchingMore && append) return;

      // Cancel any in-flight request (native-data-fetching skill: AbortController)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (!append) setLoading(true);
      else setIsFetchingMore(true);

      try {
        const res = await fetch(`${API_BASE}/api/swipe/feed`, {
          signal: controller.signal,
        });

        // Always check response.ok (native-data-fetching skill)
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: { profiles: SwipeCardProfile[] } = await res.json();

        setProfiles((prev) =>
          append ? [...prev, ...data.profiles] : data.profiles
        );
      } catch (err: any) {
        if (err.name === "AbortError") return; // Cancelled — ignore silently
        console.warn("[Feed fetch error]:", err);
        if (append) {
          showToast("Couldn't load more profiles");
        }
      } finally {
        if (!append) setLoading(false);
        setIsFetchingMore(false);
      }
    },
    [isFetchingMore]
  );

  // Mount: initial fetch
  useEffect(() => {
    fetchFeed(false);
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // ─── Handle swipe action ────────────────────────────────────────────────────
  const handleSwipe = useCallback(
    async (direction: "like" | "pass" | "superlike") => {
      const top = profiles[0];
      if (!top) return;

      // Optimistically remove top card
      setProfiles((prev) => prev.slice(1));

      // Silently fetch more when running low (5 remaining)
      const remaining = profiles.length - 1;
      if (remaining <= 5) {
        fetchFeed(true);
      }

      // POST swipe action
      try {
        const res = await fetch(`${API_BASE}/api/swipe/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ swipedId: top.userId, direction }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: {
          matched: boolean;
          matchId?: string;
          matchedProfile?: MatchInfo["matchedProfile"];
        } = await res.json();

        if (data.matched && data.matchId) {
          setMatchInfo({
            matchId: data.matchId,
            matchedProfile: data.matchedProfile ?? null,
          });
        }
      } catch (err) {
        console.warn("[Swipe action error]:", err);
      }
    },
    [profiles, fetchFeed]
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
      <Stack.Screen options={{ title: "Discover", headerShown: true }} />

      {loading ? (
        <SkeletonCards />
      ) : profiles.length === 0 ? (
        <EmptyState />
      ) : (
        <View style={{ flex: 1 }}>
          {/* Card stack (render top 3) */}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 16,
            }}
          >
            {profiles
              .slice(0, 3)
              .reverse()
              .map((p, reversedIdx) => {
                const stackIndex = 2 - reversedIdx;
                return (
                  <SwipeCard
                    key={p.userId}
                    profile={p}
                    onSwipe={handleSwipe}
                    isTop={stackIndex === 0}
                    stackIndex={stackIndex}
                  />
                );
              })}
          </View>

          {/* Action buttons */}
          <View
            style={{
              paddingVertical: 20,
              paddingBottom: Platform.OS === "ios" ? 32 : 20,
            }}
          >
            <ActionButtons
              onPass={() => handleSwipe("pass")}
              onSuperlike={() => handleSwipe("superlike")}
              onLike={() => handleSwipe("like")}
            />
          </View>
        </View>
      )}

      {/* Match modal */}
      <MatchModal
        visible={!!matchInfo}
        myName={session?.user?.name ?? "You"}
        matchedName={matchInfo?.matchedProfile?.name ?? ""}
        matchedPhotos={matchInfo?.matchedProfile?.photos}
        onSendWave={() => setMatchInfo(null)}
        onKeepSwiping={() => setMatchInfo(null)}
      />
    </View>
  );
}
