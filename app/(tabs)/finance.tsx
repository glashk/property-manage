import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useGuestsStore, usePropertiesStore } from "@/src/store";
import { useThemeColors } from "@/src/theme/colors";
import {
  SCREEN_PADDING,
  CARD_PADDING,
  MIN_TAP_HEIGHT,
} from "@/src/theme/layout";
import { Ionicons } from "@expo/vector-icons";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getMonthLabel(year: number, month: number) {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function getMonthRange(year: number, month: number) {
  const first = new Date(year, month, 1).setHours(0, 0, 0, 0);
  const last = new Date(year, month + 1, 0).setHours(23, 59, 59, 999);
  return { first, last };
}

export default function FinanceScreen() {
  const colors = useThemeColors();
  const guests = useGuestsStore((s) => s.guests);
  const properties = usePropertiesStore((s) => s.properties);

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [propertyFilter, setPropertyFilter] = useState<string>("");

  const { first: monthStart, last: monthEnd } = getMonthRange(
    selectedYear,
    selectedMonth,
  );

  const filteredEntries = useMemo(() => {
    return guests.filter((g) => {
      if (typeof g.price !== "number" || g.price <= 0) return false;
      const checkIn = g.checkIn;
      if (checkIn < monthStart || checkIn > monthEnd) return false;
      if (propertyFilter && g.propertyId !== propertyFilter) return false;
      return true;
    });
  }, [guests, monthStart, monthEnd, propertyFilter]);

  const totalIncome = useMemo(
    () => filteredEntries.reduce((sum, g) => sum + (g.price ?? 0), 0),
    [filteredEntries],
  );

  const goPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const getPropertyName = (id: string) =>
    properties.find((p) => p.id === id)?.name ?? "—";

  const stylesWithTheme = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    scroll: {
      padding: SCREEN_PADDING,
    },
    header: { marginBottom: 20 },
    headerTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      letterSpacing: -0.5,
    },
    headerSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },

    monthRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
      paddingVertical: 4,
    },
    monthNavBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    monthLabel: { fontSize: 18, fontWeight: "600", color: colors.text },
    monthNavDisabled: { opacity: 0.4 },

    filterSection: { marginBottom: 16 },
    filterLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: MIN_TAP_HEIGHT,
      justifyContent: "center",
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: { fontSize: 15, color: colors.text },
    filterChipTextActive: { color: colors.primaryText },

    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: CARD_PADDING + 4,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
    },
    summaryIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.success + "22",
      alignItems: "center",
      justifyContent: "center",
    },
    summaryTotal: { fontSize: 28, fontWeight: "700", color: colors.text },
    summaryLabel: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    summaryMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    summaryMetaItem: { alignItems: "center" },
    summaryMetaValue: { fontSize: 17, fontWeight: "600", color: colors.text },
    summaryMetaLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },

    sectionTitle: {
      fontSize: 12,
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 10,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 0,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: CARD_PADDING,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowLast: { borderBottomWidth: 0 },
    rowLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
    rowIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
    },
    rowName: { fontSize: 17, color: colors.text, fontWeight: "500", flex: 1 },
    rowSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    rowRight: { alignItems: "flex-end" },
    rowPrice: { fontSize: 17, fontWeight: "600", color: colors.text },
    rowDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    empty: {
      paddingVertical: 32,
      paddingHorizontal: 16,
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
    },
  });

  const isCurrentMonth =
    selectedYear === now.getFullYear() && selectedMonth === now.getMonth();
  const canGoNext =
    selectedYear < now.getFullYear() ||
    (selectedYear === now.getFullYear() && selectedMonth < now.getMonth());

  return (
    <ScrollView
      style={stylesWithTheme.screen}
      contentContainerStyle={stylesWithTheme.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={stylesWithTheme.header}>
        <Text style={stylesWithTheme.headerTitle}>Finance</Text>
        <Text style={stylesWithTheme.headerSub}>
          Income by month & property
        </Text>
      </View>

      <View style={stylesWithTheme.monthRow}>
        <TouchableOpacity
          style={stylesWithTheme.monthNavBtn}
          onPress={goPrevMonth}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={stylesWithTheme.monthLabel}>
          {getMonthLabel(selectedYear, selectedMonth)}
        </Text>
        <TouchableOpacity
          style={[
            stylesWithTheme.monthNavBtn,
            !canGoNext && stylesWithTheme.monthNavDisabled,
          ]}
          onPress={goNextMonth}
          disabled={!canGoNext}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={stylesWithTheme.filterSection}>
        <Text style={stylesWithTheme.filterLabel}>Property</Text>
        <View style={stylesWithTheme.filterRow}>
          <TouchableOpacity
            style={[
              stylesWithTheme.filterChip,
              !propertyFilter && stylesWithTheme.filterChipActive,
            ]}
            onPress={() => setPropertyFilter("")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                stylesWithTheme.filterChipText,
                !propertyFilter && stylesWithTheme.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {properties.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                stylesWithTheme.filterChip,
                propertyFilter === p.id && stylesWithTheme.filterChipActive,
              ]}
              onPress={() =>
                setPropertyFilter(propertyFilter === p.id ? "" : p.id)
              }
              activeOpacity={0.8}
            >
              <Text
                style={[
                  stylesWithTheme.filterChipText,
                  propertyFilter === p.id &&
                    stylesWithTheme.filterChipTextActive,
                ]}
              >
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={stylesWithTheme.summaryCard}>
        <View style={stylesWithTheme.summaryRow}>
          <View style={stylesWithTheme.summaryIconWrap}>
            <Ionicons name="wallet" size={26} color={colors.success} />
          </View>
          <View>
            <Text style={stylesWithTheme.summaryTotal}>
              {formatMoney(totalIncome)}
            </Text>
            <Text style={stylesWithTheme.summaryLabel}>
              Total income
              {propertyFilter
                ? ` · ${getPropertyName(propertyFilter)}`
                : ""} in {getMonthLabel(selectedYear, selectedMonth)}
            </Text>
          </View>
        </View>
        <View style={stylesWithTheme.summaryMeta}>
          <View style={stylesWithTheme.summaryMetaItem}>
            <Text style={stylesWithTheme.summaryMetaValue}>
              {filteredEntries.length}
            </Text>
            <Text style={stylesWithTheme.summaryMetaLabel}>Bookings</Text>
          </View>
          <View style={stylesWithTheme.summaryMetaItem}>
            <Text style={stylesWithTheme.summaryMetaValue}>
              {filteredEntries.length
                ? formatMoney(totalIncome / filteredEntries.length)
                : "0"}
            </Text>
            <Text style={stylesWithTheme.summaryMetaLabel}>
              Avg per booking
            </Text>
          </View>
        </View>
      </View>

      <Text style={stylesWithTheme.sectionTitle}>Income entries</Text>
      {filteredEntries.length === 0 ? (
        <View style={stylesWithTheme.card}>
          <Text style={stylesWithTheme.empty}>
            {propertyFilter || !isCurrentMonth
              ? `No income in this period${propertyFilter ? ` for ${getPropertyName(propertyFilter)}` : ""}.`
              : "No income recorded yet. Add a price when adding a guest to track income here."}
          </Text>
        </View>
      ) : (
        <View style={stylesWithTheme.card}>
          {filteredEntries.map((g, index) => (
            <View
              key={g.id}
              style={[
                stylesWithTheme.row,
                index === filteredEntries.length - 1 && stylesWithTheme.rowLast,
              ]}
            >
              <View style={stylesWithTheme.rowLeft}>
                <View style={stylesWithTheme.rowIconWrap}>
                  <Ionicons name="person" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={stylesWithTheme.rowName} numberOfLines={1}>
                    {g.fullName}
                  </Text>
                  <Text style={stylesWithTheme.rowSub}>
                    {getPropertyName(g.propertyId)}
                  </Text>
                </View>
              </View>
              <View style={stylesWithTheme.rowRight}>
                <Text style={stylesWithTheme.rowPrice}>
                  {formatMoney(g.price ?? 0)}
                </Text>
                <Text style={stylesWithTheme.rowDate}>
                  {formatDate(g.checkIn)} – {formatDate(g.checkOut)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
