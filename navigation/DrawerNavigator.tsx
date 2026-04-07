import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { DrawerParamList } from './types';
import TabNavigator from './TabNavigator';
import LocalTracksScreen from '@/screens/LocalTracksScreen';
import { Spacing, Radii, FontSizes } from '@/constants/theme';

const Drawer = createDrawerNavigator<DrawerParamList>();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { borderBottomColor: colors.outlineVariant }]}>
        <Image 
          source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80' }} 
          style={styles.avatar} 
        />
        <Text style={[styles.userName, { color: colors.onSurface }]}>{user?.name || 'GIG User'}</Text>
        <Text style={[styles.userEmail, { color: colors.onSurfaceVariant }]}>{user?.email || 'user@gig.com'}</Text>
      </View>

      <View style={{ flex: 1, paddingTop: Spacing.md }}>
        <DrawerItemList {...props} />
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, { borderTopColor: colors.outlineVariant }]} 
        onPress={() => logout()}
      >
        <Ionicons name="log-out-outline" size={22} color={colors.error} />
        <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.onSurfaceVariant,
        drawerActiveBackgroundColor: colors.surfaceContainerHigh,
        drawerStyle: {
          backgroundColor: colors.background,
          width: 300,
          borderTopRightRadius: Radii['3xl'],
          borderBottomRightRadius: Radii['3xl'],
        },
        drawerItemStyle: {
          borderRadius: Radii.full,
          paddingHorizontal: Spacing.md,
          marginVertical: 4,
        },
        drawerLabelStyle: {
          fontSize: FontSizes.labelLg,
          fontWeight: '600',
          marginLeft: -8,
        },
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{
          title: 'Home',
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="LocalTracks" 
        component={LocalTracksScreen} 
        options={{
          title: 'Local Library',
          drawerIcon: ({ color, size }) => <Ionicons name="musical-notes-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={View} // Placeholder for now
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: Spacing.xl,
    paddingTop: Spacing['2xl'],
    borderBottomWidth: 1,
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: Spacing.md,
  },
  userName: {
    fontSize: FontSizes.titleLg,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: FontSizes.bodySm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  logoutText: {
    fontSize: FontSizes.labelLg,
    fontWeight: '600',
  },
});
