import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { usePlaylist } from '@/contexts/PlaylistContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Song, Playlist } from '@/services/types';
import { Spacing, Radii, FontSizes, ColorPalette } from '@/constants/theme';

interface AddToPlaylistModalProps {
  isVisible: boolean;
  onClose: () => void;
  song: Song;
}

export default function AddToPlaylistModal({ isVisible, onClose, song }: AddToPlaylistModalProps) {
  const { playlists, addSongToPlaylist, createPlaylist } = usePlaylist();
  const { colors, isDark } = useTheme();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const s = makeStyles(colors);

  const handleAddToPlaylist = (playlist: Playlist) => {
    addSongToPlaylist(playlist.id, song);
    onClose();
  };

  const handleCreateNew = () => {
    if (newPlaylistName.trim()) {
      const newPlaylist = createPlaylist(newPlaylistName.trim());
      addSongToPlaylist(newPlaylist.id, song);
      setNewPlaylistName('');
      setIsCreating(false);
      onClose();
    }
  };

  const renderHeader = () => (
    <View style={s.header}>
      <Text style={s.title}>{isCreating ? 'New Playlist' : 'Add to Playlist'}</Text>
      <TouchableOpacity onPress={() => {
        if (isCreating) {
          setIsCreating(false);
          setNewPlaylistName('');
        } else {
          onClose();
        }
      }}>
        <Ionicons name={isCreating ? "arrow-back" : "close"} size={24} color={colors.onSurface} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={s.overlay} onPress={onClose}>
        <BlurView intensity={isDark ? 40 : 60} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      </Pressable>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.keyboardView}
      >
        <View style={s.content}>
          {renderHeader()}

          {isCreating ? (
            <View style={s.createForm}>
              <TextInput
                style={s.input}
                placeholder="Name your playlist"
                placeholderTextColor={colors.onSurfaceVariant}
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                autoFocus
                maxLength={50}
              />
              <TouchableOpacity 
                style={[s.submitButton, !newPlaylistName.trim() && s.disabledButton]} 
                onPress={handleCreateNew}
                disabled={!newPlaylistName.trim()}
              >
                <Text style={s.submitButtonText}>Create and Add</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity style={s.createButton} onPress={() => setIsCreating(true)}>
                <View style={s.iconWrapper}>
                  <Ionicons name="add" size={24} color={colors.primary} />
                </View>
                <Text style={s.createButtonText}>New Playlist</Text>
              </TouchableOpacity>

              <FlatList
                data={playlists}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={s.playlistItem} onPress={() => handleAddToPlaylist(item)}>
                    <View style={s.playlistIcon}>
                      <Ionicons name="musical-notes" size={20} color={colors.onSurfaceVariant} />
                    </View>
                    <View style={s.playlistInfo}>
                      <Text style={s.playlistName}>{item.name}</Text>
                      <Text style={s.playlistCount}>{item.songs.length} songs</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.outline} />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={s.emptyState}>
                    <Text style={s.emptyText}>You haven't created any playlists yet.</Text>
                  </View>
                }
                contentContainerStyle={s.listPadding}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  overlay: { flex: 1 },
  keyboardView: {
    marginTop: 'auto',
  },
  content: {
    backgroundColor: c.surface,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    minHeight: 400,
    maxHeight: '80%',
    paddingTop: Spacing.xl,
    // Shadow for Android/iOS
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  title: {
    color: c.onSurface,
    fontSize: FontSizes.titleLg,
    fontWeight: '700',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.outlineVariant,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: c.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: c.primary,
    fontSize: FontSizes.bodyLg,
    fontWeight: '600',
  },
  createForm: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  input: {
    backgroundColor: c.surfaceContainer,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    color: c.onSurface,
    fontSize: FontSizes.bodyLg,
  },
  submitButton: {
    backgroundColor: c.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: c.onPrimaryFixed,
    fontSize: FontSizes.bodyLg,
    fontWeight: '700',
  },
  listPadding: {
    paddingBottom: Spacing["5xl"],
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  playlistIcon: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: c.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    color: c.onSurface,
    fontSize: FontSizes.bodyLg,
    fontWeight: '600',
  },
  playlistCount: {
    color: c.onSurfaceVariant,
    fontSize: FontSizes.labelMd,
    marginTop: 2,
  },
  emptyState: {
    padding: Spacing['3xl'],
    alignItems: 'center',
  },
  emptyText: {
    color: c.onSurfaceVariant,
    fontSize: FontSizes.bodyMd,
    textAlign: 'center',
  },
});
