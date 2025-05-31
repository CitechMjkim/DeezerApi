import React, { useLayoutEffect, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';
// @ts-ignore
import FastImage from 'react-native-fast-image';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Track {
  id: number;
  title: string;
  duration: number;
  preview: string;
  artist: {
    name: string;
  };
}

interface DeezerAlbum {
  id: number;
  title: string;
  cover_medium: string;
  tracks: {
    data: Track[];
  };
}

interface DeezerTrack {
  id: number;
  title: string;
  duration: number;
  preview: string;
  artist: {
    id: number;
    name: string;
    picture: string;
  };
  album: {
    id: number;
    title: string;
    cover_medium: string;
  };
}

function getResizedImageUrl(item: any): string {
  let url = item.applemusic_thumbnail || item.tidal_thumbnail || item.qobuz_thumbnail || '';
  if (!url) return 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';

  if (url.startsWith('http:')) url = url.replace('http:', 'https:');
  if (!url.startsWith('https://')) url = `https://${url}`;

  if (url.includes('apple.com')) {
    url = url.replace('/source/', '/300x300/');
  } else if (url.includes('tidal.com')) {
    url = url.replace('/images/', '/images/300x300/');
  } else if (url.includes('qobuz.com')) {
    url = url.replace('/images/', '/images/300x300/');
  } else {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}width=300&height=300`;
  }
  return url;
}
// ISRC로 트랙 찾기
const ClassicAlbumDetailScreen = () => {
  const route = useRoute();
  const navigation: any = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { album } = route.params as { album: any };
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [albumInfo, setAlbumInfo] = useState<DeezerAlbum | null>(null);

  useEffect(() => {
    if (album.isrc) {
      fetchAlbumAndTracks();
    }
  }, [album.isrc]);

  const fetchAlbumAndTracks = async () => {
    try {
      // 1. ISRC로 트랙 찾기
      const trackResponse = await axios.get<DeezerTrack>(`https://api.deezer.com/track/isrc:${album.isrc}`);
      console.log('Track response:', trackResponse.data);
      
      if (trackResponse.data?.id) {
        console.log('Found track ID:', trackResponse.data.id);
        // 2. 앨범 ID로 앨범 정보와 트랙 목록 가져오기
        const albumResponse = await axios.get<DeezerAlbum>(`https://api.deezer.com/album/${trackResponse.data.album.id}`);
        console.log('Album response:', albumResponse.data);

        if (albumResponse.data) {
          
          // setAlbumInfo(albumResponse.data);// 앨범저보가 다르면 업데이트

          // 트랙 데이터가 있는지 확인하고 설정
          if (albumResponse.data.tracks?.data && albumResponse.data.tracks.data.length > 0) {
            console.log('Setting tracks:', albumResponse.data.tracks.data);
            setTracks(albumResponse.data.tracks.data);
          } else {
            console.log('No tracks found in album response');
            // 트랙이 없는 경우 현재 트랙만 표시
            setTracks([{
              id: trackResponse.data.id,
              title: trackResponse.data.title,
              duration: trackResponse.data.duration,
              preview: trackResponse.data.preview,
              artist: {
                name: trackResponse.data.artist.name
              }
            }]);
          }
        }
      } else {
        console.log('No track ID found in response');
      }
    } catch (error) {
      console.error('Error fetching track and album:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;  };

  // 앱바 타이틀을 앨범명으로 설정
  useLayoutEffect(() => {
    navigation.setOptions({ title: album.title });
  }, [navigation, album.title]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}>
      <View style={styles.container}>
        <FastImage
          style={styles.cover}
          source={{
            uri: albumInfo?.cover_medium || getResizedImageUrl(album),
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.immutable,
          }}
          resizeMode={FastImage.resizeMode.cover}
          // defaultSource={require('../assets/icons/main_ico_cd.png')}
        />
        <Text style={[styles.title, { color: isDark ? '#fff' : '#222' }]}>
          {albumInfo?.title || album.title}
        </Text>
        <Text style={[styles.artist, { color: isDark ? '#bbb' : '#444' }]}>{album.artist}</Text>
        {album.desc && <Text style={[styles.desc, { color: isDark ? '#ccc' : '#666' }]}>{album.desc}</Text>}
        
        {/* 트랙 목록 */}
        <View style={styles.tracksContainer}>
          <Text style={[styles.tracksTitle, { color: isDark ? '#fff' : '#222' }]}>트랙 목록</Text>
          {loading ? (
            <ActivityIndicator size="large" color={isDark ? "#FFFFFF" : "#0000ff"} />
          ) : tracks.length > 0 ? (
            tracks.map((track, index) => (
              <TouchableOpacity
                key={track.id}
                style={[styles.trackItem, { borderBottomColor: isDark ? '#333' : '#eee' }]}
                onPress={() => {
                  // 트랙 재생 로직 추가 예정
                  console.log('Play track:', track.title);
                }}
              >
                <Text style={[styles.trackNumber, { color: isDark ? '#fff' : '#222' }]}>{index + 1}</Text>
                <View style={styles.trackInfo}>
                  <Text style={[styles.trackTitle, { color: isDark ? '#fff' : '#222' }]} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={[styles.trackArtist, { color: isDark ? '#bbb' : '#666' }]} numberOfLines={1}>
                    {track.artist?.name || album.artist || 'Unknown Artist'}
                  </Text>
                </View>
                <Text style={[styles.trackDuration, { color: isDark ? '#bbb' : '#666' }]}>
                  {formatDuration(track.duration)}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.noTracks, { color: isDark ? '#bbb' : '#666' }]}>
              트랙 정보를 찾을 수 없습니다.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
  },
  cover: {
    width: SCREEN_WIDTH - 48,
    height: (SCREEN_WIDTH - 48) * 0.75, // 4:3 비율
    borderRadius: 12,
    backgroundColor: '#222',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  artist: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  tracksContainer: {
    width: '100%',
    marginTop: 24,
  },
  tracksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  trackNumber: {
    width: 30,
    fontSize: 14,
    textAlign: 'center',
  },
  trackInfo: {
    flex: 1,
    marginLeft: 8,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  trackArtist: {
    fontSize: 12,
    marginTop: 2,
  },
  trackDuration: {
    fontSize: 12,
    marginLeft: 8,
  },
  noTracks: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});

export default ClassicAlbumDetailScreen; 