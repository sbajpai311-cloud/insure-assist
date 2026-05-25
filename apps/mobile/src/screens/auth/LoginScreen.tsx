import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert, StatusBar, ScrollView } from 'react-native';
import { theme } from '../../theme';
import { API_BASE } from '../../config/api';
import { useAuthStore } from '../../store/authStore';

// Demo credentials shown only in non-production builds
const DEMO_ACCOUNTS = [
  { label: 'Demo Agent',  email: 'agent@insureassist.demo',   password: 'Demo@1234' },
  { label: 'SC Agent',    email: 'scagent@insureassist.demo', password: 'SC@9876'   },
];

export default function LoginScreen() {
  const { setToken, setAgent } = useAuthStore();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);
    try {
      const res = await fetch(`${API_BASE.replace('/api', '')}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
        signal:  controller.signal,
      }).then(r => r.json());

      if (res.error) {
        Alert.alert('Login Failed', res.message ?? 'Invalid credentials.');
        return;
      }
      setToken(res.token);
      setAgent(res.agent);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        Alert.alert('Timeout', 'Server is waking up — please try again in a moment.');
      } else {
        Alert.alert('Network Error', e.message);
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.tealPrimary} />

      {/* Logo */}
      <Image
        source={{ uri: 'https://av.sc.com/in/content/images/sc-mobile-logo.png' }}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.heading}>InsureAssist</Text>
      <Text style={styles.subheading}>Agent Portal</Text>
      <Text style={styles.tagline}>Powered by SC Mobile</Text>

      {/* Login form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Agent Email"
          placeholderTextColor={theme.colors.grey600}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={theme.colors.grey600}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color={theme.colors.white} />
            : <Text style={styles.loginButtonText}>Sign In</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Demo account shortcuts — dev/staging only */}
      {process.env.NODE_ENV !== 'production' && (
        <View style={styles.demoSection}>
          <Text style={styles.demoLabel}>Demo Accounts</Text>
          {DEMO_ACCOUNTS.map(acc => (
            <TouchableOpacity
              key={acc.email}
              style={styles.demoCard}
              onPress={() => { setEmail(acc.email); setPassword(acc.password); }}
            >
              <Text style={styles.demoName}>{acc.label}</Text>
              <Text style={styles.demoEmail}>{acc.email}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.footer}>
        Access is restricted to authorised agents only.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.tealPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[6],
  },
  logo: {
    width: 160,
    height: 60,
    marginBottom: theme.spacing[6],
    tintColor: theme.colors.white,
  },
  heading:    { fontSize: 32, fontWeight: '700', color: theme.colors.white, letterSpacing: -0.5 },
  subheading: { fontSize: 18, color: theme.colors.tealLight, marginTop: theme.spacing[1] },
  tagline:    { fontSize: 13, color: theme.colors.tealLight, marginTop: theme.spacing[2], opacity: 0.8 },
  form: {
    width: '100%',
    marginTop: theme.spacing[8],
    gap: theme.spacing[3],
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    fontSize: 16,
    color: theme.colors.white,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  loginButton: {
    backgroundColor: theme.colors.navy,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    alignItems: 'center',
    marginTop: theme.spacing[2],
  },
  loginButtonText: { color: theme.colors.white, fontWeight: '700', fontSize: 16 },
  demoSection: {
    width: '100%',
    marginTop: theme.spacing[6],
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
  },
  demoLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.tealLight, marginBottom: theme.spacing[3], textTransform: 'uppercase', letterSpacing: 0.8 },
  demoCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[2],
  },
  demoName:  { fontSize: 13, fontWeight: '600', color: theme.colors.white },
  demoEmail: { fontSize: 11, color: theme.colors.tealLight, marginTop: 2 },
  footer: {
    marginTop: theme.spacing[8],
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.tealLight,
    opacity: 0.7,
  },
});
