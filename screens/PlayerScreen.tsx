import AddToPlaylistModal from "@/components/AddToPlaylistModal";
import { ColorPalette, FontSizes, Radii, Spacing } from "@/constants/theme";
import { usePlayer } from "@/contexts/PlayerContext";
import { usePlaylist } from "@/contexts/PlaylistContext";
import { useTheme } from "@/contexts/ThemeContext";
import { formatDuration } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedImage = Animated.createAnimatedComponent(Image);

const { width } = Dimensions.get("window");
const ART_SIZE = width - 80;

export default function PlayerScreen() {
  const {
    currentSong,
    isPlaying,
    position,
    duration,
    shuffle,
    repeat,
    togglePlayPause,
    skipNext,
    skipPrevious,
    toggleShuffle,
    toggleRepeat,
    seekTo,
  } = usePlayer();
  const { isFavorite, toggleFavorite, isDownloaded, toggleDownload } =
    usePlaylist();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [isPlaylistModalVisible, setIsPlaylistModalVisible] = useState(false);

  if (!currentSong) {
    return (
      <View style={s.emptyContainer}>
        <Ionicons
          name="musical-notes"
          size={64}
          color={colors.onSurfaceVariant}
        />
        <Text style={s.emptyText}>No song playing</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.goBack}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const liked = isFavorite(currentSong.id);
  const downloaded = isDownloaded(currentSong.id);
  const progress = duration > 0 ? position / duration : 0;

  const handleSeek = (locationX: number, layoutWidth: number) => {
    const newPosition = (locationX / layoutWidth) * duration;
    seekTo(Math.max(0, Math.min(newPosition, duration)));
  };

  const handleShare = async () => {
    try {
      if (!currentSong) return;
      const url = currentSong.uri || currentSong.previewUrl;
      const message = `Check out "${currentSong.name}" by ${currentSong.artist} on BeatFlow! ${url}`;
      await Share.share({
        message,
        title: `Share ${currentSong.name}`,
      });
    } catch (error) {
      console.error("Error sharing song:", error);
    }
  };

  return (
    <View
      style={[
        s.container,
        {
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Now Playing</Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      <View style={s.artContainer}>
        <AnimatedImage
          source={{ uri: currentSong.image }}
          style={s.albumArt}
          // @ts-ignore - sharedTransitionTag is handled at runtime by Reanimated
          sharedTransitionTag={`albumArt-${currentSong.id}`}
        />
      </View>

      <View style={s.infoSection}>
        <View style={s.infoRow}>
          <View style={s.infoText}>
            <Text style={s.songTitle} numberOfLines={1}>
              {currentSong.name}
            </Text>
            <Text style={s.songArtist} numberOfLines={1}>
              {currentSong.artist}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: Spacing.md }}>
            <TouchableOpacity onPress={() => setIsPlaylistModalVisible(true)}>
              <Ionicons
                name="add-circle-outline"
                size={28}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleDownload(currentSong)}>
              <Ionicons
                name={downloaded ? "cloud-done" : "cloud-download-outline"}
                size={28}
                color={downloaded ? colors.primary : colors.onSurfaceVariant}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleFavorite(currentSong)}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={28}
                color={liked ? colors.primary : colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={s.progressContainer}
          activeOpacity={1}
          onPress={(e) => {
            handleSeek(e.nativeEvent.locationX, width - 80);
          }}
        >
          <View style={s.progressTrack}>
            <LinearGradient
              colors={[colors.secondary, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[s.progressFill, { width: `${progress * 100}%` }]}
            />
            <View
              style={[
                s.progressDot,
                { left: `${progress * 100}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
          <View style={s.timeRow}>
            <Text style={s.timeText}>{formatDuration(position)}</Text>
            <Text style={s.timeText}>{formatDuration(duration)}</Text>
          </View>
        </TouchableOpacity>

        <View style={s.controls}>
          <TouchableOpacity onPress={toggleShuffle}>
            <Ionicons
              name="shuffle"
              size={24}
              color={shuffle ? colors.secondary : colors.onSurfaceVariant}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={skipPrevious}>
            <Ionicons
              name="play-skip-back"
              size={32}
              color={colors.onSurface}
            />
          </TouchableOpacity>
          <TouchableOpacity style={s.playButton} onPress={togglePlayPause}>
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              style={s.playGradient}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={32}
                color={colors.onPrimaryFixed}
              />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={skipNext}>
            <Ionicons
              name="play-skip-forward"
              size={32}
              color={colors.onSurface}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleRepeat}>
            <Ionicons
              name="repeat"
              size={24}
              color={
                repeat !== "off" ? colors.secondary : colors.onSurfaceVariant
              }
            />
            {repeat === "one" && (
              <View
                style={[s.repeatDot, { backgroundColor: colors.secondary }]}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <AddToPlaylistModal
        isVisible={isPlaylistModalVisible}
        onClose={() => setIsPlaylistModalVisible(false)}
        song={currentSong}
      />
    </View>
  );
}

const makeStyles = (c: ColorPalette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    emptyContainer: {
      flex: 1,
      backgroundColor: c.background,
      justifyContent: "center",
      alignItems: "center",
      gap: Spacing.lg,
    },
    emptyText: { color: c.onSurfaceVariant, fontSize: FontSizes.bodyLg },
    goBack: { color: c.primary, fontSize: FontSizes.bodyMd },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: Spacing.xl,
      marginBottom: Spacing["2xl"],
    },
    headerTitle: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.labelLg,
      fontWeight: "600",
    },
    artContainer: { alignItems: "center", marginBottom: Spacing["3xl"] },
    albumArt: { width: ART_SIZE, height: ART_SIZE, borderRadius: Radii.xl },
    infoSection: { paddingHorizontal: Spacing["3xl"] },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing["2xl"],
    },
    infoText: { flex: 1, marginRight: Spacing.lg },
    songTitle: {
      color: c.onSurface,
      fontSize: FontSizes.titleLg,
      fontWeight: "700",
    },
    songArtist: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.bodyMd,
      marginTop: Spacing.xs,
    },
    progressContainer: { marginBottom: Spacing.xl },
    progressTrack: {
      height: 4,
      backgroundColor: c.outlineVariant + "44",
      borderRadius: 2,
      overflow: "visible",
    },
    progressFill: { height: "100%", borderRadius: 2 },
    progressDot: {
      position: "absolute",
      top: -5,
      width: 14,
      height: 14,
      borderRadius: 7,
      marginLeft: -7,
    },
    timeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: Spacing.sm,
    },
    timeText: { color: c.onSurfaceVariant, fontSize: FontSizes.labelSm },
    controls: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: Spacing.md,
    },
    playButton: {},
    playGradient: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
    },
    repeatDot: {
      position: "absolute",
      bottom: -4,
      alignSelf: "center",
      width: 4,
      height: 4,
      borderRadius: 2,
    },
  });
