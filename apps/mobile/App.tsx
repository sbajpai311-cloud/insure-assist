import React from 'react';
import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

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
