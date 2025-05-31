import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import styles from '../styles';
import { useTheme } from '../ThemeContext';
import FastImage from 'react-native-fast-image';
import { useRoute } from '@react-navigation/native';

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

export default function RadioDetailScreen() {
  const route = useRoute();
  const { title, apiUrl } = route.params as { title?: string; apiUrl?: string };
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paging, setPaging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const PAGE_SIZE = 20;

  // 캐시 키는 apiUrl 기준
  const getCacheKey = () => 'radio_detail_' + (apiUrl || '').replace(/[^a-zA-Z0-9]/g, '_');

  // 캐시 불러오기
  const loadCache = async () => {
    try {
      const cache = await AsyncStorage.getItem(getCacheKey());
      if (cache) {
        setChannels(JSON.parse(cache));
        setLoading(false);
      }
    } catch {}
  };

  const fetchChannels = async (pageToLoad = 0, isRefresh = false) => {
    try {
      if (loading || paging) return;
      if (pageToLoad === 0 || isRefresh) {
        setLoading(true);
      } else {
        setPaging(true);
      }
      const token = await AsyncStorage.getItem('accessToken');
      // page, size 쿼리 파라미터 추가
      let url = apiUrl || 'https://api.roseaudio.kr/radio/v2/my/recent?page=0&size=30';
      if (url.includes('?')) {
        url = url.replace(/([&?])page=\d+/, `$1page=${pageToLoad}`);
        url = url.replace(/([&?])size=\d+/, `$1size=${PAGE_SIZE}`);
        if (!/page=\d+/.test(url)) url += `&page=${pageToLoad}`;
        if (!/size=\d+/.test(url)) url += `&size=${PAGE_SIZE}`;
      } else {
        url += `?page=${pageToLoad}&size=${PAGE_SIZE}`;
      }
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'If-None-Match': '*',
          'User-Agent': 'android-com.citech.rosepremium.remote.beta-5.2.01.5',
          'Accept-Language': 'ko_KR',
        }
      });
      const radioChannels = response.data?.radioChannels || response.data?.data || [];
      setHasMore(radioChannels.length === PAGE_SIZE);
      if (isRefresh || pageToLoad === 0) {
        setChannels(radioChannels);
        // 캐시 저장
        AsyncStorage.setItem(getCacheKey(), JSON.stringify(radioChannels));
      } else {
        setChannels(prev => [...prev, ...radioChannels]);
      }
      setPage(pageToLoad);
    } catch (error) {
      if (isRefresh || pageToLoad === 0) setChannels([]);
    } finally {
      setLoading(false);
      setPaging(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchChannels(0, true);
  }, [apiUrl]);

  useEffect(() => {
    let didCache = false;
    setLoading(true);
    loadCache().then(() => {
      didCache = true;
      // 캐시가 없으면 바로 fetch, 있으면 fetch는 백그라운드에서
      if (channels.length === 0) {
        fetchChannels(0, true);
      } else {
        setLoading(false);
        fetchChannels(0, true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  const handleEndReached = () => {
    if (!loading && hasMore) {
      fetchChannels(page + 1);
    }
  };

  const handleChannelPress = async (item: RadioChannelData, index: number) => {
    try {
      // 저장된 기기 정보 불러오기
      const deviceInfoStr = await AsyncStorage.getItem('deviceInfo');
      if (!deviceInfoStr) {
        Alert.alert('기기 미연결', '먼저 기기를 연결해주세요.');
        return;
      }
      const deviceInfo = JSON.parse(deviceInfoStr);
      const deviceIP = deviceInfo.deviceIP;
      const roseToken = deviceInfo.deviceRoseToken;

      // 전송 데이터 구성
      const payload = {
        data: channels, // 전체 리스트
        currentPosition: index, // 선택한 포지션
        roseToken: roseToken    // 토큰
      };

      await axios.post(`http://${deviceIP}:9283/rose_radio_play`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      // Alert.alert('전송 성공', '기기에 라디오 재생 명령을 보냈습니다.');
    } catch (e) {
      Alert.alert('전송 실패', '기기에 명령을 보내지 못했습니다.');
    }
  };

  const renderItem = ({ item, index }: { item: RadioChannelData; index: number }) => (
    <TouchableOpacity onPress={() => handleChannelPress(item, index)}>
      <View
        style={[
          styles.menuItem,
          { flexDirection: 'row', alignItems: 'center' },
          isDark && { backgroundColor: '#1C1C1E', borderBottomColor: '#2C2C2E' }
        ]}
      >
        <FastImage
          source={
            item.imageUrl
              ? { uri: item.imageUrl }
              : require('../assets/icons/main_ico_fm.png')
          }
          style={{ width: 48, height: 48, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' }}
          resizeMode={FastImage.resizeMode.cover}
        />
        <Text style={[styles.menuText, isDark && { color: '#FFFFFF' }]}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && { backgroundColor: '#000000' }]}>
      {title && <Text style={{ fontSize: 22, fontWeight: 'bold', color: isDark ? '#fff' : '#000', margin: 16 }}>{title}</Text>}
      {loading && channels.length === 0 ? (
        <ActivityIndicator size="large" color={isDark ? "#FFFFFF" : "#0000ff"} />
      ) : (
        <FlatList
          data={channels}
          renderItem={renderItem}
          keyExtractor={item => (item.id ? item.id.toString() : item.key ?? Math.random().toString())}
          style={isDark && { backgroundColor: '#000000' }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? "#FFFFFF" : "#000000"}
              colors={isDark ? ["#FFFFFF"] : ["#000000"]}
              progressBackgroundColor={isDark ? "#1C1C1E" : "#FFFFFF"}
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.7}
          ListFooterComponent={
            paging && channels.length > 0 ? (
              <View style={{ height: 64, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#181818' : '#fff' }}>
                <ActivityIndicator size="large" color="#FFD700" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}