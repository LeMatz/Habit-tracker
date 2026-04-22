import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Clock, CheckCircle2 } from 'lucide-react-native';
import { HabitButtonType } from '../types';

interface HabitButtonProps {
  type: HabitButtonType;
  onPress: () => void;
  disabled?: boolean;
  customLabel?: string;
}

type Config = {
  gradient: [string, string];
  icon: React.ReactNode;
  text: string;
  subtext: string;
};

export const HabitButton: React.FC<HabitButtonProps> = ({ type, onPress, disabled, customLabel }) => {
  const configs: Record<HabitButtonType, Config> = {
    emergency: {
      gradient: ['#f97316', '#c2410c'],
      icon: <Zap size={28} color="#ffffff" />,
      text: customLabel || 'EMD',
      subtext: 'Esfuerzo Mínimo Diario',
    },
    twoMinutes: {
      gradient: ['#6366f1', '#4338ca'],
      icon: <Clock size={28} color="#ffffff" />,
      text: customLabel || '2 min',
      subtext: '2 minutos',
    },
    complete: {
      gradient: ['#22d3ee', '#0891b2'],
      icon: <CheckCircle2 size={28} color="#ffffff" />,
      text: customLabel || 'Total',
      subtext: 'Check',
    },
  };

  const config = configs[type];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`items-center w-full ${disabled ? 'opacity-20' : ''}`}
    >
      {({ pressed }) => (
        <>
          <View
            className="w-20 h-20 rounded-[2rem] overflow-hidden items-center justify-center"
            style={{ transform: [{ scale: pressed && !disabled ? 0.95 : 1 }] }}
          >
            {disabled ? (
              <View className="w-full h-full bg-slate-800 border border-white/5 items-center justify-center">
                {config.icon}
              </View>
            ) : (
              <LinearGradient
                colors={config.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {config.icon}
              </LinearGradient>
            )}
          </View>
          <View className="w-full px-0.5 mt-4">
            <Text
              className="text-[9px] font-black text-white uppercase text-center"
              style={{ letterSpacing: -0.5, lineHeight: 10 }}
            >
              {config.text}
            </Text>
            <Text
              className="text-[7px] font-bold text-slate-500 uppercase text-center mt-1"
              style={{ letterSpacing: 2 }}
            >
              {config.subtext}
            </Text>
          </View>
        </>
      )}
    </Pressable>
  );
};
