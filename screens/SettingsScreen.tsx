import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, Modal, TextInput, Button, Alert } from 'react-native';
import styles from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { sha1 } from '../common/utils';
import { setupApiInterceptors } from '../common/ApiGenerator';

// 인터셉터 1회만 등록
setupApiInterceptors();

export default function SettingsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('userEmail').then(setUserEmail);
  }, [modalVisible]); // 로그인/로그아웃 후 갱신

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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenTitle}>설정</Text>
      <View style={{ marginTop: 32 }}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={userEmail ? handleLogout : () => setModalVisible(true)}
        >
          <Text style={styles.menuText}>
            {userEmail ? `로그아웃     (${userEmail})` : '로그인'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>언어 설정</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>테마 설정</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>기기 설정</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: '#fff', padding: 24, borderRadius: 8, width: '80%'
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>로그인</Text>
            <TextInput
              placeholder="이메일"
              value={email}
              onChangeText={setEmail}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 12, padding: 8 }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 12, padding: 8 }}
              
            />
            <Button title={loading ? '로그인 중...' : '로그인'} onPress={handleLogin} disabled={loading} />
            <Button title="취소" onPress={() => setModalVisible(false)} color="#888" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 