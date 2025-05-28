/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import HomeScreen from './screens/HomeScreen';
import RadioScreen from './screens/RadioScreen';
import SymphonyScreen from './screens/SymphonyScreen';
import SettingsScreen from './screens/SettingsScreen';
import styles from './styles';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

interface Album {
  id: number;
  title: string;
  cover_medium: string;
  artist: {
    name: string;
  };
  album?: {
    cover_medium: string;
  };
  preview?: string;
  duration?: number;
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF3B30',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          height: 83,
          paddingBottom: 20,
          paddingTop: 10,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: '#C6C6C8',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/icons/main_ico_home.png')}
              style={{ width: 24, height: 24, tintColor: focused ? '#FF3B30' : '#8E8E93' }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Radio"
        component={RadioScreen}
        options={{
          tabBarLabel: '라디오',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/icons/main_ico_rad.png')}
              style={{ width: 24, height: 24, tintColor: focused ? '#FF3B30' : '#8E8E93' }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Symphony"
        component={SymphonyScreen}
        options={{
          tabBarLabel: '심포니',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/icons/main_ico_symphony.png')}
              style={{ width: 24, height: 24, tintColor: focused ? '#FF3B30' : '#8E8E93' }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: '설정',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/icons/main_ico_set.png')}
              style={{ width: 24, height: 24, tintColor: focused ? '#FF3B30' : '#8E8E93' }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AlbumDetailScreen({ route }: any) {
  const { album } = route.params;
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ alignItems: 'center', marginTop: 32 }}>
        <Image
          source={{ uri: album.album?.cover_medium || album.cover_medium }}
          style={{ width: 200, height: 200, borderRadius: 8 }}
        />
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 16 }}>{album.title}</Text>
        <Text style={{ fontSize: 18, color: '#666', marginTop: 8 }}>{album.artist.name}</Text>
        {album.duration && (
          <Text style={{ fontSize: 16, color: '#666', marginTop: 8 }}>
            Duration: {Math.floor(album.duration / 60)}:{(album.duration % 60).toString().padStart(2, '0')}
          </Text>
        )}
        {album.preview && (
          <Text style={{ fontSize: 16, color: '#666', marginTop: 8 }}>
            Preview available
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AlbumDetail"
          component={AlbumDetailScreen}
          options={{
            title: 'Album Detail',
            headerStyle: {
              backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
