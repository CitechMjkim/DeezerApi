import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

interface Track {
  id: number;
  title: string;
  duration: number;
}

interface Album {
  id: number;
  title: string;
  cover_medium: string;
  artist: {
    name: string;
  };
}

// Define the navigation stack param list
export type RootStackParamList = {
  MainTabs: undefined;
  AlbumDetail: { album: Album };
};

type Props = NativeStackScreenProps<RootStackParamList, 'AlbumDetail'>;

export default function AlbumDetailScreen({ route }: Props) {
  const { album } = route.params;
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await axios.get(`https://api.deezer.com/album/${album.id}`);
        setTracks(res.data.tracks.data);
      } catch (e) {
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, [album.id]);

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ alignItems: 'center', margin: 0, padding: 0 }}>
        <Image
          source={{ uri: album.cover_medium }}
          style={{ width: '100%', height: 300, borderRadius: 0 }}
          resizeMode="cover"
        />
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 16 }}>{album.title}</Text>
        <Text style={{ fontSize: 16, color: '#666', marginTop: 4 }}>{album.artist.name}</Text>
      </View>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 16, marginBottom: 8, marginTop: 16 }}>트랙리스트</Text>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item, index }: { item: Track; index: number }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
              <Text style={{ width: 32, color: '#888' }}>{index + 1}</Text>
              <Text style={{ flex: 1 }}>{item.title}</Text>
              <Text style={{ color: '#888' }}>{Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}</Text>
            </View>
          )}
        />
      )}
    </ScrollView>
  );
} 