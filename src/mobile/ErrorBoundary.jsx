import { Component } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from './theme';
import { error as logError } from './logger';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logError('ErrorBoundary caught', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.screen}>
          <View style={styles.content}>
            <Text style={styles.title}>
              Something went wrong
            </Text>
            <Text style={styles.message}>
              The app encountered an unexpected error.
            </Text>
            <Text style={styles.detail}>
              Please try again. If the problem continues, restart the app.
            </Text>
            <Pressable
              onPress={this.handleRetry}
              accessibilityRole="button"
              accessibilityLabel="Try again"
              style={styles.button}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  title: { color: colors.navy, fontSize: 32, fontWeight: '800', marginBottom: spacing.md },
  message: { color: colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: spacing.sm },
  detail: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginBottom: spacing.xxl },
  button: { minHeight: 48, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.navy },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: '800' },
});
