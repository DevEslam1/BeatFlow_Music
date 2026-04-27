import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Spacing, Radii, FontSizes, ColorPalette } from '@/constants/theme';
import { Song } from '@/services/types';
import { usePlayer } from '@/contexts/PlayerContext';
import { usePlaylist } from '@/contexts/PlaylistContext';
import { useNetwork } from '@/contexts/NetworkContext';
import { useTheme } from '@/contexts/ThemeContext';
import { TabScreenNavProp } from '@/navigation/types';
import SongItem from '@/components/SongItem';
import SwipeableItem from '@/components/SwipeableItem';

const TABS = ['Recent', 'Playlists', 'Favorites', 'Downloads'];

export default function LibraryScreen() {
  const [activeTab, setActiveTab] = useState('Recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'artist'>('name');
  const { playSong, isSongActive, recentlyPlayed } = usePlayer();
  const { 
    playlists, favorites, downloads, 
    toggleFavorite, toggleDownload, deletePlaylist 
  } = usePlaylist();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TabScreenNavProp>();
  const { isOffline, isConnected, isOfflineModeEnabled, toggleOfflineMode } = useNetwork();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const visibleFavorites = useMemo(
    () => (isOffline ? favorites.filter(s => downloads.some(d => d.id === s.id)) : favorites),
    [isOffline, favorites, downloads]
  );

  const hasDownloadedFavorites = useMemo(() =>
    visibleFavorites.length > 0,
    [visibleFavorites]
  );
  const hasDownloadedPlaylists = useMemo(() => 
    playlists.some(p => p.songs.some(s => downloads.some(d => d.id === s.id))), 
    [playlists, downloads]
  );

  const availableTabs = useMemo(() => {
    if (!isOffline) return TABS;
    return TABS.filter(tab => {
      if (tab === 'Recent') return false;
      if (tab === 'Playlists') return hasDownloadedPlaylists;
      if (tab === 'Favorites') return hasDownloadedFavorites;
      return true; // Always show Downloads when offline
    });
  }, [isOffline, hasDownloadedFavorites, hasDownloadedPlaylists]);

  useEffect(() => {
    if (isOffline && !availableTabs.includes(activeTab)) {
      setActiveTab('Downloads');
    }
  }, [isOffline, activeTab, availableTabs]);

  const filteredSongs = recentlyPlayed
    .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.artist.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name) : a.artist.localeCompare(b.artist));

  const handleShuffleAll = () => {
    if (filteredSongs.length === 0) return;
    const i = Math.floor(Math.random() * filteredSongs.length);
    playSong(filteredSongs[i], filteredSongs);
  };

  return (
    <View style={[s.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={s.header}>
        <TouchableOpacity style={s.headerButton} onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={26} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={s.title}>My Library</Text>
        <View style={s.headerActions}>
          <TouchableOpacity
            style={[
              s.offlineButton,
              (isOfflineModeEnabled || !isConnected) && { backgroundColor: colors.secondaryContainer },
            ]}
            onPress={toggleOfflineMode}
          >
            <Ionicons
              name={isOfflineModeEnabled || !isConnected ? 'cloud-offline' : 'cloud-outline'}
              size={24}
              color={isOfflineModeEnabled || !isConnected ? colors.secondary : colors.onSurface}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.searchBar}>
        <Ionicons name="search" size={18} color={colors.onSurfaceVariant} />
        <TextInput style={s.searchInput} placeholder="Search your library..."
          placeholderTextColor={colors.onSurfaceVariant} value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      <View style={s.tabRow}>
        {availableTabs.map((tab) => (
          <TouchableOpacity key={tab} style={[s.tab, activeTab === tab && s.activeTab, { flexDirection: 'row', alignItems: 'center', gap: 4 }]} onPress={() => setActiveTab(tab)}>
            <Text style={[s.tabText, activeTab === tab && s.activeTabText]}>{tab}</Text>
            {isOffline && tab !== 'Downloads' && (
              <Ionicons name="cloud-offline" size={14} color={activeTab === tab ? colors.onPrimaryFixed : colors.secondary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'Recent' && (
        <>
          {filteredSongs.length > 0 && (
            <View style={s.actionRow}>
              <TouchableOpacity style={s.sortButton} onPress={() => setSortBy(sortBy === 'name' ? 'artist' : 'name')}>
                <Ionicons name="swap-vertical" size={18} color={colors.primary} />
                <Text style={s.sortText}>Sort: {sortBy === 'name' ? 'Name' : 'Artist'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.shuffleButton} onPress={handleShuffleAll}>
                <Ionicons name="shuffle" size={18} color={colors.onPrimaryFixed} />
                <Text style={s.shuffleText}>Shuffle All</Text>
              </TouchableOpacity>
            </View>
          )}
          <FlatList 
            data={filteredSongs} 
            keyExtractor={(item) => `recent-${item.id}`} 
            contentContainerStyle={{ paddingBottom: 180 }}
            renderItem={({ item, index }) => (
              <SongItem 
                song={item} 
                index={index} 
                isActive={isSongActive(item.id)}
                onPress={() => playSong(item, filteredSongs)} 
              />
            )}
            ListEmptyComponent={
              <Text style={s.emptyText}>No recently played songs.</Text>
            }
          />
        </>
      )}

      {activeTab === 'Playlists' && (
        <FlatList data={isOffline ? playlists.filter(p => p.songs.some(s => downloads.some(d => d.id === s.id))) : playlists} keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 180 }}
          ListHeaderComponent={
            <TouchableOpacity style={s.createPlaylistButton} onPress={() => navigation.navigate('CreatePlaylist')}>
              <View style={s.createIcon}><Ionicons name="add" size={28} color={colors.primary} /></View>
              <Text style={s.createText}>Create New Playlist</Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <SwipeableItem onDelete={() => deletePlaylist(item.id)}>
              <TouchableOpacity style={s.playlistItem} onPress={() => navigation.navigate('PlaylistDetail', { id: item.id })}>
                <View style={s.playlistCover}><Ionicons name="musical-notes" size={24} color={colors.primary} /></View>
                <View style={s.playlistInfo}>
                  <Text style={s.playlistName}>{item.name}</Text>
                  <Text style={s.playlistCount}>{item.songs.length} songs</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </SwipeableItem>
          )}
          ListEmptyComponent={<Text style={s.emptyText}>No playlists yet. Create one!</Text>}
        />
      )}

      {activeTab === 'Favorites' && (
        <FlatList data={visibleFavorites} keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 180 }}
          ListHeaderComponent={visibleFavorites.length > 0 ? (
            <View style={s.favHeader}>
              <TouchableOpacity style={s.shuffleButton} onPress={() => {
                if (visibleFavorites.length > 0) {
                  const i = Math.floor(Math.random() * visibleFavorites.length);
                  playSong(visibleFavorites[i], visibleFavorites);
                }
              }}>
                <Ionicons name="shuffle" size={18} color={colors.onPrimaryFixed} />
                <Text style={s.shuffleText}>Shuffle</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          renderItem={({ item, index }) => (
            <SwipeableItem onDelete={() => toggleFavorite(item)}>
              <SongItem
                song={item}
                index={index}
                isActive={isSongActive(item.id)}
                onPress={() => playSong(item, visibleFavorites)}
              />
            </SwipeableItem>
          )}
          ListEmptyComponent={<Text style={s.emptyText}>No favorites yet. Like some songs!</Text>}
        />
      )}

      {activeTab === 'Downloads' && (
        <FlatList data={downloads} keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 180 }}
          ListHeaderComponent={downloads.length > 0 ? (
            <View style={s.favHeader}>
              <TouchableOpacity style={s.shuffleButton} onPress={() => {
                if (downloads.length > 0) { const i = Math.floor(Math.random() * downloads.length); playSong(downloads[i], downloads); }
              }}>
                <Ionicons name="shuffle" size={18} color={colors.onPrimaryFixed} />
                <Text style={s.shuffleText}>Shuffle</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          renderItem={({ item, index }) => (
            <SwipeableItem onDelete={() => toggleDownload(item)}>
              <SongItem 
                song={item} 
                index={index} 
                isActive={isSongActive(item.id)}
                onPress={() => playSong(item, downloads)} 
              />
            </SwipeableItem>
          )}
          ListEmptyComponent={<Text style={s.emptyText}>No downloads yet. Save some songs for offline listening!</Text>}
        />
      )}
    </View>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: Spacing.xl, 
    marginBottom: Spacing.md, 
    gap: Spacing.md 
  },
  headerButton: { 
    width: 44, 
    height: 44, 
    borderRadius: Radii.full, 
    backgroundColor: c.surfaceContainer, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  offlineButton: {
    width: 44,
    height: 44,
    borderRadius: Radii.full,
    backgroundColor: c.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { 
    flex: 1,
    fontSize: FontSizes.headlineLg, 
    fontWeight: '700', 
    color: c.onSurface 
  },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.surfaceContainer, marginHorizontal: Spacing.xl, borderRadius: Radii.md, paddingHorizontal: Spacing.lg, height: 44, gap: Spacing.sm, marginBottom: Spacing.md },
  searchInput: { flex: 1, color: c.onSurface, fontSize: FontSizes.bodyMd },
  tabRow: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.xs, marginBottom: Spacing.md },
  tab: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radii.full, backgroundColor: c.surfaceContainerHigh },
  activeTab: { backgroundColor: c.primary },
  tabText: { color: c.onSurfaceVariant, fontSize: FontSizes.labelMd },
  activeTabText: { color: c.onPrimaryFixed, fontWeight: '600' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  sortButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  sortText: { color: c.primary, fontSize: FontSizes.labelMd },
  shuffleButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radii.full, gap: Spacing.xs },
  shuffleText: { color: c.onPrimaryFixed, fontSize: FontSizes.labelMd, fontWeight: '600' },
  loader: { marginTop: Spacing['5xl'] },
  createPlaylistButton: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg, gap: Spacing.md },
  createIcon: { width: 56, height: 56, borderRadius: Radii.md, backgroundColor: c.surfaceContainer, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: c.outlineVariant, borderStyle: 'dashed' },
  createText: { color: c.primary, fontSize: FontSizes.bodyLg, fontWeight: '600' },
  playlistItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
  playlistCover: { width: 56, height: 56, borderRadius: Radii.md, backgroundColor: c.surfaceContainer, justifyContent: 'center', alignItems: 'center' },
  playlistInfo: { flex: 1 },
  playlistName: { color: c.onSurface, fontSize: FontSizes.bodyLg, fontWeight: '600' },
  playlistCount: { color: c.onSurfaceVariant, fontSize: FontSizes.labelSm, marginTop: 2 },
  emptyText: { color: c.onSurfaceVariant, fontSize: FontSizes.bodyMd, textAlign: 'center', marginTop: Spacing['4xl'] },
  favHeader: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
});
