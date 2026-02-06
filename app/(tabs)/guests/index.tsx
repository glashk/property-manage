import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActionSheetIOS,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGuestsStore, usePropertiesStore, deleteGuest } from "@/src/store";
import { useThemeColors } from "@/src/theme/colors";
import {
  SCREEN_PADDING,
  CARD_PADDING,
  LIST_ITEM_HEIGHT,
  MIN_TAP_HEIGHT,
} from "@/src/theme/layout";
import { Ionicons } from "@expo/vector-icons";
import type { Guest } from "@/src/types/models";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function GuestsListScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const router = useRouter();
  const guests = useGuestsStore((s) => s.guests);
  const isLoading = useGuestsStore((s) => s.isLoading);
  const properties = usePropertiesStore((s) => s.properties);

  const now = Date.now();
  const occupying = guests.filter((g) => g.checkIn <= now && g.checkOut >= now);

  const getPropertyName = (id: string) =>
    properties.find((p) => p.id === id)?.name ?? "—";

  const openGuestActions = (item: Guest) => {
    const remove = () => {
      Alert.alert(
        "Remove guest",
        `Remove ${item.fullName}? This cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteGuest(item.id);
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
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Edit", "Remove"],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1)
            router.push({ pathname: "/add-guest", params: { guestId: item.id } });
          if (index === 2) remove();
        },
      );
    } else {
      Alert.alert(item.fullName, undefined, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Edit",
          onPress: () =>
            router.push({ pathname: "/add-guest", params: { guestId: item.id } }),
        },
        { text: "Remove", style: "destructive", onPress: remove },
      ]);
    }
  };

  const stylesWithTheme = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    list: { flex: 1 },
    listContent: { paddingHorizontal: SCREEN_PADDING, paddingBottom: insets.bottom + 56 + 32 },
    header: { paddingVertical: 8, marginBottom: 16 },
    headerTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      letterSpacing: -0.5,
    },
    headerSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    statsRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: CARD_PADDING,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    statIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
    },
    statValue: { fontSize: 22, fontWeight: "700", color: colors.text },
    statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    sectionTitleRow: { marginBottom: 10 },
    sectionTitleText: {
      fontSize: 12,
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    item: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: CARD_PADDING,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      minHeight: LIST_ITEM_HEIGHT + 8,
    },
    itemIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
    },
    itemContent: { flex: 1, minWidth: 0 },
    itemTitle: { fontSize: 17, color: colors.text, fontWeight: "600" },
    itemSub: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
    itemDates: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
    itemChevron: { marginLeft: 4 },
    emptyWrap: {
      paddingVertical: 48,
      paddingHorizontal: SCREEN_PADDING,
      alignItems: "center",
    },
    emptyIconWrap: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
      textAlign: "center",
    },
    emptySub: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 24,
    },
    emptyBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 12,
      minHeight: MIN_TAP_HEIGHT,
      justifyContent: "center",
    },
    emptyBtnText: { fontSize: 16, fontWeight: "600", color: colors.primaryText },
    loadingWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: SCREEN_PADDING,
    },
    loadingText: { marginTop: 12, fontSize: 15, color: colors.textSecondary },
  });

  const ListHeader = () => (
    <>
      <View style={stylesWithTheme.header}>
        <Text style={stylesWithTheme.headerTitle}>Guests</Text>
        <Text style={stylesWithTheme.headerSub}>
          {guests.length} total
          {occupying.length > 0 ? ` · ${occupying.length} staying now` : ""}
        </Text>
      </View>
      <View style={stylesWithTheme.statsRow}>
        <View style={stylesWithTheme.statCard}>
          <View style={stylesWithTheme.statIconWrap}>
            <Ionicons name="people" size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={stylesWithTheme.statValue}>{guests.length}</Text>
            <Text style={stylesWithTheme.statLabel}>Total</Text>
          </View>
        </View>
        <View style={stylesWithTheme.statCard}>
          <View style={[stylesWithTheme.statIconWrap, { backgroundColor: colors.success + "22" }]}>
            <Ionicons name="bed" size={24} color={colors.success} />
          </View>
          <View>
            <Text style={stylesWithTheme.statValue}>{occupying.length}</Text>
            <Text style={stylesWithTheme.statLabel}>Occupied now</Text>
          </View>
        </View>
      </View>
      <View style={stylesWithTheme.sectionTitleRow}>
        <Text style={stylesWithTheme.sectionTitleText}>All guests</Text>
      </View>
    </>
  );

  const ListEmpty = () => (
    <View style={stylesWithTheme.emptyWrap}>
      <View style={stylesWithTheme.emptyIconWrap}>
        <Ionicons name="people-outline" size={40} color={colors.textSecondary} />
      </View>
      <Text style={stylesWithTheme.emptyTitle}>No guests yet</Text>
      <Text style={stylesWithTheme.emptySub}>
        Add your first guest to start tracking stays and income.
      </Text>
      <TouchableOpacity
        style={stylesWithTheme.emptyBtn}
        onPress={() => router.push("/add-guest")}
        activeOpacity={0.8}
      >
        <Ionicons name="person-add" size={22} color={colors.primaryText} />
        <Text style={stylesWithTheme.emptyBtnText}>Add guest</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={stylesWithTheme.screen}>
        <View style={stylesWithTheme.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={stylesWithTheme.loadingText}>Loading guests…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={stylesWithTheme.screen}>
      <FlatList
        style={stylesWithTheme.list}
        contentContainerStyle={[
          stylesWithTheme.listContent,
          guests.length === 0 && { flexGrow: 1 },
        ]}
        data={guests}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={guests.length > 0 ? <ListHeader /> : null}
        ListEmptyComponent={<ListEmpty />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={stylesWithTheme.item}
            onPress={() => router.push(`/guests/${item.id}`)}
            onLongPress={() => openGuestActions(item)}
            activeOpacity={0.7}
          >
            <View style={stylesWithTheme.itemIconWrap}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <View style={stylesWithTheme.itemContent}>
              <Text style={stylesWithTheme.itemTitle} numberOfLines={1}>
                {item.fullName}
              </Text>
              <Text style={stylesWithTheme.itemSub} numberOfLines={1}>
                {getPropertyName(item.propertyId)}
              </Text>
              <Text style={stylesWithTheme.itemDates}>
                {formatDate(item.checkIn)} – {formatDate(item.checkOut)}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
              style={stylesWithTheme.itemChevron}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
