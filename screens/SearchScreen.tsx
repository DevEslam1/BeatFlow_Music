import SongItem from "@/components/SongItem";
import { ColorPalette, FontSizes, Radii, Spacing } from "@/constants/theme";
import { useNetwork } from "@/contexts/NetworkContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useTheme } from "@/contexts/ThemeContext";
import { searchSongs } from "@/services/api";
import { Song } from "@/services/types";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { TabScreenNavProp } from "@/navigation/types";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_PADDING = Spacing.xl;
const CARD_MARGIN = 6;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - CARD_MARGIN * 2) / 2;

const GENRES: {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { name: "Pop", icon: "sparkles", color: "#e040fb" },
  { name: "Rock", icon: "flash", color: "#ff5252" },
  { name: "Hip-Hop", icon: "mic", color: "#ffd740" },
  { name: "R&B", icon: "heart", color: "#69f0ae" },
  { name: "Electronic", icon: "pulse", color: "#40c4ff" },
  { name: "Jazz", icon: "musical-note", color: "#ff6e40" },
  { name: "Classical", icon: "musical-notes", color: "#b388ff" },
  { name: "Latin", icon: "flame", color: "#ff7043" },
];

const FILTERS = ["All", "Songs", "Artists", "Albums"];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [hasSearched, setHasSearched] = useState(false);
  const { playSong, isSongActive } = usePlayer();
  const { isOffline, isConnected, isOfflineModeEnabled, toggleOfflineMode } = useNetwork();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation<TabScreenNavProp>();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const songs = await searchSongs(text);
      setResults(songs);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  return (
    <View style={[s.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={s.header}>
        <TouchableOpacity style={s.headerButton} onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={26} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={s.title}>Search</Text>
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
        <Ionicons name="search" size={20} color={colors.onSurfaceVariant} />
        <TextInput
          style={s.searchInput}
          placeholder="Search songs, artists, albums..."
          placeholderTextColor={colors.onSurfaceVariant}
          value={query}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        )}
      </View>

      {isOffline && (
        <View style={s.offlineBanner}>
          <Ionicons
            name="cloud-offline"
            size={48}
            color={colors.onSurfaceVariant}
          />
          <Text style={s.offlineTitle}>Search Unavailable</Text>
          <Text style={s.offlineDesc}>
            You are currently offline. Please check your connection to search
            for new music.
          </Text>
        </View>
      )}

      {!isOffline && (
        <>
          <View style={s.filterContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filterRow}
            >
              {FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    s.filterChip,
                    activeFilter === filter && s.activeChip,
                  ]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text
                    style={[
                      s.filterText,
                      activeFilter === filter && s.activeChipText,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {!hasSearched ? (
            <ScrollView contentContainerStyle={s.browseContent}>
              <Text style={s.browseTitle}>Browse Categories</Text>
              <View style={s.genreGrid}>
                {GENRES.map((genre) => (
                  <TouchableOpacity
                    key={genre.name}
                    style={[
                      s.genreCard,
                      {
                        backgroundColor: genre.color + "18",
                        borderColor: genre.color + "40",
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleSearch(genre.name)}
                  >
                    <View
                      style={[
                        s.genreIconWrap,
                        { backgroundColor: genre.color + "28" },
                      ]}
                    >
                      <Ionicons
                        name={genre.icon}
                        size={24}
                        color={genre.color}
                      />
                    </View>
                    <Text style={[s.genreName, { color: genre.color }]}>
                      {genre.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : loading ? (
            <ActivityIndicator color={colors.primary} style={s.loader} />
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 160 }}
              renderItem={({ item }) => (
                <SongItem
                  song={item}
                  isActive={isSongActive(item.id)}
                  onPress={() => playSong(item, results)}
                />
              )}
              ListEmptyComponent={
                <Text style={s.emptyText}>No results found for "{query}"</Text>
              }
            />
          )}
        </>
      )}
    </View>
  );
}

const makeStyles = (c: ColorPalette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
      marginBottom: Spacing.lg,
      gap: Spacing.md,
    },
    headerButton: { 
      width: 44, 
      height: 44, 
      borderRadius: Radii.full, 
      backgroundColor: c.surfaceContainer, 
      justifyContent: "center", 
      alignItems: "center" 
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
      fontWeight: "700",
      color: c.onSurface,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.surfaceContainer,
      marginHorizontal: Spacing.xl,
      borderRadius: Radii.md,
      paddingHorizontal: Spacing.lg,
      height: 48,
      gap: Spacing.sm,
    },
    searchInput: { flex: 1, color: c.onSurface, fontSize: FontSizes.bodyMd },
    offlineBanner: {
      alignItems: "center",
      marginHorizontal: Spacing.xl,
      marginVertical: Spacing.xl,
      padding: Spacing.xl,
      backgroundColor: c.surfaceContainer,
      borderRadius: Radii.xl,
    },
    offlineTitle: {
      color: c.onSurface,
      fontSize: FontSizes.titleLg,
      fontWeight: "700",
      marginTop: Spacing.md,
    },
    offlineDesc: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.bodyMd,
      textAlign: "center",
      marginTop: Spacing.sm,
    },
    filterContainer: {
      height: 52,
      marginTop: Spacing.sm,
      marginBottom: Spacing.xs,
    },
    filterRow: {
      paddingHorizontal: Spacing.xl,
      flexDirection: "row",
      alignItems: "center",
      height: 52,
    },
    filterChip: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: Radii.full,
      backgroundColor: c.surfaceContainerHigh,
      marginRight: Spacing.sm,
    },
    activeChip: { backgroundColor: c.primary },
    filterText: { color: c.onSurfaceVariant, fontSize: FontSizes.labelMd },
    activeChipText: { color: c.onPrimaryFixed, fontWeight: "600" },
    browseContent: {
      paddingHorizontal: GRID_PADDING,
      paddingTop: Spacing.sm,
      paddingBottom: 160,
    },
    browseTitle: {
      color: c.onSurface,
      fontSize: FontSizes.titleLg,
      fontWeight: "700",
      marginBottom: Spacing.lg,
    },
    genreGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    genreCard: {
      width: CARD_WIDTH,
      height: 110,
      borderRadius: Radii.xl,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      marginBottom: CARD_MARGIN * 2,
      overflow: "hidden",
    },
    genreIconWrap: {
      width: 44,
      height: 44,
      borderRadius: Radii.full,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: Spacing.sm,
    },
    genreName: {
      fontSize: FontSizes.labelLg,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    loader: { marginTop: Spacing["5xl"] },
    emptyText: {
      color: c.onSurfaceVariant,
      fontSize: FontSizes.bodyMd,
      textAlign: "center",
      marginTop: Spacing["4xl"],
    },
  });
