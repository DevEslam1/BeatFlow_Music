import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song, Playlist } from '@/services/types';

interface PlaylistContextType {
  playlists: Playlist[];
  favorites: Song[];
  isFavorite: (songId: string) => boolean;
  toggleFavorite: (song: Song) => void;
  createPlaylist: (name: string, description?: string) => Playlist;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

const STORAGE_KEY_PLAYLISTS = '@gig_playlists';
const STORAGE_KEY_FAVORITES = '@gig_favorites';

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [favorites, setFavorites] = useState<Song[]>([]);

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const storedPlaylists = await AsyncStorage.getItem(STORAGE_KEY_PLAYLISTS);
        if (storedPlaylists) setPlaylists(JSON.parse(storedPlaylists));

        const storedFavorites = await AsyncStorage.getItem(STORAGE_KEY_FAVORITES);
        if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
      } catch (e) {
        console.error('Error loading data:', e);
      }
    })();
  }, []);

  // Persist playlists
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(playlists));
  }, [playlists]);

  // Persist favorites
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (songId: string) => favorites.some((s) => s.id === songId);

  const toggleFavorite = (song: Song) => {
    setFavorites((prev) => {
      if (prev.some((s) => s.id === song.id)) {
        return prev.filter((s) => s.id !== song.id);
      }
      return [song, ...prev];
    });
  };

  const createPlaylist = (name: string, description?: string): Playlist => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      description,
      songs: [],
      createdAt: Date.now(),
    };
    setPlaylists((prev) => [newPlaylist, ...prev]);
    return newPlaylist;
  };

  const deletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  };

  const renamePlaylist = (id: string, name: string) => {
    setPlaylists((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  const addSongToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId && !p.songs.some((s) => s.id === song.id)) {
          return { ...p, songs: [...p.songs, song] };
        }
        return p;
      })
    );
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          return { ...p, songs: p.songs.filter((s) => s.id !== songId) };
        }
        return p;
      })
    );
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        favorites,
        isFavorite,
        toggleFavorite,
        createPlaylist,
        deletePlaylist,
        renamePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (!context) throw new Error('usePlaylist must be used within PlaylistProvider');
  return context;
}
