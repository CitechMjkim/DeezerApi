import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Dimensions, RefreshControl, FlatList } from 'react-native';
import axios from 'axios';
import styles from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';
import ClassicAlbumDetailScreen from './ClassicAlbumDetailScreen';
// @ts-ignore
import FastImage from 'react-native-fast-image';

interface ClassicItem {
  applemusic_thumbnail: string | null;
  applemusic_id: string | null;
  tidal_id: string | null;
  tidal_thumbnail: string | null;
  qobuz_id: string | null;
  qobuz_thumbnail: string | null;
  isrc: string | null;
  desc: string | null;
  artist: string | null;
  link: string | null;
  title: string | null;
  type: string | null;
}

interface ClassicMenuData {
  name: string | null;
  appType: string | null;
  items: ClassicItem[] | null;
}

interface ClassicCategory {
  category: ClassicMenuData[] | null;
}

interface ClassicMenu {
  new: ClassicCategory | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CLASSIC_CACHE_KEY = 'classic_api_cache';
const CLASSIC_CACHE_KEY_PREFIX = 'classic_api_cache_section_';
const CACHE_EXPIRE_MS = 1000 * 60 * 60 * 24 * 7; // 1주일

function getResizedImageUrl(item: ClassicItem): string {
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

const ClassicScreen: React.FC = () => {
  const [categories, setCategories] = useState<ClassicMenuData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryPages, setCategoryPages] = useState<{ [key: number]: number }>({});
  const navigation: any = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<(View | null)[]>([]);

  useEffect(() => {
    loadClassicCategories();
  }, []);

  // 캐시에서 불러오기 + API 최신화 (3개 섹션 먼저, 나머지 개별)
  const loadClassicCategories = async () => {
    setLoading(true);
    let cacheLoaded = false;
    let cachedCategories: ClassicMenuData[] = [];
    try {
      const cacheStr = await AsyncStorage.getItem(CLASSIC_CACHE_KEY);
      if (cacheStr) {
        const cache = JSON.parse(cacheStr);
        if (cache.timestamp && Date.now() - cache.timestamp < CACHE_EXPIRE_MS && cache.data) {
          setCategories(cache.data);
          cachedCategories = cache.data;
          cacheLoaded = true;
        }
      }
    } catch (e) {}
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get<ClassicMenu>(
        'https://api.roseaudio.kr/v1/utility/apple-music/classic/category/kr',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'If-None-Match': '*',
            'User-Agent': 'android-com.citech.rosepremium.remote.beta-5.2.01.5',
            'Accept-Language': 'ko_KR',
          }
        }
      );
      if (response.data?.new?.category) {
        // 3개 섹션 먼저
        const allCategories = response.data.new.category;
        const firstThree = allCategories.slice(0, 3);
        setCategories(firstThree.concat(cachedCategories.slice(3)));
        await AsyncStorage.setItem(
          CLASSIC_CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data: allCategories })
        );
        // 나머지 카테고리 개별 업데이트
        for (let i = 3; i < allCategories.length; i++) {
          setCategories(prev => {
            const updated = [...prev];
            updated[i] = allCategories[i];
            return updated;
          });
        }
      } else {
        if (!cacheLoaded) setError('데이터 형식이 올바르지 않습니다.');
      }
    } catch (err) {
      if (!cacheLoaded) setError('클래식 음악 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 강제 갱신(캐시 무시, 3개 섹션 먼저, 나머지 개별)
  const refreshClassicCategories = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get<ClassicMenu>(
        'https://api.roseaudio.kr/v1/utility/apple-music/classic/category/kr',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'If-None-Match': '*',
            'User-Agent': 'android-com.citech.rosepremium.remote.beta-5.2.01.5',
            'Accept-Language': 'ko_KR',
          }
        }
      );
      if (response.data?.new?.category) {
        const allCategories = response.data.new.category;
        const firstThree = allCategories.slice(0, 3);
        setCategories(firstThree.concat(categories.slice(3)));
        await AsyncStorage.setItem(
          CLASSIC_CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data: allCategories })
        );
        for (let i = 3; i < allCategories.length; i++) {
          setCategories(prev => {
            const updated = [...prev];
            updated[i] = allCategories[i];
            return updated;
          });
        }
      }
    } catch (err) {
      // 네트워크 에러 시 무시
    } finally {
      setRefreshing(false);
    }
  }, [categories]);

  if (loading && categories.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF3B30" />
      </View>
    );
  }

  if (error && categories.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // 실제로 보여줄 카테고리만 추림
  const visibleCategories = categories
    .filter(category => (category.items || []).filter(item => item.artist !== 'Apple Music Classical').length > 0);

  // 추천용 첫 번째 카테고리
  const featuredCategory = visibleCategories[0];
  const restCategories = visibleCategories.slice(1);
  const featuredItems = (featuredCategory?.items || []).filter(item => item.artist !== 'Apple Music Classical');

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshClassicCategories} colors={["#FF3B30"]} />
      }
    >
      {/* 추천: 첫 번째 카테고리 리스트 */}
      {featuredCategory && featuredItems.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text style={[localStyles.sectionTitle, { color: isDark ? '#fff' : '#222' }]}>{featuredCategory.name || '추천'}</Text>
          <FlatList
            data={featuredItems.slice(0, 5)}
            horizontal
            keyExtractor={(item, itemIdx) => item.applemusic_id || item.tidal_id || item.qobuz_id || itemIdx.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[localStyles.albumCard43, { width: 300 }]}
                onPress={() => navigation.navigate('ClassicAlbumDetail', { album: item })}
              >
                <FastImage
                  style={[localStyles.albumCover43, { width: 300, height: 200 }]}
                  source={{
                    uri: getResizedImageUrl(item),
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                  // defaultSource={require('../assets/icons/main_ico_cd.png')}
                />
                <Text style={localStyles.albumTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={localStyles.artistName} numberOfLines={1}>{item.artist}</Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 8 }}
          />
        </View>
      )}
      {/* 카테고리별 섹션 (추천에 쓴 첫 카테고리는 제외) */}
      {restCategories.map((category, idx) => {
        const page = categoryPages[idx + 1] || 1;
        const filteredItems = (category.items || []).filter(item => item.artist !== 'Apple Music Classical');
        const pagedItems = filteredItems.slice(0, 5);
        return (
          <View
            key={idx}
            style={{ marginBottom: 0 }}
            ref={ref => { sectionRefs.current[idx + 1] = ref; }}
          >
            <View style={localStyles.sectionHeader}>
              <Text style={[localStyles.sectionTitle, { color: isDark ? '#fff' : '#222' }]}>{category.name || '카테고리'}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ClassicCategoryViewAll', { category })}>
                <Text style={[localStyles.viewAll, { color: isDark ? '#fff' : '#222' }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={pagedItems}
              horizontal
              keyExtractor={(item, itemIdx) => item.applemusic_id || item.tidal_id || item.qobuz_id || itemIdx.toString()}
              renderItem={({ item }) => {
                console.log(`[${category.name}] Album title: ${item.title}`);
                return (
                  <TouchableOpacity
                    style={localStyles.albumCard43}
                    onPress={() => navigation.navigate('ClassicAlbumDetail', { album: item })}
                  >
                    <FastImage
                      style={localStyles.albumCover43}
                      source={{
                        uri: getResizedImageUrl(item),
                        priority: FastImage.priority.high,
                        cache: FastImage.cacheControl.immutable,
                      }}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                    <Text style={localStyles.albumTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={localStyles.artistName} numberOfLines={1}>{item.artist}</Text>
                  </TouchableOpacity>
                )
              }
              }
              onEndReached={() => {
                if (pagedItems.length < filteredItems.length) {
                  setCategoryPages(prev => ({
                    ...prev,
                    [idx + 1]: (prev[idx + 1] || 1) + 1
                  }));
                }
              }}
              onEndReachedThreshold={0.7}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        );
      })}
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
    marginBottom: 8,
  },
  featuredContainer: {
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  featuredImage: {
    width: SCREEN_WIDTH - 32,
    height: (SCREEN_WIDTH - 32) * 0.56, // 16:9 비율
    borderRadius: 12,
    backgroundColor: '#222',
    marginBottom: 12,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  featuredArtist: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 4,
  },
  viewAll: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 16,
  },
  albumCard43: {
    width: 120,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  albumCover43: {
    width: 120,
    height: 90, // 4:3 비율
    borderRadius: 8,
    backgroundColor: '#222',
    marginBottom: 8,
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#bbb',
    marginBottom: 2,
    width: 120,
    textAlign: 'center',
  },
  artistName: {
    fontSize: 12,
    color: '#bbb',
    width: 120,
    textAlign: 'center',
  },
  categoryButton: {
    backgroundColor: '#FFD700',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 8,
    elevation: 2,
  },
  categoryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ClassicScreen; 