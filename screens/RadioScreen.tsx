import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, SafeAreaView, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import styles from '../styles';
import { useTheme } from '../ThemeContext';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { createCacheKey, loadMultipleCache, saveCache } from '../utils/cache';

interface RadioGenreData {
  id?: number;
  name?: string;
  sort?: number;
  imageUrl?: string;
}

interface RadioRegionData {
  id?: number;
  name?: string;
  sort?: number;
}

interface RadioLanguageData {
  id?: number;
  name?: string;
  sort?: number;
}

export interface RadioChannelData {
  id?: number;
  key?: string;
  title?: string;
  url?: string;
  retryUrl?: string;
  sort?: number;
  status?: string;
  imageUrl?: string;
  bitrate?: string;
  codec?: string;
  fileId?: number;
  popularPoint?: number;
  favorite?: boolean;
  online?: boolean;
  memberChannel?: boolean;
  genres?: RadioGenreData[];
  regions?: RadioRegionData[];
  languages?: RadioLanguageData[];
}

const API_LIST = [
  { key: 'recent', url: 'https://api.roseaudio.kr/radio/v2/my/recent?page=0&size=10', title: '최근 재생 채널' },
  { key: 'favorite', url: 'https://api.roseaudio.kr/radio/v2/my/favorite?page=0&size=10', title: '즐겨찾기' },
  { key: 'recommend', url: 'https://api.roseaudio.kr/radio/v2/recommend?page=0&size=10', title: '로즈 추천 채널' },
  { key: 'popular', url: 'https://api.roseaudio.kr/radio/v2/popular?page=0&size=10', title: '지역 내 인기 채널' },
  { key: 'region', url: 'https://api.roseaudio.kr/radio/v2/channel?regionId=0&page=0&size=10&sortType=NAME_ASC', title: '지역 채널' },
];

function ChannelItem({ item, onPress, isDark }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={{ width: 120, marginRight: 12 }}>
      <FastImage
        source={item.imageUrl ? { uri: item.imageUrl } : require('../assets/icons/main_ico_fm.png')}
        style={{ width: 120, height: 120, borderRadius: 12, backgroundColor: '#222' }}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Text numberOfLines={1} style={{ color: isDark ? '#fff' : '#222', marginTop: 6, textAlign: 'center', fontSize: 14 }}>{item.title}</Text>
    </TouchableOpacity>
  );
}

function ChannelItemWide({ item, onPress, isDark }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', width:250, height: 90, marginRight: 16, backgroundColor: isDark ? '#181818' : '#f5f5f5', borderRadius: 14, padding: 10 }}>
      <FastImage
        source={item.imageUrl ? { uri: item.imageUrl } : require('../assets/icons/main_ico_fm.png')}
        style={{ width: 70, height: 70, borderRadius: 10, backgroundColor: '#222' }}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={{ flex: 1, marginLeft: 16, justifyContent: 'center' }}>
        <Text numberOfLines={1} style={{ color: isDark ? '#fff' : '#222', fontSize: 16, fontWeight: 'bold' }}>{item.title}</Text>
        {item.status && <Text numberOfLines={1} style={{ color: isDark ? '#bbb' : '#666', fontSize: 13, marginTop: 4 }}>{item.status}</Text>}
      </View>
    </TouchableOpacity>
  );
}

export default function RadioScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [data, setData] = useState<any>({
    recent: [],
    favorite: [],
    recommend: [],
    popular: [],
    region: [],
  });
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation() as any;
  const [refreshing, setRefreshing] = useState(false);

  // 캐시 불러오기
  const loadCache = async () => {
    try {
      const cacheKeys = API_LIST.map(api => createCacheKey('radio', api.key));
      const cachedData = await loadMultipleCache(cacheKeys);
      setData({
        recent: cachedData[cacheKeys[0]] || [],
        favorite: cachedData[cacheKeys[1]] || [],
        recommend: cachedData[cacheKeys[2]] || [],
        popular: cachedData[cacheKeys[3]] || [],
        region: cachedData[cacheKeys[4]] || [],
      });
    } catch {}
  };

  // 모든 섹션을 먼저 온 놈부터 바로 UI에 업데이트
  const fetchAllSections = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('accessToken');
    API_LIST.forEach(api => {
      axios.get(api.url, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => {
          const arr = res.data?.radioChannels || res.data?.data || [];
          setData((prev: any) => ({ ...prev, [api.key]: arr }));
          saveCache(createCacheKey('radio', api.key), arr);
        })
        .catch(() => {
          setData((prev: any) => ({ ...prev, [api.key]: [] }));
        })
        .finally(() => {
          // 마지막 섹션이면 로딩 해제 (모든 요청이 끝나면)
          // 단순하게 모든 요청이 끝났는지 체크하려면, 각 섹션별로 완료 카운트 체크 필요
        });
    });
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadCache().then(() => {
      // 캐시가 없으면 바로 fetch, 있으면 fetch는 백그라운드에서
      const hasCache = Object.values(data).some(arr => Array.isArray(arr) && arr.length > 0);
      if (!hasCache) {
        fetchAllSections();
      } else {
        setLoading(false);
        fetchAllSections();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setLoading(true);
    fetchAllSections();
  };

  // 라디오 재생 핸들러 (RadioDetailScreen.tsx 참고)
  const handleChannelPress = async (channels: any[], index: number) => {
    try {
      const deviceInfoStr = await AsyncStorage.getItem('deviceInfo');
      if (!deviceInfoStr) {
        Alert.alert('기기 미연결', '먼저 기기를 연결해주세요.');
        return;
      }
      const deviceInfo = JSON.parse(deviceInfoStr);
      const deviceIP = deviceInfo.deviceIP;
      const roseToken = deviceInfo.deviceRoseToken;
      const payload = {
        data: channels,
        currentPosition: index,
        roseToken: roseToken
      };
      await axios.post(`http://${deviceIP}:9283/rose_radio_play`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      // Alert.alert('전송 성공', '기기에 라디오 재생 명령을 보냈습니다.');
    } catch (e) {
      Alert.alert('전송 실패', '기기에 명령을 보내지 못했습니다.');
    }
  };

  if (loading) return <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={[styles.container, isDark && { backgroundColor: '#000' }]}> 
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? "#fff" : "#000"}
            colors={isDark ? ["#fff"] : ["#000"]}
            progressBackgroundColor={isDark ? "#1C1C1E" : "#FFFFFF"}
          />
        }
      >
        {/* 3개 섹션 먼저 */}
        {[API_LIST[0], API_LIST[1], API_LIST[2]].map(api => (
          <View key={api.key} style={{ marginTop: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
              <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 18, fontWeight: 'bold' }}>{api.title}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('RadioDetailScreen', { title: api.title, apiUrl: api.url })}>
                <Text style={{ color: '#4faaff' }}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={data[api.key] || []}
              horizontal
              keyExtractor={item => item.id?.toString() || item.key || Math.random().toString()}
              renderItem={({ item, index }) => (
                api.key === 'recommend' ? (
                  <ChannelItemWide
                    item={item}
                    isDark={isDark}
                    onPress={() => handleChannelPress(data[api.key], index)}
                  />
                ) : (
                  <ChannelItem
                    item={item}
                    isDark={isDark}
                    onPress={() => handleChannelPress(data[api.key], index)}
                  />
                )
              )}
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 12, paddingLeft: 16 }}
            />
          </View>
        ))}
        {/* 나머지 2개는 먼저 온 것부터 */}
        {[API_LIST[3], API_LIST[4]].map(api => (
          <View key={api.key} style={{ marginTop: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
              <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 18, fontWeight: 'bold' }}>{api.title}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('RadioDetailScreen', { title: api.title, apiUrl: api.url })}>
                <Text style={{ color: '#4faaff' }}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={data[api.key] || []}
              horizontal
              keyExtractor={item => item.id?.toString() || item.key || Math.random().toString()}
              renderItem={({ item, index }) => (
                <ChannelItem
                  item={item}
                  isDark={isDark}
                  onPress={() => handleChannelPress(data[api.key], index)}
                />
              )}
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 12, paddingLeft: 16 }}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}