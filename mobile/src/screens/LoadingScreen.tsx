/**
 * Loading Screen for SmartTask Mobile
 * Displays while the app is initializing authentication state
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SmartTask</Text>
      <ActivityIndicator size="large" color="#007AFF" style={styles.spinner} />
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 32,
  },
  spinner: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
