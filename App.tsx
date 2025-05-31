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
  View,
  Platform
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
import RadioDetailScreen from './screens/RadioDetailScreen';
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

function TabNavigator({ setTabTitle }: { setTabTitle: (title: string) => void }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [initialRouteName, setInitialRouteName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load last selected tab
    const loadLastTab = async () => {
      try {
        const lastTab = await AsyncStorage.getItem('lastSelectedTab');
        setInitialRouteName(lastTab || 'Home');
        setTabTitle(tabNameToTitle(lastTab || 'Home'));
      } catch (error) {
        console.error('Error loading last tab:', error);
        setInitialRouteName('Home');
        setTabTitle('홈');
      } finally {
        setIsLoading(false);
      }
    };
    loadLastTab();
  }, [setTabTitle]);

  // 탭 이름을 한글 타이틀로 변환
  const tabNameToTitle = (name: string) => {
    switch (name) {
      case 'Home': return '홈';
      case 'Radio': return '라디오';
      case 'Classic': return '클래식';
      case 'Search': return '검색';
      case 'Symphony': return '심포니';
      case 'Settings': return '설정';
      default: return name;
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000' : '#fff' }}>
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
      </View>
    );
  }

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName || undefined}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#000' : '#fff',
          borderTopColor: isDark ? '#333' : '#eee',
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        },
        tabBarActiveTintColor: '#4faaff',
        tabBarInactiveTintColor: isDark ? '#666' : '#999',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
      screenListeners={{
        state: (e) => {
          const currentRoute = e.data.state.routes[e.data.state.index];
          AsyncStorage.setItem('lastTab', currentRoute.name);
          setTabTitle(tabNameToTitle(currentRoute.name));
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
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: '검색',
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
        name="Symphony"
        component={SymphonyScreen}
        options={{
          tabBarLabel: '심포니',
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
  const [tabTitle, setTabTitle] = useState('홈');

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
            fontSize: 20,
          },
          headerTitle: tabTitle,
          headerRight: () => (
            <TouchableOpacity onPress={() => { /* 원하는 동작 추가 */ }}>
              <Image
                source={require('./assets/icons/device.png')}
                style={{ width: 24, height: 24, marginRight: 16, tintColor: isDark ? '#fff' : '#222' }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ),
        }}
      >
        <Stack.Screen
          name="MainTabs"
          options={{ headerTitle: tabTitle }}
          children={() => <TabNavigator setTabTitle={setTabTitle} />}
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
        <Stack.Screen
          name="RadioDetailScreen"
          component={RadioDetailScreen}
          options={{ headerTitle: '라디오 채널' }}
        />
        <Stack.Screen
          name="DetailScreen"
          component={require('./screens/DetailScreen').default}
          options={{
            title: '상세보기',
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
