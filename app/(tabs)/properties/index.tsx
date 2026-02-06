import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePropertiesStore, useUnitsStore } from "@/src/store";
import { useThemeColors } from "@/src/theme/colors";
import {
  SCREEN_PADDING,
  CARD_PADDING,
  LIST_ITEM_HEIGHT,
  MIN_TAP_HEIGHT,
} from "@/src/theme/layout";

export default function PropertiesListScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const router = useRouter();
  const properties = usePropertiesStore((s) => s.properties);
  const units = useUnitsStore((s) => s.units);
  const isLoading = usePropertiesStore((s) => s.isLoading);

  const getUnitCount = (propertyId: string) =>
    units.filter((u) => u.propertyId === propertyId).length;

  const stylesWithTheme = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    list: { flex: 1 },
    listContent: {
      paddingHorizontal: SCREEN_PADDING,
      paddingBottom: insets.bottom + 56 + 32,
    },
    header: { paddingVertical: 8, marginBottom: 16 },
    headerTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      letterSpacing: -0.5,
    },
    headerSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 14,
      minHeight: MIN_TAP_HEIGHT,
      marginBottom: 20,
    },
    addBtnText: { fontSize: 17, fontWeight: "600", color: colors.primaryText },
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
    itemMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
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
    emptyBtnText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primaryText,
    },
    loadingWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: SCREEN_PADDING,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 15,
      color: colors.textSecondary,
    },
  });

  const ListHeader = () => (
    <>
      <View style={stylesWithTheme.header}>
        <Text style={stylesWithTheme.headerTitle}>Properties</Text>
        <Text style={stylesWithTheme.headerSub}>
          {properties.length} propert
          {properties.length === 1 ? "y" : "ies"}
          {units.length > 0 ? ` · ${units.length} units` : ""}
        </Text>
      </View>
      <TouchableOpacity
        style={stylesWithTheme.addBtn}
        onPress={() => router.push("/properties/add")}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={22} color={colors.primaryText} />
        <Text style={stylesWithTheme.addBtnText}>Add property</Text>
      </TouchableOpacity>
      <View style={stylesWithTheme.statsRow}>
        <View style={stylesWithTheme.statCard}>
          <View style={stylesWithTheme.statIconWrap}>
            <Ionicons name="business" size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={stylesWithTheme.statValue}>{properties.length}</Text>
            <Text style={stylesWithTheme.statLabel}>Properties</Text>
          </View>
        </View>
        <View style={stylesWithTheme.statCard}>
          <View
            style={[
              stylesWithTheme.statIconWrap,
              { backgroundColor: colors.success + "22" },
            ]}
          >
            <Ionicons name="home" size={24} color={colors.success} />
          </View>
          <View>
            <Text style={stylesWithTheme.statValue}>{units.length}</Text>
            <Text style={stylesWithTheme.statLabel}>Units</Text>
          </View>
        </View>
      </View>
      <View style={stylesWithTheme.sectionTitleRow}>
        <Text style={stylesWithTheme.sectionTitleText}>All properties</Text>
      </View>
    </>
  );

  const ListEmpty = () => (
    <View style={stylesWithTheme.emptyWrap}>
      <View style={stylesWithTheme.emptyIconWrap}>
        <Ionicons
          name="business-outline"
          size={40}
          color={colors.textSecondary}
        />
      </View>
      <Text style={stylesWithTheme.emptyTitle}>No properties yet</Text>
      <Text style={stylesWithTheme.emptySub}>
        Add a property to manage units and guests.
      </Text>
      <TouchableOpacity
        style={stylesWithTheme.emptyBtn}
        onPress={() => router.push("/properties/add")}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={22} color={colors.primaryText} />
        <Text style={stylesWithTheme.emptyBtnText}>Add property</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={stylesWithTheme.screen}>
        <View style={stylesWithTheme.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={stylesWithTheme.loadingText}>Loading properties…</Text>
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
          properties.length === 0 && { flexGrow: 1 },
        ]}
        data={properties}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={properties.length > 0 ? <ListHeader /> : null}
        ListEmptyComponent={<ListEmpty />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const unitCount = getUnitCount(item.id);
          return (
            <TouchableOpacity
              style={stylesWithTheme.item}
              onPress={() => router.push(`/properties/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={stylesWithTheme.itemIconWrap}>
                <Ionicons name="business" size={24} color={colors.primary} />
              </View>
              <View style={stylesWithTheme.itemContent}>
                <Text style={stylesWithTheme.itemTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={stylesWithTheme.itemSub} numberOfLines={1}>
                  {item.city || "—"}
                </Text>
                <Text style={stylesWithTheme.itemMeta}>
                  {unitCount} unit{unitCount !== 1 ? "s" : ""}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
                style={stylesWithTheme.itemChevron}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
