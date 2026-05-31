import { Component } from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { alpha, colors, radii, spacing } from './theme';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl }}>
            <Text style={{ color: colors.gold, fontSize: 32, fontWeight: '800', marginBottom: spacing.md }}>
              Something went wrong
            </Text>
            <Text style={{ color: alpha.ivory72, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: spacing.sm }}>
              The app encountered an unexpected error.
            </Text>
            <Text style={{ color: alpha.ivory55, fontSize: 12, textAlign: 'center', marginBottom: spacing.xxl }}>
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
                backgroundColor: colors.gold,
              }}
            >
              <Text style={{ color: colors.ink, fontSize: 15, fontWeight: '800' }}>Try Again</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
