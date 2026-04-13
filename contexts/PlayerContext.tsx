import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AudioPlayer, AudioStatus, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
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
const PLAYER_UPDATE_INTERVAL = 250;

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
  const playerRef = useRef<AudioPlayer | null>(null);
  const statusSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const handleSongFinishRef = useRef<() => Promise<void>>(async () => {});
  const downloadsRef = useRef<Song[]>([]);
  const isOfflineRef = useRef(false);
  const queueRef = useRef<Song[]>([]);
  const queueIndexRef = useRef(0);
  const shuffleRef = useRef(false);
  const repeatRef = useRef<'off' | 'one' | 'all'>('off');

  const { downloads } = usePlaylist();
  const { isOffline } = useNetwork();

  useEffect(() => {
    downloadsRef.current = downloads;
  }, [downloads]);

  useEffect(() => {
    isOfflineRef.current = isOffline;
  }, [isOffline]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    queueIndexRef.current = queueIndex;
  }, [queueIndex]);

  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  const ensurePlayer = useCallback(() => {
    if (playerRef.current) {
      return playerRef.current;
    }

    const player = createAudioPlayer(null, {
      updateInterval: PLAYER_UPDATE_INTERVAL,
    });

    const subscription = player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
      if (!status.isLoaded) {
        return;
      }

      setPosition(Math.round(status.currentTime * 1000));
      setDuration(Math.round(status.duration * 1000));
      setIsPlaying(status.playing);

      if (status.didJustFinish) {
        void handleSongFinishRef.current();
      }
    });

    playerRef.current = player;
    statusSubscriptionRef.current = subscription;
    return player;
  }, []);

  const cleanupPlayer = useCallback(() => {
    statusSubscriptionRef.current?.remove();
    statusSubscriptionRef.current = null;

    if (playerRef.current) {
      try {
        // Disable lock screen controls if the API is available
        (playerRef.current as any).setActiveForLockScreen?.(false);
        playerRef.current.pause();
      } catch {
        // Ignore player cleanup errors during teardown.
      }
      playerRef.current.remove();
      playerRef.current = null;
    }
  }, []);

  useEffect(() => {
    void setAudioModeAsync({
      shouldPlayInBackground: true,
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
    });

    return () => {
      cleanupPlayer();
    };
  }, [cleanupPlayer]);

  const loadAndPlay = useCallback(async (song: Song, index: number) => {
    try {
      let urlToPlay = song.previewUrl;

      // Substitute with local file if downloaded
      const downloadedSong = downloadsRef.current.find((s) => s.id === song.id);
      if (downloadedSong) {
        urlToPlay = downloadedSong.previewUrl;
      }

      if (isOfflineRef.current && !urlToPlay.startsWith('file://')) {
        Alert.alert(
          'Offline Mode',
          'This song is not downloaded. Please connect to the internet or play downloaded songs from your library.'
        );
        return;
      }

      const player = ensurePlayer();
      player.pause();
      player.replace({ uri: urlToPlay });
      queueIndexRef.current = index;
      setCurrentSong(song);
      setQueueIndex(index);
      setPosition(0);
      setDuration(song.duration);

      // Enable lock screen / notification controls with song metadata.
      // On Android this is required for sustained background playback
      // (without it the OS kills audio after ~3 minutes).
      // Uses optional chaining since this API may not exist in older expo-audio versions.
      try {
        (player as any).setActiveForLockScreen?.(true, {
          title: song.name,
          artist: song.artist,
          albumTitle: song.album,
          artworkUrl: song.image,
        });
      } catch (e) {
        console.warn('Could not set lock screen metadata:', e);
      }

      player.play();
      setIsPlaying(true);

      // Add to recently played (avoid duplicates at top)
      setRecentlyPlayed((prev) => {
        const filtered = prev.filter((s) => s.id !== song.id);
        return [song, ...filtered].slice(0, 50);
      });
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  }, [ensurePlayer]);

  const handleSongFinish = useCallback(async () => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    if (repeatRef.current === 'one') {
      await player.seekTo(0);
      player.play();
      setPosition(0);
      setIsPlaying(true);
      return;
    }

    const currentQueue = queueRef.current;
    let nextIndex = queueIndexRef.current + 1;

    if (shuffleRef.current && currentQueue.length > 0) {
      nextIndex = Math.floor(Math.random() * currentQueue.length);
    }

    if (nextIndex >= currentQueue.length) {
      if (repeatRef.current === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    const nextSong = currentQueue[nextIndex];
    if (nextSong) {
      await loadAndPlay(nextSong, nextIndex);
    }
  }, [loadAndPlay]);

  useEffect(() => {
    handleSongFinishRef.current = handleSongFinish;
  }, [handleSongFinish]);

  const playSong = async (song: Song, songList?: Song[]) => {
    // If selecting the current song, toggle playback instead of reloading
    if (currentSong?.id === song.id) {
      await togglePlayPause();
      return;
    }

    if (songList && songList.length > 0) {
      queueRef.current = songList;
      setQueue(songList);
      const index = songList.findIndex((s) => s.id === song.id);
      await loadAndPlay(song, index >= 0 ? index : 0);
    } else {
      const existingIndex = queueRef.current.findIndex((s) => s.id === song.id);
      if (existingIndex === -1) {
        const newQueue = [...queueRef.current, song];
        queueRef.current = newQueue;
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
    const player = playerRef.current;
    if (!player) return;

    if (player.playing) {
      player.pause();
      setIsPlaying(false);
      return;
    }

    if (player.duration > 0 && player.currentTime >= player.duration - 0.25) {
      await player.seekTo(0);
      setPosition(0);
    }

    player.play();
    setIsPlaying(true);
  };

  const skipNext = async () => {
    const currentQueue = queueRef.current;
    let nextIndex = queueIndexRef.current + 1;

    if (shuffleRef.current && currentQueue.length > 0) {
      nextIndex = Math.floor(Math.random() * currentQueue.length);
    }

    if (nextIndex >= currentQueue.length) {
      nextIndex = 0;
    }

    const nextSong = currentQueue[nextIndex];
    if (nextSong) {
      await loadAndPlay(nextSong, nextIndex);
    }
  };

  const skipPrevious = async () => {
    const currentQueue = queueRef.current;

    if (position > 3000) {
      await playerRef.current?.seekTo(0);
      setPosition(0);
      return;
    }

    let prevIndex = queueIndexRef.current - 1;
    if (prevIndex < 0) {
      prevIndex = currentQueue.length - 1;
    }

    const previousSong = currentQueue[prevIndex];
    if (previousSong) {
      await loadAndPlay(previousSong, prevIndex);
    }
  };

  const toggleShuffle = () => {
    setShuffle((prev) => {
      const next = !prev;
      shuffleRef.current = next;
      return next;
    });
  };

  const toggleRepeat = () => {
    setRepeat((prev) => {
      const next = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      repeatRef.current = next;
      return next;
    });
  };

  const seekTo = async (pos: number) => {
    if (!playerRef.current) return;
    await playerRef.current.seekTo(pos / 1000);
    setPosition(pos);
  };

  const addToQueue = (song: Song) => {
    setQueue((prev) => {
      const next = [...prev, song];
      queueRef.current = next;
      return next;
    });
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
