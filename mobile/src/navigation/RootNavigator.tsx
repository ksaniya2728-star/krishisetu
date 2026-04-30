import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { SplashScreen } from '../screens/auth/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { RoleSelectionScreen } from '../screens/auth/RoleSelectionScreen';

import { FarmerOnboardingScreen } from '../screens/common/FarmerOnboardingScreen';
import { ConsumerOnboardingScreen } from '../screens/common/ConsumerOnboardingScreen';
import { DistributorOnboardingScreen } from '../screens/common/DistributorOnboardingScreen';

import { FarmerDashboardScreen } from '../screens/farmer/FarmerDashboardScreen';
import { AddProduceScreen } from '../screens/farmer/AddProduceScreen';
import { FarmerOrdersScreen } from '../screens/farmer/FarmerOrdersScreen';
import { FarmerEarningsScreen } from '../screens/farmer/FarmerEarningsScreen';
import { PickupTrackingScreen } from '../screens/farmer/PickupTrackingScreen';

import { ConsumerHomeScreen } from '../screens/consumer/ConsumerHomeScreen';
import { ConsumerCartScreen } from '../screens/consumer/ConsumerCartScreen';
import { ConsumerOrdersScreen } from '../screens/consumer/ConsumerOrdersScreen';
import { ProductDetailScreen } from '../screens/consumer/ProductDetailScreen';
import { OrderTrackingScreen } from '../screens/consumer/OrderTrackingScreen';
import { CommunityBasketScreen } from '../screens/consumer/CommunityBasketScreen';
import { NearbyFarmersMapScreen } from '../screens/consumer/NearbyFarmersMapScreen';

import { ProfileScreen } from '../screens/common/ProfileScreen';
import { CommunityScreen } from '../screens/common/CommunityScreen';

import { SavedAddressScreen } from '../screens/profile/SavedAddressScreen';
import { PaymentMethodsScreen } from '../screens/profile/PaymentMethodsScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { PrivacySecurityScreen } from '../screens/profile/PrivacySecurityScreen';
import { HelpCenterScreen } from '../screens/profile/HelpCenterScreen';
import { TermsPoliciesScreen } from '../screens/profile/TermsPoliciesScreen';

import { DistributorHomeScreen } from '../screens/distributor/DistributorHomeScreen';
import { DistributorDeliveriesScreen } from '../screens/distributor/DistributorDeliveriesScreen';
import { DistributorMapScreen } from '../screens/distributor/DistributorMapScreen';

import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const ConsumerAppStack = createNativeStackNavigator();
const FarmerAppStack = createNativeStackNavigator();
const DistributorAppStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
      <AuthStack.Screen name="Splash" component={SplashScreen} />
      <AuthStack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function ConsumerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: { height: 70, paddingBottom: 10, paddingTop: 10 },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: 'home',
            Cart: 'cart',
            Orders: 'receipt',
            Community: 'chatbubble-ellipses',
            ProfileTab: 'person',
          };
          return <Ionicons name={iconMap[route.name]} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={ConsumerHomeScreen} />
      <Tab.Screen name="Cart" component={ConsumerCartScreen} />
      <Tab.Screen name="Orders" component={ConsumerOrdersScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function ConsumerApp() {
  return (
    <ConsumerAppStack.Navigator screenOptions={{ headerShown: false }}>
      <ConsumerAppStack.Screen name="ConsumerTabs" component={ConsumerTabs} />
      <ConsumerAppStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <ConsumerAppStack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <ConsumerAppStack.Screen name="CommunityBasket" component={CommunityBasketScreen} />
      <ConsumerAppStack.Screen name="NearbyFarmersMap" component={NearbyFarmersMapScreen} />
      <ConsumerAppStack.Screen name="SavedAddress" component={SavedAddressScreen} />
      <ConsumerAppStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <ConsumerAppStack.Screen name="Notifications" component={NotificationsScreen} />
      <ConsumerAppStack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <ConsumerAppStack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <ConsumerAppStack.Screen name="TermsPolicies" component={TermsPoliciesScreen} />
    </ConsumerAppStack.Navigator>
  );
}

function FarmerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: { height: 70, paddingBottom: 10, paddingTop: 10 },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: 'home',
            Add: 'add-circle',
            Orders: 'receipt',
            Community: 'chatbubble-ellipses',
            ProfileTab: 'person',
          };
          return <Ionicons name={iconMap[route.name]} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={FarmerDashboardScreen} />
      <Tab.Screen name="Add" component={AddProduceScreen} />
      <Tab.Screen name="Orders" component={FarmerOrdersScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function FarmerApp() {
  return (
    <FarmerAppStack.Navigator screenOptions={{ headerShown: false }}>
      <FarmerAppStack.Screen name="FarmerTabs" component={FarmerTabs} />
      <FarmerAppStack.Screen name="PickupTracking" component={PickupTrackingScreen} />
      <FarmerAppStack.Screen name="FarmerEarnings" component={FarmerEarningsScreen} />
      <FarmerAppStack.Screen name="SavedAddress" component={SavedAddressScreen} />
      <FarmerAppStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <FarmerAppStack.Screen name="Notifications" component={NotificationsScreen} />
      <FarmerAppStack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <FarmerAppStack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <FarmerAppStack.Screen name="TermsPolicies" component={TermsPoliciesScreen} />
    </FarmerAppStack.Navigator>
  );
}

function DistributorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: { height: 70, paddingBottom: 10, paddingTop: 10 },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: 'home',
            Map: 'map',
            Deliveries: 'bicycle',
            ProfileTab: 'person',
          };
          return <Ionicons name={iconMap[route.name]} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DistributorHomeScreen} />
      <Tab.Screen name="Map" component={DistributorMapScreen} />
      <Tab.Screen name="Deliveries" component={DistributorDeliveriesScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function DistributorApp() {
  return (
    <DistributorAppStack.Navigator screenOptions={{ headerShown: false }}>
      <DistributorAppStack.Screen name="DistributorTabs" component={DistributorTabs} />
      <DistributorAppStack.Screen name="SavedAddress" component={SavedAddressScreen} />
      <DistributorAppStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <DistributorAppStack.Screen name="Notifications" component={NotificationsScreen} />
      <DistributorAppStack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <DistributorAppStack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <DistributorAppStack.Screen name="TermsPolicies" component={TermsPoliciesScreen} />
    </DistributorAppStack.Navigator>
  );
}

function OnboardingGate() {
  const { user } = useAuth();
  if (user?.role === 'farmer') return <FarmerOnboardingScreen />;
  if (user?.role === 'distributor') return <DistributorOnboardingScreen />;
  return <ConsumerOnboardingScreen />;
}

export function RootNavigator() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : !user?.onboardingCompleted ? (
          <RootStack.Screen name="Onboarding" component={OnboardingGate} />
        ) : user?.role === 'farmer' ? (
          <RootStack.Screen name="FarmerApp" component={FarmerApp} />
        ) : user?.role === 'distributor' ? (
          <RootStack.Screen name="DistributorApp" component={DistributorApp} />
        ) : (
          <RootStack.Screen name="ConsumerApp" component={ConsumerApp} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

