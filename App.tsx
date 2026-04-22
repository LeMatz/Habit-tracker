import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { Home, ListChecks, BarChart3, Gift, Settings as SettingsIcon } from 'lucide-react-native';
import { HabitProvider } from './context/HabitContext';
import HomeScreen from './screens/Home';
import TasksScreen from './screens/Tasks';
import SettingsScreen from './screens/Settings';

const Tab = createBottomTabNavigator();

function Placeholder({ name }: { name: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950">
      <Text className="text-slate-100 text-lg">{name} (placeholder)</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <HabitProvider>
        <NavigationContainer>
          <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: '#020617', borderTopColor: '#1e293b' },
            tabBarActiveTintColor: '#06b6d4',
            tabBarInactiveTintColor: '#64748b',
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }}
          />
          <Tab.Screen
            name="Tasks"
            component={TasksScreen}
            options={{ tabBarIcon: ({ color, size }) => <ListChecks size={size} color={color} /> }}
          />
          <Tab.Screen
            name="Stats"
            options={{ tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} /> }}
          >
            {() => <Placeholder name="Stats" />}
          </Tab.Screen>
          <Tab.Screen
            name="Rewards"
            options={{ tabBarIcon: ({ color, size }) => <Gift size={size} color={color} /> }}
          >
            {() => <Placeholder name="Rewards" />}
          </Tab.Screen>
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ tabBarIcon: ({ color, size }) => <SettingsIcon size={size} color={color} /> }}
          />
          </Tab.Navigator>
        </NavigationContainer>
      </HabitProvider>
    </SafeAreaProvider>
  );
}
