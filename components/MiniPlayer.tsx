import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

const AnimatedImage = Animated.createAnimatedComponent(Image);
import { useNavigation } from '@react-navigation/native';
import { Radii, Spacing, FontSizes, ColorPalette } from '@/constants/theme';
import { usePlayer } from '@/contexts/PlayerContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDuration } from '@/services/api';

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlayPause, position, duration } = usePlayer();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (!currentSong) return null;

  const progress = duration > 0 ? position / duration : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('Player' as never)}
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

        <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color={colors.onSurface}
          />
        </TouchableOpacity>
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
    playButton: {
      width: 40,
      height: 40,
      borderRadius: Radii.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
