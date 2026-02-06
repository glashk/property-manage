import { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/src/theme/colors";
import {
  MIN_TAP_HEIGHT,
  SCREEN_PADDING,
  CARD_PADDING,
} from "@/src/theme/layout";
import { useGuestsStore, usePropertiesStore, useUnitsStore } from "@/src/store";
import { Ionicons } from "@expo/vector-icons";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function isSameDay(a: number, b: number) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function nightsBetween(checkIn: number, checkOut: number): number {
  const nights = (checkOut - checkIn) / MS_PER_DAY;
  return nights >= 1 ? nights : 1;
}

function formatMoney(amount: number) {
  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <Text>
      {formatted}
      <Text style={{ fontSize: 18 }}>ლ</Text>
    </Text>
  );
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const router = useRouter();
  const guests = useGuestsStore((s) => s.guests);
  const properties = usePropertiesStore((s) => s.properties);
  const units = useUnitsStore((s) => s.units);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();

  const checkIns = guests.filter((g) => isSameDay(g.checkIn, todayStart));
  const checkOuts = guests.filter((g) => isSameDay(g.checkOut, todayStart));
  const now = Date.now();
  const occupied = guests.filter((g) => g.checkIn <= now && g.checkOut >= now);

  const incomeTodaySources = occupied
    .map((g) => {
      const price = g.price;
      if (typeof price !== "number" || price <= 0) return null;
      const nights = nightsBetween(g.checkIn, g.checkOut);
      const perNight = price / nights;
      return { guest: g, perNight, amountToday: perNight };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const incomeToday = incomeTodaySources.reduce(
    (sum, x) => sum + x.amountToday,
    0,
  );

  const [incomeTodayExpanded, setIncomeTodayExpanded] = useState(false);
  const [occupiedNowExpanded, setOccupiedNowExpanded] = useState(false);

  const toggleIncomeTodayExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIncomeTodayExpanded((e) => !e);
  };

  const toggleOccupiedNowExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOccupiedNowExpanded((e) => !e);
  };

  const getPropertyName = (id: string) =>
    properties.find((p) => p.id === id)?.name ?? id;

  const todayLabel = today.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const bottomPadding = insets.bottom + 56 + 32;

  const stylesWithTheme = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1, padding: SCREEN_PADDING },
    header: { marginBottom: 12 },
    headerTitle: {
      fontSize: 18,
      fontWeight: "500",
      color: colors.text,
      letterSpacing: -0.5,
    },
    headerSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    section: { marginBottom: 24 },
    sectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 12,
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    quickStat: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: CARD_PADDING + 4,
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      minHeight: 88,
      justifyContent: "center",
    },
    quickStatIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    quickStatValue: { fontSize: 22, fontWeight: "700", color: colors.text },
    quickStatLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: CARD_PADDING,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: MIN_TAP_HEIGHT,
    },
    cardTitle: { fontSize: 17, color: colors.text, fontWeight: "500" },
    cardSub: { fontSize: 14, color: colors.textSecondary },
    stat: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: CARD_PADDING + 4,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    statIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    statValue: { fontSize: 26, fontWeight: "700", color: colors.text },
    statLabel: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    incomeSourceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 4,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    incomeSourceName: { fontSize: 15, color: colors.text, flex: 1 },
    incomeSourceAmount: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginLeft: 8,
    },
    occupiedRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 4,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    occupiedGuestName: { fontSize: 15, color: colors.text, flex: 1 },
    occupiedProperty: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    occupiedUntil: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    expandIcon: { marginLeft: 8 },
    activityCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: CARD_PADDING,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    activityIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    activityContent: { flex: 1 },
    financeLink: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      marginTop: 8,
      marginBottom: 16,
    },
    financeLinkText: { fontSize: 15, fontWeight: "600", color: colors.primary },
    fab: {
      position: "absolute",
      bottom: insets.bottom + 16,
      right: SCREEN_PADDING,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    fabIcon: { color: colors.primaryText },
    empty: { paddingVertical: 12, fontSize: 15, color: colors.textSecondary },
  });

  return (
    <View style={stylesWithTheme.screen}>
      <ScrollView
        style={stylesWithTheme.scroll}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <View style={stylesWithTheme.header}>
          <Text style={stylesWithTheme.headerTitle}>{todayLabel}</Text>
        </View>

        <View
          style={[stylesWithTheme.section, { flexDirection: "row", gap: 10 }]}
        >
          <TouchableOpacity
            style={stylesWithTheme.quickStat}
            onPress={() => router.push("/guests")}
            activeOpacity={0.7}
          >
            <View style={stylesWithTheme.quickStatIconWrap}>
              <Ionicons
                name="people-outline"
                size={22}
                color={colors.primary}
              />
            </View>
            <Text style={stylesWithTheme.quickStatValue}>{guests.length}</Text>
            <Text style={stylesWithTheme.quickStatLabel}>Guests</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={stylesWithTheme.quickStat}
            onPress={() => router.push("/properties")}
            activeOpacity={0.7}
          >
            <View style={stylesWithTheme.quickStatIconWrap}>
              <Ionicons
                name="business-outline"
                size={22}
                color={colors.primary}
              />
            </View>
            <Text style={stylesWithTheme.quickStatValue}>
              {properties.length}
            </Text>
            <Text style={stylesWithTheme.quickStatLabel}>Properties</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={stylesWithTheme.quickStat}
            onPress={() => router.push("/properties")}
            activeOpacity={0.7}
          >
            <View style={stylesWithTheme.quickStatIconWrap}>
              <Ionicons name="home-outline" size={22} color={colors.primary} />
            </View>
            <Text style={stylesWithTheme.quickStatValue}>{units.length}</Text>
            <Text style={stylesWithTheme.quickStatLabel}>Units</Text>
          </TouchableOpacity>
        </View>

        <View style={stylesWithTheme.section}>
          <View style={stylesWithTheme.sectionTitleRow}>
            <Ionicons
              name="bed-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={stylesWithTheme.sectionTitle}>Occupancy & income</Text>
          </View>
          <TouchableOpacity
            style={stylesWithTheme.stat}
            onPress={toggleOccupiedNowExpanded}
            activeOpacity={0.8}
          >
            <View style={stylesWithTheme.statHeader}>
              <View style={stylesWithTheme.statLeft}>
                <View
                  style={[
                    stylesWithTheme.statIconWrap,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Ionicons name="bed" size={22} color={colors.primary} />
                </View>
                <View>
                  <Text style={stylesWithTheme.statValue}>
                    {occupied.length}
                  </Text>
                  <Text style={stylesWithTheme.statLabel}>
                    of {units.length} units occupied now
                  </Text>
                </View>
              </View>
              <Ionicons
                name={occupiedNowExpanded ? "chevron-up" : "chevron-down"}
                size={22}
                color={colors.textSecondary}
              />
            </View>
            {occupiedNowExpanded && occupied.length > 0 && (
              <View style={{ marginTop: 12 }}>
                {occupied.map((g) => (
                  <View key={g.id} style={stylesWithTheme.occupiedRow}>
                    <Text
                      style={stylesWithTheme.occupiedGuestName}
                      numberOfLines={1}
                    >
                      {g.fullName}
                    </Text>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={stylesWithTheme.occupiedProperty}
                        numberOfLines={1}
                      >
                        {getPropertyName(g.propertyId)}
                      </Text>
                      <Text style={stylesWithTheme.occupiedUntil}>
                        until {formatDate(g.checkOut)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
            {occupiedNowExpanded && occupied.length === 0 && (
              <Text style={[stylesWithTheme.empty, { marginTop: 12 }]}>
                No units occupied right now
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={stylesWithTheme.stat}
            onPress={toggleIncomeTodayExpanded}
            activeOpacity={0.8}
          >
            <View style={stylesWithTheme.statHeader}>
              <View style={stylesWithTheme.statLeft}>
                <View
                  style={[
                    stylesWithTheme.statIconWrap,
                    { backgroundColor: colors.success + "22" },
                  ]}
                >
                  <Ionicons name="wallet" size={22} color={colors.success} />
                </View>
                <View>
                  <Text style={stylesWithTheme.statValue}>
                    {formatMoney(incomeToday)}
                  </Text>
                  <Text style={stylesWithTheme.statLabel}>
                    Income today (from occupying guests)
                  </Text>
                </View>
              </View>
              <Ionicons
                name={incomeTodayExpanded ? "chevron-up" : "chevron-down"}
                size={22}
                color={colors.textSecondary}
              />
            </View>
            {incomeTodayExpanded && incomeTodaySources.length > 0 && (
              <View style={{ marginTop: 12 }}>
                {incomeTodaySources.map(({ guest, amountToday }) => (
                  <View key={guest.id} style={stylesWithTheme.incomeSourceRow}>
                    <Text
                      style={stylesWithTheme.incomeSourceName}
                      numberOfLines={1}
                    >
                      {guest.fullName}
                      {getPropertyName(guest.propertyId)
                        ? ` · ${getPropertyName(guest.propertyId)}`
                        : ""}
                    </Text>
                    <Text style={stylesWithTheme.incomeSourceAmount}>
                      {formatMoney(amountToday)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            {incomeTodayExpanded && incomeTodaySources.length === 0 && (
              <Text style={[stylesWithTheme.empty, { marginTop: 12 }]}>
                No income from occupying guests today
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={stylesWithTheme.financeLink}
            onPress={() => router.push("/finance")}
            activeOpacity={0.8}
          >
            <Ionicons name="wallet-outline" size={20} color={colors.primary} />
            <Text style={stylesWithTheme.financeLinkText}>
              View all income in Finance
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={stylesWithTheme.section}>
          <View style={stylesWithTheme.sectionTitleRow}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={stylesWithTheme.sectionTitle}>
              Today&apos;s activity
            </Text>
          </View>
          <Text
            style={[
              stylesWithTheme.sectionTitle,
              { marginTop: 4, marginBottom: 6 },
            ]}
          >
            Check-ins
          </Text>
          {checkIns.length === 0 ? (
            <View style={stylesWithTheme.activityCard}>
              <View
                style={[
                  stylesWithTheme.activityIconWrap,
                  { backgroundColor: colors.border },
                ]}
              >
                <Ionicons
                  name="log-in-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
              <Text style={stylesWithTheme.empty}>No check-ins today</Text>
            </View>
          ) : (
            checkIns.map((g) => (
              <View key={g.id} style={stylesWithTheme.activityCard}>
                <View
                  style={[
                    stylesWithTheme.activityIconWrap,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Ionicons name="log-in" size={20} color={colors.primary} />
                </View>
                <View style={stylesWithTheme.activityContent}>
                  <Text style={stylesWithTheme.cardTitle}>{g.fullName}</Text>
                  <Text style={stylesWithTheme.cardSub}>
                    {getPropertyName(g.propertyId)}
                  </Text>
                </View>
              </View>
            ))
          )}

          <Text
            style={[
              stylesWithTheme.sectionTitle,
              { marginTop: 16, marginBottom: 6 },
            ]}
          >
            Check-outs
          </Text>
          {checkOuts.length === 0 ? (
            <View style={stylesWithTheme.activityCard}>
              <View
                style={[
                  stylesWithTheme.activityIconWrap,
                  { backgroundColor: colors.border },
                ]}
              >
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
              <Text style={stylesWithTheme.empty}>No check-outs today</Text>
            </View>
          ) : (
            checkOuts.map((g) => (
              <View key={g.id} style={stylesWithTheme.activityCard}>
                <View
                  style={[
                    stylesWithTheme.activityIconWrap,
                    { backgroundColor: colors.warning + "22" },
                  ]}
                >
                  <Ionicons name="log-out" size={20} color={colors.warning} />
                </View>
                <View style={stylesWithTheme.activityContent}>
                  <Text style={stylesWithTheme.cardTitle}>{g.fullName}</Text>
                  <Text style={stylesWithTheme.cardSub}>
                    {getPropertyName(g.propertyId)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={stylesWithTheme.fab}
        onPress={() => router.push("/add-guest")}
        activeOpacity={0.8}
      >
        <Ionicons name="person-add" size={28} style={stylesWithTheme.fabIcon} />
      </TouchableOpacity>
    </View>
  );
}
