import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { PlaylistProvider } from '@/contexts/PlaylistContext';
import { NetworkProvider } from '@/contexts/NetworkContext';
import { LocalTracksProvider } from '@/contexts/LocalTracksContext';
import { AuthStackParamList, MainStackParamList } from '@/navigation/types';
import DrawerNavigator from '@/navigation/DrawerNavigator';
import LoginScreen from '@/screens/LoginScreen';
import SignupScreen from '@/screens/SignupScreen';
import PlayerScreen from '@/screens/PlayerScreen';
import FavoritesScreen from '@/screens/FavoritesScreen';
import RecentScreen from '@/screens/RecentScreen';
import PlaylistDetailScreen from '@/screens/PlaylistDetailScreen';
import CreatePlaylistScreen from '@/screens/CreatePlaylistScreen';
import MiniPlayer from '@/components/MiniPlayer';
import { navigationRef } from '@/navigation/RootNavigation';
import { NavigationStateProvider, useNavigationStateContext } from '@/contexts/NavigationContext';
import { NetworkStatusBanner } from '@/components/NetworkStatusBanner';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Radii, Spacing } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

function AuthNavigator() {
  const { colors } = useTheme();
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  const { colors } = useTheme();
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'ios_from_right',
        gestureEnabled: true,
      }}
    >
      <MainStack.Screen name="HomeDrawer" component={DrawerNavigator} />
      <MainStack.Screen
        name="Player"
        component={PlayerScreen}
        options={{
          animation: 'fade_from_bottom',
          gestureDirection: 'vertical',
          fullScreenGestureEnabled: true,
        }}
      />
      <MainStack.Screen name="Favorites" component={FavoritesScreen} />
      <MainStack.Screen name="Recent" component={RecentScreen} />
      <MainStack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
      <MainStack.Screen name="CreatePlaylist" component={CreatePlaylistScreen} />
    </MainStack.Navigator>
  );
}

function AppNavigator() {
  const { user, isLoading } = useAuth();
  const { colors, isDark } = useTheme();

  const { setCurrentRouteName } = useNavigationStateContext();

  React.useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <View style={{ alignItems: 'center', marginBottom: Spacing['4xl'] }}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDim]}
            style={{
              width: 100,
              height: 100,
              borderRadius: Radii['2xl'],
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: Spacing.lg,
            }}
          >
            <Ionicons
              name="musical-notes"
              size={50}
              color={colors.onPrimaryFixed}
            />
          </LinearGradient>
        </View>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          setCurrentRouteName(navigationRef.getCurrentRoute()?.name);
        }}
        onStateChange={() => {
          setCurrentRouteName(navigationRef.getCurrentRoute()?.name);
        }}
        theme={{
          dark: isDark,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.surfaceContainer,
            text: colors.onSurface,
            border: colors.outlineVariant,
            notification: colors.error,
          },
          fonts: {
            regular: { fontFamily: 'System', fontWeight: '400' },
            medium: { fontFamily: 'System', fontWeight: '500' },
            bold: { fontFamily: 'System', fontWeight: '700' },
            heavy: { fontFamily: 'System', fontWeight: '800' },
          },
        }}
      >
        <View style={{ flex: 1 }}>
          {user ? <MainNavigator /> : <AuthNavigator />}
          {user && <MiniPlayer />}
          <NetworkStatusBanner />
        </View>
      </NavigationContainer>
    </>
  );
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <NavigationStateProvider>
            <NetworkProvider>
              <AuthProvider>
                <PlaylistProvider>
                  <LocalTracksProvider>
                    <PlayerProvider>
                      <AppNavigator />
                    </PlayerProvider>
                  </LocalTracksProvider>
                </PlaylistProvider>
              </AuthProvider>
            </NetworkProvider>
          </NavigationStateProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
