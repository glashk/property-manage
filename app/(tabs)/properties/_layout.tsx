import { Stack } from "expo-router";

export default function PropertiesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Properties" }} />
      <Stack.Screen name="add" options={{ title: "Add Property" }} />
      <Stack.Screen name="[id]" options={{ title: "Property" }} />
      <Stack.Screen name="add-unit" options={{ title: "Add Unit" }} />
      <Stack.Screen name="edit" options={{ title: "Edit Property" }} />
    </Stack>
  );
}
