/**
 * Navigation Configuration for SmartTask Mobile
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from '../types';

// Import screens
import SimpleLoginScreen from '../screens/auth/SimpleLoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { LoadingScreen } from '../screens/LoadingScreen';

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Auth Navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' }
      }}
    >
      <AuthStack.Screen name="Login" component={SimpleLoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// Tab Bar Icon Component
const TabBarIcon: React.FC<{ route: any; focused: boolean; color: string; size: number }> = ({
  route,
  focused,
  color,
  size,
}) => {
  const getIconName = (routeName: string): any => {
    switch (routeName) {
      case 'Tasks':
        return focused ? 'checkbox' : 'checkbox-outline';
      case 'Chat':
        return focused ? 'chatbubbles' : 'chatbubbles-outline';
      case 'Profile':
        return focused ? 'person' : 'person-outline';
      default:
        return 'help-outline';
    }
  };

  return <Ionicons name={getIconName(route.name)} size={size} color={color} />;
};

// Create tab bar icon function
const createTabBarIcon = (route: any) => (props: any) => (
  <TabBarIcon route={route} {...props} />
);

// Main Tab Navigator
const MainNavigator = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: createTabBarIcon(route),
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
      })}
    >
      <MainTab.Screen 
        name="Tasks" 
        component={TasksScreen}
        options={{ title: 'Tasks' }}
      />
      <MainTab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ title: 'AI Assistant' }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </MainTab.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Main" component={MainNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
