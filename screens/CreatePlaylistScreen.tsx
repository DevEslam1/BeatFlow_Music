import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Spacing, Radii, FontSizes, ColorPalette } from '@/constants/theme';
import { Song } from '@/services/types';
import { searchSongs } from '@/services/api';
import { usePlaylist } from '@/contexts/PlaylistContext';
import { useTheme } from '@/contexts/ThemeContext';
import SongItem from '@/components/SongItem';

export default function CreatePlaylistScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const { createPlaylist, addSongToPlaylist } = usePlaylist();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim().length < 2) { setSearchResults([]); return; }
    setLoading(true);
    try { const songs = await searchSongs(text); setSearchResults(songs); }
    catch { setSearchResults([]); }
    setLoading(false);
  };

  const toggleSong = (song: Song) => {
    setSelectedSongs((prev) => prev.some((item) => item.id === song.id) ? prev.filter((item) => item.id !== song.id) : [...prev, song]);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const playlist = createPlaylist(name.trim(), description.trim());
    selectedSongs.forEach((song) => addSongToPlaylist(playlist.id, song));
    navigation.goBack();
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={s.title}>Create Playlist</Text>
        <TouchableOpacity onPress={handleCreate} disabled={!name.trim()}>
          <Text style={[s.doneText, !name.trim() && { opacity: 0.4 }]}>Create</Text>
        </TouchableOpacity>
      </View>

      <View style={s.form}>
        <TextInput style={s.nameInput} placeholder="Playlist name" placeholderTextColor={colors.onSurfaceVariant}
          value={name} onChangeText={setName} maxLength={50} />
        <TextInput style={s.descInput} placeholder="Description (optional)" placeholderTextColor={colors.onSurfaceVariant}
          value={description} onChangeText={setDescription} multiline maxLength={200} />
      </View>

      {selectedSongs.length > 0 && (
        <Text style={s.selectedCount}>{selectedSongs.length} song{selectedSongs.length !== 1 ? 's' : ''} selected</Text>
      )}

      <Text style={s.sectionTitle}>Add Songs</Text>
      <View style={s.searchBar}>
        <Ionicons name="search" size={18} color={colors.onSurfaceVariant} />
        <TextInput style={s.searchInput} placeholder="Search songs to add..." placeholderTextColor={colors.onSurfaceVariant}
          value={searchQuery} onChangeText={handleSearch} />
      </View>

      {loading ? <ActivityIndicator color={colors.primary} style={s.loader} /> : (
        <FlatList data={searchResults} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            const isSelected = selectedSongs.some((sel) => sel.id === item.id);
            return (
              <TouchableOpacity style={[s.searchItem, isSelected && s.selectedItem]} onPress={() => toggleSong(item)}>
                <SongItem song={item} onPress={() => toggleSong(item)} showDuration={false} />
                <View style={s.checkMark}>
                  {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  title: { color: c.onSurface, fontSize: FontSizes.titleLg, fontWeight: '700' },
  doneText: { color: c.primary, fontSize: FontSizes.bodyLg, fontWeight: '600' },
  form: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl, gap: Spacing.md },
  nameInput: { backgroundColor: c.surfaceContainer, borderRadius: Radii.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, color: c.onSurface, fontSize: FontSizes.titleMd },
  descInput: { backgroundColor: c.surfaceContainer, borderRadius: Radii.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, color: c.onSurface, fontSize: FontSizes.bodyMd, minHeight: 60, textAlignVertical: 'top' },
  selectedCount: { color: c.secondary, fontSize: FontSizes.labelLg, fontWeight: '600', paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  sectionTitle: { color: c.onSurface, fontSize: FontSizes.titleMd, fontWeight: '700', paddingHorizontal: Spacing.xl, marginBottom: Spacing.sm },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.surfaceContainer, marginHorizontal: Spacing.xl, borderRadius: Radii.md, paddingHorizontal: Spacing.lg, height: 44, gap: Spacing.sm, marginBottom: Spacing.md },
  searchInput: { flex: 1, color: c.onSurface, fontSize: FontSizes.bodyMd },
  loader: { marginTop: Spacing['3xl'] },
  searchItem: { position: 'relative' },
  selectedItem: { backgroundColor: c.secondary + '15', borderRadius: Radii.md, marginHorizontal: Spacing.sm },
  checkMark: { position: 'absolute', right: Spacing.xl, top: '50%', marginTop: -12 },
});
