import { Component } from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { colors } from './theme';

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
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.ink }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <Text style={{ color: colors.gold, fontSize: 32, fontWeight: '800', marginBottom: 12 }}>
              Something went wrong
            </Text>
            <Text style={{ color: 'rgba(248,243,234,0.72)', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 8 }}>
              The app encountered an unexpected error.
            </Text>
            <Text style={{ color: 'rgba(248,243,234,0.5)', fontSize: 12, textAlign: 'center', marginBottom: 24 }}>
              {this.state.error?.message || 'Unknown error'}
            </Text>
            <Pressable
              onPress={this.handleRetry}
              style={{
                minHeight: 48,
                paddingHorizontal: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
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
