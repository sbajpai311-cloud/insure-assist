import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { theme } from './src/theme';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: any) {
    return { error: error?.message ?? String(error) };
  }
  render() {
    if (this.state.error) {
      return (
        <SafeAreaProvider>
          <div style={{ padding: 20, color: 'red' }}>
            <strong>App Error:</strong> {this.state.error}
          </div>
        </SafeAreaProvider>
      );
    }
    return this.props.children;
  }
}

function App() {
  const hydrate = useAuthStore(s => s.hydrate);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.tealPrimary }}>
          <ActivityIndicator size="large" color={theme.colors.white} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

registerRootComponent(App);

export default App;
