import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthProvider } from '../src/mobile/AuthProvider';
import { ErrorBoundary } from '../src/mobile/ErrorBoundary';
import { useAppFonts } from '../src/mobile/useAppFonts';
import { colors } from '../src/mobile/theme';
import { warn } from '../src/mobile/logger';

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
      <AuthProvider>
        <FontGate>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </FontGate>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.screen },
});
