import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Keyboard, SafeAreaView, ScrollView, StatusBar,
  Text, TextInput, TouchableOpacity, View, FlatList, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../styles';
import { useTheme } from '../ThemeContext';
import { LogBox } from 'react-native';
import FastImage from 'react-native-fast-image';
LogBox.ignoreAllLogs();

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
  preview?: string;
  duration?: number;
}

export default function SearchScreen({ navigation }: any) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('beethovn');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
        `https://api.deezer.com/search/album?q=${encodeURIComponent(debouncedQuery)}`
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

  const renderItem = ({ item }: { item: Album }) => (
    <TouchableOpacity
      style={[styles.menuItem, { flexDirection: 'row', alignItems: 'center' }, isDark && { backgroundColor: '#1C1C1E' }]}
      onPress={() => navigation.navigate('AlbumDetail', { album: item })}
    >
      <FastImage
        source={{ uri: item.album?.cover_medium || item.cover_medium }}
        style={{ width: 50, height: 50, borderRadius: 4, marginRight: 12 }}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuText, isDark && { color: '#FFFFFF' }]}>{item.title}</Text>
        <Text style={[styles.menuText, { fontSize: 14, color: isDark ? '#999999' : '#666666' }]}>
          {item.artist.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlbums();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && { backgroundColor: '#000000' }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#000000" : "#FFFFFF"}
      />
      <View style={[styles.searchContainer, isDark && { backgroundColor: '#1C1C1E' }]}>
        <TextInput
          style={[
            styles.searchInput,
            isDark && {
              backgroundColor: '#2C2C2E',
              color: '#FFFFFF',
            }
          ]}
          placeholder="Search songs..."
          placeholderTextColor={isDark ? '#666666' : '#999999'}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? "#FFFFFF" : "#0000ff"} />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={[
            styles.scrollView,
            isDark && { backgroundColor: '#000000' }
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? "#FFFFFF" : "#000000"}
              colors={isDark ? ["#FFFFFF"] : ["#000000"]}
              progressBackgroundColor={isDark ? "#1C1C1E" : "#FFFFFF"}
            />
          }
        >
          {isOffline && (
            <View style={[styles.offlineItem, isDark && { backgroundColor: '#1C1C1E' }]}>
              <Text style={[styles.offlineText, isDark && { color: '#FFFFFF' }]}>
                오프라인 모드 - 캐시된 데이터
              </Text>
            </View>
          )}
          <FlatList
            data={albums}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 5 }}
            style={isDark && { backgroundColor: '#000000' }}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
} 
