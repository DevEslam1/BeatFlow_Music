import React, { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorPalette, FontSizes, Radii, Spacing } from '@/constants/theme';
import { TabScreenNavProp } from '@/navigation/types';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { usePlaylist } from '@/contexts/PlaylistContext';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { favorites, playlists } = usePlaylist();
  const { recentlyPlayed } = usePlayer();
  const { colors, mode, setMode } = useTheme();
  const navigation = useNavigation<TabScreenNavProp>();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const cycleTheme = () => {
    const next: ThemeMode = mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark';
    setMode(next);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const stats = [
    { label: 'Favorites', value: favorites.length },
    { label: 'Playlists', value: playlists.length },
    { label: 'Played', value: recentlyPlayed.length },
  ];

  const themeIcon: keyof typeof Ionicons.glyphMap =
    mode === 'dark' ? 'moon' : mode === 'light' ? 'sunny' : 'phone-portrait-outline';

  const themeLabel = mode === 'dark' ? 'Dark' : mode === 'light' ? 'Light' : 'System';

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[s.contentContainer, { paddingTop: insets.top + Spacing.sm }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.header}>
        <TouchableOpacity style={s.menuButton} onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={28} color={colors.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity style={s.settingsButton} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={22} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      <View style={s.hero}>
        <LinearGradient colors={[colors.primary, colors.secondary]} style={s.avatarRing}>
          <View style={s.avatarInner}>
            <Ionicons name="person" size={44} color={colors.onSurfaceVariant} />
          </View>
        </LinearGradient>
        <Text style={s.userName}>{user?.name ?? 'BeatFlow User'}</Text>
        <Text style={s.userEmail}>{user?.email ?? 'user@beatflow.app'}</Text>
      </View>

      <View style={s.statsRow}>
        {stats.map((stat) => (
          <View key={stat.label} style={s.statItem}>
            <Text style={s.statValue}>{stat.value}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Section title="Library" colors={colors}>
        <MenuItem
          icon="heart-outline"
          label="Favorites"
          subtitle="Songs you have liked"
          colors={colors}
          onPress={() => navigation.navigate('Favorites')}
        />
        <MenuItem
          icon="time-outline"
          label="Recently Played"
          subtitle="Your latest listening history"
          colors={colors}
          onPress={() => navigation.navigate('Recent')}
        />
        <MenuItem
          icon="library-outline"
          label="My Library"
          subtitle="Jump to playlists, favorites, and downloads"
          colors={colors}
          onPress={() => navigation.navigate('Library')}
        />
        <MenuItem
          icon="add-circle-outline"
          label="Create Playlist"
          subtitle="Build a new custom playlist"
          colors={colors}
          onPress={() => navigation.navigate('CreatePlaylist')}
        />
      </Section>

      <Section title="Preferences" colors={colors}>
        <MenuItem
          icon={themeIcon}
          label="Theme"
          subtitle={`Current mode: ${themeLabel}`}
          colors={colors}
          onPress={cycleTheme}
          trailing={
            <View style={s.themeBadge}>
              <Text style={s.themeBadgeText}>{themeLabel}</Text>
            </View>
          }
        />
        <MenuItem
          icon="settings-outline"
          label="Settings"
          subtitle="Privacy, support, and app details"
          colors={colors}
          onPress={() => navigation.navigate('Settings')}
        />
        <MenuItem
          icon="chatbubbles-outline"
          label="FAQ"
          subtitle="Answers to common questions"
          colors={colors}
          onPress={() => navigation.navigate('FAQ')}
        />
      </Section>

      <TouchableOpacity style={s.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={colors.error} />
        <Text style={s.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={{ height: 140 }} />
    </ScrollView>
  );
}

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: ColorPalette;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: Spacing.xl, paddingHorizontal: Spacing.xl }}>
      <Text
        style={{
          color: colors.onSurfaceVariant,
          fontSize: FontSizes.labelLg,
          fontWeight: '700',
          marginBottom: Spacing.sm,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: colors.surfaceContainerLow,
          borderRadius: Radii.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  subtitle,
  colors,
  onPress,
  trailing,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  colors: ColorPalette;
  onPress: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <TouchableOpacity style={itemStyles(colors).row} onPress={onPress}>
      <View style={itemStyles(colors).iconWrap}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={itemStyles(colors).label}>{label}</Text>
        <Text style={itemStyles(colors).subtitle}>{subtitle}</Text>
      </View>
      {trailing ?? <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />}
    </TouchableOpacity>
  );
}

const itemStyles = (c: ColorPalette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingVertical: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: c.outlineVariant + '22',
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.primary + '18',
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      color: c.onSurface,
      fontSize: FontSizes.bodyLg,
      fontWeight: '600',
    },
    subtitle: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.bodySm,
      marginTop: 2,
    },
  });

const makeStyles = (c: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    contentContainer: {
      paddingBottom: 140,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.xl,
      marginBottom: Spacing.md,
    },
    menuButton: {
      width: 44,
      height: 44,
      borderRadius: Radii.full,
      backgroundColor: c.surfaceContainer,
      justifyContent: 'center',
      alignItems: 'center',
    },
    settingsButton: {
      width: 44,
      height: 44,
      borderRadius: Radii.full,
      backgroundColor: c.surfaceContainer,
      justifyContent: 'center',
      alignItems: 'center',
    },
    hero: {
      alignItems: 'center',
      marginBottom: Spacing['3xl'],
    },
    avatarRing: {
      width: 108,
      height: 108,
      borderRadius: 54,
      padding: 3,
    },
    avatarInner: {
      flex: 1,
      borderRadius: 54,
      backgroundColor: c.surfaceContainer,
      justifyContent: 'center',
      alignItems: 'center',
    },
    userName: {
      color: c.onSurface,
      fontSize: FontSizes.titleLg,
      fontWeight: '700',
      marginTop: Spacing.md,
    },
    userEmail: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.bodyMd,
      marginTop: Spacing.xs,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginHorizontal: Spacing.xl,
      marginBottom: Spacing['2xl'],
      paddingVertical: Spacing.xl,
      backgroundColor: c.surfaceContainerLow,
      borderRadius: Radii.xl,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      color: c.primary,
      fontSize: FontSizes.headlineSm,
      fontWeight: '700',
    },
    statLabel: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.labelSm,
      marginTop: Spacing.xs,
    },
    themeBadge: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: Radii.full,
      backgroundColor: c.primary + '22',
    },
    themeBadgeText: {
      color: c.primary,
      fontSize: FontSizes.labelMd,
      fontWeight: '700',
    },
    logoutButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: Spacing.sm,
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.lg,
      paddingVertical: Spacing.lg,
      borderRadius: Radii.lg,
      borderWidth: 1,
      borderColor: c.error + '44',
    },
    logoutText: {
      color: c.error,
      fontSize: FontSizes.bodyLg,
      fontWeight: '700',
    },
  });
