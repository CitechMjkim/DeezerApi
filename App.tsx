/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const Stack = createNativeStackNavigator();

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

function HomeScreen({ navigation }: any) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOffline, setIsOffline] = useState(false);

  // 캐시 키 생성 함수
  const getCacheKey = (query: string) => `search_${query.toLowerCase().trim()}`;

  // 캐시된 데이터 가져오기
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

  // 데이터 캐싱
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
    
    // 캐시된 데이터 확인
    const cachedData = await getCachedData(debouncedQuery);
    if (cachedData) {
      setAlbums(cachedData);
      setIsOffline(true);
      setLoading(false);
      return;
    }

    try {
      // API 호출
      const response = await axios.get(
        `https://api.deezer.com/search?q=${encodeURIComponent(debouncedQuery)}`
      );
      const newData = response.data.data;
      
      // 데이터 저장 및 캐싱
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

function AlbumDetailScreen({ route }: any) {
  const { album } = route.params;
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ alignItems: 'center', marginTop: 32 }}>
        <Image
          source={{ uri: album.album?.cover_medium || album.cover_medium }}
          style={{ width: 200, height: 200, borderRadius: 8 }}
        />
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 16 }}>{album.title}</Text>
        <Text style={{ fontSize: 18, color: '#666', marginTop: 8 }}>{album.artist.name}</Text>
        {album.duration && (
          <Text style={{ fontSize: 16, color: '#666', marginTop: 8 }}>
            Duration: {Math.floor(album.duration / 60)}:{(album.duration % 60).toString().padStart(2, '0')}
          </Text>
        )}
        {album.preview && (
          <Text style={{ fontSize: 16, color: '#666', marginTop: 8 }}>
            Preview available
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Top Albums',
            headerStyle: {
              backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="AlbumDetail"
          component={AlbumDetailScreen}
          options={{
            title: 'Album Detail',
            headerStyle: {
              backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  scrollView: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  albumCover: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  albumInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: '#666',
  },
  duration: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  offlineItem: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  offlineText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
