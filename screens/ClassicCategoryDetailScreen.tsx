import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const ClassicCategoryDetailScreen = () => {
  const route = useRoute();
  const navigation: any = useNavigation();
  // @ts-ignore
  const { category } = route.params as { category: ClassicMenuData };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }}>
      <Text style={styles.sectionTitle}>{category.name || '카테고리'}</Text>
      <View style={styles.gridContainer}>
        {category.items && category.items.map((item: ClassicItem, idx: number) => (
          <TouchableOpacity
            key={item.applemusic_id || item.tidal_id || item.qobuz_id || idx}
            style={styles.albumCard43}
            onPress={() => navigation.navigate('ClassicAlbumDetail', { album: item })}
          >
            <Image
              source={{ uri: item.applemusic_thumbnail || item.tidal_thumbnail || item.qobuz_thumbnail || 'https://example.com/default-cover.jpg' }}
              style={styles.albumCover43}
              defaultSource={require('../assets/icons/main_ico_cd.png')}
            />
            <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.artistName} numberOfLines={1}>{item.artist}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
  },
  albumCard43: {
    width: (SCREEN_WIDTH - 48) / 2,
    margin: 8,
    alignItems: 'center',
  },
  albumCover43: {
    width: (SCREEN_WIDTH - 48) / 2,
    height: ((SCREEN_WIDTH - 48) / 2) * 0.75, // 4:3 비율
    borderRadius: 8,
    backgroundColor: '#222',
    marginBottom: 8,
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
    width: '100%',
    textAlign: 'center',
  },
  artistName: {
    fontSize: 12,
    color: '#bbb',
    width: '100%',
    textAlign: 'center',
  },
});

export default ClassicCategoryDetailScreen; 