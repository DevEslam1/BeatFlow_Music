import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Spacing, Radii, FontSizes, ColorPalette } from '@/constants/theme';
import { usePlaylist } from '@/contexts/PlaylistContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PlaylistDetailRouteProp } from '@/navigation/types';
import SongItem from '@/components/SongItem';
import SwipeableItem from '@/components/SwipeableItem';

export default function PlaylistDetailScreen() {
  const route = useRoute<PlaylistDetailRouteProp>();
  const { id } = route.params;
  const { playlists, deletePlaylist, renamePlaylist, removeSongFromPlaylist } = usePlaylist();
  const { playSong, isSongActive } = usePlayer();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const playlist = playlists.find((p) => p.id === id);

  if (!playlist) {
    return (
      <View style={s.emptyContainer}>
        <Text style={s.emptyText}>Playlist not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.goBack}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePlayAll = () => { if (playlist.songs.length > 0) playSong(playlist.songs[0], playlist.songs); };
  const handleShuffle = () => {
    if (playlist.songs.length > 0) { const i = Math.floor(Math.random() * playlist.songs.length); playSong(playlist.songs[i], playlist.songs); }
  };

  const handleDelete = () => {
    Alert.alert('Delete Playlist', `Delete "${playlist.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deletePlaylist(playlist.id); navigation.goBack(); } },
    ]);
  };

  const handleRename = () => {
    if (Alert.prompt) {
      Alert.prompt('Rename Playlist', 'Enter new name:', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Rename', onPress: (text?: string) => { if (text?.trim()) renamePlaylist(playlist.id, text.trim()); } },
      ]);
    } else {
      Alert.alert('Rename', 'Alert.prompt is not supported on Android.');
    }
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={s.heroSection}>
        <View style={s.coverPlaceholder}><Ionicons name="musical-notes" size={48} color={colors.primary} /></View>
        <Text style={s.playlistName}>{playlist.name}</Text>
        {playlist.description ? <Text style={s.playlistDesc}>{playlist.description}</Text> : null}
        <Text style={s.songCount}>{playlist.songs.length} songs</Text>
        <View style={s.actionRow}>
          <TouchableOpacity style={s.playAllButton} onPress={handlePlayAll}>
            <Ionicons name="play" size={18} color={colors.onPrimaryFixed} />
            <Text style={s.playAllText}>Play All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.shuffleButton} onPress={handleShuffle}>
            <Ionicons name="shuffle" size={18} color={colors.primary} />
            <Text style={s.shuffleBtnText}>Shuffle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList 
        data={playlist.songs} 
        keyExtractor={(item) => item.id} 
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item, index }) => (
          <SwipeableItem 
            onDelete={() => removeSongFromPlaylist(playlist.id, item.id)}
          >
            <SongItem 
              song={item} 
              index={index} 
              isActive={isSongActive(item.id)}
              onPress={() => playSong(item, playlist.songs)} 
            />
          </SwipeableItem>
        )}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Text style={s.emptyStateText}>No songs yet</Text>
            <Text style={s.emptySubtext}>Search and add songs to this playlist</Text>
          </View>
        }
      />
    </View>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background, paddingTop: 60 },
  emptyContainer: { flex: 1, backgroundColor: c.background, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  emptyText: { color: c.onSurfaceVariant, fontSize: FontSizes.bodyLg },
  goBack: { color: c.primary, fontSize: FontSizes.bodyMd },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  heroSection: { alignItems: 'center', marginBottom: Spacing['2xl'] },
  coverPlaceholder: { width: 140, height: 140, borderRadius: Radii.xl, backgroundColor: c.surfaceContainer, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  playlistName: { color: c.onSurface, fontSize: FontSizes.headlineSm, fontWeight: '700' },
  playlistDesc: { color: c.onSurfaceVariant, fontSize: FontSizes.bodyMd, marginTop: Spacing.xs, textAlign: 'center', paddingHorizontal: Spacing['3xl'] },
  songCount: { color: c.onSurfaceVariant, fontSize: FontSizes.labelMd, marginTop: Spacing.sm },
  actionRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  playAllButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: Radii.full, gap: Spacing.xs },
  playAllText: { color: c.onPrimaryFixed, fontWeight: '600', fontSize: FontSizes.labelLg },
  shuffleButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: Radii.full, borderWidth: 1, borderColor: c.primary, gap: Spacing.xs },
  shuffleBtnText: { color: c.primary, fontWeight: '600', fontSize: FontSizes.labelLg },
  emptyState: { alignItems: 'center', marginTop: Spacing['5xl'] },
  emptyStateText: { color: c.onSurface, fontSize: FontSizes.titleMd, fontWeight: '600' },
  emptySubtext: { color: c.onSurfaceVariant, fontSize: FontSizes.bodyMd, marginTop: Spacing.xs },
});
