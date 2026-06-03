import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, ErrorUtils, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/mobile/AuthProvider';
import { NotificationStreamGate } from '../src/mobile/NotificationStreamGate';
import { ErrorBoundary } from '../src/mobile/ErrorBoundary';
import { useAppFonts } from '../src/mobile/useAppFonts';
import { colors } from '../src/mobile/theme';
import { error as logError, warn } from '../src/mobile/logger';

function GlobalErrorHandler() {
  useEffect(() => {
    const previousHandler = ErrorUtils.getGlobalHandler?.();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      logError(isFatal ? 'Fatal error' : 'Unhandled error', error);
      previousHandler?.(error, isFatal);
    });
    return () => {
      if (previousHandler) ErrorUtils.setGlobalHandler(previousHandler);
    };
  }, []);
  return null;
}

function FontGate({ children }) {
  const { loaded, error } = useAppFonts();

  if (error) {
    warn('Font loading failed, using system fonts', error);
    return children;
  }

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.navy} size="large" />
      </View>
    );
  }

  return children;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GlobalErrorHandler />
      <SafeAreaProvider>
        <AuthProvider>
          <NotificationStreamGate />
          <FontGate>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
          </FontGate>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.screen },
});
