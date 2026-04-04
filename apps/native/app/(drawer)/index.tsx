import { Card, useThemeColor, Button } from "heroui-native";
import { Text, View, useColorScheme } from "react-native";
import { authClient } from "@/lib/auth-client";
import { Container } from "@/components/container";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Dashboard() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const colorScheme = useColorScheme();

  // Theme-aware colors
  const bgColor = useThemeColor("background");

  const surfaceColor = useThemeColor("surface"); // For the card background

  return (
    <Container className="bg-background" disableSafeArea>
      {/* Auto-adapts Status Bar icons based on current color scheme */}
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack.Screen options={{ headerShown: false, title: "" }} />

      <View
        style={{
          padding: 24,
          flex: 1,
          justifyContent: "center",
        }}
      >
        <View
          className="p-8 rounded-[40px] w-full items-center shadow-sm"
          style={{ backgroundColor: surfaceColor }}
        >
          <Text className="text-muted text-sm font-bold uppercase tracking-widest mb-2">
            Authenticated Account
          </Text>

          <Text className="text-foreground text-3xl font-extrabold text-center mb-1">
            Hello, {session?.user?.name || "User"}!
          </Text>

          <Text className="text-muted text-lg text-center mb-8">
            {session?.user?.email}
          </Text>

          <Button
            onPress={async () => {
              await authClient.signOut();
              router.replace("/landing");
            }}
            variant="secondary"
            className="bg-red-50 text-red-600 dark:bg-red-900/10 h-14 rounded-2xl w-full"
          >
            <Button.Label className="text-red-500 font-bold">
              Sign Out
            </Button.Label>
          </Button>
        </View>
      </View>
    </Container>
  );
}
