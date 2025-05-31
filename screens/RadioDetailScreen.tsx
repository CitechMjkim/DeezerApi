import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import styles from '../styles';
import { useTheme } from '../ThemeContext';
import FastImage from 'react-native-fast-image';

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

export default function RadioScreen() {
  const [channels, setChannels] = useState<[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const fetchChannels = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('Fetching channels with token:', token ? 'Token exists' : 'No token');
      
      const response = await axios.get(
        'https://api.roseaudio.kr/radio/v2/my/recent?page=0&size=30',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'If-None-Match': '*',
            'User-Agent': 'android-com.citech.rosepremium.remote.beta-5.2.01.5',
            'Accept-Language': 'ko_KR',
          }
        }
      );
      
      console.log('API Response:', response.data);
      const radioChannels = response.data?.radioChannels || [];
      console.log('Parsed channels:', radioChannels.length);
      
      if (radioChannels.length > 0) {
        console.log('mjkim   Radio channels:', radioChannels);
        setChannels(radioChannels);
        console.log('Channels updated successfully');
      } else {
        console.log('No channels received from API');
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      setChannels([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchChannels();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchChannels();
  }, []);

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
      {loading ? (
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
        />
      )}
    </SafeAreaView>
  );
}