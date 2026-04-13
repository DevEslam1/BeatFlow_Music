import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Spacing, FontSizes, Radii, ColorPalette } from '@/constants/theme';
import { usePlaylist } from '@/contexts/PlaylistContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { useTheme } from '@/contexts/ThemeContext';
import SongItem from '@/components/SongItem';
import SwipeableItem from '@/components/SwipeableItem';

type TabType = 'Online' | 'Local';

export default function FavoritesScreen() {
  const { favorites, toggleFavorite } = usePlaylist();
  const { playSong, isSongActive } = usePlayer();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState<TabType>('Online');

  const filteredFavorites = useMemo(() => {
    return favorites.filter(song => 
      activeTab === 'Local' ? song.id.startsWith('local-') : !song.id.startsWith('local-')
    );
  }, [favorites, activeTab]);

  const handlePlayAll = () => { 
    if (filteredFavorites.length > 0) playSong(filteredFavorites[0], filteredFavorites); 
  };
  
  const handleShuffle = () => {
    if (filteredFavorites.length > 0) { 
      const i = Math.floor(Math.random() * filteredFavorites.length); 
      playSong(filteredFavorites[i], filteredFavorites); 
    }
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
        
        <View style={s.tabRow}>
          {(['Online', 'Local'] as TabType[]).map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[s.tab, activeTab === tab && s.activeTab]} 
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[s.tabText, activeTab === tab && s.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
        data={filteredFavorites} 
        keyExtractor={(item) => item.id} 
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item, index }) => (
          <SwipeableItem onDelete={() => toggleFavorite(item)}>
            <SongItem 
              song={item} 
              index={index} 
              isActive={isSongActive(item.id)}
              onPress={() => playSong(item, filteredFavorites)} 
            />
          </SwipeableItem>
        )}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Ionicons name="heart-outline" size={48} color={colors.onSurfaceVariant} />
            <Text style={s.emptyText}>No {activeTab.toLowerCase()} favorites yet</Text>
            <Text style={s.emptySubtext}>Tap the heart on any {activeTab === 'Local' ? 'local track' : 'online song'} to add it here</Text>
          </View>
        }
      />
    </View>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  title: { color: c.onSurface, fontSize: FontSizes.titleLg, fontWeight: '700' },
  heroSection: { alignItems: 'center', marginBottom: Spacing.xl },
  songCount: { color: c.onSurfaceVariant, fontSize: FontSizes.bodyMd, marginTop: Spacing.sm, marginBottom: Spacing.lg },
  tabRow: { 
    flexDirection: 'row', 
    gap: Spacing.sm, 
    marginBottom: Spacing.lg,
    backgroundColor: c.surfaceContainerLow,
    padding: 4,
    borderRadius: Radii.full,
  },
  tab: { 
    paddingHorizontal: Spacing.xl, 
    paddingVertical: Spacing.xs, 
    borderRadius: Radii.full,
  },
  activeTab: { backgroundColor: c.primary },
  tabText: { color: c.onSurfaceVariant, fontSize: FontSizes.labelLg, fontWeight: '600' },
  activeTabText: { color: c.onPrimaryFixed },
  actionRow: { flexDirection: 'row', gap: Spacing.md },
  playAllButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: Radii.full, gap: Spacing.xs },
  playAllText: { color: c.onPrimaryFixed, fontSize: FontSizes.labelLg, fontWeight: '600' },
  shuffleButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: Radii.full, borderWidth: 1, borderColor: c.primary, gap: Spacing.xs },
  shuffleBtnText: { color: c.primary, fontSize: FontSizes.labelLg, fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: Spacing['5xl'] },
  emptyText: { color: c.onSurface, fontSize: FontSizes.titleMd, fontWeight: '600', marginTop: Spacing.md },
  emptySubtext: { color: c.onSurfaceVariant, fontSize: FontSizes.bodyMd, marginTop: Spacing.xs },
});
