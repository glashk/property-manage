import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useThemeColors } from '@/src/theme/colors';
import { MIN_TAP_HEIGHT, SCREEN_PADDING, CARD_PADDING } from '@/src/theme/layout';
import { usePropertiesStore, updateProperty } from '@/src/store';

export default function EditPropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const router = useRouter();
  const properties = usePropertiesStore((s) => s.properties);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const property = id ? properties.find((p) => p.id === id) : null;

  useEffect(() => {
    if (property) {
      setName(property.name);
      setCity(property.city ?? '');
    }
  }, [property?.id, property?.name, property?.city]);

  const canSave = name.trim().length > 0 && id;

  const handleSave = async () => {
    if (!canSave || !id) return;
    setError(null);
    setSaving(true);
    try {
      await updateProperty(id, { name: name.trim(), city: city.trim() });
      router.back();
    } catch (e) {
      console.error('Update property failed', e);
      const message = e instanceof Error ? e.message : 'Could not save';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const stylesWithTheme = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background, padding: SCREEN_PADDING },
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
      textTransform: 'uppercase',
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
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      minHeight: MIN_TAP_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    saveBtnDisabled: { opacity: 0.5 },
    saveBtnText: { fontSize: 17, fontWeight: '600', color: colors.primaryText },
    errorText: { color: colors.error, fontSize: 14, marginBottom: 8 },
  });

  if (!id) {
    return (
      <View style={stylesWithTheme.screen}>
        <Text style={stylesWithTheme.errorText}>Missing property. Go back and open a property.</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={stylesWithTheme.screen}>
        <Text style={stylesWithTheme.errorText}>Property not found.</Text>
      </View>
    );
  }

  return (
    <View style={stylesWithTheme.screen}>
      {error ? <Text style={stylesWithTheme.errorText}>{error}</Text> : null}

      <View style={stylesWithTheme.card}>
        <Text style={stylesWithTheme.label}>Property name *</Text>
        <TextInput
          style={stylesWithTheme.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Sunset Guesthouse"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="words"
          editable={!saving}
        />
      </View>

      <View style={stylesWithTheme.card}>
        <Text style={stylesWithTheme.label}>City</Text>
        <TextInput
          style={stylesWithTheme.input}
          value={city}
          onChangeText={setCity}
          placeholder="e.g. Tbilisi"
          placeholderTextColor={colors.textSecondary}
          editable={!saving}
        />
      </View>

      <TouchableOpacity
        style={[stylesWithTheme.saveBtn, (!canSave || saving) && stylesWithTheme.saveBtnDisabled]}
        onPress={handleSave}
        disabled={!canSave || saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : (
          <Text style={stylesWithTheme.saveBtnText}>Save changes</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
