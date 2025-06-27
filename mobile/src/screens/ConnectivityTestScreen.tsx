import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/apiService';
import { BACKEND_URLS } from '../utils/config';

interface TestResult {
  url: string;
  success: boolean;
  responseTime?: number;
  error?: string;
  status?: number;
  data?: any;
}

export default function ConnectivityTestScreen({ navigation }: any) {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runConnectivityTests = async () => {
    setTesting(true);
    setResults([]);

    try {
      console.log('Starting comprehensive connectivity tests...');
      
      // Test all possible URLs
      console.log('Testing all possible backend URLs...');
      const urlTest = await apiService.findWorkingBaseUrl();
      
      setResults(urlTest.results);
      
      if (urlTest.success) {
        Alert.alert(
          'Success!',
          `Found working backend at:\n${urlTest.workingUrl}\n\nResponse time: ${urlTest.results[0]?.responseTime}ms`
        );
      } else {
        Alert.alert(
          'No Connection',
          'Could not connect to any backend URL. Please ensure the backend is running and accessible.'
        );
      }
    } catch (error: any) {
      console.error('Connectivity test error:', error);
      Alert.alert('Error', `Test failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const testSingleUrl = async (url: string) => {
    try {
      console.log(`Testing single URL: ${url}`);
      const startTime = Date.now();
      
      // Create a temporary API instance for this URL
      const axios = require('axios');
      const testApi = axios.create({
        baseURL: url,
        timeout: 5000,
      });
      
      const response = await testApi.get('/api/health');
      const duration = Date.now() - startTime;
      
      Alert.alert(
        'Success!',
        `Connected to ${url}\nResponse time: ${duration}ms\nStatus: ${response.status}`
      );
    } catch (error: any) {
      Alert.alert(
        'Failed',
        `Could not connect to ${url}\nError: ${error.message}`
      );
    }
  };

  const renderResult = (result: TestResult) => {
    const icon = result.success ? 'checkmark-circle' : 'close-circle';
    const color = result.success ? '#4CAF50' : '#F44336';
    
    return (
      <View key={result.url} style={[styles.resultCard, { borderLeftColor: color }]}>
        <View style={styles.resultHeader}>
          <Ionicons name={icon} size={24} color={color} />
          <Text style={styles.resultUrl}>{result.url}</Text>
        </View>
        
        {result.success ? (
          <View style={styles.resultDetails}>
            <Text style={styles.successText}>✅ Connected successfully</Text>
            <Text style={styles.detailText}>Response time: {result.responseTime}ms</Text>
            <Text style={styles.detailText}>Status: {result.status}</Text>
            {result.data && (
              <Text style={styles.detailText}>Data: {JSON.stringify(result.data)}</Text>
            )}
          </View>
        ) : (
          <View style={styles.resultDetails}>
            <Text style={styles.errorText}>❌ Connection failed</Text>
            <Text style={styles.detailText}>Error: {result.error}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Backend Connectivity Test</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Tests</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={runConnectivityTests}
            disabled={testing}
          >
            <Ionicons name="wifi" size={20} color="white" />
            <Text style={styles.buttonText}>
              {testing ? 'Testing All URLs...' : 'Test All Backend URLs'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Individual URL Tests</Text>
          
          {Object.entries(BACKEND_URLS).map(([key, url]) => (
            <TouchableOpacity
              key={key}
              style={[styles.button, styles.secondaryButton]}
              onPress={() => testSingleUrl(url)}
            >
              <Text style={styles.buttonTextSecondary}>{key}</Text>
              <Text style={styles.urlText}>{url}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {results.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            {results.map(renderResult)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  buttonTextSecondary: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  urlText: {
    color: '#666',
    fontSize: 12,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultUrl: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    color: '#333',
  },
  resultDetails: {
    marginLeft: 32,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    marginBottom: 4,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 4,
  },
  detailText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 2,
  },
});
