import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Radii, Spacing, FontSizes, ColorPalette } from '@/constants/theme';
import { Song } from '@/services/types';
import { formatDuration } from '@/services/api';
import { usePlayer } from '@/contexts/PlayerContext';
import { usePlaylist } from '@/contexts/PlaylistContext';
import { useTheme } from '@/contexts/ThemeContext';

interface SongItemProps {
  song: Song;
  index?: number;
  onPress: () => void;
  showDuration?: boolean;
  isActive?: boolean;
}

export default function SongItem({
  song,
  index,
  onPress,
  showDuration = true,
  isActive = false,
}: SongItemProps) {
  const { isPlaying: playerIsPlaying } = usePlayer();
  const { isFavorite, toggleFavorite } = usePlaylist();
  const { colors } = useTheme();
  const liked = isFavorite(song.id);
  const isPlaying = isActive && playerIsPlaying;
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Animated.View 
      entering={FadeInRight.delay((index ?? 0) * 50).duration(400)}
    >
      <TouchableOpacity
        style={[styles.container, isActive && styles.activeContainer]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {index !== undefined && (
          <Text style={styles.index}>{index + 1}</Text>
        )}

        <View style={styles.albumArtContainer}>
          <Image source={{ uri: song.image }} style={styles.albumArt} />
          {isActive && (
            <View style={styles.activeOverlay}>
              <Ionicons 
                name={isPlaying ? 'pause' : 'play'} 
                size={20} 
                color="#fff" 
              />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text
            style={[styles.title, isActive && styles.activeTitle]}
            numberOfLines={1}
          >
            {song.name}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {song.artist}
          </Text>
        </View>

        {showDuration && (
          <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
        )}

        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => toggleFavorite(song)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? colors.primary : colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const makeStyles = (c: ColorPalette) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.lg,
    },
    activeContainer: {
      backgroundColor: c.surfaceBright,
      borderRadius: Radii.md,
    },
    index: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.labelMd,
      width: 24,
      textAlign: 'center',
      opacity: 0.5,
    },
    albumArtContainer: {
      position: 'relative',
      marginLeft: Spacing.sm,
    },
    albumArt: {
      width: 48,
      height: 48,
      borderRadius: Radii.md,
    },
    activeOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: Radii.md,
      justifyContent: 'center',
      alignItems: 'center',
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
    activeTitle: {
      color: c.primary,
    },
    artist: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.labelSm,
      marginTop: 2,
    },
    duration: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.labelSm,
      marginRight: Spacing.sm,
    },
    heartButton: {
      padding: Spacing.xs,
    },
  });
