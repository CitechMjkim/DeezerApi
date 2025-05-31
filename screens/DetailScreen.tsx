import React, { useEffect, useState, useRef } from 'react';
import { View, Text, SafeAreaView, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';
import FastImage from 'react-native-fast-image';
import axios from 'axios';
import { createCacheKey, loadCache, saveCache } from '../utils/cache';

function SectionItem({ item, type }: { item: any; type: string }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const getAppTypeIcon = (appType: string) => {
    switch (appType) {
      case 'QOBUZ':
        return require('../assets/icons/main_ico_qobuz.png');
      case 'TIDAL':
        return require('../assets/icons/main_ico_tidal.png');
      case 'APPLE_MUSIC':
        return require('../assets/icons/main_icon_apple.png');
      case 'YOUTUBE':
        return require('../assets/icons/main_ico_yt.png');
      default:
        return require('../assets/icons/main_ico_mus.png');
    }
  };
  const displayTitle = item.title || item.name || item.comment || item.owner || item.creator || '정보 없음';
  if (type === 'playlist') {
    return (
      <View style={{ flex: 1, margin: 6, maxWidth: '48%' }}>
        <View style={{ position: 'relative' }}>
          <FastImage source={{ uri: item.thumbnailUrl || item.imageUrl || item.coverUrl }} style={{ width: 180, height: 180, borderRadius: 12, backgroundColor: '#222' }} resizeMode={FastImage.resizeMode.cover} />
          <FastImage
            source={getAppTypeIcon(item.type)}
            style={{ width: 24, height: 24, position: 'absolute', top: 6, left: 6 }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
        <Text numberOfLines={2} style={{ color: isDark ? '#fff' : '#111', marginTop: 6, fontSize: 15, fontWeight: '500' }}>
          {displayTitle}
        </Text>
        <Text numberOfLines={1} style={{ color: '#aaa', fontSize: 13 }}>
          {item.owner} • {item.trackCount}곡
        </Text>
      </View>
    );
  }
  if (type === 'album' || type === 'youtube') {
    return (
      <View style={{ flex: 1, margin: 6, maxWidth: '48%' }}>
        <View style={{ position: 'relative' }}>
          <FastImage source={{ uri: item.imageUrl || item.coverUrl || item.thumbnailUrl }} style={{ width: 180, height: 180, borderRadius: 12, backgroundColor: '#222' }} resizeMode={FastImage.resizeMode.cover} />
          <FastImage
            source={getAppTypeIcon(item.type)}
            style={{ width: 24, height: 24, position: 'absolute', top: 6, left: 6 }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
        <Text numberOfLines={2} style={{ color: isDark ? '#fff' : '#111', marginTop: 6, fontSize: 15, fontWeight: '500' }}>
          {displayTitle}
        </Text>
      </View>
    );
  }
  if (type === 'track' || type === 'youtube') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#222' : '#eee', backgroundColor: 'transparent' }}>
        <View style={{ position: 'relative' }}>
          <FastImage
            source={{ uri: item.thumbnailUrl || item.imageUrl || item.coverUrl }}
            style={{ width: 48, height: 48, borderRadius: 6, backgroundColor: '#222' }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text numberOfLines={1} style={{ color: isDark ? '#FFFFFF' : '#222222', fontSize: 16, fontWeight: 'bold' }}>
            {item.title || item.name || '정보 없음'}
          </Text>
        </View>
      </View>
    );
  }
  if (type === 'artist') {
    return (
      <View style={{ width: 90, alignItems: 'center', marginRight: 12 }}>
        <FastImage source={{ uri: item.imageUrl || item.coverUrl || item.thumbnailUrl }} style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#222' }} resizeMode={FastImage.resizeMode.cover} />
        <Text numberOfLines={1} style={{ color: '#fff', marginTop: 6, fontSize: 13, textAlign: 'center' }}>{item.name || item.title}</Text>
      </View>
    );
  }
  if (type === 'my_playlist') {
    return (
      <View style={{ flex: 1, margin: 6, maxWidth: '48%' }}>
        <View style={{ position: 'relative' }}>
          <FastImage
            source={{
              uri: item.tracks && item.tracks.length > 0
                ? item.tracks[0].albumArt || item.tracks[0].cover || item.tracks[0].coverUrl || item.tracks[0].thumbnailUrl
                : item.thumbnailUrl || item.coverUrl || item.thumbnail
            }}
            style={{ width: 180, height: 180, borderRadius: 12, backgroundColor: '#222' }}
            resizeMode={FastImage.resizeMode.cover}
          />
          <FastImage
            source={getAppTypeIcon(item.type)}
            style={{ width: 24, height: 24, position: 'absolute', top: 6, left: 6 }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
        <Text numberOfLines={2} style={{ color: isDark ? '#fff' : '#111', marginTop: 6, fontSize: 15, fontWeight: '500' }}>
          {item.title || item.name || '정보 없음'}
        </Text>
      </View>
    );
  }
  // fallback
  return <Text style={{ color: '#fff' }}>{item.title || item.name}</Text>;
}

function ArtistGridItem({ item }: { item: any }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const getAppTypeIcon = (appType: string) => {
    switch (appType) {
      case 'TIDAL':
        return require('../assets/icons/main_ico_tidal.png');
      case 'QOBUZ':
        return require('../assets/icons/main_ico_qobuz.png');
      case 'APPLE_MUSIC':
        return require('../assets/icons/main_icon_apple.png');
      default:
        return require('../assets/icons/main_ico_mus.png');
    }
  };
  return (
    <View style={{ flex: 1 / 3, alignItems: 'center', marginVertical: 16 }}>
      <View style={{ position: 'relative' }}>
        <FastImage
          source={{ uri: item.thumbnailUrl || item.imageUrl || item.coverUrl }}
          style={{ width: 130, height: 130, borderRadius: 65, backgroundColor: '#222' }}
        />
        {item.type && (
          <FastImage
            source={getAppTypeIcon(item.type)}
            style={{ width: 32, height: 32, position: 'absolute', top: 10, left: 10 }}
            resizeMode={FastImage.resizeMode.contain}
          />
        )}
      </View>
      <Text
        numberOfLines={1}
        style={{
          color: isDark ? '#fff' : '#222',
          fontSize: 17,
          marginTop: 14,
          textAlign: 'center',
          width: 180,
          fontWeight: 'bold',
        }}
      >
        {item.name || item.title || '정보 없음'}
      </Text>
    </View>
  );
}

const getListFromResponse = (sectionKey: string, resData: any) => {
  switch (sectionKey) {
    case 'recent_playlist':
      return (resData.recentList || []).map((item: any) => ({
        id: item.playlist.id,
        title: item.playlist.title,
        thumbnailUrl: item.playlist.thumbnail,
        owner: item.playlist.ownerName,
        type: item.playlist.type,
        trackCount: item.playlist.trackCount
      }));
    case 'recent_album':
      return (resData.recentList || []).map((item: any) => ({
        id: item.album.id,
        title: item.album.title,
        thumbnailUrl: item.album.thumbnail,
        type: item.album.type,
        clientKey: item.album.clientKey
      }));
    case 'recent_yt':
      return resData.tracks || resData.recentList || [];
    case 'recent_artist':
      return (resData.artistDtos || resData.data || resData.recentList || []).map((item: any) => ({
        ...item,
        thumbnailUrl: Array.isArray(item.thumbnail) ? item.thumbnail[0] : item.thumbnail || item.imageUrl || item.coverUrl,
      }));
    case 'rose_recommend':
      return (resData.recommends || []).map((item: any) => ({
        ...item.playlist,
        owner: item.playlist.ownerName,
        trackCount: item.playlist.trackCount,
        thumbnailUrl: item.playlist.thumbnail,
        type: item.playlist.type,
      }));
    case 'recent_track':
      return resData.tracks || resData.recentList || [];
    case 'my_playlist':
      return (resData.data || resData.playlists || []).map((item: any) => ({
        ...item,
        thumbnailUrl:
          item.tracks && item.tracks.length > 0
            ? item.tracks[0].albumArt || item.tracks[0].cover || item.tracks[0].coverUrl || item.tracks[0].thumbnailUrl
            : item.thumbnailUrl || item.coverUrl || item.thumbnail,
      }));
    case 'latest_playlist':
      return (resData.playlists || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        thumbnailUrl: item.thumbnail,
        owner: item.ownerName,
        type: item.type,
        trackCount: item.trackCount,
        thumbupCount: item.thumbupCount,
        comment: item.comment,
        tags: item.tags,
        registDateTime: item.registDateTime,
        lastUpdateDateTime: item.lastUpdateDateTime
      }));
    case 'popular_playlist':
      return (resData.playlists || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        thumbnailUrl: item.thumbnail,
        owner: item.ownerName,
        type: item.type,
        trackCount: item.trackCount,
        thumbupCount: item.thumbupCount,
        comment: item.comment,
        tags: item.tags,
        registDateTime: item.registDateTime,
        lastUpdateDateTime: item.lastUpdateDateTime
      }));
    default:
      return resData.data || resData.radioChannels || [];
  }
};

export default function DetailScreen() {
  const route = useRoute();
  const { sectionKey, title, apiUrl, type } = route.params as { sectionKey: string; title: string; apiUrl: string; type?: string };
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isEnd, setIsEnd] = useState(false);
  const artistPageSize = 20;
  const defaultPageSize = 15;
  const loadingMore = useRef(false);

  // 캐시 키는 apiUrl+sectionKey 기준
  const getCacheKey = () => createCacheKey('detail', (sectionKey || '') + '_' + (apiUrl || ''));

  // 캐시 불러오기
  const loadCachedData = async () => {
    try {
      const cachedData = await loadCache<any[]>(getCacheKey());
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
      }
    } catch {}
  };

  const fetchData = async (pageNum = 0, append = false) => {
    if (loadingMore.current) return;
    loadingMore.current = true;
    if (!append) setLoading(true);
    const token = await AsyncStorage.getItem('accessToken');
    try {
      let url = apiUrl;
      let pageSize = (sectionKey === 'recent_artist') ? artistPageSize : defaultPageSize;
      // 최신/인기 플레이리스트는 page/size 파라미터를 붙이지 않음
      if (sectionKey === 'latest_playlist') {
        if (url.includes('?')) {
          url += `&page=${pageNum}&size=10`;
        } else {
          url += `?page=${pageNum}&size=10`;
        }
      } else if (sectionKey !== 'popular_playlist') {
        if (url.includes('?')) {
          url += `&page=${pageNum}&size=${pageSize}`;
        } else {
          url += `?page=${pageNum}&size=${pageSize}`;
        }
      }
      const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const list = getListFromResponse(sectionKey, res.data);
      setTotalCount(
        res.data.totalCount ||
        res.data.count ||
        (res.data.recommends ? res.data.recommends.length : null) ||
        list.length
      );
      if (append) {
        setData(prev => [...prev, ...list]);
      } else {
        setData(list);
        // 캐시 저장
        await saveCache(getCacheKey(), list);
      }
      if (list.length < pageSize) setIsEnd(true);
      else setIsEnd(false);
    } catch {
      if (!append) setData([]);
    }
    setLoading(false);
    setRefreshing(false);
    loadingMore.current = false;
  };

  useEffect(() => {
    setPage(0);
    setLoading(true);
    loadCachedData().then(() => {
      // 캐시가 없으면 바로 fetch, 있으면 fetch는 백그라운드에서
      if (data.length === 0) {
        fetchData(0, false);
      } else {
        setLoading(false);
        fetchData(0, false);
      }
    });
  }, [apiUrl]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    fetchData(0, false);
  };

  const onEndReached = () => {
    if (!isEnd && !loading && !loadingMore.current) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage, true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000000' : '#FFFFFF' }}>
      {loading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDark ? '#000000' : '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
        </View>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: isDark ? '#fff' : '#000' }}>{title} {totalCount !== null && `(${totalCount})`}</Text>
      </View>
      {sectionKey === 'recent_artist' ? (
        <FlatList
          data={data}
          numColumns={3}
          keyExtractor={item => item.id?.toString() || item.key || item.clientKey || Math.random().toString()}
          renderItem={({ item }) => <ArtistGridItem item={item} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? "#fff" : "#000"}
              colors={isDark ? ["#fff"] : ["#000"]}
              progressBackgroundColor={isDark ? "#1C1C1E" : "#FFFFFF"}
            />
          }
          contentContainerStyle={{ padding: 6 }}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.7}
          ListFooterComponent={() =>
            !isEnd && loadingMore.current ? (
              <ActivityIndicator size="small" color={isDark ? '#fff' : '#000'} style={{ marginVertical: 16 }} />
            ) : null
          }
        />
      ) : (
        <FlatList
          data={data}
          numColumns={sectionKey === 'recent_track' ? 1 : 2}
          keyExtractor={item =>
            item.id?.toString() ||
            item.key ||
            item.clientKey ||
            Math.random().toString()
          }
          renderItem={({ item }) => {
            let itemType = '';
            if (
              sectionKey === 'recent_album' ||
              sectionKey === 'rose_recommend' ||
              sectionKey === 'my_playlist'
            ) itemType = 'album';
            else if (
              sectionKey === 'recent_playlist' ||
              sectionKey === 'latest_playlist' ||
              sectionKey === 'popular_playlist'
            ) itemType = 'playlist';
            else if (sectionKey === 'recent_yt') itemType = 'album';
            else if (sectionKey === 'recent_track') itemType = 'track';
            else itemType = type || '';
            return <SectionItem item={item} type={itemType} />;
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? "#fff" : "#000"}
              colors={isDark ? ["#fff"] : ["#000"]}
              progressBackgroundColor={isDark ? "#1C1C1E" : "#FFFFFF"}
            />
          }
          contentContainerStyle={{ padding: 6 }}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.7}
          ListFooterComponent={() =>
            !isEnd && loadingMore.current ? (
              <ActivityIndicator size="small" color={isDark ? '#fff' : '#000'} style={{ marginVertical: 16 }} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
} 