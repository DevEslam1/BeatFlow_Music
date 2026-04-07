import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Alert } from 'react-native';
import { Song } from '@/services/types';
import { usePlaylist } from './PlaylistContext';
import { useNetwork } from './NetworkContext';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
  queue: Song[];
  queueIndex: number;
  recentlyPlayed: Song[];
  playSong: (song: Song, songList?: Song[]) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  seekTo: (position: number) => Promise<void>;
  addToQueue: (song: Song) => void;
  isSongActive: (songId: string) => boolean;
  isSongPlaying: (songId: string) => boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'one' | 'all'>('off');
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const soundRef = useRef<Audio.Sound | null>(null);
  
  const { downloads } = usePlaylist();
  const { isOffline } = useNetwork();

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis);
    setDuration(status.durationMillis ?? 0);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish) {
      handleSongFinish();
    }
  }, [repeat, queue, queueIndex, shuffle]);

  const handleSongFinish = useCallback(async () => {
    if (repeat === 'one') {
      await soundRef.current?.replayAsync();
      return;
    }

    let nextIndex = queueIndex + 1;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    }

    if (nextIndex >= queue.length) {
      if (repeat === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    if (queue[nextIndex]) {
      await loadAndPlay(queue[nextIndex], nextIndex);
    }
  }, [repeat, queue, queueIndex, shuffle]);

  const loadAndPlay = async (song: Song, index: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      let urlToPlay = song.previewUrl;
      
      // Substitute with local file if downloaded
      const downloadedSong = downloads.find(s => s.id === song.id);
      if (downloadedSong) {
        urlToPlay = downloadedSong.previewUrl;
      }

      if (isOffline && !urlToPlay.startsWith('file://')) {
        Alert.alert(
          'Offline Mode',
          'This song is not downloaded. Please connect to the internet or play downloaded songs from your library.'
        );
        setIsPlaying(false);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: urlToPlay },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setCurrentSong(song);
      setQueueIndex(index);
      setIsPlaying(true);

      // Add to recently played (avoid duplicates at top)
      setRecentlyPlayed((prev) => {
        const filtered = prev.filter((s) => s.id !== song.id);
        return [song, ...filtered].slice(0, 50);
      });
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const playSong = async (song: Song, songList?: Song[]) => {
    // If selecting the current song, toggle playback instead of reloading
    if (currentSong?.id === song.id) {
      await togglePlayPause();
      return;
    }

    if (songList && songList.length > 0) {
      setQueue(songList);
      const index = songList.findIndex((s) => s.id === song.id);
      await loadAndPlay(song, index >= 0 ? index : 0);
    } else {
      const existingIndex = queue.findIndex((s) => s.id === song.id);
      if (existingIndex === -1) {
        const newQueue = [...queue, song];
        setQueue(newQueue);
        await loadAndPlay(song, newQueue.length - 1);
      } else {
        await loadAndPlay(song, existingIndex);
      }
    }
  };

  const isSongActive = (songId: string) => currentSong?.id === songId;
  const isSongPlaying = (songId: string) => isSongActive(songId) && isPlaying;

  const togglePlayPause = async () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const skipNext = async () => {
    let nextIndex = queueIndex + 1;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    }
    if (nextIndex >= queue.length) {
      nextIndex = 0;
    }
    if (queue[nextIndex]) {
      await loadAndPlay(queue[nextIndex], nextIndex);
    }
  };

  const skipPrevious = async () => {
    if (position > 3000) {
      await soundRef.current?.setPositionAsync(0);
      return;
    }
    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }
    if (queue[prevIndex]) {
      await loadAndPlay(queue[prevIndex], prevIndex);
    }
  };

  const toggleShuffle = () => setShuffle((prev) => !prev);

  const toggleRepeat = () => {
    setRepeat((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const seekTo = async (pos: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(pos);
  };

  const addToQueue = (song: Song) => {
    setQueue((prev) => [...prev, song]);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        position,
        duration,
        shuffle,
        repeat,
        queue,
        queueIndex,
        recentlyPlayed,
        playSong,
        togglePlayPause,
        skipNext,
        skipPrevious,
        toggleShuffle,
        toggleRepeat,
        seekTo,
        addToQueue,
        isSongActive,
        isSongPlaying,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
}
