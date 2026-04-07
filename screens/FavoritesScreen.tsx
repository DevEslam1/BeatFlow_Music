import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Spacing, FontSizes, Radii, ColorPalette } from '@/constants/theme';
import { usePlaylist } from '@/contexts/PlaylistContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { useTheme } from '@/contexts/ThemeContext';
import SongItem from '@/components/SongItem';

export default function FavoritesScreen() {
  const { favorites } = usePlaylist();
  const { playSong, isSongActive } = usePlayer();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const handlePlayAll = () => { if (favorites.length > 0) playSong(favorites[0], favorites); };
  const handleShuffle = () => {
    if (favorites.length > 0) { const i = Math.floor(Math.random() * favorites.length); playSong(favorites[i], favorites); }
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={s.title}>Favorites</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={s.heroSection}>
        <Ionicons name="heart" size={48} color={colors.primary} />
        <Text style={s.songCount}>{favorites.length} liked songs</Text>
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

      <FlatList data={favorites} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item, index }) => (
          <SongItem 
            song={item} 
            index={index} 
            isActive={isSongActive(item.id)}
            onPress={() => playSong(item, favorites)} 
          />
        )}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Ionicons name="heart-outline" size={48} color={colors.onSurfaceVariant} />
            <Text style={s.emptyText}>No favorites yet</Text>
            <Text style={s.emptySubtext}>Tap the heart on any song to add it here</Text>
          </View>
        }
      />
    </View>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  title: { color: c.onSurface, fontSize: FontSizes.titleLg, fontWeight: '700' },
  heroSection: { alignItems: 'center', marginBottom: Spacing['2xl'] },
  songCount: { color: c.onSurfaceVariant, fontSize: FontSizes.bodyMd, marginTop: Spacing.sm },
  actionRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  playAllButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: Radii.full, gap: Spacing.xs },
  playAllText: { color: c.onPrimaryFixed, fontSize: FontSizes.labelLg, fontWeight: '600' },
  shuffleButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: Radii.full, borderWidth: 1, borderColor: c.primary, gap: Spacing.xs },
  shuffleBtnText: { color: c.primary, fontSize: FontSizes.labelLg, fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: Spacing['5xl'] },
  emptyText: { color: c.onSurface, fontSize: FontSizes.titleMd, fontWeight: '600', marginTop: Spacing.md },
  emptySubtext: { color: c.onSurfaceVariant, fontSize: FontSizes.bodyMd, marginTop: Spacing.xs },
});
