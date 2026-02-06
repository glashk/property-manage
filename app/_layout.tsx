import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ensureAnonymousAuth } from '@/src/lib/firebase';
import { startFirestoreSubscriptions } from '@/src/store';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    (async () => {
      try {
        await ensureAnonymousAuth();
        unsub = startFirestoreSubscriptions();
        setReady(true);
      } catch (e) {
        console.error('App init error', e);
        setError(e instanceof Error ? e.message : 'Failed to start');
      }
    })();
    return () => {
      unsub?.();
    };
  }, []);

  if (error) {
    return (
      <SafeAreaProvider>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  if (!ready) {
    return (
      <SafeAreaProvider>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'default',
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    padding: 20,
  },
});
