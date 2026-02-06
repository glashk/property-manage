import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePropertiesStore, deleteProperty } from '@/src/store';
import { useUnitsStore } from '@/src/store';
import { useGuestsStore } from '@/src/store';
import { useThemeColors } from '@/src/theme/colors';
import { SCREEN_PADDING, CARD_PADDING } from '@/src/theme/layout';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const properties = usePropertiesStore((s) => s.properties);
  const units = useUnitsStore((s) => s.units);
  const guests = useGuestsStore((s) => s.guests);

  const property = properties.find((p) => p.id === id);
  const propertyUnits = units.filter((u) => u.propertyId === id);
  const now = Date.now();
  const currentGuests = guests.filter((g) => g.propertyId === id && g.checkIn <= now && g.checkOut >= now);

  const getGuestForUnit = (unitId: string) =>
    currentGuests.find((g) => g.unitId === unitId);

  const stylesWithTheme = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1, padding: SCREEN_PADDING },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: CARD_PADDING,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    titleBlock: { flex: 1 },
    title: { fontSize: 22, fontWeight: '600', color: colors.text, marginBottom: 2 },
    sub: { fontSize: 15, color: colors.textSecondary },
    iconBtn: { padding: 8 },
    unitRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    unitName: { fontSize: 17, color: colors.text },
    guestName: { fontSize: 14, color: colors.textSecondary },
    empty: { fontSize: 15, color: colors.textSecondary },
    addUnitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      marginTop: 8,
    },
    addUnitBtnText: { fontSize: 17, fontWeight: '600', color: colors.primaryText },
  });

  const handleDelete = () => {
    Alert.alert(
      'Delete property',
      `Delete "${property?.name}"? Units and guest links will keep the old property id.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            try {
              await deleteProperty(id);
              router.replace('/properties');
            } catch (e) {
              console.error('Delete property failed', e);
              Alert.alert('Error', e instanceof Error ? e.message : 'Could not delete');
            }
          },
        },
      ]
    );
  };

  if (!property) {
    return (
      <View style={stylesWithTheme.screen}>
        <View style={stylesWithTheme.scroll}>
          <Text style={stylesWithTheme.empty}>Property not found</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={stylesWithTheme.screen} contentContainerStyle={stylesWithTheme.scroll}>
      <View style={stylesWithTheme.card}>
        <View style={stylesWithTheme.headerRow}>
          <View style={stylesWithTheme.titleBlock}>
            <Text style={stylesWithTheme.title}>{property.name}</Text>
            <Text style={stylesWithTheme.sub}>{property.city || '—'}</Text>
          </View>
          <TouchableOpacity
            style={stylesWithTheme.iconBtn}
            onPress={() => router.push({ pathname: '/properties/edit', params: { id } })}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="pencil-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={stylesWithTheme.iconBtn}
            onPress={handleDelete}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="trash-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={stylesWithTheme.card}>
        <Text style={stylesWithTheme.sub}>Units & current guest</Text>
        {propertyUnits.length === 0 ? (
          <Text style={[stylesWithTheme.empty, { marginTop: 8 }]}>No units</Text>
        ) : (
          propertyUnits.map((u) => {
            const guest = getGuestForUnit(u.id);
            return (
              <View key={u.id} style={stylesWithTheme.unitRow}>
                <Text style={stylesWithTheme.unitName}>{u.name}</Text>
                <Text style={stylesWithTheme.guestName}>
                  {guest ? `${guest.fullName} (until ${formatDate(guest.checkOut)})` : '—'}
                </Text>
              </View>
            );
          })
        )}
        <TouchableOpacity
          style={stylesWithTheme.addUnitBtn}
          onPress={() => router.push({ pathname: '/properties/add-unit', params: { propertyId: id } })}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={22} color={colors.primaryText} />
          <Text style={stylesWithTheme.addUnitBtnText}>Add unit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
