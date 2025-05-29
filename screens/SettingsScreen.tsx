import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, Modal, TextInput, Button, Alert, Switch, StatusBar } from 'react-native';
import styles from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { sha1 } from '../common/utils';
import { setupApiInterceptors } from '../common/ApiGenerator';
import { useTheme } from '../ThemeContext';

interface DeviceInfo {
  deviceID: string;
  deviceRoseToken: string;
  deviceType: string;
  deviceIP: string;
  deviceName: string;
}

// 인터셉터 1회만 등록
setupApiInterceptors();

export default function SettingsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [deviceModalVisible, setDeviceModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceIP, setDeviceIP] = useState('192.168.2.188');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    AsyncStorage.getItem('userEmail').then(setUserEmail);
    // 저장된 기기 정보 불러오기
    AsyncStorage.getItem('deviceInfo').then((info) => {
      if (info) {
        setDeviceInfo(JSON.parse(info));
      }
    });
  }, [modalVisible]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const hashedPassword = sha1(password);
      const response = await axios.post('https://api.roseaudio.kr/v1/member/member/login', {
        email: email,
        password: hashedPassword,
        roseId: null,
      });
      const resData = response.data;
      const data = resData?.data ? resData.data : resData;
      if (data?.accessToken && data?.refreshToken && data?.email && data?.userName) {
        await AsyncStorage.multiSet([
          ['accessToken', data.accessToken],
          ['refreshToken', data.refreshToken],
          ['userEmail', data.email],
          ['userName', data.userName],
        ]);
        Alert.alert('로그인 성공', '토큰과 사용자 정보가 저장되었습니다.');
        setModalVisible(false);
        setEmail('');
        setPassword('');
        setUserEmail(data.email);
      } else {
        Alert.alert('로그인 실패', '필요한 정보를 받지 못했습니다.');
      }
    } catch (e) {
      Alert.alert('로그인 실패', '이메일 또는 비밀번호를 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userEmail', 'userName']);
    setUserEmail(null);
    Alert.alert('로그아웃', '로그아웃 되었습니다.');
  };

  const handleDeviceConnect = async () => {
    if (!deviceIP) {
      Alert.alert('오류', 'IP 주소를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`http://${deviceIP}:9283/device_connected`, {
        connectIP: deviceIP
      }, {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        }
      });
      console.log("mjkim >>> ", response.data);
      const deviceData: DeviceInfo = response.data.data;
      console.log("mjkim >>> ", deviceData);
      // 기기 정보 저장
      await AsyncStorage.setItem('deviceInfo', JSON.stringify(deviceData));
      setDeviceInfo(deviceData);
      
      Alert.alert('연결 성공', '기기가 연결되었습니다.');
      setDeviceModalVisible(false);
    } catch (error) {
      Alert.alert('연결 실패', '기기 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceDisconnect = async () => {
    await AsyncStorage.removeItem('deviceInfo');
    setDeviceInfo(null);
    Alert.alert('연결 해제', '기기 연결이 해제되었습니다.');
  };

  const handleClearCache = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('search_'));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        Alert.alert('완료', '오프라인(캐시) 데이터가 삭제되었습니다.');
      } else {
        Alert.alert('알림', '삭제할 캐시 데이터가 없습니다.');
      }
    } catch (e) {
      Alert.alert('오류', '캐시 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && { backgroundColor: '#000000' }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#000000" : "#FFFFFF"}
      />
      <View style={{ marginTop: 32 }}>
      <TouchableOpacity 
          style={[styles.menuItem, isDark && { backgroundColor: '#1C1C1E', borderBottomColor: '#2C2C2E' }]}
          onPress={deviceInfo ? handleDeviceDisconnect : () => setDeviceModalVisible(true)}
        >
          <Text style={[styles.menuText, isDark && { color: '#FFFFFF' }]}>
            {deviceInfo ? `기기 연결 해제    \n [${deviceInfo.deviceIP} ]   [ ${deviceInfo.deviceName} ]` : '기기 설정'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuItem, isDark && { backgroundColor: '#1C1C1E', borderBottomColor: '#2C2C2E' }]}
          onPress={userEmail ? handleLogout : () => setModalVisible(true)}
        >
          <Text style={[styles.menuText, isDark && { color: '#FFFFFF' }]}>
            {userEmail ? `로그아웃     (${userEmail})` : '로그인'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.menuItem, isDark && { backgroundColor: '#1C1C1E', borderBottomColor: '#2C2C2E' }]}
        >
          <Text style={[styles.menuText, isDark && { color: '#FFFFFF' }]}>언어 설정</Text>
        </TouchableOpacity>
        <View 
          style={[
            styles.menuItem, 
            isDark && { backgroundColor: '#1C1C1E', borderBottomColor: '#2C2C2E' },
            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }
          ]}
        >
          <Text style={[styles.menuText, isDark && { color: '#FFFFFF' }]}>테마 설정</Text>
          <Switch 
            value={theme === 'dark'} 
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={theme === 'dark' ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
        <TouchableOpacity
          style={[styles.menuItem, isDark && { backgroundColor: '#1C1C1E', borderBottomColor: '#2C2C2E' }]}
          onPress={handleClearCache}
        >
          <Text style={[styles.menuText, isDark && { color: '#FFFFFF' }]}>오프라인 데이터 삭제</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            padding: 24,
            borderRadius: 8,
            width: '80%'
          }}>
            <Text style={[
              { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
              isDark && { color: '#FFFFFF' }
            ]}>로그인</Text>
            <TextInput
              placeholder="이메일"
              placeholderTextColor={isDark ? '#666666' : '#999999'}
              value={email}
              onChangeText={setEmail}
              style={[
                { 
                  borderWidth: 1,
                  borderRadius: 6,
                  marginBottom: 12,
                  padding: 8
                },
                isDark ? {
                  backgroundColor: '#2C2C2E',
                  borderColor: '#3C3C3E',
                  color: '#FFFFFF'
                } : {
                  borderColor: '#ccc',
                  color: '#000000'
                }
              ]}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              placeholder="비밀번호"
              placeholderTextColor={isDark ? '#666666' : '#999999'}
              value={password}
              onChangeText={setPassword}
              style={[
                { 
                  borderWidth: 1,
                  borderRadius: 6,
                  marginBottom: 12,
                  padding: 8
                },
                isDark ? {
                  backgroundColor: '#2C2C2E',
                  borderColor: '#3C3C3E',
                  color: '#FFFFFF'
                } : {
                  borderColor: '#ccc',
                  color: '#000000'
                }
              ]}
              secureTextEntry
            />
            <Button 
              title={loading ? '로그인 중...' : '로그인'} 
              onPress={handleLogin} 
              disabled={loading}
              color={isDark ? '#81b0ff' : '#007AFF'}
            />
            <Button 
              title="취소" 
              onPress={() => setModalVisible(false)} 
              color={isDark ? '#666666' : '#888'}
            />
          </View>
        </View>
      </Modal>
      <Modal visible={deviceModalVisible} transparent animationType="slide">
        <View style={{
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            padding: 24,
            borderRadius: 8,
            width: '80%'
          }}>
            <Text style={[
              { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
              isDark && { color: '#FFFFFF' }
            ]}>기기 연결</Text>
            <TextInput
              placeholder="IP 주소 입력"
              placeholderTextColor={isDark ? '#666666' : '#999999'}
              value={deviceIP}
              onChangeText={setDeviceIP}
              style={[
                { 
                  borderWidth: 1,
                  borderRadius: 6,
                  marginBottom: 12,
                  padding: 8
                },
                isDark ? {
                  backgroundColor: '#2C2C2E',
                  borderColor: '#3C3C3E',
                  color: '#FFFFFF'
                } : {
                  borderColor: '#ccc',
                  color: '#000000'
                }
              ]}
              keyboardType="numeric"
            />
            <Button 
              title={loading ? '연결 중...' : '연결'} 
              onPress={handleDeviceConnect} 
              disabled={loading}
              color={isDark ? '#81b0ff' : '#007AFF'}
            />
            <Button 
              title="취소" 
              onPress={() => {
                setDeviceModalVisible(false);
              }} 
              color={isDark ? '#666666' : '#888'}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 