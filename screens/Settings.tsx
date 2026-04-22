import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import {
  Settings as SettingsIcon,
  Moon,
  Trash2,
  Heart,
  Shield,
  Zap,
  UserCircle,
  Sun,
  Type,
  RotateCcw,
  ChevronRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  Volume2,
  VolumeX,
  Dice5,
  ChevronDown,
  ChevronUp,
  Gift,
} from 'lucide-react-native';
import { useHabits } from '../context/HabitContext';
import { haptics } from '../utils/haptics';
import Layout from '../components/Layout';

interface ToggleProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ value, onValueChange }) => (
  <Pressable
    onPress={() => onValueChange(!value)}
    style={{
      width: 56,
      height: 28,
      borderRadius: 14,
      backgroundColor: value ? '#4f46e5' : '#334155',
      justifyContent: 'center',
      padding: 4,
    }}
  >
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        transform: [{ translateX: value ? 28 : 0 }],
      }}
    />
  </Pressable>
);

const Settings: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetProgress,
    startNewHabit,
    diceRewards,
    updateDiceReward,
  } = useHabits();
  const [showDiceConfig, setShowDiceConfig] = useState(false);

  const handleChange = (field: string, value: any) => {
    haptics.selection();
    updateSettings({ ...settings, [field]: value });
  };

  const forgedTerm = settings.gender === 'male' ? 'FORJADO' : 'FORJADA';

  const handleReset = () => {
    haptics.error();
    Alert.alert(
      'Reiniciar Todo',
      '¿Estás seguro de reiniciar todo? Se perderá el historial y los puntos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', style: 'destructive', onPress: () => resetProgress() },
      ]
    );
  };

  const handleNewHabit = () => {
    haptics.heavy();
    Alert.alert(
      'Hábito Nuevo',
      '¿Empezar hábito nuevo? Se archivará el actual y se reiniciará la racha, pero conservarás tus puntos y récord histórico.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Empezar', onPress: () => startNewHabit() },
      ]
    );
  };

  return (
    <Layout>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 96 }}>
        {/* Header */}
        <View className="flex-row items-center mb-10 px-1">
          <View className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mr-3">
            <SettingsIcon size={24} color="#818cf8" />
          </View>
          <View>
            <Text className="text-2xl font-black text-white" style={{ letterSpacing: -0.5 }}>
              Ajustes
            </Text>
            <Text className="text-[10px] text-slate-500 font-bold uppercase mt-1" style={{ letterSpacing: 2 }}>
              Configuración del Sistema
            </Text>
          </View>
        </View>

        {/* Identidad */}
        <View style={{ marginBottom: 40 }}>
          <View className="flex-row items-center mb-5 px-3">
            <UserCircle size={14} color="#6366f1" />
            <Text className="text-[10px] font-black uppercase text-slate-500 ml-2" style={{ letterSpacing: 4 }}>
              Identidad de Misión
            </Text>
          </View>
          <View className="p-8 rounded-[3rem] bg-slate-900 border border-slate-800">
            <View style={{ marginBottom: 24 }}>
              <Text
                className="text-[11px] font-black text-slate-500 uppercase mb-3 px-1"
                style={{ letterSpacing: 2 }}
              >
                ¿Quién soy?
              </Text>
              <TextInput
                value={settings.habitName}
                onChangeText={(text) => updateSettings({ ...settings, habitName: text })}
                placeholder="Soy un corredor constante"
                placeholderTextColor="#475569"
                className="bg-slate-800 rounded-3xl border border-slate-700 font-black text-white"
                style={{ paddingHorizontal: 24, paddingVertical: 20 }}
              />
            </View>

            <View>
              <Text
                className="text-[11px] font-black text-slate-500 uppercase mb-3 px-1"
                style={{ letterSpacing: 2 }}
              >
                Avatar de Género
              </Text>
              <View className="flex-row bg-slate-800 rounded-[2rem] border border-slate-700 p-1" style={{ gap: 4 }}>
                <Pressable
                  onPress={() => handleChange('gender', 'male')}
                  className={`flex-1 py-4 rounded-[1.8rem] items-center ${
                    settings.gender === 'male' ? 'bg-indigo-600' : ''
                  }`}
                >
                  <Text
                    className={`text-[10px] font-black uppercase ${
                      settings.gender === 'male' ? 'text-white' : 'text-slate-400'
                    }`}
                    style={{ letterSpacing: 2 }}
                  >
                    Héroe
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleChange('gender', 'female')}
                  className={`flex-1 py-4 rounded-[1.8rem] items-center ${
                    settings.gender === 'female' ? 'bg-indigo-600' : ''
                  }`}
                >
                  <Text
                    className={`text-[10px] font-black uppercase ${
                      settings.gender === 'female' ? 'text-white' : 'text-slate-400'
                    }`}
                    style={{ letterSpacing: 2 }}
                  >
                    Heroína
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Ciclo del Hábito */}
        <View style={{ marginBottom: 40 }}>
          <View className="flex-row items-center mb-5 px-3">
            <RotateCcw size={14} color="#6366f1" />
            <Text className="text-[10px] font-black uppercase text-slate-500 ml-2" style={{ letterSpacing: 4 }}>
              Ciclo del Hábito (James Clear)
            </Text>
          </View>
          <View className="p-8 rounded-[3rem] bg-slate-900 border border-slate-800">
            {[
              [
                { label: 'Señal', field: 'cue' as const },
                { label: 'Anhelo', field: 'craving' as const },
              ],
              [
                { label: 'Respuesta', field: 'response' as const },
                { label: 'Recompensa', field: 'reward' as const },
              ],
            ].map((row, rowIdx) => (
              <View key={rowIdx} className="flex-row" style={{ gap: 12, marginBottom: rowIdx === 0 ? 16 : 0 }}>
                {row.map(({ label, field }) => (
                  <View key={field} style={{ flex: 1 }}>
                    <Text
                      className="text-[9px] font-black text-slate-400 uppercase mb-2 px-1"
                      style={{ letterSpacing: 2 }}
                    >
                      {label}
                    </Text>
                    <TextInput
                      value={settings.habitLoop[field]}
                      onChangeText={(text) =>
                        updateSettings({
                          ...settings,
                          habitLoop: { ...settings.habitLoop, [field]: text },
                        })
                      }
                      className="bg-slate-800 rounded-2xl border border-slate-700 font-bold text-xs text-white"
                      style={{ paddingHorizontal: 16, paddingVertical: 12 }}
                    />
                  </View>
                ))}
              </View>
            ))}
            <Text
              className="text-[9px] text-slate-400 italic text-center mt-6 px-4"
              style={{ lineHeight: 14 }}
            >
              Define los cuatro pasos de tu hábito para hacerlo consciente y automático.
            </Text>
          </View>
        </View>

        {/* Nombres de Ejecución */}
        <View style={{ marginBottom: 40 }}>
          <View className="flex-row items-center mb-5 px-3">
            <Zap size={14} color="#f59e0b" />
            <Text className="text-[10px] font-black uppercase text-slate-500 ml-2" style={{ letterSpacing: 4 }}>
              Nombres de Ejecución
            </Text>
          </View>
          <View className="p-8 rounded-[3rem] bg-slate-900 border border-slate-800">
            {[
              {
                icon: <Zap size={12} color="#f97316" />,
                label: 'Botón EMD (Esfuerzo Mínimo Diario)',
                field: 'emergencyHabit' as const,
              },
              {
                icon: <Clock size={12} color="#6366f1" />,
                label: 'Botón 2 minutos',
                field: 'twoMinuteHabit' as const,
              },
              {
                icon: <CheckCircle2 size={12} color="#06b6d4" />,
                label: 'Botón Completo (Hábito)',
                field: 'completeHabit' as const,
              },
            ].map(({ icon, label, field }, idx) => (
              <View key={field} style={{ marginBottom: idx < 2 ? 24 : 0 }}>
                <View className="flex-row items-center mb-3 px-1">
                  {icon}
                  <Text
                    className="text-[10px] font-black text-slate-400 uppercase ml-2"
                    style={{ letterSpacing: 2 }}
                  >
                    {label}
                  </Text>
                </View>
                <TextInput
                  value={settings[field]}
                  onChangeText={(text) => updateSettings({ ...settings, [field]: text })}
                  className="bg-slate-800 rounded-2xl border border-slate-700 font-bold text-white"
                  style={{ paddingHorizontal: 20, paddingVertical: 16 }}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Premios del Dado */}
        <View style={{ marginBottom: 40 }}>
          <View className="flex-row items-center mb-5 px-3">
            <Dice5 size={14} color="#6366f1" />
            <Text className="text-[10px] font-black uppercase text-slate-500 ml-2" style={{ letterSpacing: 4 }}>
              Premios del Dado
            </Text>
          </View>

          <Pressable
            onPress={() => {
              haptics.selection();
              setShowDiceConfig(!showDiceConfig);
            }}
            className="flex-row items-center justify-between p-6 bg-slate-900 border border-slate-800"
            style={{
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              borderBottomLeftRadius: showDiceConfig ? 0 : 40,
              borderBottomRightRadius: showDiceConfig ? 0 : 40,
            }}
          >
            <View className="flex-row items-center">
              <View className="p-2.5 bg-indigo-500/10 rounded-xl mr-4">
                <Gift size={20} color="#818cf8" />
              </View>
              <View>
                <Text
                  className="text-[11px] font-black uppercase text-slate-400"
                  style={{ letterSpacing: 2 }}
                >
                  Ajustar Premios
                </Text>
                <Text
                  className="text-[8px] font-bold text-slate-500 uppercase italic mt-0.5"
                  style={{ letterSpacing: 2 }}
                >
                  Dado del destino
                </Text>
              </View>
            </View>
            {showDiceConfig ? (
              <ChevronUp size={20} color="#64748b" />
            ) : (
              <ChevronDown size={20} color="#64748b" />
            )}
          </Pressable>

          {showDiceConfig && (
            <View
              className="p-6 bg-slate-900 border-x border-b border-slate-800"
              style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40, gap: 16 }}
            >
              {diceRewards.map((reward) => (
                <View
                  key={reward.id}
                  className="flex-row items-center bg-slate-800/40 p-4 rounded-2xl border border-white/5"
                >
                  <View className="w-10 h-10 rounded-2xl bg-indigo-500/10 items-center justify-center border border-indigo-500/10 mr-4">
                    <Text className="text-indigo-400 font-black text-sm">{reward.diceNumber}</Text>
                  </View>
                  <TextInput
                    value={reward.title}
                    onChangeText={(text) => updateDiceReward(reward.id, text, '')}
                    placeholder="Tu premio..."
                    placeholderTextColor="#475569"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl font-bold text-sm text-white"
                    style={{ paddingHorizontal: 16, paddingVertical: 12 }}
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Mejoras de Experiencia */}
        <View style={{ marginBottom: 40 }}>
          <View className="flex-row items-center mb-5 px-3">
            <Shield size={14} color="#6366f1" />
            <Text className="text-[10px] font-black uppercase text-slate-500 ml-2" style={{ letterSpacing: 4 }}>
              Mejoras de Experiencia
            </Text>
          </View>
          <View className="rounded-[3rem] bg-slate-900 border border-slate-800 overflow-hidden">
            {[
              {
                icon: settings.isDarkMode ? <Moon size={22} color="#818cf8" /> : <Sun size={22} color="#818cf8" />,
                title: 'Modo Oscuro',
                sub: 'Apariencia Visual',
                value: settings.isDarkMode,
                onChange: (v: boolean) => handleChange('isDarkMode', v),
              },
              {
                icon: settings.soundsEnabled ? (
                  <Volume2 size={22} color="#818cf8" />
                ) : (
                  <VolumeX size={22} color="#818cf8" />
                ),
                title: 'Efectos de Sonido',
                sub: 'Feedback Auditivo',
                value: settings.soundsEnabled,
                onChange: (v: boolean) => handleChange('soundsEnabled', v),
              },
              {
                icon: <Type size={22} color="#818cf8" />,
                title: 'Fuente Grande',
                sub: 'Optimización Universal',
                value: settings.fontSize === 'large',
                onChange: (v: boolean) => handleChange('fontSize', v ? 'large' : 'normal'),
              },
            ].map((row, i, arr) => (
              <View
                key={i}
                className="p-7 flex-row items-center justify-between"
                style={{ borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: '#1e293b' }}
              >
                <View className="flex-row items-center flex-1">
                  <View className="p-3.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/10 mr-5">
                    {row.icon}
                  </View>
                  <View>
                    <Text className="text-sm font-black text-white" style={{ letterSpacing: -0.3 }}>
                      {row.title}
                    </Text>
                    <Text className="text-[9px] text-slate-500 font-bold uppercase">{row.sub}</Text>
                  </View>
                </View>
                <Toggle value={row.value} onValueChange={row.onChange} />
              </View>
            ))}
          </View>
        </View>

        {/* Zona de Peligro */}
        <View style={{ marginBottom: 40 }}>
          <View className="flex-row items-center mb-5 px-3">
            <Trash2 size={14} color="#ef4444" />
            <Text className="text-[10px] font-black uppercase text-slate-500 ml-2" style={{ letterSpacing: 4 }}>
              Zona de Peligro
            </Text>
          </View>
          <View className="rounded-[3rem] bg-red-500/5 border border-red-500/20 overflow-hidden">
            <Pressable
              onPress={handleNewHabit}
              className="p-8 flex-row items-center justify-between"
              style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(239,68,68,0.1)' }}
            >
              <View className="flex-row items-center flex-1">
                <View className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mr-5">
                  <PlusCircle size={26} color="#818cf8" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-black text-indigo-400" style={{ letterSpacing: -0.3 }}>
                    Empezar Hábito Nuevo
                  </Text>
                  <Text
                    className="text-[9px] font-bold text-indigo-400/40 uppercase"
                    style={{ letterSpacing: 2, lineHeight: 14 }}
                  >
                    Reinicia racha y análisis manteniendo puntos y récords
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="rgba(129,140,248,0.3)" />
            </Pressable>

            <Pressable onPress={handleReset} className="p-8 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 mr-5">
                  <RotateCcw size={26} color="#f87171" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-black text-red-500" style={{ letterSpacing: -0.3 }}>
                    Reiniciar Todo
                  </Text>
                  <Text
                    className="text-[9px] font-bold text-red-500/40 uppercase"
                    style={{ letterSpacing: 2, lineHeight: 14 }}
                  >
                    Eliminación completa y absoluta de la cuenta
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="rgba(239,68,68,0.3)" />
            </Pressable>
          </View>
        </View>

        {/* Version & Credits */}
        <View className="items-center py-12">
          <View className="flex-row items-center">
            <Text className="text-[10px] font-black text-slate-600 uppercase" style={{ letterSpacing: 4 }}>
              {forgedTerm} EN EL SILENCIO
            </Text>
            <View style={{ marginHorizontal: 12 }}>
              <Heart size={14} color="#6366f1" fill="#6366f1" />
            </View>
            <Text className="text-[10px] font-black text-slate-600 uppercase" style={{ letterSpacing: 4 }}>
              SHCE v3.5.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
};

export default Settings;
