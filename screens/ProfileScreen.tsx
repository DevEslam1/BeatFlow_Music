import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Spacing, Radii, FontSizes, ColorPalette } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { usePlaylist } from '@/contexts/PlaylistContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { favorites, playlists } = usePlaylist();
  const { recentlyPlayed } = usePlayer();
  const { colors, mode, setMode } = useTheme();
  const navigation = useNavigation<any>();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const cycleTheme = () => {
    const next: ThemeMode = mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark';
    setMode(next);
  };

  const getThemeIcon = (): keyof typeof Ionicons.glyphMap =>
    mode === 'dark' ? 'moon' : mode === 'light' ? 'sunny' : 'phone-portrait-outline';

  const getThemeLabel = () => mode === 'dark' ? 'Dark' : mode === 'light' ? 'Light' : 'System';

  const stats = [
    { label: 'Favorites', value: favorites.length },
    { label: 'Playlists', value: playlists.length },
    { label: 'Played', value: recentlyPlayed.length },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.contentContainer}>
      <View style={s.avatarSection}>
        <LinearGradient colors={[colors.primary, colors.secondary]} style={s.avatarRing}>
          <View style={s.avatarInner}><Ionicons name="person" size={40} color={colors.onSurfaceVariant} /></View>
        </LinearGradient>
        <Text style={s.userName}>{user?.name ?? 'User'}</Text>
        <Text style={s.userEmail}>{user?.email ?? ''}</Text>
      </View>

      <View style={s.statsRow}>
        {stats.map((stat) => (
          <View key={stat.label} style={s.statItem}>
            <Text style={s.statValue}>{stat.value}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={s.menuSection}>
        <Text style={s.menuTitle}>Library</Text>
        <MenuItem icon="heart" label="Favorites" colors={colors} onPress={() => navigation.navigate('Favorites')} />
        <MenuItem icon="time" label="Recently Played" colors={colors} onPress={() => navigation.navigate('Recent')} />
        <MenuItem icon="list" label="Playlists" colors={colors} onPress={() => navigation.navigate('CreatePlaylist')} />
      </View>

      <View style={s.menuSection}>
        <Text style={s.menuTitle}>Appearance</Text>
        <TouchableOpacity style={s.menuItem} onPress={cycleTheme}>
          <Ionicons name={getThemeIcon()} size={22} color={colors.onSurfaceVariant} />
          <Text style={s.menuLabel}>Theme</Text>
          <View style={s.themeBadge}><Text style={s.themeBadgeText}>{getThemeLabel()}</Text></View>
        </TouchableOpacity>
      </View>

      <View style={s.menuSection}>
        <Text style={s.menuTitle}>Settings</Text>
        <MenuItem icon="shield-outline" label="Privacy" colors={colors} onPress={() => setShowPrivacy(true)} />
        <MenuItem icon="help-circle-outline" label="Help & Support" colors={colors} onPress={() => setShowHelp(true)} />
        <MenuItem icon="information-circle-outline" label="About" colors={colors} onPress={() => setShowAbout(true)} />
      </View>

      <TouchableOpacity style={s.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={colors.error} />
        <Text style={s.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={{ height: 140 }} />

      {/* Privacy Modal */}
      <InfoModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy" colors={colors}>
        <InfoSection title="Data Collection" colors={colors}>GIG Music Player does not collect, store, or transmit any personal data to external servers. All your data is stored locally on your device using AsyncStorage.</InfoSection>
        <InfoSection title="Third-Party Services" colors={colors}>We use the Deezer public API to fetch music metadata and 30-second previews. No personal information is shared with Deezer.</InfoSection>
        <InfoSection title="Local Storage" colors={colors}>Your account credentials, playlists, and preferences are saved locally on your device. Uninstalling will delete all stored data.</InfoSection>
        <InfoSection title="Your Rights" colors={colors}>Since all data is stored locally, you have full control. Delete at any time by clearing app data or uninstalling.</InfoSection>
      </InfoModal>

      {/* Help Modal */}
      <InfoModal visible={showHelp} onClose={() => setShowHelp(false)} title="Help & Support" colors={colors}>
        <InfoSection title="How to Search" colors={colors}>Tap the Search tab and type a song name, artist, or album. You can also tap genre cards to browse by category.</InfoSection>
        <InfoSection title="Playing Music" colors={colors}>Tap any song to start playback. Use the mini player at the bottom, or tap it for the full-screen player.</InfoSection>
        <InfoSection title="Managing Playlists" colors={colors}>Go to Library → Playlists to create a new playlist. Add songs from search results or your library.</InfoSection>
        <InfoSection title="Favorites" colors={colors}>Tap the heart icon on any song to add it to favorites. Access all favorites from Library or Home.</InfoSection>
      </InfoModal>

      {/* About Modal */}
      <InfoModal visible={showAbout} onClose={() => setShowAbout(false)} title="About" colors={colors}>
        <View style={s.aboutHeader}>
          <LinearGradient colors={[colors.primary, colors.secondary]} style={s.aboutIconRing}>
            <View style={s.aboutIconInner}><Ionicons name="musical-notes" size={28} color={colors.primary} /></View>
          </LinearGradient>
          <Text style={s.aboutAppName}>GIG Music Player</Text>
          <Text style={s.aboutVersion}>Version 1.0.0</Text>
        </View>
        <InfoSection title="About the App" colors={colors}>A modern music streaming app built with React Native and Expo, connecting to the Deezer API.</InfoSection>
        <InfoSection title="Tech Stack" colors={colors}>React Native 0.81 • Expo SDK 54 • React Navigation • expo-av • TypeScript</InfoSection>
        <InfoSection title="Design System" colors={colors}>Powered by Sonic Noir — a dual-mode palette with vibrant purple and cyan accents.</InfoSection>
      </InfoModal>
    </ScrollView>
  );
}

function MenuItem({ icon, label, colors, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; colors: ColorPalette; onPress: () => void }) {
  return (
    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md }} onPress={onPress}>
      <Ionicons name={icon} size={22} color={colors.onSurfaceVariant} />
      <Text style={{ flex: 1, color: colors.onSurface, fontSize: FontSizes.bodyLg }}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
    </TouchableOpacity>
  );
}

function InfoModal({ visible, onClose, title, colors, children }: { visible: boolean; onClose: () => void; title: string; colors: ColorPalette; children: React.ReactNode }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: colors.surfaceContainerLow, borderTopLeftRadius: Radii['2xl'], borderTopRightRadius: Radii['2xl'], maxHeight: '85%', paddingBottom: 40 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginTop: Spacing.md }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md }}>
            <Text style={{ color: colors.onSurface, fontSize: FontSizes.titleLg, fontWeight: '700' }}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceContainer, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="close" size={22} color={colors.onSurface} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl }} showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function InfoSection({ title, colors, children }: { title: string; colors: ColorPalette; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: Spacing.xl }}>
      <Text style={{ color: colors.primary, fontSize: FontSizes.labelLg, fontWeight: '700', marginBottom: Spacing.xs }}>{title}</Text>
      <Text style={{ color: colors.onSurfaceVariant, fontSize: FontSizes.bodyMd, lineHeight: 22 }}>{children}</Text>
    </View>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  contentContainer: { paddingTop: 60 },
  avatarSection: { alignItems: 'center', marginBottom: Spacing['3xl'] },
  avatarRing: { width: 100, height: 100, borderRadius: 50, padding: 3 },
  avatarInner: { flex: 1, borderRadius: 50, backgroundColor: c.surfaceContainer, justifyContent: 'center', alignItems: 'center' },
  userName: { color: c.onSurface, fontSize: FontSizes.titleLg, fontWeight: '700', marginTop: Spacing.md },
  userEmail: { color: c.onSurfaceVariant, fontSize: FontSizes.bodyMd, marginTop: Spacing.xs },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: c.surfaceContainerLow, marginHorizontal: Spacing.xl, borderRadius: Radii.lg, paddingVertical: Spacing.xl, marginBottom: Spacing['2xl'] },
  statItem: { alignItems: 'center' },
  statValue: { color: c.primary, fontSize: FontSizes.headlineSm, fontWeight: '700' },
  statLabel: { color: c.onSurfaceVariant, fontSize: FontSizes.labelSm, marginTop: Spacing.xs },
  menuSection: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  menuTitle: { color: c.onSurfaceVariant, fontSize: FontSizes.labelLg, fontWeight: '600', marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
  menuLabel: { flex: 1, color: c.onSurface, fontSize: FontSizes.bodyLg },
  themeBadge: { backgroundColor: c.primary + '22', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radii.full },
  themeBadgeText: { color: c.primary, fontSize: FontSizes.labelMd, fontWeight: '600' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.lg, marginHorizontal: Spacing.xl, borderRadius: Radii.lg, borderWidth: 1, borderColor: c.error + '44', gap: Spacing.sm, marginTop: Spacing.lg },
  logoutText: { color: c.error, fontSize: FontSizes.bodyLg, fontWeight: '600' },
  aboutHeader: { alignItems: 'center', marginBottom: Spacing['2xl'] },
  aboutIconRing: { width: 64, height: 64, borderRadius: 32, padding: 2 },
  aboutIconInner: { flex: 1, borderRadius: 32, backgroundColor: c.surfaceContainerLow, justifyContent: 'center', alignItems: 'center' },
  aboutAppName: { color: c.onSurface, fontSize: FontSizes.titleLg, fontWeight: '700', marginTop: Spacing.md },
  aboutVersion: { color: c.onSurfaceVariant, fontSize: FontSizes.labelMd, marginTop: Spacing.xs },
});
