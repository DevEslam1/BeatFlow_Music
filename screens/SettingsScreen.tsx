import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorPalette, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '@/navigation/types';

type SettingsNavProp = DrawerNavigationProp<DrawerParamList>;

const THEME_OPTIONS: Array<{
  label: string;
  mode: ThemeMode;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { label: 'Dark', mode: 'dark', icon: 'moon' },
  { label: 'Light', mode: 'light', icon: 'sunny' },
  { label: 'System', mode: 'system', icon: 'phone-portrait-outline' },
];

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation<SettingsNavProp>();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open the link.');
    });
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[s.contentContainer, { paddingTop: insets.top + Spacing.sm }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.header}>
        <TouchableOpacity style={s.headerButton} onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={s.headerCopy}>
          <Text style={s.eyebrow}>Preferences</Text>
          <Text style={s.title}>Settings</Text>
        </View>
      </View>

      <View style={s.accountCard}>
        <View style={s.accountIcon}>
          <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.accountName}>{user?.name ?? 'BeatFlow User'}</Text>
          <Text style={s.accountEmail}>{user?.email ?? 'user@beatflow.app'}</Text>
        </View>
      </View>

      <Section title="Theme" colors={colors}>
        <View style={s.themeRow}>
          {THEME_OPTIONS.map((option) => {
            const active = option.mode === mode;
            return (
              <TouchableOpacity
                key={option.mode}
                style={[s.themeOption, active && s.themeOptionActive]}
                onPress={() => setMode(option.mode)}
              >
                <Ionicons
                  name={option.icon}
                  size={18}
                  color={active ? colors.onPrimaryFixed : colors.onSurfaceVariant}
                />
                <Text style={[s.themeOptionText, active && s.themeOptionTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>

      <Section title="App" colors={colors}>
        <SettingsRow
          icon="chatbubbles-outline"
          label="FAQ"
          description="Answers to the common playback and library questions."
          colors={colors}
          onPress={() => navigation.navigate('FAQ')}
        />
        <SettingsRow
          icon="shield-outline"
          label="Privacy Policy"
          description="See how BeatFlow stores account and playlist data."
          colors={colors}
          onPress={() => setShowPrivacy(true)}
        />
        <SettingsRow
          icon="information-circle-outline"
          label="About BeatFlow"
          description="Product details and current app focus."
          colors={colors}
          onPress={() => setShowAbout(true)}
        />
      </Section>

      <Section title="Support" colors={colors}>
        <SettingsRow
          icon="mail-outline"
          label="Email Support"
          description="xdev.eslam@gmail.com"
          colors={colors}
          onPress={() => handleOpenLink('mailto:xdev.eslam@gmail.com')}
        />
        <SettingsRow
          icon="logo-linkedin"
          label="LinkedIn"
          description="deveslam-mahmoud"
          colors={colors}
          onPress={() => handleOpenLink('https://linkedin.com/in/deveslam-mahmoud')}
        />
        <SettingsRow
          icon="logo-github"
          label="GitHub"
          description="DevEslam1"
          colors={colors}
          onPress={() => handleOpenLink('https://github.com/DevEslam1')}
        />
      </Section>

      <TouchableOpacity style={s.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={s.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={{ height: 140 }} />

      <SheetModal
        visible={showPrivacy}
        title="Privacy Policy"
        colors={colors}
        onClose={() => setShowPrivacy(false)}
      >
        <ModalSection title="Local Data" colors={colors}>
          BeatFlow stores account information, playlists, favorites, and theme settings locally on your device.
        </ModalSection>
        <ModalSection title="Streaming Data" colors={colors}>
          Music metadata and preview URLs come from the Deezer public API. BeatFlow does not send your personal account data to Deezer.
        </ModalSection>
        <ModalSection title="Device Library" colors={colors}>
          Local library scanning uses media permissions only to read your on-device audio files and organize them inside the app.
        </ModalSection>
      </SheetModal>

      <SheetModal
        visible={showAbout}
        title="About BeatFlow"
        colors={colors}
        onClose={() => setShowAbout(false)}
      >
        <ModalSection title="Product" colors={colors}>
          BeatFlow is a React Native music player built with Expo, combining Deezer previews, local audio scanning, downloads, playlists, and offline-aware playback.
        </ModalSection>
        <ModalSection title="Developer" colors={colors}>
          Built by Eslam Mahmoud, focused on polished mobile UI, reliable playback behavior, and practical app architecture.
        </ModalSection>
        <ModalSection title="Current Version" colors={colors}>
          1.0.0
        </ModalSection>
      </SheetModal>
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
          marginBottom: Spacing.md,
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

function SettingsRow({
  icon,
  label,
  description,
  colors,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  colors: ColorPalette;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={rowStyles(colors).row} onPress={onPress}>
      <View style={rowStyles(colors).iconWrap}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={rowStyles(colors).label}>{label}</Text>
        <Text style={rowStyles(colors).description}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
    </TouchableOpacity>
  );
}

function SheetModal({
  visible,
  title,
  colors,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  colors: ColorPalette;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={modalStyles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View
          style={[
            modalStyles.sheet,
            {
              backgroundColor: colors.surfaceContainerLow,
              paddingBottom: insets.bottom + Spacing.xl,
            },
          ]}
        >
          <View style={[modalStyles.handle, { backgroundColor: colors.outlineVariant }]} />
          <View style={modalStyles.modalHeader}>
            <Text style={[modalStyles.modalTitle, { color: colors.onSurface }]}>{title}</Text>
            <TouchableOpacity
              style={[modalStyles.closeButton, { backgroundColor: colors.surfaceContainer }]}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={colors.onSurface} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={{ maxHeight: 520 }}
            contentContainerStyle={{ paddingHorizontal: Spacing.xl }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ModalSection({
  title,
  colors,
  children,
}: {
  title: string;
  colors: ColorPalette;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: Spacing.xl }}>
      <Text
        style={{
          color: colors.primary,
          fontSize: FontSizes.labelLg,
          fontWeight: '700',
          marginBottom: Spacing.sm,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: colors.onSurfaceVariant,
          fontSize: FontSizes.bodyMd,
          lineHeight: 22,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

const rowStyles = (c: ColorPalette) =>
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
    description: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.bodySm,
      marginTop: 2,
    },
  });

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radii['3xl'],
    borderTopRightRadius: Radii['3xl'],
    paddingTop: Spacing.md,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSizes.titleLg,
    fontWeight: '700',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
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
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
      marginBottom: Spacing.xl,
      gap: Spacing.md,
    },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: Radii.full,
      backgroundColor: c.surfaceContainer,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerCopy: {
      flex: 1,
    },
    eyebrow: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.bodySm,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    title: {
      color: c.onSurface,
      fontSize: FontSizes.headlineSm,
      fontWeight: '700',
      marginTop: 2,
    },
    accountCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: Spacing.xl,
      marginBottom: Spacing['2xl'],
      backgroundColor: c.surfaceContainerLow,
      borderRadius: Radii.xl,
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    accountIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: c.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    accountName: {
      color: c.onSurface,
      fontSize: FontSizes.titleMd,
      fontWeight: '700',
    },
    accountEmail: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.bodyMd,
      marginTop: 2,
    },
    themeRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      paddingVertical: Spacing.lg,
    },
    themeOption: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: Spacing.xs,
      paddingVertical: Spacing.md,
      borderRadius: Radii.full,
      backgroundColor: c.surfaceContainerHighest,
    },
    themeOptionActive: {
      backgroundColor: c.primary,
    },
    themeOptionText: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.labelLg,
      fontWeight: '600',
    },
    themeOptionTextActive: {
      color: c.onPrimaryFixed,
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
