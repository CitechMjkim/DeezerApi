import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import styles from '../styles';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenTitle}>설정</Text>
    </SafeAreaView>
  );
} 