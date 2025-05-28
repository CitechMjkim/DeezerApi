import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, Keyboard, SafeAreaView, ScrollView, StatusBar,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../styles';

interface Album {
  id: number;
  title: string;
  cover_medium: string;
  artist: {
    name: string;
  };
  album?: {
    cover_medium: string;
  };
  duration?: number;
}

export default function HomeScreen({ navigation }: any) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('bts');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOffline, setIsOffline] = useState(false);

  const getCacheKey = (query: string) => `search_${query.toLowerCase().trim()}`;
  const getCachedData = async (query: string) => {
    try {
      const cacheKey = getCacheKey(query);
      const cachedData = await AsyncStorage.getItem(cacheKey);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  };
  const cacheData = async (query: string, data: any) => {
    try {
      const cacheKey = getCacheKey(query);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  useEffect(() => {
    if (debouncedQuery) {
      fetchAlbums();
    }
  }, [debouncedQuery]);
  const fetchAlbums = async () => {
    setLoading(true);
    const cachedData = await getCachedData(debouncedQuery);
    if (cachedData) {
      setAlbums(cachedData);
      setIsOffline(true);
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(
        `https://api.deezer.com/search?q=${encodeURIComponent(debouncedQuery)}`
      );
      const newData = response.data.data;
      setAlbums(newData);
      await cacheData(debouncedQuery, newData);
      setIsOffline(false);
    } catch (error) {
      setIsOffline(false);
      console.error('Error fetching albums:', error);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs..."
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollView}>
          {isOffline && (
            <View style={styles.offlineItem}>
              <Text style={styles.offlineText}>오프라인 모드 - 캐시된 데이터</Text>
            </View>
          )}
          {albums.map((album) => (
            <TouchableOpacity
              key={album.id}
              style={styles.albumCard}
              onPress={() => navigation.navigate('AlbumDetail', { album })}
            >
              <Image
                source={{ uri: album.album?.cover_medium || album.cover_medium }}
                style={styles.albumCover}
              />
              <View style={styles.albumInfo}>
                <Text style={styles.albumTitle}>{album.title}</Text>
                <Text style={styles.artistName}>{album.artist.name}</Text>
                {album.duration && (
                  <Text style={styles.duration}>
                    {Math.floor(album.duration / 60)}:{(album.duration % 60).toString().padStart(2, '0')}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
} 