import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { useTheme } from '../ThemeContext';

export default function HomeScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000000' : '#FFFFFF' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: isDark ? '#FFFFFF' : '#000000' }}>홈 화면</Text>
      </View>
    </SafeAreaView>
  );
}
