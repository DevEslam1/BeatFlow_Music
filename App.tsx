import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { PlaylistProvider } from '@/contexts/PlaylistContext';
import { NetworkProvider } from '@/contexts/NetworkContext';
import { AuthStackParamList, MainStackParamList } from '@/navigation/types';
import TabNavigator from '@/navigation/TabNavigator';
import LoginScreen from '@/screens/LoginScreen';
import SignupScreen from '@/screens/SignupScreen';
import PlayerScreen from '@/screens/PlayerScreen';
import FavoritesScreen from '@/screens/FavoritesScreen';
import RecentScreen from '@/screens/RecentScreen';
import PlaylistDetailScreen from '@/screens/PlaylistDetailScreen';
import CreatePlaylistScreen from '@/screens/CreatePlaylistScreen';

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
        animation: 'slide_from_right',
      }}
    >
      <MainStack.Screen name="HomeTabs" component={TabNavigator} />
      <MainStack.Screen
        name="Player"
        component={PlayerScreen}
        options={{
          animation: 'slide_from_bottom',
          gestureDirection: 'vertical',
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

  React.useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer
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
        {user ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NetworkProvider>
        <AuthProvider>
          <PlaylistProvider>
            <PlayerProvider>
              <AppNavigator />
            </PlayerProvider>
          </PlaylistProvider>
        </AuthProvider>
      </NetworkProvider>
    </ThemeProvider>
  );
}
