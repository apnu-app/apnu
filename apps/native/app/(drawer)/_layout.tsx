import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";

export default function DrawerLayout() {
  const primaryColor = "#ff385c"; // Brand red
  const bgColor = useThemeColor("background");
  const surfaceColor = useThemeColor("surface");

  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: primaryColor,
        headerStyle: { backgroundColor: surfaceColor },
        headerShadowVisible: false,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: "Discover",
          title: "Discover",
          drawerIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "flame" : "flame-outline"} size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="map"
        options={{
          drawerLabel: "Nearby",
          title: "Live Map",
          drawerIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "map" : "map-outline"} size={22} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
