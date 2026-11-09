import React from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { colors } from './src/components/UI';
import { RootStackParams, TabParams } from './src/navigation/types';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import ChatScreen from './src/screens/ChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

const Stack = createNativeStackNavigator<RootStackParams>();
const Tabs = createBottomTabNavigator<TabParams>();
const icons = { Home: '☏', Contacts: '♧', Notifications: '♧', Settings: '⚙' };
function Main() {
  const { conversations } = useApp();
  const unread = conversations.reduce((sum, item) => sum + item.unread, 0);
  return (
    <SafeAreaView style={styles.page} edges={['top', 'left', 'right']}>
      <Tabs.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: styles.tabs,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>{icons[route.name]}</Text>
          ),
        })}
      >
        <Tabs.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Tin nhắn', tabBarBadge: unread || undefined }}
        />
        <Tabs.Screen
          name="Contacts"
          component={ContactsScreen}
          options={{ title: 'Danh bạ' }}
        />
        <Tabs.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ title: 'Thông báo' }}
        />
        <Tabs.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Cài đặt' }}
        />
      </Tabs.Navigator>
    </SafeAreaView>
  );
}
function Root() {
  const { user, loading } = useApp();
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: colors.primary,
          background: '#fff',
        },
      }}
    >
      {user ? (
        <Stack.Navigator
          screenOptions={{
            headerTintColor: colors.ink,
            headerShadowVisible: false,
            headerBackTitle: 'Quay lại',
          }}
        >
          <Stack.Screen
            name="Main"
            component={Main}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ title: 'Trò chuyện' }}
          />
        </Stack.Navigator>
      ) : (
        <AuthScreen />
      )}
    </NavigationContainer>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  tabs: { borderTopColor: '#EBEEF5', paddingTop: 7 },
  tabLabel: { fontSize: 10, fontWeight: '600', marginBottom: 4 },
});
