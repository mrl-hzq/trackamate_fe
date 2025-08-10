// components/PageWrapper.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { removeToken } from '../../src/utils/auth';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await removeToken();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.username}>Hi, John Doe</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ffff" />
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.content}>{children}</View>

      {/* Bottom Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <Ionicons name="home" size={24} color="#38bdf8" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/finance')}>
          <Ionicons name="cash" size={24} color="#94a3b8" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/food')}>
          <Ionicons name="fast-food" size={24} color="#94a3b8" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/health')}>
          <Ionicons name="fitness" size={24} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e293b' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
  },
  username: { 
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: { flex: 1, padding: 10 },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderTopWidth: 0.5,
    borderTopColor: '#334155',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
});
