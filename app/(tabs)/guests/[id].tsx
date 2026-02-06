import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  useGuestsStore,
  usePropertiesStore,
  useUnitsStore,
  deleteGuest,
} from "@/src/store";
import { useThemeColors } from "@/src/theme/colors";
import {
  SCREEN_PADDING,
  CARD_PADDING,
  MIN_TAP_HEIGHT,
} from "@/src/theme/layout";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function GuestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const guests = useGuestsStore((s) => s.guests);
  const properties = usePropertiesStore((s) => s.properties);
  const units = useUnitsStore((s) => s.units);

  const guest = guests.find((g) => g.id === id);
  const property = guest
    ? properties.find((p) => p.id === guest.propertyId)
    : null;
  const unit = guest ? units.find((u) => u.id === guest.unitId) : null;

  const handleRemove = () => {
    if (!id) return;
    Alert.alert(
      "Remove guest",
      `Remove ${guest?.fullName ?? "this guest"}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGuest(id);
              router.back();
            } catch (e) {
              console.error("Delete guest failed", e);
              Alert.alert(
                "Error",
                e instanceof Error ? e.message : "Could not remove guest",
              );
            }
          },
        },
      ],
    );
  };

  const stylesWithTheme = StyleSheet.create({
    screen: { backgroundColor: colors.background },
    scroll: { padding: SCREEN_PADDING },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: CARD_PADDING,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
      textTransform: "uppercase",
    },
    value: { fontSize: 17, color: colors.text },
    actions: { flexDirection: "row", gap: 12, marginTop: 8, marginBottom: 24 },
    editBtn: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      minHeight: MIN_TAP_HEIGHT,
      alignItems: "center",
      justifyContent: "center",
    },
    editBtnText: { fontSize: 17, fontWeight: "600", color: colors.primaryText },
    removeBtn: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingVertical: 14,
      minHeight: MIN_TAP_HEIGHT,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    removeBtnText: { fontSize: 17, fontWeight: "600", color: colors.error },
  });

  if (!guest) {
    return (
      <View style={stylesWithTheme.screen}>
        <View style={stylesWithTheme.scroll}>
          <Text style={{ color: colors.textSecondary }}>Guest not found</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={stylesWithTheme.screen}
      contentContainerStyle={stylesWithTheme.scroll}
    >
      <View style={stylesWithTheme.card}>
        <Text style={stylesWithTheme.label}>Name</Text>
        <Text style={stylesWithTheme.value}>{guest.fullName}</Text>
      </View>
      <View style={stylesWithTheme.card}>
        <Text style={stylesWithTheme.label}>Phone</Text>
        <Text style={stylesWithTheme.value}>{guest.phone || "—"}</Text>
      </View>
      <View style={stylesWithTheme.card}>
        <Text style={stylesWithTheme.label}>Property</Text>
        <Text style={stylesWithTheme.value}>{property?.name ?? "—"}</Text>
      </View>
      <View style={stylesWithTheme.card}>
        <Text style={stylesWithTheme.label}>Unit</Text>
        <Text style={stylesWithTheme.value}>{unit?.name ?? "—"}</Text>
      </View>
      <View style={stylesWithTheme.card}>
        <Text style={stylesWithTheme.label}>Check-in</Text>
        <Text style={stylesWithTheme.value}>{formatDate(guest.checkIn)}</Text>
      </View>
      <View style={stylesWithTheme.card}>
        <Text style={stylesWithTheme.label}>Check-out</Text>
        <Text style={stylesWithTheme.value}>{formatDate(guest.checkOut)}</Text>
      </View>
      <View style={stylesWithTheme.card}>
        <Text style={stylesWithTheme.label}>Source</Text>
        <Text style={stylesWithTheme.value}>{guest.source}</Text>
      </View>
      <View style={stylesWithTheme.card}>
        <Text style={stylesWithTheme.label}>Payment</Text>
        <Text style={stylesWithTheme.value}>{guest.paymentStatus}</Text>
      </View>
      {typeof guest.price === "number" && guest.price > 0 ? (
        <View style={stylesWithTheme.card}>
          <Text style={stylesWithTheme.label}>Price / Income</Text>
          <Text style={stylesWithTheme.value}>
            {new Intl.NumberFormat(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }).format(guest.price)}
          </Text>
        </View>
      ) : null}
      {guest.notes ? (
        <View style={stylesWithTheme.card}>
          <Text style={stylesWithTheme.label}>Notes</Text>
          <Text style={stylesWithTheme.value}>{guest.notes}</Text>
        </View>
      ) : null}

      <View style={stylesWithTheme.actions}>
        <TouchableOpacity
          style={stylesWithTheme.editBtn}
          onPress={() =>
            router.push({ pathname: "/add-guest", params: { guestId: id } })
          }
          activeOpacity={0.8}
        >
          <Text style={stylesWithTheme.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={stylesWithTheme.removeBtn}
          onPress={handleRemove}
          activeOpacity={0.8}
        >
          <Text style={stylesWithTheme.removeBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
