import { Component } from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
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
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl }}>
            <Text style={{ color: colors.navy, fontSize: 32, fontWeight: '800', marginBottom: spacing.md }}>
              Something went wrong
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: spacing.sm }}>
              The app encountered an unexpected error.
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center', marginBottom: spacing.xxl }}>
              {this.state.error?.message || 'Unknown error'}
            </Text>
            <Pressable
              onPress={this.handleRetry}
              style={{
                minHeight: 48,
                paddingHorizontal: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radii.md,
                backgroundColor: colors.navy,
              }}
            >
              <Text style={{ color: colors.white, fontSize: 15, fontWeight: '800' }}>Try Again</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
