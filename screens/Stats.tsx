import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal, Alert } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Activity,
  Shield,
  Flame,
  History,
  Compass,
  Crown,
  Trophy,
  Target,
  X,
  Trash2,
  Info,
  Zap,
  Ruler,
  Eye,
  Layers,
} from 'lucide-react-native';
import { useHabits } from '../context/HabitContext';
import Heatmap from '../components/Heatmap';
import HabitLoopView from '../components/HabitLoopView';
import Layout from '../components/Layout';
import { PastHabit } from '../types';
import { haptics } from '../utils/haptics';

type RankData = {
  level: number;
  name: string;
  description: string;
  feat: string;
  iconEl: React.ReactElement;
  color: string;
  bg: string;
  border: string;
  accent: string;
  nextThreshold: number;
  prevThreshold: number;
};

const Stats: React.FC = () => {
  const { checkins, streak, pastHabits, settings, today, deletePastHabit } = useHabits();
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | '90d'>('30d');
  const [selectedPastHabit, setSelectedPastHabit] = useState<PastHabit | null>(null);
  const [infoModal, setInfoModal] = useState<'rank' | 'curve' | 'matrix' | null>(null);

  const getRankData = (days: number): RankData => {
    if (days >= 32)
      return {
        level: 4,
        name: 'Hércules Semi-Dios',
        description: 'Has alcanzado la cima. Tu disciplina es ahora una fuerza de la naturaleza.',
        feat:
          'Completó 12 trabajos imposibles y se fue aceptado en el Olimpo. Tu disciplina no es algo que haces, es quién eres.',
        iconEl: <Crown size={48} color="#c026d3" />,
        color: 'text-fuchsia-400',
        bg: 'bg-fuchsia-500/10',
        border: 'border-fuchsia-500/20',
        accent: '#c026d3',
        nextThreshold: 50,
        prevThreshold: 32,
      };
    if (days >= 17)
      return {
        level: 3,
        name: 'Aquiles',
        description: 'Maestría técnica. Tu ejecución es impecable y veloz.',
        feat: 'El guerrero más veloz y técnico. Maestría donde tu ejecución es impecable, rápida y casi automática.',
        iconEl: <Shield size={48} color="#f59e0b" />,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        accent: '#f59e0b',
        nextThreshold: 32,
        prevThreshold: 17,
      };
    if (days >= 7)
      return {
        level: 2,
        name: 'Jasón',
        description: 'Consolidación. Como Jasón al frente del Argo, ya has zarpado.',
        feat: 'Lideró la travesía del barco Argo. Fase de consolidación: ya zarpaste y organizas tu entorno para mantener el rumbo.',
        iconEl: <Compass size={48} color="#94a3b8" />,
        color: 'text-slate-300',
        bg: 'bg-slate-400/10',
        border: 'border-slate-400/20',
        accent: '#94a3b8',
        nextThreshold: 17,
        prevThreshold: 7,
      };
    return {
      level: 1,
      name: 'Prometeo',
      description: 'Iniciación. Has robado el fuego de los Dioses para iluminar tu humanidad.',
      feat:
        'Asumes el costo de pensar por cuenta propia: tomas aquello que expande tu capacidad, aunque implique riesgo.',
      iconEl: <Activity size={48} color="#818cf8" />,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      accent: '#818cf8',
      nextThreshold: 7,
      prevThreshold: 0,
    };
  };

  const currentRank = getRankData(streak.currentStreak);
  const linajeTerm = settings.gender === 'male' ? 'Linaje de Héroes' : 'Linaje de Heroínas';

  const progressToNext = useMemo(() => {
    if (streak.currentStreak >= 50) return 100;
    const range = currentRank.nextThreshold - currentRank.prevThreshold;
    const currentPos = streak.currentStreak - currentRank.prevThreshold;
    return Math.max(5, Math.min(100, (currentPos / range) * 100));
  }, [streak.currentStreak, currentRank]);

  const willpowerData = useMemo(() => {
    if (timeRange === 'today') {
      const todayCheckin = checkins.find((c) => c.date === today);
      return [
        { dateLabel: 'Mañana', willpower: 0 },
        { dateLabel: 'Hoy', willpower: todayCheckin ? todayCheckin.willpowerScore : 0 },
      ];
    }
    const daysToLookBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const todayDate = new Date(today + 'T12:00:00');
    const data: { dateLabel: string; willpower: number }[] = [];
    for (let i = daysToLookBack - 1; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const checkin = checkins.find((c) => c.date === dateStr);
      data.push({
        dateLabel: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        willpower: checkin ? checkin.willpowerScore : 0,
      });
    }
    return data;
  }, [checkins, today, timeRange]);

  const avgWillpower = useMemo(() => {
    const withValues = willpowerData.filter((d) => d.willpower > 0);
    if (withValues.length === 0) return '0.0';
    const sum = withValues.reduce((acc, d) => acc + d.willpower, 0);
    return (sum / withValues.length).toFixed(1);
  }, [willpowerData]);

  const chartData = useMemo(
    () =>
      willpowerData.map((d, i) => ({
        value: d.willpower,
        label: i % Math.max(1, Math.floor(willpowerData.length / 6)) === 0 ? d.dateLabel : '',
      })),
    [willpowerData]
  );

  const getRankBadgeClasses = (rankName: string): { bg: string; border: string; text: string } => {
    if (rankName.includes('Hércules'))
      return { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', text: 'text-fuchsia-500' };
    if (rankName.includes('Aquiles'))
      return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500' };
    if (rankName.includes('Jasón'))
      return { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-500' };
    return { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-500' };
  };

  const handleDeleteRecord = (id: string) => {
    haptics.error();
    Alert.alert(
      'Eliminar registro',
      '¿Deseas eliminar este registro de tu linaje para siempre?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deletePastHabit(id);
            setSelectedPastHabit(null);
            haptics.success();
          },
        },
      ]
    );
  };

  const legendItems = [
    { label: settings.completeHabit || 'Completo', color: '#06b6d4' },
    { label: settings.twoMinuteHabit || '2 min', color: '#6366f1' },
    { label: settings.emergencyHabit || 'EMD', color: '#f97316' },
    { label: 'Día Perdido', color: '#ffffff' },
    { label: 'Sin Registro', color: '#0f172a' },
  ];

  const renderInfoModal = () => {
    if (!infoModal) return null;

    const modalData =
      infoModal === 'rank'
        ? {
            icon: currentRank.iconEl,
            title: 'Estatus de Identidad',
            subtitle: `Rango actual: ${currentRank.name}`,
            rules: [{ icon: currentRank.iconEl, title: currentRank.name, desc: currentRank.feat }],
          }
        : infoModal === 'curve'
        ? {
            icon: <TrendingUp size={32} color="#ec4899" />,
            title: 'Curva de Adaptación',
            subtitle: 'Métrica de Resistencia',
            rules: [
              {
                icon: <Zap size={18} color="#fbbf24" />,
                title: 'Willpower Score',
                desc: 'Mide qué tanto esfuerzo (del 1 al 10) te costó arrancar. A mayor número, menos "lag" de inicio.',
              },
              {
                icon: <Target size={18} color="#22d3ee" />,
                title: 'Media de Voluntad',
                desc: 'Representa tu estado de flujo promedio. Una media alta indica que el hábito ya no genera fricción mental.',
              },
              {
                icon: <Ruler size={18} color="#94a3b8" />,
                title: 'Tendencia',
                desc: 'Busca que la línea se estabilice en valores altos (8-10) con el paso de las semanas.',
              },
            ],
          }
        : {
            icon: <Calendar size={32} color="#6366f1" />,
            title: 'Matriz de Esfuerzo',
            subtitle: 'Huella Visual',
            rules: [
              {
                icon: <Layers size={18} color="#818cf8" />,
                title: 'Cronología',
                desc: 'Este mapa es lineal. Cada cuadro es un día de los últimos 84 días. Los cuadros negros son días que perdiste.',
              },
              {
                icon: <Eye size={18} color="#818cf8" />,
                title: 'Visión de Racha',
                desc: 'Los cuadros grises son el futuro. Tu misión es evitar que se conviertan en huecos negros manteniendo la constancia.',
              },
            ],
          };

    return (
      <Modal transparent visible={!!infoModal} animationType="fade" onRequestClose={() => setInfoModal(null)}>
        <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <View
            className="bg-[#020617] border border-white/10 w-full p-8"
            style={{ maxWidth: 384, borderRadius: 56 }}
          >
            <Pressable
              onPress={() => setInfoModal(null)}
              style={{ position: 'absolute', top: 24, right: 24, padding: 8 }}
            >
              <X size={20} color="#64748b" />
            </Pressable>
            <View className="items-center mb-8 pt-6">
              <View className="p-4 bg-white/5 rounded-3xl border border-white/5 mb-3">{modalData.icon}</View>
              <Text
                className="text-2xl font-black text-white uppercase text-center"
                style={{ letterSpacing: -0.5 }}
              >
                {modalData.title}
              </Text>
              <Text
                className="text-[10px] font-black text-indigo-400 uppercase mt-1"
                style={{ letterSpacing: 3 }}
              >
                {modalData.subtitle}
              </Text>
            </View>
            <View style={{ gap: 24 }}>
              {modalData.rules.map((rule, i) => (
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
              onPress={() => setInfoModal(null)}
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
    );
  };

  const renderPastHabitModal = () => {
    if (!selectedPastHabit) return null;
    const habit = selectedPastHabit;
    const dateFormatted = new Date(habit.date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const pastChartData = habit.willpowerHistory?.map((d, i) => ({
      value: d.willpower,
      label: i % 5 === 0 ? d.dateLabel : '',
    })) ?? [];

    return (
      <Modal transparent visible animationType="fade" onRequestClose={() => setSelectedPastHabit(null)}>
        <View className="flex-1 items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <View
            className="bg-[#020617] border border-white/10 w-full"
            style={{ maxWidth: 512, borderRadius: 56, height: '85%', overflow: 'hidden' }}
          >
            <View className="p-8 pb-4 flex-row justify-between items-start">
              <View className="flex-1">
                <Text
                  className="text-2xl font-black text-white uppercase"
                  style={{ letterSpacing: -0.5 }}
                  numberOfLines={2}
                >
                  {habit.name}
                </Text>
                <Text
                  className="text-[10px] font-black text-indigo-400 uppercase mt-1"
                  style={{ letterSpacing: 3 }}
                >
                  Misión Finalizada el {dateFormatted}
                </Text>
              </View>
              <Pressable onPress={() => setSelectedPastHabit(null)} className="p-2">
                <X size={24} color="#64748b" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 32, gap: 32 }}>
              <View className="flex-row flex-wrap" style={{ gap: 16 }}>
                {[
                  { label: 'Sesiones Totales', icon: <Activity size={14} color="#22d3ee" />, value: habit.sessions },
                  { label: 'Máxima Racha', icon: <Flame size={14} color="#f97316" />, value: habit.maxStreak },
                  {
                    label: 'Rango Alcanzado',
                    icon: <Crown size={14} color="#fbbf24" />,
                    value: habit.rankReached,
                    small: true,
                  },
                  {
                    label: 'Media Voluntad',
                    icon: <Zap size={14} color="#ec4899" />,
                    value: habit.avgWillpower || '0.0',
                  },
                ].map((s, i) => (
                  <View
                    key={i}
                    className="bg-white/5 border border-white/5 p-5 rounded-3xl"
                    style={{ width: '48%' }}
                  >
                    <Text
                      className="text-[8px] font-black text-slate-500 uppercase"
                      style={{ letterSpacing: 2 }}
                    >
                      {s.label}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      {s.icon}
                      <Text
                        className={`font-black text-white uppercase ml-2 ${s.small ? 'text-xs' : 'text-xl'}`}
                        numberOfLines={1}
                      >
                        {s.value}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {habit.willpowerHistory && habit.willpowerHistory.length > 0 && (
                <View>
                  <View className="flex-row items-center mb-3 px-1">
                    <TrendingUp size={16} color="#ec4899" />
                    <Text className="text-[10px] font-black text-white uppercase ml-2" style={{ letterSpacing: 3 }}>
                      Últimos 30 Días
                    </Text>
                  </View>
                  <View className="bg-white/5 rounded-[2rem] border border-white/5 p-4">
                    <LineChart
                      data={pastChartData}
                      areaChart
                      curved
                      hideDataPoints
                      startFillColor="#ec4899"
                      endFillColor="#ec4899"
                      startOpacity={0.4}
                      endOpacity={0.05}
                      color="#ec4899"
                      thickness={2}
                      noOfSections={5}
                      maxValue={10}
                      yAxisColor="transparent"
                      xAxisColor="transparent"
                      rulesColor="#1e293b"
                      yAxisTextStyle={{ color: '#475569', fontSize: 9 }}
                      xAxisLabelTextStyle={{ color: '#475569', fontSize: 8 }}
                      initialSpacing={10}
                      height={120}
                      adjustToWidth
                    />
                  </View>
                </View>
              )}

              {habit.checkinsSnapshot && habit.checkinsSnapshot.length > 0 && (
                <View>
                  <View className="flex-row items-center mb-3 px-1">
                    <Calendar size={16} color="#6366f1" />
                    <Text className="text-[10px] font-black text-white uppercase ml-2" style={{ letterSpacing: 3 }}>
                      Matriz de Esfuerzo
                    </Text>
                  </View>
                  <Heatmap checkins={habit.checkinsSnapshot} endDate={habit.date.split('T')[0]} />
                </View>
              )}

              {habit.habitLoop && (
                <View
                  className="bg-white/5 border border-white/5 py-10 px-4"
                  style={{ borderRadius: 48 }}
                >
                  <HabitLoopView loop={habit.habitLoop} title="Ciclo de Identidad" />
                </View>
              )}

              <Pressable
                onPress={() => handleDeleteRecord(habit.id)}
                className="flex-row items-center justify-center bg-red-500/10 py-4 rounded-3xl border border-red-500/20"
              >
                <Trash2 size={16} color="#ef4444" />
                <Text
                  className="text-red-500 font-black uppercase text-[10px] ml-2"
                  style={{ letterSpacing: 2 }}
                >
                  Eliminar del Linaje
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <Layout>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 96, gap: 40 }}>
        <View className="flex-row items-center px-2">
          <View className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mr-4">
            <BarChart3 size={24} color="#818cf8" />
          </View>
          <View>
            <Text className="text-2xl font-black text-white" style={{ letterSpacing: -0.5 }}>
              Análisis
            </Text>
            <Text className="text-[10px] text-slate-500 font-bold uppercase mt-1" style={{ letterSpacing: 2 }}>
              Evolución del Héroe
            </Text>
          </View>
        </View>

        {/* Rank Card */}
        <View className={`${currentRank.bg} border ${currentRank.border} p-8`} style={{ borderRadius: 56, position: 'relative' }}>
          <Pressable
            onPress={() => {
              haptics.selection();
              setInfoModal('rank');
            }}
            style={{ position: 'absolute', top: 24, right: 24, padding: 8, zIndex: 20 }}
          >
            <Info size={18} color="rgba(148,163,184,0.4)" />
          </Pressable>

          <View className="items-center">
            <View className="relative mb-6">
              <View className="w-24 h-24 bg-black/40 rounded-[2.5rem] items-center justify-center border border-white/5">
                {currentRank.iconEl}
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: -8,
                  right: -8,
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: currentRank.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#0f172a',
                }}
              >
                <Text className="text-white font-black text-[10px]">NV {currentRank.level}</Text>
              </View>
            </View>

            <Text
              className="text-[9px] font-black uppercase text-white/40"
              style={{ letterSpacing: 4 }}
            >
              Estatus de Identidad
            </Text>
            <Text
              className={`text-3xl font-black ${currentRank.color} mt-1`}
              style={{ letterSpacing: -1 }}
            >
              {currentRank.name}
            </Text>
            <Text
              className="mt-4 text-[11px] font-medium text-slate-300 italic px-4 text-center"
              style={{ lineHeight: 16 }}
            >
              {currentRank.description}
            </Text>

            <View className="w-full mt-8">
              <View className="flex-row justify-between items-center mb-3 px-1">
                <View className="flex-row items-center">
                  <Target size={12} color="#6366f1" />
                  <Text
                    className="text-[10px] font-black uppercase text-slate-500 ml-2"
                    style={{ letterSpacing: 2 }}
                  >
                    Progreso al Nivel {currentRank.level === 4 ? 4 : currentRank.level + 1}
                  </Text>
                </View>
                <Text
                  className="text-[10px] font-black uppercase text-slate-500"
                  style={{ letterSpacing: 2 }}
                >
                  {Math.round(progressToNext)}%
                </Text>
              </View>
              <View
                className="bg-white/5 border border-white/5 overflow-hidden"
                style={{ height: 12, borderRadius: 6, padding: 2 }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${progressToNext}%`,
                    borderRadius: 4,
                    backgroundColor: currentRank.accent,
                  }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Adaptation Curve */}
        <View className="bg-slate-900 border border-slate-800 p-8" style={{ borderRadius: 48, position: 'relative' }}>
          <Pressable
            onPress={() => {
              haptics.selection();
              setInfoModal('curve');
            }}
            style={{ position: 'absolute', top: 24, right: 24, padding: 8, zIndex: 20 }}
          >
            <Info size={16} color="rgba(148,163,184,0.4)" />
          </Pressable>

          <View className="items-center mb-6">
            <View className="flex-row items-center">
              <TrendingUp size={18} color="#ec4899" />
              <Text className="text-[10px] font-black uppercase text-white ml-2" style={{ letterSpacing: 4 }}>
                Curva de Adaptación
              </Text>
            </View>
            <View className="bg-pink-500/10 border border-pink-500/20 px-4 py-1.5 rounded-full mt-3">
              <Text className="text-[9px] font-black text-pink-400">Media: {avgWillpower}</Text>
            </View>
          </View>

          <View className="flex-row bg-white/5 border border-white/5 rounded-2xl p-1 mb-6">
            {(['today', '7d', '30d', '90d'] as const).map((r) => (
              <Pressable
                key={r}
                onPress={() => setTimeRange(r)}
                className={`flex-1 py-2 rounded-xl items-center ${timeRange === r ? 'bg-slate-800' : ''}`}
              >
                <Text
                  className={`text-[8px] font-black uppercase ${
                    timeRange === r ? 'text-indigo-400' : 'text-slate-400'
                  }`}
                  style={{ letterSpacing: 2 }}
                >
                  {r.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ minHeight: 220, alignItems: 'center', justifyContent: 'center' }}>
            <LineChart
              data={chartData}
              areaChart
              curved
              hideDataPoints
              startFillColor="#ec4899"
              endFillColor="#ec4899"
              startOpacity={0.6}
              endOpacity={0.05}
              color="#ec4899"
              thickness={3}
              noOfSections={5}
              maxValue={10}
              yAxisColor="transparent"
              xAxisColor="transparent"
              rulesColor="#1e293b"
              yAxisTextStyle={{ color: '#475569', fontSize: 10, fontWeight: '900' }}
              xAxisLabelTextStyle={{ color: '#475569', fontSize: 8, fontWeight: '900' }}
              height={200}
              adjustToWidth
              initialSpacing={10}
            />
          </View>
        </View>

        {/* Heatmap */}
        <View className="bg-slate-900 border border-slate-800 p-8" style={{ borderRadius: 56, position: 'relative' }}>
          <Pressable
            onPress={() => {
              haptics.selection();
              setInfoModal('matrix');
            }}
            style={{ position: 'absolute', top: 24, right: 24, padding: 8, zIndex: 20 }}
          >
            <Info size={16} color="rgba(148,163,184,0.4)" />
          </Pressable>

          <View className="flex-row items-center mb-6 px-1">
            <Calendar size={18} color="#6366f1" />
            <Text className="text-[10px] font-black uppercase text-white ml-2" style={{ letterSpacing: 4 }}>
              Matriz de Esfuerzo
            </Text>
          </View>

          <Heatmap checkins={checkins} endDate={today} />

          <View
            className="flex-row flex-wrap pt-6 mt-6"
            style={{ gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}
          >
            {legendItems.map((item, idx) => (
              <View key={idx} className="flex-row items-center" style={{ width: '48%' }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 4,
                    backgroundColor: item.color,
                    marginRight: 12,
                    borderWidth: item.color === '#0f172a' ? 1 : 0,
                    borderColor: 'rgba(255,255,255,0.05)',
                  }}
                />
                <Text
                  className="text-[9px] font-black text-slate-400 uppercase"
                  numberOfLines={1}
                  style={{ letterSpacing: -0.3 }}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Linaje */}
        <View>
          <View className="px-4 mb-6">
            <View className="flex-row items-center mb-1">
              <History size={16} color="#6366f1" />
              <Text className="text-[10px] font-black uppercase text-white ml-2" style={{ letterSpacing: 4 }}>
                {linajeTerm}
              </Text>
            </View>
            <Text
              className="text-[10px] text-slate-400 font-bold uppercase"
              style={{ letterSpacing: 2, lineHeight: 14 }}
            >
              Historial de identidades forjadas anteriormente.
            </Text>
          </View>

          <View style={{ gap: 20 }}>
            {pastHabits.length > 0 ? (
              pastHabits.map((habit) => {
                const badge = getRankBadgeClasses(habit.rankReached || 'Prometeo');
                return (
                  <Pressable
                    key={habit.id}
                    onPress={() => setSelectedPastHabit(habit)}
                    className="bg-slate-900 border border-slate-800 p-6 mx-1"
                    style={{ borderRadius: 45, position: 'relative', overflow: 'hidden' }}
                  >
                    <View style={{ position: 'absolute', top: 16, right: 16, opacity: 0.1 }}>
                      <Trophy size={40} color="#818cf8" />
                    </View>
                    <View className="flex-row justify-between items-start">
                      <Text className="text-sm font-black text-white uppercase flex-1 mr-2" style={{ letterSpacing: -0.3 }} numberOfLines={2}>
                        {habit.name}
                      </Text>
                      <View className={`${badge.bg} border ${badge.border} px-2 py-1 rounded-full`}>
                        <Text className={`${badge.text} text-[8px] font-black uppercase`}>
                          {habit.rankReached || 'Prometeo'}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <View
                className="bg-white/5 border border-dashed border-white/5 p-12 items-center mx-1"
                style={{ borderRadius: 45 }}
              >
                <Text
                  className="text-[10px] text-slate-400 uppercase font-black"
                  style={{ letterSpacing: 2 }}
                >
                  Tu legado comienza hoy
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {renderInfoModal()}
      {renderPastHabitModal()}
    </Layout>
  );
};

export default Stats;
