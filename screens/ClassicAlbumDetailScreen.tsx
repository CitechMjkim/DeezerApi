import React, { useLayoutEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ClassicAlbumDetailScreen = () => {
  const route = useRoute();
  const navigation: any = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // @ts-ignore
  const { album } = route.params;

  // 앱바 타이틀을 앨범명으로 설정
  useLayoutEffect(() => {
    navigation.setOptions({ title: album.title });
  }, [navigation, album.title]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}>
      <View style={styles.container}>
        <Image
          source={{ uri: album.applemusic_thumbnail || album.tidal_thumbnail || album.qobuz_thumbnail || 'https://example.com/default-cover.jpg' }}
          style={styles.cover}
          defaultSource={require('../assets/icons/main_ico_cd.png')}
        />
        <Text style={[styles.title, { color: isDark ? '#fff' : '#222' }]}>{album.title}</Text>
        <Text style={[styles.artist, { color: isDark ? '#bbb' : '#444' }]}>{album.artist}</Text>
        {album.desc && <Text style={[styles.desc, { color: isDark ? '#ccc' : '#666' }]}>{album.desc}</Text>}
        {/* 필요시 추가 정보 표시 */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
  },
  cover: {
    width: SCREEN_WIDTH - 48,
    height: (SCREEN_WIDTH - 48) * 0.75, // 4:3 비율
    borderRadius: 12,
    backgroundColor: '#222',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  artist: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ClassicAlbumDetailScreen; 