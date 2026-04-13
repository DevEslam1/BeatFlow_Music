import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Song } from '@/services/types';

interface LocalTracksContextType {
  localSongs: Song[];
  albums: Record<string, Song[]>;
  artists: Record<string, Song[]>;
  folders: Record<string, Song[]>;
  isLoading: boolean;
  permissionStatus: MediaLibrary.PermissionStatus | null;
  refreshLocalTracks: () => Promise<void>;
}

const LocalTracksContext = createContext<LocalTracksContextType | undefined>(undefined);

export function LocalTracksProvider({ children }: { children: React.ReactNode }) {
  const [localSongs, setLocalSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Record<string, Song[]>>({});
  const [artists, setArtists] = useState<Record<string, Song[]>>({});
  const [folders, setFolders] = useState<Record<string, Song[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<MediaLibrary.PermissionStatus | null>(null);

  const scanLocalDevice = useCallback(async () => {
    setIsLoading(true);
    try {
      let status: MediaLibrary.PermissionStatus;
      
      const { status: currentStatus, canAskAgain } = await MediaLibrary.getPermissionsAsync();
      status = currentStatus;

      if (status !== 'granted' && canAskAgain) {
        const { status: requestedStatus } = await MediaLibrary.requestPermissionsAsync();
        status = requestedStatus;
      }
      
      setPermissionStatus(status);

      if (status !== 'granted') {
        console.log('Media Library permission not granted:', status);
        setIsLoading(false);
        return;
      }

      // We use getAssetsAsync for audio.
      let media = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
        first: 1000, // Reasonable limit
      });

      const songs: Song[] = [];
      const albumMap: Record<string, Song[]> = {};
      const artistMap: Record<string, Song[]> = {};
      const folderMap: Record<string, Song[]> = {};

      for (const asset of media.assets) {
        // Basic metadata from the asset.
        // Note: Expo Media Library doesn't provide full Artist/Album from ID3 tags natively.
        // We use the available fields and folder name from the URI.
        
        const filename = asset.filename;
        const uri = asset.uri;
        const id = asset.id;
        const duration = Math.round(asset.duration * 1000);
        
        // Extract folder name from URI (e.g., file:///storage/emulated/0/Music/track.mp3 -> Music)
        const pathSegments = uri.split('/');
        const folderName = pathSegments.length > 1 ? pathSegments[pathSegments.length - 2] : 'Unknown';

        const song: Song = {
          id: `local-${id}`,
          name: filename.replace('.mp3', '').replace('.m4a', ''),
          artist: folderName, // Use folder as artist fallback or 'Local File'
          image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80', // Default local icon
          uri: uri,
          previewUrl: uri,
          album: folderName, // Use folder name as album fallback
          duration: duration,
        };

        songs.push(song);

        // Grouping
        const albumName = song.album || 'Unknown';
        if (!albumMap[albumName]) albumMap[albumName] = [];
        albumMap[albumName].push(song);

        const artistName = song.artist || 'Unknown';
        if (!artistMap[artistName]) artistMap[artistName] = [];
        artistMap[artistName].push(song);

        if (!folderMap[folderName]) folderMap[folderName] = [];
        folderMap[folderName].push(song);
      }

      setLocalSongs(songs);
      setAlbums(albumMap);
      setArtists(artistMap);
      setFolders(folderMap);

    } catch (error) {
      console.error('Error scanning local tracks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    scanLocalDevice();
  }, [scanLocalDevice]);

  return (
    <LocalTracksContext.Provider
      value={{
        localSongs,
        albums,
        artists,
        folders,
        isLoading,
        permissionStatus,
        refreshLocalTracks: scanLocalDevice,
      }}
    >
      {children}
    </LocalTracksContext.Provider>
  );
}

export function useLocalTracks() {
  const context = useContext(LocalTracksContext);
  if (!context) throw new Error('useLocalTracks must be used within LocalTracksProvider');
  return context;
}
