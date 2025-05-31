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
import SearchScreen from './screens/SearchScreen';
import RadioScreen from './screens/RadioScreen';
import SymphonyScreen from './screens/SymphonyScreen';
import ClassicScreen from './screens/ClassicScreen';
import SettingsScreen from './screens/SettingsScreen';
import AlbumDetailScreen from './screens/AlbumDetailScreen';
import ClassicCategoryViewAllScreen from './screens/ClassicCategoryViewAllScreen';
import ClassicAlbumDetailScreen from './screens/ClassicAlbumDetailScreen';
import styles from './styles';
import { ThemeProvider, useTheme } from './ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF3B30',
        tabBarInactiveTintColor: isDark ? '#666666' : '#8E8E93',
        tabBarStyle: {
          height: 83,
          paddingBottom: 20,
          paddingTop: 10,
          backgroundColor: isDark ? '#000000' : '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: isDark ? '#333333' : '#C6C6C8',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
          color: isDark ? '#FFFFFF' : '#000000',
        },
        headerStyle: {
          backgroundColor: isDark ? '#000000' : '#FFFFFF',
        },
        headerTintColor: isDark ? '#FFFFFF' : '#000000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          headerTitle: '홈',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/icons/main_ico_home.png')}
              style={{ width: 24, height: 24, tintColor: focused ? '#FF3B30' : (isDark ? '#666666' : '#8E8E93') }}
              resizeMode="contain"
            />
          ),
        }}
      />
       <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: '검색',
          headerTitle: '검색',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/icons/search_ico.png')}
              style={{ width: 24, height: 24, tintColor: focused ? '#FF3B30' : (isDark ? '#666666' : '#8E8E93') }}
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
          headerTitle: '라디오',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/icons/main_ico_rad.png')}
              style={{ width: 24, height: 24, tintColor: focused ? '#FF3B30' : (isDark ? '#666666' : '#8E8E93') }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Classic"
        component={ClassicScreen}
        options={{
          tabBarLabel: '클래식',
          headerTitle: '클래식',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/icons/main_ico_tidal.png')}
              style={{ width: 24, height: 24, tintColor: focused ? '#FF3B30' : (isDark ? '#666666' : '#8E8E93') }}
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
          headerTitle: '심포니',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/icons/main_ico_symphony.png')}
              style={{ width: 24, height: 24, tintColor: focused ? '#FF3B30' : (isDark ? '#666666' : '#8E8E93') }}
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
          headerTitle: '설정',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/icons/main_ico_set.png')}
              style={{ width: 24, height: 24, tintColor: focused ? '#FF3B30' : (isDark ? '#666666' : '#8E8E93') }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#000000" : "#FFFFFF"}
      />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AlbumDetail"
          component={AlbumDetailScreen as React.ComponentType<any>}
          options={{
            title: 'Album Detail',
          }}
        />
        <Stack.Screen
          name="ClassicCategoryViewAll"
          component={ClassicCategoryViewAllScreen as React.ComponentType<any>}
          options={{
            title: '카테고리 전체보기',
          }}
        />
        <Stack.Screen
          name="ClassicAlbumDetail"
          component={ClassicAlbumDetailScreen as React.ComponentType<any>}
          options={{
            title: '클래식 앨범 상세',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
