import { Song, DeezerTrack, DeezerSearchResponse } from './types';

const BASE_URL = 'https://api.deezer.com';

function mapTrackToSong(track: DeezerTrack): Song {
  return {
    id: String(track.id),
    name: track.title,
    artist: track.artist?.name ?? 'Unknown Artist',
    album: track.album?.title ?? 'Unknown Album',
    image: track.album?.cover_big || track.album?.cover_medium || '',
    duration: track.duration * 1000,
    uri: track.link,
    previewUrl: track.preview,
  };
}

export async function searchSongs(query: string): Promise<Song[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/search?q=${encodeURIComponent(query)}&limit=30`
    );
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data: DeezerSearchResponse = await response.json();
    return data.data
      .filter((track) => track.preview) // only tracks with previews
      .map(mapTrackToSong);
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

export async function getChart(): Promise<Song[]> {
  try {
    const response = await fetch(`${BASE_URL}/chart/0/tracks?limit=30`);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return data.data
      .filter((track: DeezerTrack) => track.preview)
      .map(mapTrackToSong);
  } catch (error) {
    console.error('Chart error:', error);
    throw error;
  }
}

export async function getTrack(id: string): Promise<Song> {
  try {
    const response = await fetch(`${BASE_URL}/track/${id}`);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const track: DeezerTrack = await response.json();
    return mapTrackToSong(track);
  } catch (error) {
    console.error('Track error:', error);
    throw error;
  }
}

export async function getArtistTopTracks(artistId: number): Promise<Song[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/artist/${artistId}/top?limit=20`
    );
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return data.data
      .filter((track: DeezerTrack) => track.preview)
      .map(mapTrackToSong);
  } catch (error) {
    console.error('Artist tracks error:', error);
    throw error;
  }
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
