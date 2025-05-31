import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { parse } from 'query-string';

const SECTION_LIST = [
  { key: 'recent', title: '최근 재생' },
  { key: 'recent_yt', url: 'https://api.roseaudio.kr/v1/member/track/recent?type=YOUTUBE&excludeMediaType=&page=0&size=10', type: 'youtube', title: '최근 재생 로즈튜브' },
];

const RECENT_PLAYLIST_URL = 'https://api.roseaudio.kr/v1/member/playlist/recent?type=&excludeMediaType=&page=0&size=10';
const RECENT_ALBUM_URL = 'https://api.roseaudio.kr/v1/member/album/recent?type=&excludeMediaType=&page=0&size=10';
const RECENT_TRACK_URL = 'https://api.roseaudio.kr/v1/member/track/recent?type=&excludeMediaType=&page=0&size=10';
const RECENT_ARTIST_URL = 'https://api.roseaudio.kr/v1/member/artist/recent?type=&excludeMediaType=&page=0&size=10';
const MY_PLAYLIST_URL = 'https://api.roseaudio.kr/v1/member/playlist/member/3029?sortType=PLAYLIST_RECENT&mediaType=&page=0&size=20';
const ROSE_RECOMMEND_URL = 'https://api.roseaudio.kr/v1/member/recommend';
const LATEST_PLAYLIST_URL = 'https://api.roseaudio.kr/v1/member/playlist/latest/filteredByLanguage';
const POPULAR_PLAYLIST_URL = 'https://api.roseaudio.kr/v1/member/playlist/popular?mediaType=&page=0&size=20&isRose=true';

function RecentItem({ item, type }: { item: any; type: string }) {
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
      default:
        return null;
    }
  };
  // 타이틀 우선순위: title > name > comment > owner > creator > '정보 없음'
  const displayTitle = item.title || item.name || item.comment || item.owner || item.creator || '정보 없음';
  return (
    <View style={{ width: 140, marginRight: 12 }}>
      <View style={{ position: 'relative' }}>
        <FastImage
          source={{ uri: item.imageUrl || item.coverUrl || item.thumbnailUrl }}
          style={{ width: 140, height: 140, borderRadius: 8, backgroundColor: '#222' }}
          resizeMode={FastImage.resizeMode.cover}
        />
        {/* 앱 타입 아이콘 오버레이 */}
        {((type === 'album' && item.type) || (type === 'playlist' && item.type)) && (
          <FastImage
            source={getAppTypeIcon(item.type)}
            style={{ width: 24, height: 24, position: 'absolute', top: 6, left: 6 }}
            resizeMode={FastImage.resizeMode.contain}
          />
        )}
      </View>
      <Text numberOfLines={1} style={{ color: isDark ? '#fff' : '#111', marginTop: 6 }}>{displayTitle}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
        {type === 'playlist' ? (
          <Text numberOfLines={1} style={{ color: '#aaa', fontSize: 13, flex: 1 }}>
            {`${item.owner} • ${item.trackCount}곡`}
          </Text>
        ) : type === 'album' ? null : (
          <Text numberOfLines={1} style={{ color: '#aaa', fontSize: 13, flex: 1 }}>
            {item.artist || item.owner || item.creator || ''}
          </Text>
        )}
      </View>
    </View>
  );
}

function RoseTubeItem({ item }: { item: any }) {
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
        return require('../assets/icons/main_ico_yt.png'); // 기본값: 유튜브
    }
  };
  // 타이틀 우선순위: title > name > comment > owner > creator > '정보 없음'
  const displayTitle = item.title || item.name || item.comment || item.owner || item.creator || '정보 없음';
  return (
    <View style={{ width: 260, marginRight: 12 }}>
      <View style={{ position: 'relative' }}>
        <FastImage source={{ uri: item.imageUrl || item.coverUrl || item.thumbnailUrl }} style={{ width: 260, height: 146, borderRadius: 8, backgroundColor: '#222' }} resizeMode={FastImage.resizeMode.cover} />
        {/* 앱 타입 아이콘 오버레이 */}
        <FastImage
          source={getAppTypeIcon(item.type)}
          style={{ width: 24, height: 24, position: 'absolute', top: 6, left: 6 }}
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>
      <Text numberOfLines={2} style={{ color: isDark ? '#fff' : '#111', marginTop: 6, fontWeight: 'bold' }}>{displayTitle}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
        <Text numberOfLines={1} style={{ color: '#aaa', fontSize: 13, flex: 1 }}>{item.artist || item.owner || ''}</Text>
        <TouchableOpacity style={{ marginHorizontal: 6 }}>
          {/* 하트 아이콘 자리 */}
        </TouchableOpacity>
        <TouchableOpacity>
          {/* 점 3개 아이콘 자리 */}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RecentTrackItem({ item }: { item: any }) {
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
        return null;
    }
  };
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#222' : '#eee',
      backgroundColor: 'transparent'
    }}>
      <View style={{ position: 'relative' }}>
        <FastImage
          source={{ uri: item.imageUrl || item.coverUrl || item.thumbnailUrl }}
          style={{ width: 48, height: 48, borderRadius: 6, backgroundColor: '#222' }}
          resizeMode={FastImage.resizeMode.cover}
        />
        {item.type && (
          <FastImage
            source={getAppTypeIcon(item.type)}
            style={{ width: 18, height: 18, position: 'absolute', top: 2, left: 2 }}
            resizeMode={FastImage.resizeMode.contain}
          />
        )}
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text numberOfLines={1} style={{ color: isDark ? '#FFFFFF' : '#222222', fontSize: 16, fontWeight: 'bold' }}>
          {item.title || item.name || '정보 없음'}
        </Text>
      </View>
      <TouchableOpacity style={{ marginHorizontal: 8 }}>
        {/* 하트 아이콘 자리 */}
      </TouchableOpacity>
      <TouchableOpacity>
        {/* 점 3개 아이콘 자리 */}
      </TouchableOpacity>
    </View>
  );
}

function RecentArtistItem({ item }: { item: any }) {
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
        return null;
    }
  };
  return (
    <View style={{ width: 140, alignItems: 'center', marginRight: 16 }}>
      <View style={{ position: 'relative' }}>
        <FastImage
          source={{ uri: item.thumbnailUrl || item.imageUrl || item.coverUrl || item.thumbnailUrl }}
          style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: '#222' }}
          resizeMode={FastImage.resizeMode.cover}
        />
        {item.type && (
          <FastImage
            source={getAppTypeIcon(item.type)}
            style={{ width: 24, height: 24, position: 'absolute', top: 6, left: 6 }}
            resizeMode={FastImage.resizeMode.contain}
          />
        )}
      </View>
      <Text
        numberOfLines={1}
        style={{
          color: isDark ? '#fff' : '#222',
          fontSize: 15,
          marginTop: 10,
          textAlign: 'center',
          width: 130,
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
      return resData.tracks || [];
    case 'recent_track':
      return resData.recentList || resData.tracks || [];
    case 'recent_artist':
      return (resData.artistDtos || []).map((item: any) => ({
        ...item,
        thumbnailUrl: Array.isArray(item.thumbnail) ? item.thumbnail[0] : item.thumbnail,
      }));
    case 'my_playlist':
      return (resData.data || resData.playlists || []).map((item: any) => ({
        ...item,
        thumbnailUrl:
          item.tracks && item.tracks.length > 0
            ? item.tracks[0].albumArt || item.tracks[0].cover || item.tracks[0].coverUrl || item.tracks[0].thumbnailUrl
            : item.thumbnailUrl || item.coverUrl || item.thumbnail,
      }));
    case 'rose_recommend':
      return (resData.recommends || []).map((item: any) => ({
        ...item.playlist,
        owner: item.playlist.ownerName,
        trackCount: item.playlist.trackCount,
        thumbnailUrl: item.playlist.thumbnail,
        type: item.playlist.type,
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
        tags: item.tags
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
      return [];
  }
};

// Helper to remove page/size from url
function removePageSizeParams(url: string) {
  const [base, query] = url.split('?');
  if (!query) return url;
  const params = query.split('&').filter(q => !q.startsWith('size=') && !q.startsWith('page='));
  return params.length > 0 ? `${base}?${params.join('&')}` : base;
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [recentTab, setRecentTab] = useState<'playlist' | 'album'>('album');
  const [recentPlaylist, setRecentPlaylist] = useState<any[]>([]);
  const [recentAlbum, setRecentAlbum] = useState<any[]>([]);
  const [recentYt, setRecentYt] = useState<any[]>([]);
  const [recentTrack, setRecentTrack] = useState<any[]>([]);
  const [recentArtist, setRecentArtist] = useState<any[]>([]);
  const [myPlaylist, setMyPlaylist] = useState<any[]>([]);
  const [roseRecommend, setRoseRecommend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation() as any;
  const [recentAlbumTotal, setRecentAlbumTotal] = useState(0);
  const [recentPlaylistTotal, setRecentPlaylistTotal] = useState(0);
  const [recentYtTotal, setRecentYtTotal] = useState(0);
  const [recentTrackTotal, setRecentTrackTotal] = useState(0);
  const [recentArtistTotal, setRecentArtistTotal] = useState(0);
  const [myPlaylistTotal, setMyPlaylistTotal] = useState(0);
  const [roseRecommendTotal, setRoseRecommendTotal] = useState(0);
  const [latestPlaylist, setLatestPlaylist] = useState<any[]>([]);
  const [popularPlaylist, setPopularPlaylist] = useState<any[]>([]);
  const [latestPlaylistTotal, setLatestPlaylistTotal] = useState(0);
  const [popularPlaylistTotal, setPopularPlaylistTotal] = useState(0);

  const fetchRecent = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('accessToken');
    try {
      const [playlistRes, albumRes, ytRes, trackRes, artistRes, myPlaylistRes, roseRecommendRes, latestPlaylistRes, popularPlaylistRes] = await Promise.all([
        axios.get(RECENT_PLAYLIST_URL, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(RECENT_ALBUM_URL, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(SECTION_LIST[1].url!, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(RECENT_TRACK_URL, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(RECENT_ARTIST_URL, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(MY_PLAYLIST_URL, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(ROSE_RECOMMEND_URL, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(LATEST_PLAYLIST_URL, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(POPULAR_PLAYLIST_URL, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      setRecentPlaylist(getListFromResponse('recent_playlist', playlistRes.data));
      setRecentAlbum(getListFromResponse('recent_album', albumRes.data));
      setRecentYt(getListFromResponse('recent_yt', ytRes.data));
      setRecentTrack(getListFromResponse('recent_track', trackRes.data));
      setRecentArtist(getListFromResponse('recent_artist', artistRes.data));
      setMyPlaylist(getListFromResponse('my_playlist', myPlaylistRes.data));
      setRoseRecommend(getListFromResponse('rose_recommend', roseRecommendRes.data));
      setLatestPlaylist(getListFromResponse('latest_playlist', latestPlaylistRes.data));
      setLatestPlaylistTotal(latestPlaylistRes.data.playlists?.length || 0);
      setRecentAlbumTotal(albumRes.data.totalCount || (albumRes.data.recentList ? albumRes.data.recentList.length : 0));
      setRecentPlaylistTotal(playlistRes.data.totalCount || (playlistRes.data.recentList ? playlistRes.data.recentList.length : 0));
      setRecentYtTotal(ytRes.data.totalCount || (ytRes.data.tracks ? ytRes.data.tracks.length : 0));
      setRecentTrackTotal(trackRes.data.totalCount || (trackRes.data.tracks ? trackRes.data.tracks.length : 0));
      setRecentArtistTotal(artistRes.data.totalCount || (artistRes.data.artistDtos ? artistRes.data.artistDtos.length : 0));
      setMyPlaylistTotal(myPlaylistRes.data.totalCount || (myPlaylistRes.data.playlists ? myPlaylistRes.data.playlists.length : 0));
      setRoseRecommendTotal(roseRecommendRes.data.totalCount || (roseRecommendRes.data.recommends ? roseRecommendRes.data.recommends.length : 0));
      setPopularPlaylist(getListFromResponse('popular_playlist', popularPlaylistRes.data));
      setPopularPlaylistTotal(popularPlaylistRes.data.totalCount || 0);
    } catch {
      setRecentPlaylist([]);
      setRecentAlbum([]);
      setRecentYt([]);
      setRecentTrack([]);
      setRecentArtist([]);
      setMyPlaylist([]);
      setRoseRecommend([]);
      setRecentAlbumTotal(0);
      setRecentPlaylistTotal(0);
      setRecentYtTotal(0);
      setRecentTrackTotal(0);
      setRecentArtistTotal(0);
      setMyPlaylistTotal(0);
      setRoseRecommendTotal(0);
      setLatestPlaylist([]);
      setLatestPlaylistTotal(0);
      setPopularPlaylist([]);
      setPopularPlaylistTotal(0);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    // 초기 데이터가 없을 때만 fetch
    if (recentPlaylist.length === 0 && 
        recentAlbum.length === 0 && 
        recentYt.length === 0 && 
        recentTrack.length === 0 && 
        recentArtist.length === 0 && 
        myPlaylist.length === 0 && 
        roseRecommend.length === 0) {
      fetchRecent();
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // 데이터가 없을 때만 fetch
      if (recentPlaylist.length === 0 && 
          recentAlbum.length === 0 && 
          recentYt.length === 0 && 
          recentTrack.length === 0 && 
          recentArtist.length === 0 && 
          myPlaylist.length === 0 && 
          roseRecommend.length === 0) {
        fetchRecent();
      }
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecent();
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
        {/* 최근 재생 (앨범/플레이리스트 탭) */}
        <View style={{ marginTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
              <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 22, fontWeight: 'bold' }}>
                최근 재생
              </Text>
              <View style={{ flexDirection: 'row', marginTop: 6 }}>
                <TouchableOpacity onPress={() => setRecentTab('album')}>
                  <Text style={{ color: recentTab === 'album' ? isDark ? '#fff' : '#000' : isDark ? '#aaa' : '#000', fontWeight: recentTab === 'album' ? 'bold' : 'normal', fontSize: 16 }}>앨범</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setRecentTab('playlist')} style={{ marginLeft: 12 }}>
                  <Text style={{ color: recentTab === 'playlist' ? isDark ? '#fff' : '#000' : isDark ? '#aaa' : '#000', fontWeight: recentTab === 'playlist' ? 'bold' : 'normal', fontSize: 16 }}>플레이리스트</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('DetailScreen', { sectionKey: recentTab === 'album' ? 'recent_album' : 'recent_playlist', title: recentTab === 'album' ? '최근 재생 앨범' : '최근 재생 플레이리스트', apiUrl: removePageSizeParams(recentTab === 'album' ? RECENT_ALBUM_URL : RECENT_PLAYLIST_URL) })}>
              <Text style={{ color: '#4faaff' }}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentTab === 'album' ? (
            recentAlbum.length === 0 ? (
              <ActivityIndicator size="small" color={isDark ? "#fff" : "#000"} style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={recentAlbum}
                horizontal
                keyExtractor={item => item.id?.toString() || item.key || Math.random().toString()}
                renderItem={({ item }) => <RecentItem item={item} type="album" />}
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 12, paddingLeft: 16 }}
              />
            )
          ) : (
            recentPlaylist.length === 0 ? (
              <ActivityIndicator size="small" color={isDark ? "#fff" : "#000"} style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={recentPlaylist}
                horizontal
                keyExtractor={item => item.id?.toString() || item.key || Math.random().toString()}
                renderItem={({ item }) => <RecentItem item={item} type="playlist" />}
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 12, paddingLeft: 16 }}
              />
            )
          )}
        </View>

        {/* 최근 재생 로즈튜브 */}
        <View style={{ marginTop: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 20, fontWeight: 'bold' }}>최근 재생 로즈튜브{recentYtTotal ? ` (${recentYtTotal})` : ''}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DetailScreen', { sectionKey: 'recent_yt', title: '최근 재생 로즈튜브', apiUrl: removePageSizeParams(SECTION_LIST[1].url || '') })}>
              <Text style={{ color: '#4faaff' }}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentYt.length === 0 ? (
            <ActivityIndicator size="small" color={isDark ? "#fff" : "#000"} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={recentYt}
              horizontal
              keyExtractor={item => item.id?.toString() || item.key || Math.random().toString()}
              renderItem={({ item }) => <RoseTubeItem item={item} />}
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 12, paddingLeft: 16 }}
            />
          )}
        </View>

        {/* 최근 재생 트랙 */}
        <View style={{ marginTop: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 20, fontWeight: 'bold' }}>최근 재생 트랙{recentTrackTotal ? ` (${recentTrackTotal})` : ''}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DetailScreen', { sectionKey: 'recent_track', title: '최근 재생 트랙', apiUrl: removePageSizeParams(RECENT_TRACK_URL) })}>
              <Text style={{ color: '#4faaff' }}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentTrack.slice(0, 5)}
            keyExtractor={item => item.id?.toString() || item.key || Math.random().toString()}
            renderItem={({ item }) => <RecentTrackItem item={item} />}
            style={{ marginTop: 12 }}
            scrollEnabled={false}
          />
        </View>

        {/* 최근 재생 아티스트 */}
        <View style={{ marginTop: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 20, fontWeight: 'bold' }}>최근 재생 아티스트{recentArtistTotal ? ` (${recentArtistTotal})` : ''}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DetailScreen', { sectionKey: 'recent_artist', title: '최근 재생 아티스트', apiUrl: removePageSizeParams(RECENT_ARTIST_URL) })}>
              <Text style={{ color: '#4faaff' }}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentArtist}
            horizontal
            keyExtractor={item => item.id?.toString() || item.key || Math.random().toString()}
            renderItem={({ item }) => <RecentArtistItem item={item} />}
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 12, paddingLeft: 16 }}
          />
        </View>

        {/* My 플레이리스트 */}
        <View style={{ marginTop: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 20, fontWeight: 'bold' }}>My 플레이리스트{myPlaylistTotal ? ` (${myPlaylistTotal})` : ''}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DetailScreen', { sectionKey: 'my_playlist', title: 'My 플레이리스트', apiUrl: removePageSizeParams(MY_PLAYLIST_URL), data: myPlaylist })}>
              <Text style={{ color: '#4faaff' }}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={myPlaylist}
            horizontal
            keyExtractor={item => item.id?.toString() || item.key || Math.random().toString()}
            renderItem={({ item }) => <RecentItem item={item} type="playlist" />}
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 12, paddingLeft: 16 }}
          />
        </View>

        {/* 로즈 추천 플레이리스트 */}
        <View style={{ marginTop: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 20, fontWeight: 'bold' }}>로즈 추천 플레이리스트{roseRecommendTotal ? ` (${roseRecommendTotal})` : ''}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DetailScreen', { sectionKey: 'rose_recommend', title: '로즈 추천 플레이리스트', apiUrl: removePageSizeParams(ROSE_RECOMMEND_URL), data: roseRecommend })}>
              <Text style={{ color: '#4faaff' }}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={roseRecommend}
            horizontal
            keyExtractor={item => item.id?.toString() || item.key || Math.random().toString()}
            renderItem={({ item }) => <RecentItem item={item} type="playlist" />}
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 12, paddingLeft: 16 }}
          />
        </View>

        {/* 최신 플레이리스트 */}
        <View style={{ marginTop: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 20, fontWeight: 'bold' }}>최신 플레이리스트{latestPlaylistTotal ? ` (${latestPlaylistTotal})` : ''}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DetailScreen', { sectionKey: 'latest_playlist', title: '최신 플레이리스트', apiUrl: removePageSizeParams(LATEST_PLAYLIST_URL) })}>
              <Text style={{ color: '#4faaff' }}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={latestPlaylist}
            horizontal
            keyExtractor={item => item.id?.toString() || item.key || Math.random().toString()}
            renderItem={({ item }) => <RecentItem item={item} type="playlist" />}
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 12, paddingLeft: 16 }}
          />
        </View>

        {/* 인기 플레이리스트 */}
        <View style={{ marginTop: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 20, fontWeight: 'bold' }}>인기 플레이리스트{popularPlaylistTotal ? ` (${popularPlaylistTotal})` : ''}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DetailScreen', { sectionKey: 'popular_playlist', title: '인기 플레이리스트', apiUrl: removePageSizeParams(POPULAR_PLAYLIST_URL) })}>
              <Text style={{ color: '#4faaff' }}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={popularPlaylist}
            horizontal
            keyExtractor={item => item.id?.toString() || item.key || Math.random().toString()}
            renderItem={({ item }) => <RecentItem item={item} type="playlist" />}
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 12, paddingLeft: 16 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
