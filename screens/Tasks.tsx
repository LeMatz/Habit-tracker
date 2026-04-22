import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import {
  ClipboardCheck,
  Sparkles,
  Brain,
  CheckCircle2,
  Info,
  Settings2,
  Microscope,
  X,
  Target,
} from 'lucide-react-native';
import { useHabits } from '../context/HabitContext';
import { TASKS_POOL } from '../constants';
import { haptics } from '../utils/haptics';
import { soundService } from '../utils/soundService';
import Layout from '../components/Layout';

const Tasks: React.FC = () => {
  const { taskState, completeDailyTask, settings } = useHabits();
  const [infoOpen, setInfoOpen] = useState(false);

  const currentTask = TASKS_POOL.find((t) => t.id === taskState.currentTaskId);

  const handleComplete = () => {
    if (taskState.isCompleted) return;
    haptics.success();
    if (settings.soundsEnabled) soundService.playTaskComplete();
    completeDailyTask();
  };

  if (!currentTask) {
    return (
      <Layout>
        <View className="flex-1 items-center justify-center">
          <Text className="text-[10px] font-black text-slate-500 uppercase" style={{ letterSpacing: 3 }}>
            Asignando Misión...
          </Text>
        </View>
      </Layout>
    );
  }

  const rules = [
    {
      icon: <Sparkles size={18} color="#fbbf24" />,
      title: 'Recompensa',
      desc: 'Cada misión completada otorga +5 puntos de Maná inmediatamente.',
    },
    {
      icon: <Brain size={18} color="#818cf8" />,
      title: 'Propósito',
      desc: 'Estas tareas entrenan funciones ejecutivas superiores que complementan y facilitan la creación de nuevos hábitos.',
    },
    {
      icon: <CheckCircle2 size={18} color="#34d399" />,
      title: 'Disponibilidad',
      desc: 'Se asigna una nueva misión aleatoria cada 24 horas.',
    },
  ];

  return (
    <Layout>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 96 }}>
        <View className="flex-row items-center mb-10 px-1">
          <View className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl mr-3">
            <ClipboardCheck size={24} color="#22d3ee" />
          </View>
          <View>
            <Text className="text-2xl font-black text-white" style={{ letterSpacing: -0.5 }}>
              Misión Diaria
            </Text>
            <Text className="text-[10px] font-black text-slate-500 uppercase mt-1" style={{ letterSpacing: 2 }}>
              Refuerzo Cognitivo
            </Text>
          </View>
        </View>

        <View
          className={`p-10 border ${
            taskState.isCompleted
              ? 'bg-emerald-500/5 border-emerald-500/20'
              : 'bg-slate-900/40 border-white/5'
          }`}
          style={{ borderRadius: 56, position: 'relative', overflow: 'hidden', marginBottom: 40 }}
        >
          <Pressable
            onPress={() => {
              haptics.selection();
              setInfoOpen(true);
            }}
            style={{ position: 'absolute', top: 24, right: 24, padding: 8, zIndex: 20 }}
          >
            <Info size={18} color="rgba(255,255,255,0.3)" />
          </Pressable>

          <View className="items-center">
            <View
              className={`p-7 border ${
                taskState.isCompleted
                  ? 'bg-emerald-500/20 border-emerald-500/30'
                  : 'bg-indigo-500/10 border-white/10'
              }`}
              style={{ borderRadius: 45, marginBottom: 24 }}
            >
              {taskState.isCompleted ? (
                <CheckCircle2 size={48} color="#34d399" />
              ) : (
                <Brain size={48} color="#818cf8" />
              )}
            </View>

            <Text
              className={`text-2xl font-black mb-4 text-center ${
                taskState.isCompleted ? 'text-emerald-400' : 'text-white'
              }`}
              style={{ letterSpacing: -0.5 }}
            >
              {currentTask.title}
            </Text>
            <Text
              className="text-sm font-semibold text-slate-400 px-2 text-center"
              style={{ lineHeight: 20 }}
            >
              {currentTask.description}
            </Text>

            {!taskState.isCompleted ? (
              <View className="w-full pt-6">
                <Pressable
                  onPress={handleComplete}
                  className="w-full py-6 bg-indigo-600 rounded-[2rem] border border-indigo-400/20 flex-row items-center justify-center"
                  style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}
                >
                  <Sparkles size={16} color="#fff" />
                  <Text className="text-white font-black uppercase text-[10px] ml-3" style={{ letterSpacing: 3 }}>
                    Confirmar Ejecución
                  </Text>
                </Pressable>
                <View className="flex-row items-center justify-center mt-6">
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#10b981',
                      marginRight: 8,
                    }}
                  />
                  <Text
                    className="text-[9px] font-black text-emerald-500 uppercase"
                    style={{ letterSpacing: 2, opacity: 0.8 }}
                  >
                    +5 Puntos de Maná
                  </Text>
                </View>
              </View>
            ) : (
              <View className="w-full pt-6 items-center">
                <View className="px-8 py-4 bg-emerald-500/20 rounded-3xl border border-emerald-500/20">
                  <Text
                    className="text-emerald-400 text-[10px] font-black uppercase"
                    style={{ letterSpacing: 2 }}
                  >
                    ¡Misión Cumplida!
                  </Text>
                </View>
                <Text
                  className="text-[9px] text-slate-500 font-bold uppercase mt-4"
                  style={{ letterSpacing: 2 }}
                >
                  Siguiente reto en el próximo ciclo
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Scientific Basis Box */}
        <View
          className="bg-slate-900/90 border border-white/10 p-8"
          style={{ borderRadius: 48, marginBottom: 40 }}
        >
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <View className="p-2 bg-indigo-500/10 rounded-xl mr-3">
                <Microscope size={18} color="#818cf8" />
              </View>
              <Text
                className="text-[11px] font-black uppercase text-indigo-400"
                style={{ letterSpacing: 3, opacity: 0.8 }}
              >
                Base Científica
              </Text>
            </View>
            <View className="px-3 py-1 bg-slate-800 rounded-full border border-white/5">
              <Text className="text-[8px] font-black text-slate-400 uppercase" style={{ letterSpacing: 2 }}>
                Neuro-Insights
              </Text>
            </View>
          </View>
          <Text
            className="text-[12px] text-slate-300 font-semibold italic"
            style={{ lineHeight: 20 }}
          >
            "{currentTask.neuroBasis}"
          </Text>
        </View>

        <View className="flex-row items-center justify-center bg-white/5 border border-white/5 px-6 py-5 rounded-[2rem]" style={{ opacity: 0.7 }}>
          <Settings2 size={14} color="#818cf8" />
          <Text
            className="text-[10px] font-bold text-slate-500 italic text-center ml-3 flex-1"
            style={{ lineHeight: 14 }}
          >
            La adaptabilidad es la marca del genio. Modifica la misión según tu voluntad actual.
          </Text>
        </View>
      </ScrollView>

      <Modal transparent visible={infoOpen} animationType="fade" onRequestClose={() => setInfoOpen(false)}>
        <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <View
            className="bg-slate-950 border border-white/10 w-full p-8"
            style={{ maxWidth: 384, borderRadius: 56 }}
          >
            <Pressable
              onPress={() => setInfoOpen(false)}
              style={{ position: 'absolute', top: 24, right: 24, padding: 8 }}
            >
              <X size={20} color="#64748b" />
            </Pressable>
            <View className="items-center mb-8 pt-6">
              <View className="p-4 bg-white/5 rounded-3xl border border-white/5 mb-3">
                <Target size={32} color="#22d3ee" />
              </View>
              <Text
                className="text-2xl font-black text-white uppercase text-center"
                style={{ letterSpacing: -0.5 }}
              >
                MISION DIARIA
              </Text>
              <Text
                className="text-[10px] font-black text-indigo-400 uppercase mt-1"
                style={{ letterSpacing: 3 }}
              >
                tareas opcionales
              </Text>
            </View>

            <View style={{ gap: 24 }}>
              {rules.map((rule, i) => (
                <View key={i} className="flex-row">
                  <View style={{ marginTop: 4, marginRight: 16 }}>{rule.icon}</View>
                  <View className="flex-1">
                    <Text className="text-xs font-black text-white uppercase mb-1">{rule.title}</Text>
                    <Text className="text-[10px] text-slate-400 font-medium" style={{ lineHeight: 16 }}>
                      {rule.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => setInfoOpen(false)}
              className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl mt-8"
            >
              <Text
                className="text-white font-black text-center uppercase text-[10px]"
                style={{ letterSpacing: 2 }}
              >
                Cerrar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Layout>
  );
};

export default Tasks;
