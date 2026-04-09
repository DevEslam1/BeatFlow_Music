import React, { useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  Alert,
} from 'react-native';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ColorPalette, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { DrawerParamList } from '@/navigation/types';

type FAQNavProp = DrawerNavigationProp<DrawerParamList>;

const FAQ_ITEMS = [
  {
    question: 'How do I start playing music?',
    answer:
      'Open Home, Search, Library, Favorites, or Local Library and tap any song row. BeatFlow will queue the list you started from and open the same track in the player controls.',
  },
  {
    question: 'Can I play local files from my device?',
    answer:
      'Yes. Open Local Library from the drawer and grant media access. BeatFlow will scan device audio files and group them into songs, artists, albums, and folders.',
  },
  {
    question: 'Why does some music only play for 30 seconds?',
    answer:
      'Tracks from the Deezer public API use preview clips, so streamed songs are limited to the preview length provided by Deezer.',
  },
  {
    question: 'How do downloads work?',
    answer:
      'Use the download button from the player screen. Downloaded tracks are saved locally and BeatFlow will prefer those files when you are offline.',
  },
  {
    question: 'How do I change the app theme?',
    answer:
      'Open Profile or Settings and switch between Dark, Light, and System theme modes. The change is stored locally on your device.',
  },
  {
    question: 'What should I do if playback looks wrong?',
    answer:
      'Try replaying the track from the list, then reopen the player screen. If the issue continues, restart the app so the audio session is rebuilt cleanly.',
  },
];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FAQScreen() {
  const navigation = useNavigation<FAQNavProp>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const handleContactSupport = () => {
    Linking.openURL('mailto:xdev.eslam@gmail.com').catch(() => {
      Alert.alert('Error', 'Could not open the mail app.');
    });
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
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>Support</Text>
          <Text style={s.title}>FAQ</Text>
        </View>
      </View>

      <View style={s.heroCard}>
        <Ionicons name="help-circle" size={42} color={colors.secondary} />
        <Text style={s.heroTitle}>Frequently Asked Questions</Text>
        <Text style={s.heroText}>
          Quick answers for playback, local files, downloads, and app settings.
        </Text>
      </View>

      <View style={s.faqList}>
        {FAQ_ITEMS.map((item) => (
          <FAQItem
            key={item.question}
            question={item.question}
            answer={item.answer}
            colors={colors}
          />
        ))}
      </View>

      <View style={s.supportCard}>
        <Text style={s.supportTitle}>Still need help?</Text>
        <Text style={s.supportText}>
          Contact the developer directly if a playback or library issue keeps happening.
        </Text>
        <TouchableOpacity style={s.supportButton} onPress={handleContactSupport}>
          <Ionicons name="mail-outline" size={18} color={colors.onPrimaryFixed} />
          <Text style={s.supportButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 140 }} />
    </ScrollView>
  );
}

function FAQItem({
  question,
  answer,
  colors,
}: {
  question: string;
  answer: string;
  colors: ColorPalette;
}) {
  const [expanded, setExpanded] = useState(false);
  const styles = useMemo(() => faqItemStyles(colors), [colors]);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.8}>
        <Text style={styles.question}>{question}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.primary}
        />
      </TouchableOpacity>
      {expanded && <Text style={styles.answer}>{answer}</Text>}
    </View>
  );
}

const faqItemStyles = (c: ColorPalette) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: Radii.xl,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: c.outlineVariant + '22',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.md,
      paddingVertical: Spacing.lg,
    },
    question: {
      flex: 1,
      color: c.onSurface,
      fontSize: FontSizes.bodyLg,
      fontWeight: '600',
    },
    answer: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.bodyMd,
      lineHeight: 22,
      paddingBottom: Spacing.lg,
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
      gap: Spacing.md,
      paddingHorizontal: Spacing.xl,
      marginBottom: Spacing.xl,
    },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: Radii.full,
      backgroundColor: c.surfaceContainer,
      justifyContent: 'center',
      alignItems: 'center',
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
    heroCard: {
      marginHorizontal: Spacing.xl,
      marginBottom: Spacing['2xl'],
      padding: Spacing.xl,
      backgroundColor: c.surfaceContainer,
      borderRadius: Radii['2xl'],
    },
    heroTitle: {
      color: c.onSurface,
      fontSize: FontSizes.titleLg,
      fontWeight: '700',
      marginTop: Spacing.md,
    },
    heroText: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.bodyMd,
      lineHeight: 22,
      marginTop: Spacing.sm,
    },
    faqList: {
      paddingHorizontal: Spacing.xl,
    },
    supportCard: {
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.lg,
      padding: Spacing.xl,
      backgroundColor: c.surfaceContainerLow,
      borderRadius: Radii.xl,
      alignItems: 'flex-start',
    },
    supportTitle: {
      color: c.onSurface,
      fontSize: FontSizes.titleMd,
      fontWeight: '700',
    },
    supportText: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.bodyMd,
      lineHeight: 22,
      marginTop: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    supportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      backgroundColor: c.primary,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.sm,
      borderRadius: Radii.full,
    },
    supportButtonText: {
      color: c.onPrimaryFixed,
      fontSize: FontSizes.labelLg,
      fontWeight: '700',
    },
  });
