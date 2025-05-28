import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, ActivityIndicator, FlatList, View, Image } from 'react-native';
import styles from '../styles';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';

interface RadioChannelData {
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
  genres?: any[];
  regions?: any[];
  languages?: any[];
}

export default function RadioScreen() {
  const [channels, setChannels] = useState<RadioChannelData[]>([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('accessToken');
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
        const radioChannels = response.data?.radioChannels || [];
        setChannels(radioChannels);
      } catch (error) {
        setChannels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, []);

  const renderItem = ({ item }: { item: RadioChannelData }) => (
    <View
      style={[
        styles.menuItem,
        { flexDirection: 'row', alignItems: 'center' },
        isDark && { backgroundColor: '#1C1C1E', borderBottomColor: '#2C2C2E' }
      ]}
    >
      <Image
        source={
          item.imageUrl
            ? { uri: item.imageUrl }
            : require('../assets/icons/main_ico_fm.png')
        }
        style={{ width: 48, height: 48, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' }}
        resizeMode="cover"
      />
      <Text style={[styles.menuText, isDark && { color: '#FFFFFF' }]}>{item.title}</Text>
    </View>
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
        />
      )}
    </SafeAreaView>
  );
}