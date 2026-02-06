import { useState } from 'react';
import { useRouter } from 'expo-router';
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
import { addProperty } from '@/src/store';

export default function AddPropertyScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setError(null);
    setSaving(true);
    try {
      await addProperty({ name: name.trim(), city: city.trim() });
      router.back();
    } catch (e) {
      console.error('Add property failed', e);
      const message = e instanceof Error ? e.message : 'Could not save property';
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
          <Text style={stylesWithTheme.saveBtnText}>Save property</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
