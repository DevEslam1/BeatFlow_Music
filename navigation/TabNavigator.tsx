import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { TabParamList } from './types';
import HomeScreen from '@/screens/HomeScreen';
import SearchScreen from '@/screens/SearchScreen';
import LibraryScreen from '@/screens/LibraryScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import MiniPlayer from '@/components/MiniPlayer';
import { useNetwork } from '@/contexts/NetworkContext';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const { colors } = useTheme();
  const { isOffline } = useNetwork();
  const insets = useSafeAreaInsets();

  const TAB_BAR_HEIGHT = 60 + insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.secondary,
          tabBarInactiveTintColor: colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: colors.tabBarBg,
            borderTopWidth: 0,
            height: TAB_BAR_HEIGHT,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <View style={{ width: size, height: size }}>
                <Ionicons 
                  name="home" 
                  size={size} 
                  color={color} 
                />
                {isOffline && (
                  <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: colors.background, borderRadius: 10, padding: 1 }}>
                    <Ionicons name="cloud-offline" size={12} color={colors.secondary} />
                  </View>
                )}
              </View>
            ),
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '500',
            },
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <View style={{ width: size, height: size }}>
                <Ionicons name="search" size={size} color={color} />
                {isOffline && (
                  <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: colors.background, borderRadius: 10, padding: 1 }}>
                    <Ionicons name="cloud-offline" size={12} color={colors.secondary} />
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Library"
          component={LibraryScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <View style={{ width: size, height: size }}>
                <Ionicons name="library" size={size} color={color} />
                {isOffline && (
                  <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: colors.background, borderRadius: 10, padding: 1 }}>
                    <Ionicons name="cloud-offline" size={12} color={colors.secondary} />
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <View style={{ width: size, height: size }}>
                <Ionicons name="person" size={size} color={color} />
                {isOffline && (
                  <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: colors.background, borderRadius: 10, padding: 1 }}>
                    <Ionicons name="cloud-offline" size={12} color={colors.secondary} />
                  </View>
                )}
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}
