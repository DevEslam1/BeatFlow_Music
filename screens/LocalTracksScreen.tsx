import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, ScrollView, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalTracks } from '@/contexts/LocalTracksContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { Spacing, Radii, FontSizes, ColorPalette } from '@/constants/theme';
import SongItem from '@/components/SongItem';
import { Song } from '@/services/types';

type TabType = 'Songs' | 'Artists' | 'Albums' | 'Folders';

export default function LocalTracksScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('Songs');
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null);
  const [selectedGroupSongs, setSelectedGroupSongs] = useState<Song[] | null>(null);
  const { localSongs, albums, artists, folders, isLoading, permissionStatus, refreshLocalTracks } = useLocalTracks();
  const { playSong, isSongActive } = usePlayer();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const handleGroupPress = (name: string, songs: Song[]) => {
    setSelectedGroupName(name);
    setSelectedGroupSongs(songs);
  };

  const handleBack = () => {
    if (selectedGroupName) {
      setSelectedGroupName(null);
      setSelectedGroupSongs(null);
    } else {
      navigation.openDrawer();
    }
  };

  const renderTabHeader = () => {
    if (selectedGroupName) return null;
    return (
      <View style={s.tabRow}>
        {(['Songs', 'Artists', 'Albums', 'Folders'] as TabType[]).map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[s.tab, activeTab === tab && s.activeTab]} 
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderDetailView = () => {
    if (!selectedGroupName || !selectedGroupSongs) return null;

    return (
      <View style={{ flex: 1 }}>
        <View style={s.detailHeader}>
          <View style={s.detailInfo}>
            <Text style={[s.detailTitle, { color: colors.onSurface }]}>{selectedGroupName}</Text>
            <Text style={[s.detailSubtitle, { color: colors.onSurfaceVariant }]}>{selectedGroupSongs.length} songs</Text>
          </View>
          <TouchableOpacity 
            style={s.playAllMini} 
            onPress={() => playSong(selectedGroupSongs[0], selectedGroupSongs)}
          >
            <Ionicons name="play" size={20} color={colors.onPrimaryFixed} />
            <Text style={s.playText}>Play All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={selectedGroupSongs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item, index }) => (
            <SongItem 
              song={item} 
              index={index} 
              isActive={isSongActive(item.id)}
              onPress={() => playSong(item, selectedGroupSongs)} 
            />
          )}
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={s.emptyContainer}>
      <Ionicons name="musical-notes-outline" size={64} color={colors.onSurfaceVariant} />
      <Text style={[s.emptyText, { color: colors.onSurface }]}>
        {permissionStatus === 'granted' ? 'No local music found.' : 'Permission needed to scan library.'}
      </Text>
      <TouchableOpacity style={s.refreshButton} onPress={refreshLocalTracks}>
        <Text style={s.refreshButtonText}>Scan Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGroupList = (data: Record<string, Song[]>, icon: any) => {
    const keys = Object.keys(data).sort();
    return (
      <FlatList
        data={keys}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={s.groupItem} 
            onPress={() => handleGroupPress(item, data[item])}
          >
            <View style={s.groupIcon}>
              <Ionicons name={icon} size={24} color={colors.primary} />
            </View>
            <View style={s.groupInfo}>
              <Text style={[s.groupName, { color: colors.onSurface }]}>{item}</Text>
              <Text style={[s.groupCount, { color: colors.onSurfaceVariant }]}>{data[item].length} songs</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={handleBack} style={s.backButton}>
          <Ionicons name={selectedGroupName ? "arrow-back" : "menu"} size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[s.title, { color: colors.onSurface }]}>
          {selectedGroupName ? activeTab.slice(0, -1) : 'Local Library'}
        </Text>
        <TouchableOpacity onPress={refreshLocalTracks} style={s.backButton}>
          <Ionicons name={selectedGroupName ? "shuffle" : "sync"} size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {renderTabHeader()}

      {isLoading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[s.loadingText, { color: colors.onSurfaceVariant }]}>Scanning your device...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {selectedGroupName ? (
            renderDetailView()
          ) : (
            <View style={{ flex: 1 }}>
              {activeTab === 'Songs' && (
                <FlatList
                  data={localSongs}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingBottom: 100 }}
                  renderItem={({ item, index }) => (
                    <SongItem 
                      song={item} 
                      index={index} 
                      isActive={isSongActive(item.id)}
                      onPress={() => playSong(item, localSongs)} 
                    />
                  )}
                  ListEmptyComponent={renderEmptyState()}
                />
              )}
              {activeTab === 'Artists' && renderGroupList(artists, 'person-outline')}
              {activeTab === 'Albums' && renderGroupList(albums, 'disc-outline')}
              {activeTab === 'Folders' && renderGroupList(folders, 'folder-open-outline')}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, 
    paddingVertical: Spacing.md 
  },
  title: { fontSize: FontSizes.headlineSm, fontWeight: 'bold' },
  backButton: { padding: Spacing.xs },
  tabRow: { 
    flexDirection: 'row', 
    paddingHorizontal: Spacing.xl, 
    gap: Spacing.xs, 
    marginBottom: Spacing.md,
    marginTop: Spacing.sm
  },
  tab: { 
    paddingHorizontal: Spacing.lg, 
    paddingVertical: Spacing.sm, 
    borderRadius: Radii.full, 
    backgroundColor: c.surfaceContainerHigh 
  },
  activeTab: { backgroundColor: c.primary },
  tabText: { color: c.onSurfaceVariant, fontSize: FontSizes.labelMd },
  activeTabText: { color: c.onPrimaryFixed, fontWeight: '600' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: Spacing.md, fontSize: FontSizes.bodyMd },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: Spacing.lg, fontSize: FontSizes.bodyLg, textAlign: 'center', paddingHorizontal: Spacing['4xl'] },
  refreshButton: { marginTop: Spacing.xl, backgroundColor: c.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radii.full },
  refreshButtonText: { color: c.onPrimaryFixed, fontWeight: 'bold' },
  groupItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, gap: Spacing.md },
  groupIcon: { width: 48, height: 48, borderRadius: Radii.md, backgroundColor: c.surfaceContainer, justifyContent: 'center', alignItems: 'center' },
  groupInfo: { flex: 1 },
  groupName: { fontSize: FontSizes.bodyLg, fontWeight: '600' },
  groupCount: { fontSize: FontSizes.labelSm, marginTop: 2 },
  detailHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: c.surfaceContainerLow,
    marginHorizontal: Spacing.xl,
    borderRadius: Radii.xl,
    marginBottom: Spacing.md
  },
  detailInfo: { flex: 1 },
  detailTitle: { fontSize: FontSizes.titleLg, fontWeight: 'bold' },
  detailSubtitle: { fontSize: FontSizes.labelMd, marginTop: 2 },
  playAllMini: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: c.primary, 
    paddingHorizontal: Spacing.lg, 
    paddingVertical: Spacing.sm, 
    borderRadius: Radii.full,
    gap: Spacing.xs
  },
  playText: { color: c.onPrimaryFixed, fontWeight: '600', fontSize: FontSizes.labelMd },
});
