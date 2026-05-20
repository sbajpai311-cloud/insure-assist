import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { theme } from '../theme';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/Dashboard';
import FNAWizard from '../screens/fna/FNAWizard';
import ProductRecommendation from '../screens/quotation/ProductRecommendation';
import QuoteCalculator from '../screens/quotation/QuoteCalculator';
import ApplicationForm from '../screens/issuance/ApplicationForm';
import PaymentScreen from '../screens/issuance/PaymentScreen';
import PolicySuccess from '../screens/issuance/PolicySuccess';
import PolicyDetail from '../screens/policy/PolicyDetail';
import WellnessCatalogue from '../screens/wellness/WellnessCatalogue';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.tealPrimary,
        tabBarInactiveTintColor: theme.colors.grey600,
        headerStyle: { backgroundColor: theme.colors.tealPrimary },
        headerTintColor: theme.colors.white,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="FNA" component={FNAWizard} options={{ title: 'New FNA' }} />
      <Tab.Screen name="Wellness" component={WellnessCatalogue} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.tealPrimary },
          headerTintColor: theme.colors.white,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="ProductRecommendation" component={ProductRecommendation} options={{ title: 'Recommendations' }} />
            <Stack.Screen name="QuoteCalculator" component={QuoteCalculator} options={{ title: 'Get Quote' }} />
            <Stack.Screen name="ApplicationForm" component={ApplicationForm} options={{ title: 'Application' }} />
            <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Pay Premium' }} />
            <Stack.Screen name="PolicySuccess" component={PolicySuccess} options={{ title: 'Policy Issued' }} />
            <Stack.Screen name="PolicyDetail" component={PolicyDetail} options={{ title: 'Policy Details' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
