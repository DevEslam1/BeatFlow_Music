import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ColorPalette, FontSizes, Radii, Spacing } from '@/constants/theme';
import { getChart, searchSongs } from '@/services/api';
import { Song } from '@/services/types';
import { useAuth } from '@/contexts/AuthContext';
import { useNetwork } from '@/contexts/NetworkContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { usePlaylist } from '@/contexts/PlaylistContext';
import { useTheme } from '@/contexts/ThemeContext';
import { TabScreenNavProp } from '@/navigation/types';
import SongItem from '@/components/SongItem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SuggestedPlaylist {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  query: string;
  gradient: [string, string];
}

const SUGGESTED_PLAYLISTS: SuggestedPlaylist[] = [
  { id: 'chill', title: 'Chill Vibes', subtitle: 'Relax & unwind', icon: 'leaf', query: 'chill lofi', gradient: ['#667eea', '#764ba2'] },
  { id: 'workout', title: 'Workout Energy', subtitle: 'Push your limits', icon: 'barbell', query: 'workout energy', gradient: ['#f857a6', '#ff5858'] },
  { id: 'focus', title: 'Deep Focus', subtitle: 'Concentration mode', icon: 'glasses', query: 'focus instrumental', gradient: ['#00c6fb', '#005bea'] },
  { id: 'party', title: 'Party Mix', subtitle: 'Turn it up!', icon: 'sparkles', query: 'party dance hits', gradient: ['#f7971e', '#ffd200'] },
  { id: 'romance', title: 'Love Songs', subtitle: 'Feel the romance', icon: 'heart', query: 'love romance ballad', gradient: ['#ee9ca7', '#ffdde1'] },
  { id: 'hiphop', title: 'Hip-Hop Hits', subtitle: 'Bars & beats', icon: 'mic', query: 'hip hop rap trending', gradient: ['#a18cd1', '#fbc2eb'] },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const { recentlyPlayed, playSong, isSongActive } = usePlayer();
  const { favorites } = usePlaylist();
  const { isOffline, isConnected, isOfflineModeEnabled, toggleOfflineMode } = useNetwork();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation<TabScreenNavProp>();
  const [trending, setTrending] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [playlistSongs, setPlaylistSongs] = useState<Record<string, Song[]>>({});
  const [loadingPlaylist, setLoadingPlaylist] = useState<string | null>(null);
  const s = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      const songs = await getChart();
      setTrending(songs);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handlePlaylistPress = async (playlist: SuggestedPlaylist) => {
    if (playlistSongs[playlist.id]?.length) {
      const songs = playlistSongs[playlist.id];
      playSong(songs[0], songs);
      return;
    }

    setLoadingPlaylist(playlist.id);
    try {
      const songs = await searchSongs(playlist.query);
      if (songs.length > 0) {
        setPlaylistSongs((prev) => ({ ...prev, [playlist.id]: songs }));
        playSong(songs[0], songs);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingPlaylist(null);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[s.contentContainer, { paddingTop: insets.top + Spacing.sm }]}
    >
      <View style={s.header}>
        <TouchableOpacity style={s.menuButton} onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={28} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <Text style={s.greeting}>{greeting()}</Text>
          <Text style={s.userName}>{user?.name ?? 'Music Lover'}</Text>
        </View>
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

      {isOffline && (
        <View style={s.offlineBanner}>
          <Ionicons name="cloud-offline" size={48} color={colors.onSurfaceVariant} />
          <Text style={s.offlineTitle}>
            {isConnected ? 'Offline Mode Enabled' : "You're Offline"}
          </Text>
          <Text style={s.offlineDesc}>
            {isConnected
              ? 'Streaming is paused. Use Local Library or Downloads until you switch back online.'
              : 'Go to Library > Downloads to play saved music.'}
          </Text>
        </View>
      )}

      {!isOffline && (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Made For You</Text>
          </View>
          <FlatList
            horizontal
            data={SUGGESTED_PLAYLISTS}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.xl }}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handlePlaylistPress(item)}
                style={s.suggestedCard}
              >
                <LinearGradient
                  colors={item.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.suggestedGradient}
                >
                  <View style={s.decoCircle} />
                  <View style={s.decoCircle2} />
                  <View style={s.suggestedContent}>
                    <View style={s.suggestedIconWrap}>
                      <Ionicons name={item.icon} size={22} color="#fff" />
                    </View>
                    <Text style={s.suggestedTitle}>{item.title}</Text>
                    <Text style={s.suggestedSubtitle}>{item.subtitle}</Text>
                  </View>
                  <View style={s.suggestedPlayBtn}>
                    {loadingPlaylist === item.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="play" size={18} color="#fff" />
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {recentlyPlayed.length > 0 && (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Recently Played</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Recent')}>
              <Text style={s.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={recentlyPlayed.slice(0, 10)}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.recentItem} onPress={() => playSong(item, recentlyPlayed)}>
                <Image source={{ uri: item.image }} style={s.recentImage} />
                <Text style={s.recentTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={s.recentArtist} numberOfLines={1}>
                  {item.artist}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {favorites.length > 0 && (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Your Favorites</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
              <Text style={s.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={favorites.slice(0, 8)}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.favItem} onPress={() => playSong(item, favorites)}>
                <View>
                  <Image source={{ uri: item.image }} style={s.favImage} />
                  <View style={s.favHeart}>
                    <Ionicons name="heart" size={14} color={colors.primary} />
                  </View>
                </View>
                <Text style={s.recentTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={s.recentArtist} numberOfLines={1}>
                  {item.artist}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {!isOffline && (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Trending Now</Text>
          </View>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: Spacing.xl }} />
          ) : (
            trending.slice(0, 15).map((song, index) => (
              <SongItem
                key={song.id}
                song={song}
                index={index}
                isActive={isSongActive(song.id)}
                onPress={() => playSong(song, trending)}
              />
            ))
          )}
        </View>
      )}

      <View style={{ height: 140 }} />
    </ScrollView>
  );
}

const CARD_WIDTH = SCREEN_WIDTH * 0.42;

const makeStyles = (c: ColorPalette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    contentContainer: { paddingBottom: 140 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
      marginBottom: Spacing['2xl'],
    },
    menuButton: {
      width: 44,
      height: 44,
      borderRadius: Radii.full,
      backgroundColor: c.surfaceContainer,
      justifyContent: 'center',
      alignItems: 'center',
    },
    greeting: { color: c.onSurfaceVariant, fontSize: FontSizes.bodyMd },
    userName: { color: c.onSurface, fontSize: FontSizes.headlineMd, fontWeight: '700' },
    offlineButton: {
      width: 44,
      height: 44,
      borderRadius: Radii.full,
      backgroundColor: c.surfaceContainer,
      justifyContent: 'center',
      alignItems: 'center',
    },
    offlineBanner: {
      alignItems: 'center',
      marginHorizontal: Spacing.xl,
      marginVertical: Spacing.xl,
      padding: Spacing.xl,
      backgroundColor: c.surfaceContainer,
      borderRadius: Radii.xl,
    },
    offlineTitle: {
      color: c.onSurface,
      fontSize: FontSizes.titleLg,
      fontWeight: '700',
      marginTop: Spacing.md,
    },
    offlineDesc: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.bodyMd,
      textAlign: 'center',
      marginTop: Spacing.sm,
    },
    section: { marginBottom: Spacing['2xl'] },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
      marginBottom: Spacing.md,
    },
    sectionTitle: { color: c.onSurface, fontSize: FontSizes.titleLg, fontWeight: '700' },
    seeAll: { color: c.primary, fontSize: FontSizes.labelLg },
    suggestedCard: { width: CARD_WIDTH, marginRight: Spacing.md },
    suggestedGradient: {
      width: '100%',
      height: CARD_WIDTH * 1.15,
      borderRadius: Radii.xl,
      padding: Spacing.lg,
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    decoCircle: {
      position: 'absolute',
      top: -20,
      right: -20,
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    decoCircle2: {
      position: 'absolute',
      bottom: -10,
      left: -15,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    suggestedContent: { flex: 1, justifyContent: 'flex-start' },
    suggestedIconWrap: {
      width: 40,
      height: 40,
      borderRadius: Radii.full,
      backgroundColor: 'rgba(255,255,255,0.22)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    suggestedTitle: { color: '#fff', fontSize: FontSizes.titleMd, fontWeight: '700', marginBottom: 2 },
    suggestedSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: FontSizes.labelSm },
    suggestedPlayBtn: {
      alignSelf: 'flex-end',
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(0,0,0,0.25)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    recentItem: { width: 130, marginRight: Spacing.md },
    recentImage: { width: 130, height: 130, borderRadius: Radii.md, marginBottom: Spacing.sm },
    recentTitle: { color: c.onSurface, fontSize: FontSizes.labelMd, fontWeight: '600' },
    recentArtist: { color: c.onSurfaceVariant, fontSize: FontSizes.labelSm, marginTop: 2 },
    favItem: { width: 120, marginRight: Spacing.md },
    favImage: { width: 120, height: 120, borderRadius: Radii.md, marginBottom: Spacing.sm },
    favHeart: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: Radii.full,
      padding: 4,
    },
  });
