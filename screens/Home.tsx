import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Flame,
  Trophy,
  Star,
  ChevronDown,
  Zap,
  MicOff,
  MapPin,
  Ghost,
  Wind,
  Smartphone,
  Activity,
  Dices,
  Shield,
  Info,
  X,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react-native';
import { useHabits } from '../context/HabitContext';
import { HabitButton } from '../components/HabitButtons';
import WillpowerModal from '../components/WillpowerModal';
import HabitLoopView from '../components/HabitLoopView';
import Layout from '../components/Layout';
import { HabitButtonType } from '../types';
import { haptics } from '../utils/haptics';
import { soundService } from '../utils/soundService';
import { DIFFICULTY_MODES } from '../constants';

const renderModeIcon = (iconName: string, size = 16, color = '#818cf8') => {
  switch (iconName) {
    case 'MicOff':
      return <MicOff size={size} color={color} />;
    case 'MapPin':
      return <MapPin size={size} color={color} />;
    case 'Zap':
      return <Zap size={size} color={color} />;
    case 'Ghost':
      return <Ghost size={size} color={color} />;
    case 'Wind':
      return <Wind size={size} color={color} />;
    case 'Smartphone':
      return <Smartphone size={size} color={color} />;
    case 'Dices':
      return <Dices size={size} color={color} />;
    case 'Shield':
      return <Shield size={size} color={color} />;
    default:
      return <Activity size={size} color={color} />;
  }
};

const Home: React.FC = () => {
  const { streak, canCheckin, addCheckin, settings, today, rewards } = useHabits();
  const [modalOpen, setModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<HabitButtonType | null>(null);
  const [selectedModeId, setSelectedModeId] = useState('normal');
  const [isModeOpen, setIsModeOpen] = useState(false);

  const selectedMode = DIFFICULTY_MODES.find((m) => m.id === selectedModeId) || DIFFICULTY_MODES[0];

  const handleHabitPress = (type: HabitButtonType) => {
    if (selectedModeId !== 'normal' && type !== 'complete') return;
    if (type === 'emergency') haptics.medium();
    else if (type === 'twoMinutes') haptics.light();
    else if (type === 'complete') haptics.success();
    setSelectedType(type);
    setModalOpen(true);
  };

  const handleSubmit = (willpower: number) => {
    if (selectedType) {
      const success = addCheckin(selectedType, willpower, selectedModeId);
      if (success) {
        haptics.success();
        if (settings.soundsEnabled) soundService.playSuccess();
        setModalOpen(false);
      }
    }
  };

  const handleModeChange = (id: string) => {
    haptics.selection();
    setSelectedModeId(id);
    setIsModeOpen(false);
  };

  const available = canCheckin();
  const heroTerm = settings.gender === 'male' ? 'Héroe' : 'Heroína';

  const getModeName = (mode: typeof DIFFICULTY_MODES[0]) => {
    if (mode.id === 'hero') return settings.gender === 'male' ? 'Modo Héroe' : 'Modo Heroína';
    return mode.name;
  };

  return (
    <Layout>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 80 }}>
        {/* Streak Card */}
        {settings.showStreak && (
          <LinearGradient
            colors={['#1e1b4b', '#020617']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 48,
              padding: 40,
              marginBottom: 48,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Pressable
              onPress={() => {
                haptics.selection();
                setInfoModalOpen(true);
              }}
              style={{ position: 'absolute', top: 24, right: 24, padding: 8, zIndex: 20 }}
            >
              <Info size={18} color="rgba(255,255,255,0.3)" />
            </Pressable>

            <View className="items-center">
              <View className="p-5 rounded-[2rem] bg-white/5 border border-white/10 mb-6">
                <Flame size={48} color="#f97316" fill="#f97316" />
              </View>
              <Text
                className="text-5xl font-black mb-1 text-white"
                style={{ letterSpacing: -2 }}
              >
                {streak.currentStreak} DÍAS
              </Text>
              <Text className="text-indigo-400 text-[11px] font-black uppercase mb-8" style={{ letterSpacing: 4 }}>
                Racha Actual
              </Text>

              <View className="flex-row w-full px-2 mb-8">
                {[...Array(7)].map((_, i) => (
                  <View
                    key={i}
                    style={{
                      height: 8,
                      flex: 1,
                      marginHorizontal: 4,
                      borderRadius: 4,
                      backgroundColor: i < streak.currentStreak % 7 ? '#6366f1' : 'rgba(255,255,255,0.1)',
                    }}
                  />
                ))}
              </View>

              <View className="flex-row items-center bg-white/5 border border-white/5 px-5 py-2.5 rounded-2xl">
                <Trophy size={16} color="#fbbf24" />
                <Text className="text-[10px] font-black text-slate-300 uppercase ml-2" style={{ letterSpacing: 2 }}>
                  Record Personal: {streak.longestStreak}
                </Text>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Difficulty Modifier */}
        <View style={{ marginBottom: 48 }}>
          <Text
            className="text-[10px] font-black text-slate-500 uppercase mb-4 ml-4"
            style={{ letterSpacing: 4 }}
          >
            Configuración de Sesión
          </Text>

          <Pressable
            onPress={() => {
              haptics.selection();
              setIsModeOpen(!isModeOpen);
            }}
            className="bg-[#0f172a] border border-white/10 p-5 flex-row items-center justify-between"
            style={{
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              borderBottomLeftRadius: isModeOpen ? 0 : 40,
              borderBottomRightRadius: isModeOpen ? 0 : 40,
            }}
          >
            <View className="flex-row items-center">
              <View className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mr-5">
                {renderModeIcon(selectedMode.icon, 20)}
              </View>
              <View>
                <View className="flex-row items-center">
                  <Text className="text-sm font-black text-white mr-2">{getModeName(selectedMode)}</Text>
                  <View className="bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                    <Text className="text-indigo-400 text-[9px] font-black">{selectedMode.multiplier}x</Text>
                  </View>
                </View>
                <Text
                  className="text-[10px] text-slate-300 font-bold uppercase mt-0.5"
                  numberOfLines={1}
                  style={{ letterSpacing: 1 }}
                >
                  {selectedMode.description}
                </Text>
              </View>
            </View>
            <View style={{ transform: [{ rotate: isModeOpen ? '180deg' : '0deg' }] }}>
              <ChevronDown size={20} color="#64748b" />
            </View>
          </Pressable>

          {isModeOpen && (
            <View
              className="bg-[#0f172a] border-x border-b border-white/10"
              style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' }}
            >
              {DIFFICULTY_MODES.map((mode) => {
                const isSelected = selectedModeId === mode.id;
                return (
                  <Pressable
                    key={mode.id}
                    onPress={() => handleModeChange(mode.id)}
                    className={`p-5 flex-row items-start ${isSelected ? 'bg-indigo-500/10' : ''}`}
                  >
                    <View
                      className={`p-2 rounded-xl mr-4 ${
                        isSelected
                          ? 'bg-indigo-500/20 border border-indigo-500/30'
                          : 'bg-white/5 border border-white/5'
                      }`}
                    >
                      {renderModeIcon(mode.icon, 16, isSelected ? '#818cf8' : '#64748b')}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                          {getModeName(mode)}
                        </Text>
                        <View
                          className={`px-2 py-0.5 rounded-md ${isSelected ? 'bg-indigo-600' : 'bg-slate-800'}`}
                        >
                          <Text
                            className={`text-[9px] font-black ${isSelected ? 'text-white' : 'text-slate-500'}`}
                          >
                            {mode.multiplier}x
                          </Text>
                        </View>
                      </View>
                      <Text className="text-[10px] text-slate-300 font-medium mt-1" style={{ lineHeight: 14 }}>
                        {mode.description}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Habit Buttons */}
        <View style={{ marginBottom: 48 }}>
          <View className="flex-row items-center justify-between mb-8">
            <View>
              <Text className="font-black text-white text-2xl uppercase" style={{ letterSpacing: -0.5 }}>
                {settings.habitName || 'Entrenamiento'}
              </Text>
              <View className="flex-row items-center mt-1">
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: available ? '#06b6d4' : '#334155',
                    marginRight: 8,
                  }}
                />
                <Text className="text-[10px] font-bold text-slate-500 uppercase" style={{ letterSpacing: 2 }}>
                  Ejecución del {today}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row" style={{ gap: 20 }}>
            <View className="flex-1">
              <HabitButton
                type="emergency"
                onPress={() => handleHabitPress('emergency')}
                disabled={!available || selectedModeId !== 'normal'}
                customLabel={settings.emergencyHabit}
              />
            </View>
            <View className="flex-1">
              <HabitButton
                type="twoMinutes"
                onPress={() => handleHabitPress('twoMinutes')}
                disabled={!available || selectedModeId !== 'normal'}
                customLabel={settings.twoMinuteHabit}
              />
            </View>
            <View className="flex-1">
              <HabitButton
                type="complete"
                onPress={() => handleHabitPress('complete')}
                disabled={!available}
                customLabel={settings.completeHabit}
              />
            </View>
          </View>

          {!available && (
            <View className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 items-center mt-8">
              <View className="bg-slate-800 p-4 rounded-3xl border border-white/5 mb-4">
                <Star size={32} color="#818cf8" fill="#818cf8" />
              </View>
              <Text className="text-lg font-black text-white mb-1">¡Victoria de {heroTerm}!</Text>
              <Text
                className="text-xs text-slate-500 font-medium text-center"
                style={{ lineHeight: 18, maxWidth: 240 }}
              >
                Has invertido en tu futuro hoy bajo el {getModeName(selectedMode)}. El progreso es inevitable.
              </Text>
            </View>
          )}
        </View>

        {/* Habit Loop Section */}
        <View
          className="bg-[#0f172a] border border-white/5 py-10 px-4"
          style={{ borderRadius: 48, position: 'relative', overflow: 'visible', marginBottom: 48 }}
        >
          <View
            className="bg-indigo-600 px-4 py-1.5"
            style={{
              position: 'absolute',
              top: -12,
              alignSelf: 'center',
              borderRadius: 999,
              zIndex: 30,
            }}
          >
            <Text className="text-white text-[8px] font-black uppercase" style={{ letterSpacing: 3 }}>
              Arquitectura del Hábito
            </Text>
          </View>
          <HabitLoopView loop={settings.habitLoop} />
        </View>
      </ScrollView>

      <WillpowerModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />

      {/* Info Modal */}
      <Modal transparent visible={infoModalOpen} animationType="fade" onRequestClose={() => setInfoModalOpen(false)}>
        <View className="flex-1 items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <View
            className="bg-slate-950 border border-white/10 w-full p-8"
            style={{ maxWidth: 384, borderRadius: 56, maxHeight: '85%' }}
          >
            <Pressable
              onPress={() => setInfoModalOpen(false)}
              className="bg-white/5 rounded-full p-2"
              style={{ position: 'absolute', top: 24, right: 24, zIndex: 50 }}
            >
              <X size={20} color="#64748b" />
            </Pressable>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="items-center mb-6 pt-6">
                <View className="p-4 bg-orange-500/20 rounded-3xl border border-orange-500/20 mb-3">
                  <Flame size={32} color="#f97316" fill="#f97316" />
                </View>
                <Text
                  className="text-2xl font-black text-white uppercase text-center"
                  style={{ letterSpacing: -0.5 }}
                >
                  Reglas del Linaje
                </Text>
                <Text
                  className="text-[10px] font-black text-indigo-400 uppercase mt-1"
                  style={{ letterSpacing: 3 }}
                >
                  Protocolo de Persistencia
                </Text>
              </View>

              <View style={{ gap: 24 }}>
                {[
                  {
                    icon: <Activity size={18} color="#818cf8" />,
                    title: 'Ejecución Diaria',
                    body: 'Debes registrar al menos un tipo de check-in antes de que termine el día (00:00 GMT-3) para aumentar tu racha.',
                  },
                  {
                    icon: <AlertTriangle size={18} color="#f87171" />,
                    title: 'Riesgo de Ruptura',
                    body: 'Si pasa un día completo sin registros, tu racha actual volverá a 0 inmediatamente. La constancia es el único camino hacia el Olimpo de la Identidad.',
                  },
                  {
                    icon: <ShieldCheck size={18} color="#34d399" />,
                    title: 'Protectores de Racha',
                    body: 'Si tienes protectores (comprados en el Bazar), se activarán automáticamente para salvar tu racha si olvidas un día. Son tu red de seguridad en momentos de crisis.',
                  },
                  {
                    icon: <Zap size={18} color="#fb923c" />,
                    title: 'EMD es Válido',
                    body: 'Incluso el "Esfuerzo Mínimo Diario" (EMD) cuenta como victoria. La clave es no romper la cadena, sin importar si la sesión fue de 10 segundos o 2 horas.',
                  },
                ].map((item, i) => (
                  <View key={i} className="flex-row">
                    <View style={{ marginTop: 4, marginRight: 16 }}>{item.icon}</View>
                    <View className="flex-1">
                      <Text className="text-xs font-black text-white uppercase mb-1">{item.title}</Text>
                      <Text className="text-[10px] text-slate-400 font-medium" style={{ lineHeight: 16 }}>
                        {item.body}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View className="flex-row items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/5 mt-6">
                <View>
                  <Text className="text-[8px] font-black text-slate-500 uppercase" style={{ letterSpacing: 2 }}>
                    Tus Protecciones
                  </Text>
                  <Text className="text-sm font-black text-white uppercase" style={{ letterSpacing: -0.3 }}>
                    {rewards.streakProtectors} Cargas Disponibles
                  </Text>
                </View>
                <View className="p-2 bg-emerald-500/20 rounded-xl">
                  <ShieldCheck size={20} color="#10b981" />
                </View>
              </View>

              <Pressable
                onPress={() => setInfoModalOpen(false)}
                className="w-full bg-indigo-600 py-5 rounded-[2rem] mt-6 border border-indigo-400/20"
              >
                <Text className="text-white font-black text-center uppercase text-[10px]" style={{ letterSpacing: 3 }}>
                  Entendido
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Layout>
  );
};

export default Home;
