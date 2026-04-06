import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Spacing, FontSizes, ColorPalette } from '@/constants/theme';
import { usePlayer } from '@/contexts/PlayerContext';
import { useTheme } from '@/contexts/ThemeContext';
import SongItem from '@/components/SongItem';

export default function RecentScreen() {
  const { recentlyPlayed, playSong } = usePlayer();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={s.title}>Recently Played</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList data={recentlyPlayed} keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item, index }) => (<SongItem song={item} index={index} onPress={() => playSong(item, recentlyPlayed)} />)}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Ionicons name="time-outline" size={48} color={colors.onSurfaceVariant} />
            <Text style={s.emptyText}>No history yet</Text>
            <Text style={s.emptySubtext}>Songs you play will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  title: { color: c.onSurface, fontSize: FontSizes.titleLg, fontWeight: '700' },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: c.onSurface, fontSize: FontSizes.titleMd, fontWeight: '600', marginTop: Spacing.md },
  emptySubtext: { color: c.onSurfaceVariant, fontSize: FontSizes.bodyMd, marginTop: Spacing.xs },
});
