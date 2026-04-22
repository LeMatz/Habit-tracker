import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabits } from '../context/HabitContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { rewards } = useHabits();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-950">
      <View className="flex-row justify-between items-center px-6 py-4 bg-slate-900/80 border-b border-slate-800">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-slate-800 rounded-xl items-center justify-center border border-slate-700 mr-3">
            <Text className="text-xl">⚡</Text>
          </View>
          <Text className="text-xl font-black tracking-tighter text-white">Sistema SHCE</Text>
        </View>
        <View className="flex-row items-center bg-slate-800 border border-slate-700 px-4 py-2 rounded-2xl">
          <Text className="text-xs mr-2">🌀</Text>
          <Text className="text-sm font-black text-indigo-400">{rewards.availablePoints}</Text>
        </View>
      </View>
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
};

export default Layout;
