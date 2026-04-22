import React from 'react';
import { View, Text } from 'react-native';
import { RefreshCw, Zap, Target, Award } from 'lucide-react-native';
import { HabitLoop } from '../types';

interface HabitLoopViewProps {
  loop: HabitLoop;
  title?: string;
}

type Step = {
  label: string;
  icon: React.ReactNode;
  bg: string;
  border: string;
  text: string;
  // Position on the outer circle (anchor the bubble center)
  position: 'top' | 'right' | 'bottom' | 'left';
};

const CIRCLE_SIZE = 140;
const BUBBLE_SIZE = 44;
const LABEL_WIDTH = 88;

const HabitLoopView: React.FC<HabitLoopViewProps> = ({ loop, title = 'Ciclo del Hábito' }) => {
  if (!loop) return null;

  const steps: Step[] = [
    {
      label: loop.cue || 'Señal',
      icon: <Zap size={22} color="#fff" />,
      bg: 'bg-yellow-500',
      border: 'border-yellow-500/30',
      text: 'text-yellow-500',
      position: 'top',
    },
    {
      label: loop.craving || 'Anhelo',
      icon: <Target size={22} color="#fff" />,
      bg: 'bg-pink-500',
      border: 'border-pink-500/30',
      text: 'text-pink-500',
      position: 'right',
    },
    {
      label: loop.response || 'Respuesta',
      icon: <RefreshCw size={22} color="#fff" />,
      bg: 'bg-indigo-500',
      border: 'border-indigo-500/30',
      text: 'text-indigo-500',
      position: 'bottom',
    },
    {
      label: loop.reward || 'Recompensa',
      icon: <Award size={22} color="#fff" />,
      bg: 'bg-emerald-500',
      border: 'border-emerald-500/30',
      text: 'text-emerald-500',
      position: 'left',
    },
  ];

  const posStyle = (p: Step['position']) => {
    const half = CIRCLE_SIZE / 2;
    const offset = BUBBLE_SIZE / 2;
    switch (p) {
      case 'top':
        return { top: -offset, left: half - offset };
      case 'right':
        return { right: -offset, top: half - offset };
      case 'bottom':
        return { bottom: -offset, left: half - offset };
      case 'left':
        return { left: -offset, top: half - offset };
    }
  };

  const labelStyle = (p: Step['position']) => {
    switch (p) {
      case 'top':
        return { bottom: BUBBLE_SIZE + 4, left: -(LABEL_WIDTH - BUBBLE_SIZE) / 2, width: LABEL_WIDTH };
      case 'bottom':
        return { top: BUBBLE_SIZE + 4, left: -(LABEL_WIDTH - BUBBLE_SIZE) / 2, width: LABEL_WIDTH };
      case 'right':
        // Label on east bubble sits BELOW the bubble to stay inside the card
        return { top: BUBBLE_SIZE + 4, left: -(LABEL_WIDTH - BUBBLE_SIZE) / 2, width: LABEL_WIDTH };
      case 'left':
        // Label on west bubble sits ABOVE the bubble to stay inside the card
        return { bottom: BUBBLE_SIZE + 4, left: -(LABEL_WIDTH - BUBBLE_SIZE) / 2, width: LABEL_WIDTH };
    }
  };

  return (
    <View className="items-center w-full px-2">
      <View className="flex-row items-center mb-4">
        <RefreshCw size={14} color="#6366f1" />
        <Text className="ml-2 text-[10px] font-black uppercase text-white" style={{ letterSpacing: 3 }}>
          {title}
        </Text>
      </View>

      <View
        style={{
          width: CIRCLE_SIZE,
          height: CIRCLE_SIZE,
          marginVertical: 100,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Background ring */}
        <View
          style={{
            position: 'absolute',
            inset: 0,
            borderWidth: 4,
            borderColor: 'rgba(255,255,255,0.05)',
            borderRadius: CIRCLE_SIZE / 2,
          }}
        />

        {/* Dashed outer ring */}
        <View
          style={{
            position: 'absolute',
            top: -32,
            left: -32,
            right: -32,
            bottom: -32,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: 'rgba(99,102,241,0.2)',
            borderRadius: (CIRCLE_SIZE + 64) / 2,
          }}
        />

        {/* Center core */}
        <View className="bg-slate-900 p-4 rounded-full border border-white/10" style={{ zIndex: 1 }}>
          <View className="w-10 h-10 bg-indigo-500/10 rounded-full items-center justify-center">
            <RefreshCw size={20} color="#6366f1" />
          </View>
        </View>

        {/* Bubbles */}
        {steps.map((step, i) => (
          <View key={i} style={{ position: 'absolute', ...posStyle(step.position), zIndex: 20 }}>
            <View
              className={`${step.bg} rounded-2xl items-center justify-center border-4 border-slate-900`}
              style={{ width: BUBBLE_SIZE, height: BUBBLE_SIZE }}
            >
              {step.icon}
            </View>
            <View
              style={{ position: 'absolute', ...labelStyle(step.position) }}
              pointerEvents="none"
            >
              <View className={`px-2 py-1.5 bg-slate-800 rounded-xl border ${step.border}`}>
                <Text className={`text-[9px] font-black uppercase text-center ${step.text}`} style={{ letterSpacing: -0.3 }}>
                  {step.label}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className="pt-4 items-center">
        <Text className="text-[9px] text-slate-400 font-bold uppercase text-center" style={{ letterSpacing: 2, maxWidth: 200 }}>
          La identidad se forja en la repetición.
        </Text>
      </View>
    </View>
  );
};

export default HabitLoopView;
