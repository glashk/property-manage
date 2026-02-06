import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/src/theme/colors";
import {
  MIN_TAP_HEIGHT,
  SCREEN_PADDING,
  CARD_PADDING,
} from "@/src/theme/layout";
import { usePropertiesStore, useUnitsStore, useGuestsStore, addGuest, updateGuest, getGuest } from "@/src/store";
import { GUEST_SOURCES, PAYMENT_STATUSES } from "@/src/types/models";
import type { GuestSource, PaymentStatus } from "@/src/types/models";

function toDateStr(ts: number): string {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default function AddGuestScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const router = useRouter();
  const { guestId } = useLocalSearchParams<{ guestId?: string }>();
  const isEditMode = Boolean(guestId);
  const properties = usePropertiesStore((s) => s.properties);
  const units = useUnitsStore((s) => s.units);
  const guests = useGuestsStore((s) => s.guests);

  const [fullName, setFullName] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  });
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  });
  const [source, setSource] = useState<GuestSource>("Direct");
  const [notes, setNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("unpaid");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datePickerMode, setDatePickerMode] = useState<"checkIn" | "checkOut" | null>(null);
  const [editLoaded, setEditLoaded] = useState(false);

  useEffect(() => {
    if (!guestId) {
      setEditLoaded(true);
      return;
    }
    const guest = guests.find((g) => g.id === guestId);
    if (guest) {
      setFullName(guest.fullName);
      setPropertyId(guest.propertyId);
      setUnitId(guest.unitId);
      setCheckIn(toDateStr(guest.checkIn));
      setCheckOut(toDateStr(guest.checkOut));
      setSource(guest.source);
      setNotes(guest.notes);
      setPaymentStatus(guest.paymentStatus);
      setPrice(guest.price != null ? String(guest.price) : "");
      setEditLoaded(true);
      return;
    }
    getGuest(guestId).then((g) => {
      if (g) {
        setFullName(g.fullName);
        setPropertyId(g.propertyId);
        setUnitId(g.unitId);
        setCheckIn(toDateStr(g.checkIn));
        setCheckOut(toDateStr(g.checkOut));
        setSource(g.source);
        setNotes(g.notes);
        setPaymentStatus(g.paymentStatus);
        setPrice(g.price != null ? String(g.price) : "");
      }
      setEditLoaded(true);
    });
  }, [guestId, guests]);

  const scrollRef = useRef<ScrollView>(null);

  const formatDateLabel = useCallback((yyyyMmDd: string) => {
    if (!yyyyMmDd || yyyyMmDd.length < 10) return "Tap to pick";
    const d = new Date(yyyyMmDd + "T12:00:00");
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }, []);
  const sectionTops = useRef<Record<string, number>>({});
  const scrollToSection = useCallback((key: string) => {
    setTimeout(() => {
      const y = sectionTops.current[key];
      if (typeof y === "number" && scrollRef.current) {
        scrollRef.current.scrollTo({
          y: Math.max(0, y - 80),
          animated: true,
        });
      }
    }, 100);
  }, []);

  const unitsForProperty = useMemo(
    () => units.filter((u) => u.propertyId === propertyId),
    [units, propertyId],
  );

  const prevPropertyIdRef = useRef(propertyId);
  useEffect(() => {
    if (propertyId !== prevPropertyIdRef.current) {
      prevPropertyIdRef.current = propertyId;
      if (unitsForProperty.length === 1) {
        setUnitId(unitsForProperty[0].id);
      } else {
        setUnitId("");
      }
    } else if (unitsForProperty.length === 1) {
      setUnitId(unitsForProperty[0].id);
    } else if (unitsForProperty.length === 0) {
      setUnitId("");
    }
  }, [propertyId, unitsForProperty]);

  const canSave = fullName.trim().length > 0 && propertyId && unitId;

  const resetForm = useCallback(() => {
    setFullName("");
    setPropertyId("");
    setUnitId("");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCheckIn(today.toISOString().slice(0, 10));
    setCheckOut(tomorrow.toISOString().slice(0, 10));
    setSource("Direct");
    setNotes("");
    setPaymentStatus("unpaid");
    setPrice("");
    setError(null);
    setDatePickerMode(null);
  }, []);

  if (isEditMode && !editLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, fontSize: 16, color: colors.textSecondary }}>Loading guest…</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!canSave) return;
    setError(null);
    setSaving(true);
    try {
      const checkInTs = new Date(checkIn).setHours(0, 0, 0, 0);
      const checkOutTs = new Date(checkOut).setHours(0, 0, 0, 0);
      const priceNum = price.trim() ? parseFloat(price.trim()) : undefined;
      const payload = {
        fullName: fullName.trim(),
        phone: "",
        checkIn: checkInTs,
        checkOut: checkOutTs,
        propertyId,
        unitId,
        source,
        notes: notes.trim(),
        paymentStatus,
        price: typeof priceNum === "number" && !Number.isNaN(priceNum) ? priceNum : undefined,
      };
      if (isEditMode && guestId) {
        await updateGuest(guestId, payload);
        router.back();
      } else {
        await addGuest(payload);
        resetForm();
        router.replace("/");
      }
    } catch (e) {
      console.error(isEditMode ? "Update guest failed" : "Add guest failed", e);
      const message = e instanceof Error ? e.message : "Could not save guest";
      setError(message);
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  const stylesWithTheme = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    scroll: {
      padding: SCREEN_PADDING,
      paddingBottom: insets.bottom,
    },
    scrollContent: {
      flexGrow: 1,
    },
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
      marginBottom: 6,
      textTransform: "uppercase",
    },
    input: {
      fontSize: 17,
      color: colors.text,
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      minHeight: MIN_TAP_HEIGHT,
    },
    datesRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    dateInput: {
      flex: 1,
    },
    dateTouchable: {
      justifyContent: "center",
    },
    dateTouchableText: {
      fontSize: 17,
      color: colors.text,
    },
    datePlaceholder: {
      color: colors.textSecondary,
    },
    datesSeparator: {
      fontSize: 17,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    datePickerInline: {
      height: 120,
    },
    datePickerInlineWrap: {
      marginTop: 8,
      alignItems: "center",
    },
    pickerRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    pickerOption: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: colors.background,
      minHeight: MIN_TAP_HEIGHT,
      justifyContent: "center",
    },
    pickerOptionSelected: {
      backgroundColor: colors.primary,
    },
    pickerOptionText: { fontSize: 15, color: colors.text },
    pickerOptionTextSelected: { color: colors.primaryText },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      minHeight: MIN_TAP_HEIGHT,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    saveBtnDisabled: { opacity: 0.5 },
    saveBtnText: { fontSize: 17, fontWeight: "600", color: colors.primaryText },
    errorText: { color: colors.error, fontSize: 14, marginBottom: 8 },
  });

  return (
    <KeyboardAvoidingView
      style={stylesWithTheme.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={stylesWithTheme.screen}>
        <ScrollView
          ref={scrollRef}
          style={StyleSheet.absoluteFill}
          contentContainerStyle={[stylesWithTheme.scroll, stylesWithTheme.scrollContent]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
        {error ? <Text style={stylesWithTheme.errorText}>{error}</Text> : null}

        <View
          style={stylesWithTheme.card}
          onLayout={(e) => {
            sectionTops.current["fullName"] = e.nativeEvent.layout.y;
          }}
        >
          <Text style={stylesWithTheme.label}>Full name *</Text>
          <TextInput
            style={stylesWithTheme.input}
            value={fullName}
            onChangeText={setFullName}
            onFocus={() => scrollToSection("fullName")}
            placeholder="Guest full name"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
            editable={!saving}
          />
        </View>

        <View
          style={stylesWithTheme.card}
          onLayout={(e) => {
            sectionTops.current["property"] = e.nativeEvent.layout.y;
          }}
        >
          <Text style={stylesWithTheme.label}>Property *</Text>
          <View style={stylesWithTheme.pickerRow}>
            {properties.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[
                  stylesWithTheme.pickerOption,
                  propertyId === p.id && stylesWithTheme.pickerOptionSelected,
                ]}
                onPress={() => {
                  setPropertyId(p.id);
                  setUnitId("");
                }}
                disabled={saving}
              >
                <Text
                  style={[
                    stylesWithTheme.pickerOptionText,
                    propertyId === p.id &&
                      stylesWithTheme.pickerOptionTextSelected,
                  ]}
                >
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {properties.length === 0 ? (
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              No properties. Add properties in Firebase first.
            </Text>
          ) : null}
        </View>

        {propertyId && unitsForProperty.length !== 1 ? (
          <View
            style={stylesWithTheme.card}
            onLayout={(e) => {
              sectionTops.current["unit"] = e.nativeEvent.layout.y;
            }}
          >
            <Text style={stylesWithTheme.label}>Unit *</Text>
            <View style={stylesWithTheme.pickerRow}>
              {unitsForProperty.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={[
                    stylesWithTheme.pickerOption,
                    unitId === u.id && stylesWithTheme.pickerOptionSelected,
                  ]}
                  onPress={() => setUnitId(u.id)}
                  disabled={saving}
                >
                  <Text
                    style={[
                      stylesWithTheme.pickerOptionText,
                      unitId === u.id &&
                        stylesWithTheme.pickerOptionTextSelected,
                    ]}
                  >
                    {u.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {unitsForProperty.length === 0 ? (
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 4,
                }}
              >
                No units for this property.
              </Text>
            ) : null}
          </View>
        ) : null}

        <View
          style={stylesWithTheme.card}
          onLayout={(e) => {
            sectionTops.current["dates"] = e.nativeEvent.layout.y;
          }}
        >
          <Text style={stylesWithTheme.label}>Stay (check-in – check-out)</Text>
          <View style={stylesWithTheme.datesRow}>
            <TouchableOpacity
              style={[stylesWithTheme.input, stylesWithTheme.dateInput, stylesWithTheme.dateTouchable]}
              onPress={() => {
                scrollToSection("dates");
                setDatePickerMode("checkIn");
              }}
              disabled={saving}
            >
              <Text style={[stylesWithTheme.dateTouchableText, !checkIn && stylesWithTheme.datePlaceholder]}>
                {formatDateLabel(checkIn)}
              </Text>
            </TouchableOpacity>
            <Text style={stylesWithTheme.datesSeparator}>–</Text>
            <TouchableOpacity
              style={[stylesWithTheme.input, stylesWithTheme.dateInput, stylesWithTheme.dateTouchable]}
              onPress={() => {
                scrollToSection("dates");
                setDatePickerMode("checkOut");
              }}
              disabled={saving}
            >
              <Text style={[stylesWithTheme.dateTouchableText, !checkOut && stylesWithTheme.datePlaceholder]}>
                {formatDateLabel(checkOut)}
              </Text>
            </TouchableOpacity>
          </View>
          {datePickerMode && (
            Platform.OS === "android" ? (
              <DateTimePicker
                value={datePickerMode === "checkIn" ? new Date(checkIn + "T12:00:00") : new Date(checkOut + "T12:00:00")}
                mode="date"
                minimumDate={datePickerMode === "checkOut" ? new Date(checkIn + "T12:00:00") : undefined}
                onChange={(event: { type: string }, date?: Date) => {
                  if (Platform.OS === "android" && event.type !== "set") {
                    setDatePickerMode(null);
                    return;
                  }
                  if (date) {
                    const next = date.toISOString().slice(0, 10);
                    if (datePickerMode === "checkIn") {
                      setCheckIn(next);
                      if (checkOut && next >= checkOut) {
                        const d = new Date(date);
                        d.setDate(d.getDate() + 1);
                        setCheckOut(d.toISOString().slice(0, 10));
                      }
                    } else {
                      setCheckOut(next);
                    }
                  }
                  setDatePickerMode(null);
                }}
              />
            ) : (
              <View style={stylesWithTheme.datePickerInlineWrap}>
                <DateTimePicker
                  value={datePickerMode === "checkIn" ? new Date(checkIn + "T12:00:00") : new Date(checkOut + "T12:00:00")}
                  mode="date"
                  minimumDate={datePickerMode === "checkOut" ? new Date(checkIn + "T12:00:00") : undefined}
                  onChange={(_: { type: string }, date?: Date) => {
                    if (date) {
                      const next = date.toISOString().slice(0, 10);
                      if (datePickerMode === "checkIn") {
                        setCheckIn(next);
                        if (checkOut && next >= checkOut) {
                          const d = new Date(date);
                          d.setDate(d.getDate() + 1);
                          setCheckOut(d.toISOString().slice(0, 10));
                        }
                      } else {
                        setCheckOut(next);
                      }
                    }
                    setDatePickerMode(null);
                  }}
                  style={stylesWithTheme.datePickerInline}
                />
              </View>
            )
          )}
        </View>

        <View style={stylesWithTheme.card}>
          <Text style={stylesWithTheme.label}>Booking source</Text>
          <View style={stylesWithTheme.pickerRow}>
            {GUEST_SOURCES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  stylesWithTheme.pickerOption,
                  source === s && stylesWithTheme.pickerOptionSelected,
                ]}
                onPress={() => setSource(s)}
                disabled={saving}
              >
                <Text
                  style={[
                    stylesWithTheme.pickerOptionText,
                    source === s && stylesWithTheme.pickerOptionTextSelected,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={stylesWithTheme.card}>
          <Text style={stylesWithTheme.label}>Payment status</Text>
          <View style={stylesWithTheme.pickerRow}>
            {PAYMENT_STATUSES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  stylesWithTheme.pickerOption,
                  paymentStatus === p && stylesWithTheme.pickerOptionSelected,
                ]}
                onPress={() => setPaymentStatus(p)}
                disabled={saving}
              >
                <Text
                  style={[
                    stylesWithTheme.pickerOptionText,
                    paymentStatus === p &&
                      stylesWithTheme.pickerOptionTextSelected,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View
          style={stylesWithTheme.card}
          onLayout={(e) => {
            sectionTops.current["price"] = e.nativeEvent.layout.y;
          }}
        >
          <Text style={stylesWithTheme.label}>Price / Income</Text>
          <TextInput
            style={stylesWithTheme.input}
            value={price}
            onChangeText={setPrice}
            onFocus={() => scrollToSection("price")}
            placeholder="Optional – for Finance tracking"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            editable={!saving}
          />
        </View>

        <View
          style={stylesWithTheme.card}
          onLayout={(e) => {
            sectionTops.current["notes"] = e.nativeEvent.layout.y;
          }}
        >
          <Text style={stylesWithTheme.label}>Notes</Text>
          <TextInput
            style={[
              stylesWithTheme.input,
              { minHeight: 80, textAlignVertical: "top" },
            ]}
            value={notes}
            onChangeText={setNotes}
            onFocus={() => scrollToSection("notes")}
            placeholder="Optional notes"
            placeholderTextColor={colors.textSecondary}
            multiline
            editable={!saving}
          />
        </View>

        <TouchableOpacity
          style={[
            stylesWithTheme.saveBtn,
            (!canSave || saving || (isEditMode && !editLoaded)) && stylesWithTheme.saveBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={!canSave || saving || (isEditMode && !editLoaded)}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={stylesWithTheme.saveBtnText}>{isEditMode ? "Save changes" : "Save guest"}</Text>
          )}
        </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
