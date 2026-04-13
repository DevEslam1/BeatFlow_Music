import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedImage = Animated.createAnimatedComponent(Image);
import { Radii, Spacing, FontSizes, ColorPalette } from '@/constants/theme';
import { usePlayer } from '@/contexts/PlayerContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigationStateContext } from '@/contexts/NavigationContext';
import { navigationRef } from '@/navigation/RootNavigation';

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlayPause, position, duration } = usePlayer();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { currentRouteName } = useNavigationStateContext();
  
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (!currentSong) return null;

  // Global navigation action using ref
  const handlePress = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Player' as never);
    }
  };

  // Determine if we should hide the mini player (e.g. on full player screen)
  const isPlayerScreenActive = currentRouteName === 'Player';
  if (isPlayerScreenActive) return null;

  // Check if we are in the main tabs to adjust bottom position
  // These are the route names defined in TabNavigator.tsx
  const isMainTabs = ['Home', 'Search', 'Library', 'Profile'].includes(currentRouteName || '');

  const bottomOffset = isMainTabs ? (60 + insets.bottom) : (insets.bottom > 0 ? insets.bottom : 0);

  const progress = duration > 0 ? position / duration : 0;

  return (
    <TouchableOpacity
      style={[styles.container, { position: 'absolute', bottom: bottomOffset, left: 0, right: 0, zIndex: 1000 }]}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      {/* Progress line */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.content}>
        <AnimatedImage 
          source={{ uri: currentSong.image }} 
          style={styles.albumArt} 
          // @ts-ignore - sharedTransitionTag is handled at runtime by Reanimated
          sharedTransitionTag={`albumArt-${currentSong.id}`}
        />

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.name}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color={colors.onSurface}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (c: ColorPalette) =>
  StyleSheet.create({
    container: {
      backgroundColor: c.miniPlayerBg,
      borderTopLeftRadius: Radii.lg,
      borderTopRightRadius: Radii.lg,
      overflow: 'hidden',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    progressTrack: {
      height: 2,
      backgroundColor: c.outlineVariant + '33',
    },
    progressFill: {
      height: '100%',
      backgroundColor: c.primary,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
    },
    albumArt: {
      width: 44,
      height: 44,
      borderRadius: Radii.md,
    },
    info: {
      flex: 1,
      marginLeft: Spacing.md,
    },
    title: {
      color: c.onSurface,
      fontSize: FontSizes.bodyMd,
      fontWeight: '600',
    },
    artist: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.labelSm,
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    playButton: {
      width: 40,
      height: 40,
      borderRadius: Radii.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
