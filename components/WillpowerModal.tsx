import React, { useState } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { X, Brain } from 'lucide-react-native';
import { haptics } from '../utils/haptics';

interface WillpowerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (score: number) => void;
}

const WillpowerModal: React.FC<WillpowerModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [score, setScore] = useState(5);

  const getEmoji = (val: number) => {
    if (val === 10) return '🌀';
    if (val <= 3) return '🧊';
    if (val <= 5) return '🛡️';
    if (val <= 8) return '🔥';
    return '⚡';
  };

  const getColor = (val: number) => {
    if (val <= 3) return 'text-sky-400';
    if (val <= 5) return 'text-indigo-400';
    if (val <= 8) return 'text-orange-400';
    if (val === 10) return 'text-cyan-400';
    return 'text-yellow-400';
  };

  const getLabel = (val: number) => {
    if (val <= 3) return 'Mucha Resistencia';
    if (val <= 5) return 'Esfuerzo Estable';
    if (val <= 8) return 'En el Flujo';
    return 'Estado de Gracia';
  };

  return (
    <Modal transparent visible={isOpen} animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 items-center justify-center px-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        onPress={() => {
          haptics.selection();
          onClose();
        }}
      >
        <Pressable
          className="bg-slate-950 border border-white/10 rounded-[3.5rem] w-full max-w-xs p-8 overflow-hidden"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <View className="p-2.5 bg-indigo-500/20 rounded-2xl mr-3">
                <Brain size={20} color="#818cf8" />
              </View>
              <Text className="text-xl font-black text-white" style={{ letterSpacing: -0.5 }}>
                Lag de inicio
              </Text>
            </View>
            <Pressable
              onPress={() => {
                haptics.selection();
                onClose();
              }}
              className="p-2 rounded-full"
            >
              <X size={20} color="#64748b" />
            </Pressable>
          </View>

          <Text
            className="text-slate-200 text-[11px] font-black uppercase text-center mb-8 px-2"
            style={{ letterSpacing: 2, lineHeight: 18 }}
          >
            ¿Cuánto esfuerzo y tiempo te llevó comenzar hoy?
          </Text>

          <View className="items-center">
            <View className="items-center mb-4">
              <View className="bg-white/5 w-24 h-24 items-center justify-center rounded-[2rem] border border-white/5">
                <Text style={{ fontSize: 56 }}>{getEmoji(score)}</Text>
              </View>
              <View className="items-center mt-4">
                <Text className={`font-black text-4xl ${getColor(score)}`}>{score}</Text>
                <Text
                  className="text-[10px] font-bold text-slate-600 uppercase mt-1"
                  style={{ letterSpacing: 2 }}
                >
                  {getLabel(score)}
                </Text>
              </View>
            </View>

            <View className="w-full px-2 pt-4">
              <Slider
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={score}
                minimumTrackTintColor="#6366f1"
                maximumTrackTintColor="rgba(255,255,255,0.1)"
                thumbTintColor="#6366f1"
                onValueChange={(val) => {
                  const rounded = Math.round(val);
                  if (rounded !== score) {
                    setScore(rounded);
                    haptics.selection();
                  }
                }}
              />
              <View className="flex-row justify-between px-1 mt-2">
                <Text className="text-[10px] font-black text-slate-700 uppercase" style={{ letterSpacing: 2 }}>
                  Mucho
                </Text>
                <Text className="text-[10px] font-black text-slate-700 uppercase" style={{ letterSpacing: 2 }}>
                  Poco
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => {
                haptics.success();
                onSubmit(score);
              }}
              className="w-full bg-indigo-600 py-5 rounded-[2rem] mt-6 border border-indigo-400/20"
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}
            >
              <Text
                className="text-white font-black text-center uppercase text-[10px]"
                style={{ letterSpacing: 3 }}
              >
                Registrar tarea
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default WillpowerModal;
