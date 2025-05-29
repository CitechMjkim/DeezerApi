import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, ActivityIndicator, FlatList, View, Image, RefreshControl } from 'react-native';
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