import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal,
} from 'react-native';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open the link.');
    });
  };

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
    <ScrollView style={s.container} contentContainerStyle={[s.contentContainer, { paddingTop: insets.top + Spacing.sm }]}>
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

      <InfoModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy" colors={colors}>
        <InfoSection title="Data Collection" colors={colors}>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: FontSizes.bodyMd }}>GIG Music Player does not collect, store, or transmit any personal data to external servers. All your data is stored locally on your device using AsyncStorage.</Text>
        </InfoSection>
        <InfoSection title="Third-Party Services" colors={colors}>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: FontSizes.bodyMd }}>We use the Deezer public API to fetch music metadata and 30-second previews. No personal information is shared with Deezer.</Text>
        </InfoSection>
        <InfoSection title="Local Storage" colors={colors}>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: FontSizes.bodyMd }}>Your account credentials, playlists, and preferences are saved locally on your device. Uninstalling will delete all stored data.</Text>
        </InfoSection>
        <InfoSection title="Your Rights" colors={colors}>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: FontSizes.bodyMd }}>Since all data is stored locally, you have full control. Delete at any time by clearing app data or uninstalling.</Text>
        </InfoSection>
      </InfoModal>

      {/* Help Modal */}
      <InfoModal visible={showHelp} onClose={() => setShowHelp(false)} title="Help & Support" colors={colors}>
        <InfoSection title="Contact the Developer" colors={colors}>
          <Text style={{ fontWeight: '700', color: colors.onSurface, fontSize: FontSizes.bodyLg, marginBottom: Spacing.sm }}>Eslam Mahmoud</Text>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: FontSizes.bodyMd, marginBottom: Spacing.xl }}>Mobile Applications Engineer</Text>
          
          <TouchableOpacity style={s.contactRow} onPress={() => handleOpenLink('mailto:xdev.eslam@gmail.com')}>
            <Ionicons name="mail" size={20} color={colors.primary} />
            <Text style={s.contactLink}>Email: xdev.eslam@gmail.com</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={s.contactRow} onPress={() => handleOpenLink('tel:+201122299831')}>
            <Ionicons name="call" size={20} color={colors.primary} />
            <Text style={s.contactLink}>Phone: +20 1122299831</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.contactRow} onPress={() => handleOpenLink('https://linkedin.com/in/deveslam-mahmoud')}>
            <Ionicons name="logo-linkedin" size={20} color={colors.primary} />
            <Text style={s.contactLink}>LinkedIn: Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.contactRow} onPress={() => handleOpenLink('https://github.com/DevEslam1')}>
            <Ionicons name="logo-github" size={20} color={colors.primary} />
            <Text style={s.contactLink}>GitHub: DevEslam1</Text>
          </TouchableOpacity>
        </InfoSection>
        <InfoSection title="Quick Guide" colors={colors}>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: FontSizes.bodyMd, marginBottom: Spacing.xs }}>• Search: Tap Search tab to find music.</Text>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: FontSizes.bodyMd, marginBottom: Spacing.xs }}>• Offline: Use cloud icon to download.</Text>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: FontSizes.bodyMd, marginBottom: Spacing.xs }}>• Library: Manage your music & lists.</Text>
        </InfoSection>
      </InfoModal>

      {/* About Modal */}
      <InfoModal visible={showAbout} onClose={() => setShowAbout(false)} title="About the Developer" colors={colors}>
        <View style={s.aboutHeader}>
          <LinearGradient colors={[colors.primary, colors.secondary]} style={s.aboutIconRing}>
            <View style={s.aboutIconInner}><Ionicons name="musical-notes" size={28} color={colors.primary} /></View>
          </LinearGradient>
          <Text style={s.aboutAppName}>Eslam Mahmoud</Text>
          <Text style={s.aboutVersion}>Mobile Applications Engineer</Text>
        </View>
        <InfoSection title="Professional Summary" colors={colors}>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: FontSizes.bodyMd, lineHeight: 22 }}>Cross-platform Mobile Developer with 1+ year of hands-on experience building scalable applications using Flutter, React Native, and Clean Architecture. Passionate about performance optimization and exceptional UI/UX.</Text>
        </InfoSection>
        <InfoSection title="Technical Expertise" colors={colors}>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: FontSizes.bodyMd }}>Expertise in React Native, Flutter, BLoC, Provider, Firebase, and Clean Architecture. Developer of production-ready apps like Maysur and Free Zone.</Text>
        </InfoSection>
        <InfoSection title="Education" colors={colors}>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: FontSizes.bodyMd }}>B.Sc. in Mechatronics Engineering, Mansoura University (June 2022). Technical excellence award winner.</Text>
        </InfoSection>
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
  const insets = useSafeAreaInsets();
  
  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
        <TouchableOpacity activeOpacity={1} onPress={onClose} style={StyleSheet.absoluteFill} />
        
        <View 
          style={{ 
            backgroundColor: colors.surfaceContainerLow, 
            borderTopLeftRadius: Radii['3xl'], 
            borderTopRightRadius: Radii['3xl'], 
            maxHeight: '90%',
            width: '100%',
          }}
        >
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginTop: Spacing.md }} />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md }}>
            <Text style={{ color: colors.onSurface, fontSize: FontSizes.titleLg, fontWeight: '700' }}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceContainer, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="close" size={22} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={{ maxHeight: 600 }}
            contentContainerStyle={{ 
              paddingHorizontal: Spacing.xl, 
              paddingBottom: insets.bottom + Spacing.xl 
            }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function InfoSection({ title, colors, children }: { title: string; colors: ColorPalette; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: Spacing.xl }}>
      <Text style={{ color: colors.primary, fontSize: FontSizes.labelLg, fontWeight: '700', marginBottom: Spacing.sm }}>{title}</Text>
      <View>{children}</View>
    </View>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  contentContainer: { paddingBottom: 140 },
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
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: c.outlineVariant + '22', marginBottom: Spacing.xs },
  contactLink: { color: c.primary, fontSize: FontSizes.bodyMd, textDecorationLine: 'underline' },
});
