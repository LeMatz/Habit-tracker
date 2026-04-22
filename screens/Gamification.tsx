import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Dice5,
  ShoppingBag,
  Lock,
  ShieldCheck,
  Scissors,
  Zap,
  Music,
  BookOpen,
  Sparkles,
  Gift,
  Coffee,
  Coins,
  Infinity as InfinityIcon,
  X,
  CheckCircle2,
  Info,
  Dice1,
  LayoutGrid,
  History,
  Dices,
} from 'lucide-react-native';
import { useHabits } from '../context/HabitContext';
import { haptics } from '../utils/haptics';
import { soundService } from '../utils/soundService';
import Layout from '../components/Layout';
import { UserReward } from '../types';

const renderRewardIcon = (iconName?: string, size = 24, color = '#ffffff') => {
  const IconMap: Record<string, React.ComponentType<any>> = {
    Scissors,
    ShieldCheck,
    Zap,
    Music,
    BookOpen,
    Coffee,
    Sparkles,
    Gift,
  };
  const Comp = IconMap[iconName ?? 'Sparkles'] || Sparkles;
  return <Comp size={size} color={color} />;
};

const Gamification: React.FC = () => {
  const {
    rewards,
    redeemReward,
    addPoints,
    diceRewards,
    hasCheckedInToday,
    recordDiceRoll,
    settings,
    today,
  } = useHabits();

  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [purchasedReward, setPurchasedReward] = useState<UserReward | null>(null);
  const [showDiceRewardModal, setShowDiceRewardModal] = useState(false);
  const [infoModal, setInfoModal] = useState<'dice' | 'inventory' | 'mana' | null>(null);

  const habitCompleted = hasCheckedInToday();
  const alreadyRolled = rewards.lastDiceRollDate === today;
  const canRoll = habitCompleted && !alreadyRolled;
  const heroTerm = settings.gender === 'male' ? 'Héroe' : 'Heroína';

  useEffect(() => {
    if (alreadyRolled && rewards.lastDiceResult) {
      setDiceResult(rewards.lastDiceResult);
    }
  }, [alreadyRolled, rewards.lastDiceResult]);

  const effectiveDiceResult = diceResult || (alreadyRolled ? rewards.lastDiceResult : null);

  const handleRollDice = () => {
    if (isRolling || !canRoll) return;
    haptics.medium();
    setIsRolling(true);
    setDiceResult(null);
    const vInterval = setInterval(() => {
      haptics.selection();
      if (settings.soundsEnabled) soundService.playDiceTick();
    }, 120);
    setTimeout(() => {
      clearInterval(vInterval);
      const result = Math.floor(Math.random() * 6) + 1;
      setDiceResult(result);
      setIsRolling(false);
      haptics.success();
      if (settings.soundsEnabled) soundService.playDiceResult();
      if (result === 6) addPoints(3);
      recordDiceRoll(result);
      setShowDiceRewardModal(true);
    }, 1500);
  };

  const handleRedeem = (reward: UserReward) => {
    haptics.heavy();
    const success = redeemReward(reward.id);
    if (success) {
      haptics.success();
      if (settings.soundsEnabled) soundService.playPurchase();
      setPurchasedReward(reward);
    } else {
      haptics.error();
    }
  };

  const modalContent = {
    dice: {
      icon: <Dice1 size={32} color="#818cf8" />,
      title: 'Dado del Destino',
      subtitle: 'Sistema de Invocación',
      rules: [
        {
          icon: <CheckCircle2 size={18} color="#34d399" />,
          title: 'Requisito de Hábito',
          desc: 'El dado solo puede ser invocado una vez al día, DESPUÉS de registrar tu hábito.',
        },
        {
          icon: <Sparkles size={18} color="#fbbf24" />,
          title: 'Jackpot del 6',
          desc: 'Si obtienes un 6, además del premio especial, recibes +3 puntos de Maná extra.',
        },
        {
          icon: <InfinityIcon size={18} color="#818cf8" />,
          title: 'Personalización',
          desc: 'Puedes ajustar los premios que otorga cada número del dado en la sección de Ajustes.',
        },
      ],
    },
    inventory: {
      icon: <LayoutGrid size={32} color="#818cf8" />,
      title: 'Inventario Élite',
      subtitle: 'Economía de Identidad',
      rules: [
        {
          icon: <Coins size={18} color="#fbbf24" />,
          title: 'Cosecha de Maná',
          desc: 'Obtienes Maná mediante check-ins y misiones diarias. Los modos de dificultad multiplican tu ganancia.',
        },
        {
          icon: <ShieldCheck size={18} color="#34d399" />,
          title: 'Protección Automática',
          desc: "El 'Protector de Racha' se activa solo si olvidas un día. Es tu red de seguridad definitiva.",
        },
        {
          icon: <Sparkles size={18} color="#818cf8" />,
          title: 'Tipos de Items',
          desc: 'Instantáneos (alivio inmediato), Experiencias (contenido exclusivo) y Tratamientos (recompensas físicas).',
        },
      ],
    },
    mana: {
      icon: <Zap size={32} color="#818cf8" />,
      title: 'Energía de Maná',
      subtitle: 'Recurso de Transformación',
      rules: [
        {
          icon: <Sparkles size={18} color="#818cf8" />,
          title: 'Origen',
          desc: 'El Maná es la representación de tu energía de voluntad convertida en recurso digital.',
        },
        {
          icon: <Coins size={18} color="#fbbf24" />,
          title: 'Acumulación',
          desc: 'Obtienes Maná por cada check-in diario, sin importar si es la versión completa, de 2 minutos o EMD.',
        },
        {
          icon: <ShoppingBag size={18} color="#22d3ee" />,
          title: 'Utilidad',
          desc: 'Gasta tu Maná en el Bazar para obtener protecciones de racha o premios que refuercen tu nueva identidad.',
        },
      ],
    },
  };

  const activeModal = infoModal ? modalContent[infoModal] : null;

  return (
    <Layout>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 96, gap: 48 }}>
        <View className="flex-row items-center px-1">
          <View className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mr-3">
            <ShoppingBag size={24} color="#818cf8" />
          </View>
          <View>
            <Text className="text-2xl font-black text-white" style={{ letterSpacing: -0.5 }}>
              Bazar
            </Text>
            <Text className="text-[10px] text-slate-500 font-bold uppercase mt-1" style={{ letterSpacing: 2 }}>
              Intercambio de Voluntad
            </Text>
          </View>
        </View>

        {/* Maná Circle */}
        <View style={{ position: 'relative', alignItems: 'center', paddingVertical: 40 }}>
          <Pressable
            onPress={() => {
              haptics.selection();
              setInfoModal('mana');
            }}
            style={{
              position: 'absolute',
              top: 0,
              right: 40,
              padding: 12,
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
              borderRadius: 16,
              zIndex: 20,
            }}
          >
            <Info size={20} color="#64748b" />
          </Pressable>

          <LinearGradient
            colors={['#1e1b4b', '#000000']}
            style={{
              width: 192,
              height: 192,
              borderRadius: 96,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <Text className="text-7xl font-black text-white" style={{ letterSpacing: -3 }}>
              {rewards.availablePoints}
            </Text>
            <Text
              className="text-xs font-black text-indigo-400 uppercase"
              style={{ letterSpacing: 4, marginTop: -5 }}
            >
              Maná
            </Text>
          </LinearGradient>
        </View>

        {/* Dado del Destino */}
        <View style={{ position: 'relative' }}>
          <Pressable
            onPress={() => {
              haptics.selection();
              setInfoModal('dice');
            }}
            style={{ position: 'absolute', top: 0, right: 16, padding: 8, zIndex: 20 }}
          >
            <Info size={18} color="#64748b" />
          </Pressable>
          <View className="flex-row items-center mb-6 px-4">
            <Coins size={14} color="#6366f1" />
            <Text className="text-[10px] font-black uppercase text-slate-500 ml-2" style={{ letterSpacing: 4 }}>
              Mecánica de Suerte
            </Text>
          </View>

          {canRoll || isRolling ? (
            <LinearGradient colors={['#4f46e5', '#1e1b4b']} style={{ padding: 40, borderRadius: 64 }}>
              <View className="items-center" style={{ gap: 32 }}>
                <Text
                  className="text-2xl font-black text-white uppercase text-center"
                  style={{ letterSpacing: -0.5 }}
                >
                  Dado del destino
                </Text>
                <View
                  className="bg-white items-center justify-center"
                  style={{ width: 128, height: 128, borderRadius: 45 }}
                >
                  {!habitCompleted ? (
                    <Lock size={44} color="#4338ca" />
                  ) : isRolling ? (
                    <Dice5 size={60} color="#4338ca" />
                  ) : effectiveDiceResult ? (
                    <Text className="text-indigo-700 font-black" style={{ fontSize: 60 }}>
                      {effectiveDiceResult}
                    </Text>
                  ) : (
                    <Dice5 size={60} color="#4338ca" />
                  )}
                </View>
                {effectiveDiceResult && !isRolling && (
                  <View className="items-center">
                    <Text
                      className="text-[10px] font-black text-indigo-400 uppercase mb-1"
                      style={{ letterSpacing: 3 }}
                    >
                      Recompensa Activa
                    </Text>
                    <Text
                      className="font-black text-3xl text-white uppercase text-center"
                      style={{ letterSpacing: -1 }}
                    >
                      {diceRewards.find((r) => r.diceNumber === effectiveDiceResult)?.title}
                    </Text>
                    {effectiveDiceResult === 6 && (
                      <Text
                        className="text-amber-400 text-[10px] font-bold uppercase mt-2"
                        style={{ letterSpacing: 2 }}
                      >
                        ✨ +3 Puntos de Maná Extra ✨
                      </Text>
                    )}
                  </View>
                )}
                <Pressable
                  onPress={handleRollDice}
                  disabled={isRolling || !canRoll}
                  className="w-full py-6 bg-white rounded-[2rem]"
                  style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}
                >
                  <Text
                    className="text-indigo-700 font-black text-center uppercase text-[10px]"
                    style={{ letterSpacing: 3 }}
                  >
                    {isRolling
                      ? 'Invocando...'
                      : alreadyRolled && effectiveDiceResult
                      ? diceRewards.find((r) => r.diceNumber === effectiveDiceResult)?.title || 'Lanzar Dado'
                      : 'Lanzar Dado'}
                  </Text>
                </Pressable>
              </View>
            </LinearGradient>
          ) : (
            <View
              className="bg-slate-900 border border-white/5 p-10"
              style={{ borderRadius: 64, opacity: 0.9 }}
            >
              <View className="items-center" style={{ gap: 32 }}>
                <Text
                  className="text-2xl font-black text-white uppercase text-center"
                  style={{ letterSpacing: -0.5 }}
                >
                  Dado del destino
                </Text>
                <View
                  className="bg-white items-center justify-center"
                  style={{ width: 128, height: 128, borderRadius: 45, opacity: 0.4 }}
                >
                  {!habitCompleted ? (
                    <Lock size={44} color="#4338ca" />
                  ) : effectiveDiceResult ? (
                    <Text className="text-indigo-700 font-black" style={{ fontSize: 60 }}>
                      {effectiveDiceResult}
                    </Text>
                  ) : (
                    <Dice5 size={60} color="#4338ca" />
                  )}
                </View>
                {effectiveDiceResult && (
                  <View className="items-center">
                    <Text
                      className="text-[10px] font-black text-indigo-400 uppercase mb-1"
                      style={{ letterSpacing: 3 }}
                    >
                      Recompensa Activa
                    </Text>
                    <Text
                      className="font-black text-3xl text-white uppercase text-center"
                      style={{ letterSpacing: -1 }}
                    >
                      {diceRewards.find((r) => r.diceNumber === effectiveDiceResult)?.title}
                    </Text>
                  </View>
                )}
                <View className="w-full py-6 bg-slate-800 rounded-[2rem]">
                  <Text
                    className="text-slate-400 font-black text-center uppercase text-[10px]"
                    style={{ letterSpacing: 3 }}
                  >
                    {!habitCompleted ? 'Completa tu hábito primero' : 'Ya lanzaste hoy'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Dice rewards grid */}
          <View className="px-4 mt-6">
            <View className="flex-row items-center justify-center mb-4">
              <Dices size={12} color="#6366f1" />
              <Text
                className="text-[8px] font-black uppercase text-slate-500 ml-2"
                style={{ letterSpacing: 2 }}
              >
                Premios del Dado del Destino
              </Text>
            </View>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {diceRewards.map((reward) => (
                <View
                  key={reward.id}
                  className="bg-white/5 border border-white/5 p-3 rounded-2xl items-center"
                  style={{ width: '31%' }}
                >
                  <Text className="text-xs font-black text-indigo-500 mb-1">{reward.diceNumber}</Text>
                  <Text
                    className="text-[9px] font-bold text-slate-300 text-center"
                    style={{ lineHeight: 11 }}
                    numberOfLines={2}
                  >
                    {reward.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Inventario */}
        <View style={{ position: 'relative' }}>
          <Pressable
            onPress={() => {
              haptics.selection();
              setInfoModal('inventory');
            }}
            style={{ position: 'absolute', top: 0, right: 16, padding: 8, zIndex: 20 }}
          >
            <Info size={18} color="#64748b" />
          </Pressable>

          <View className="flex-row items-center justify-between px-4 mb-6">
            <View className="flex-row items-center">
              <View
                style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366f1', marginRight: 12 }}
              />
              <Text className="font-black text-[11px] text-slate-500 uppercase" style={{ letterSpacing: 3 }}>
                Inventario de Élite
              </Text>
            </View>
            {rewards.streakProtectors > 0 && (
              <View className="flex-row items-center bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                <ShieldCheck size={12} color="#10b981" />
                <Text
                  className="text-[10px] font-black text-emerald-400 uppercase ml-2"
                  style={{ letterSpacing: 2 }}
                >
                  {rewards.streakProtectors} {rewards.streakProtectors === 1 ? 'Protector' : 'Protectores'}
                </Text>
              </View>
            )}
          </View>

          <View style={{ gap: 24 }}>
            {rewards.rewardsCatalog.map((reward) => {
              const isAffordable = rewards.availablePoints >= reward.cost;
              return (
                <View
                  key={reward.id}
                  className={`p-6 flex-row items-center justify-between border ${
                    isAffordable ? 'bg-slate-900 border-white/10' : 'bg-slate-900/30 border-white/5'
                  }`}
                  style={{ borderRadius: 45, opacity: isAffordable ? 1 : 0.8 }}
                >
                  <View className="flex-row items-center flex-1">
                    <View className="p-4 rounded-2xl bg-slate-800/50 border border-white/10 mr-4">
                      {renderRewardIcon(reward.icon, 24)}
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-base font-black text-white mb-0.5"
                        style={{ letterSpacing: -0.3 }}
                        numberOfLines={1}
                      >
                        {reward.name}
                      </Text>
                      <Text
                        className="text-[10px] text-slate-500 font-bold uppercase"
                        style={{ letterSpacing: 2, lineHeight: 12 }}
                        numberOfLines={2}
                      >
                        {reward.description}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => handleRedeem(reward)}
                    disabled={!isAffordable}
                    className={`px-6 py-3.5 rounded-[1.5rem] ${
                      isAffordable ? 'bg-white' : 'bg-slate-800/50'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-black uppercase ${
                        isAffordable ? 'text-slate-950' : 'text-slate-400'
                      }`}
                      style={{ letterSpacing: 2 }}
                    >
                      {reward.cost} MANÁ
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        {/* Purchase History */}
        {rewards.purchaseHistory && rewards.purchaseHistory.length > 0 && (
          <View>
            <View className="flex-row items-center mb-6 px-4">
              <History size={14} color="#94a3b8" />
              <Text className="text-[10px] font-black uppercase text-slate-500 ml-3" style={{ letterSpacing: 4 }}>
                Historial de Canjes
              </Text>
            </View>

            <View className="bg-slate-900/50 border border-white/5 overflow-hidden" style={{ borderRadius: 40 }}>
              {rewards.purchaseHistory.slice(0, 5).map((transaction, i, arr) => {
                const reward = rewards.rewardsCatalog.find((r) => r.id === transaction.rewardId);
                const date = new Date(transaction.date).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <View
                    key={transaction.id}
                    className="p-5 flex-row items-center justify-between"
                    style={{
                      borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                      borderBottomColor: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="p-2 bg-slate-800 rounded-xl mr-4">
                        {renderRewardIcon(reward?.icon, 16, '#94a3b8')}
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-xs font-black text-white uppercase"
                          style={{ letterSpacing: -0.3 }}
                          numberOfLines={1}
                        >
                          {reward?.name || 'Recompensa Desconocida'}
                        </Text>
                        <Text className="text-[10px] text-slate-500 font-medium">{date}</Text>
                      </View>
                    </View>
                    <Text
                      className="text-[10px] font-black text-indigo-500 uppercase"
                      style={{ letterSpacing: 2 }}
                    >
                      -{transaction.pointsSpent} MANÁ
                    </Text>
                  </View>
                );
              })}
              {rewards.purchaseHistory.length > 5 && (
                <View className="p-4 items-center" style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
                  <Text className="text-[10px] text-slate-400 font-bold uppercase" style={{ letterSpacing: 2 }}>
                    Y {rewards.purchaseHistory.length - 5} canjes más...
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Info modal */}
      <Modal
        transparent
        visible={!!infoModal}
        animationType="fade"
        onRequestClose={() => setInfoModal(null)}
      >
        <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          {activeModal && (
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
                <View className="p-4 bg-white/5 rounded-3xl border border-white/5 mb-3">
                  {activeModal.icon}
                </View>
                <Text
                  className="text-2xl font-black text-white uppercase text-center"
                  style={{ letterSpacing: -0.5 }}
                >
                  {activeModal.title}
                </Text>
                <Text
                  className="text-[10px] font-black text-indigo-400 uppercase mt-1"
                  style={{ letterSpacing: 3 }}
                >
                  {activeModal.subtitle}
                </Text>
              </View>
              <View style={{ gap: 24 }}>
                {activeModal.rules.map((rule, i) => (
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
          )}
        </View>
      </Modal>

      {/* Purchase confirmation modal */}
      <Modal
        transparent
        visible={!!purchasedReward}
        animationType="fade"
        onRequestClose={() => setPurchasedReward(null)}
      >
        <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          {purchasedReward && (
            <View
              className="bg-slate-900 border border-white/10 w-full p-8 items-center"
              style={{ maxWidth: 384, borderRadius: 56 }}
            >
              <Pressable
                onPress={() => setPurchasedReward(null)}
                style={{ position: 'absolute', top: 24, right: 24, padding: 8 }}
              >
                <X size={20} color="#64748b" />
              </Pressable>
              <View className="p-8 rounded-2xl bg-slate-800/50 border border-white/10 mb-6 mt-4">
                {renderRewardIcon(purchasedReward.icon, 48)}
              </View>
              <Text
                className="text-3xl font-black text-white text-center mb-6"
                style={{ letterSpacing: -1 }}
              >
                ¡Felicidades, {heroTerm}!
              </Text>
              <Pressable
                onPress={() => setPurchasedReward(null)}
                className="w-full bg-indigo-600 py-5 rounded-[2rem]"
              >
                <Text
                  className="text-white font-black text-center uppercase text-[10px]"
                  style={{ letterSpacing: 2 }}
                >
                  Continuar Misión
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>

      {/* Dice result modal */}
      <Modal
        transparent
        visible={showDiceRewardModal && !!diceResult}
        animationType="fade"
        onRequestClose={() => setShowDiceRewardModal(false)}
      >
        <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
          {diceResult && (
            <View
              className="bg-[#020617] border border-white/10 w-full p-10 items-center"
              style={{ maxWidth: 384, borderRadius: 64 }}
            >
              <Pressable
                onPress={() => setShowDiceRewardModal(false)}
                style={{ position: 'absolute', top: 32, right: 32, padding: 8, zIndex: 20 }}
              >
                <X size={20} color="#64748b" />
              </Pressable>
              <View
                className="bg-white p-6 items-center justify-center"
                style={{ borderRadius: 40, marginBottom: 32 }}
              >
                <Text className="text-indigo-700 font-black" style={{ fontSize: 60 }}>
                  {diceResult}
                </Text>
              </View>
              <Text
                className="text-[10px] font-black text-indigo-400 uppercase mb-3"
                style={{ letterSpacing: 4 }}
              >
                Recompensa del Destino
              </Text>
              <Text
                className="text-4xl font-black text-white uppercase text-center mb-3"
                style={{ letterSpacing: -1 }}
              >
                {diceRewards.find((r) => r.diceNumber === diceResult)?.title}
              </Text>
              <Text className="text-slate-400 text-xs text-center font-medium px-4 mb-6">
                {diceRewards.find((r) => r.diceNumber === diceResult)?.description ||
                  'Has invocado un premio especial por tu disciplina diaria.'}
              </Text>
              {diceResult === 6 && (
                <View className="bg-amber-500/10 border border-amber-500/20 px-6 py-3 rounded-2xl flex-row items-center mb-6">
                  <Sparkles size={18} color="#fbbf24" />
                  <Text
                    className="text-amber-400 text-[10px] font-black uppercase mx-3"
                    style={{ letterSpacing: 2 }}
                  >
                    +3 Puntos de Maná Extra
                  </Text>
                  <Sparkles size={18} color="#fbbf24" />
                </View>
              )}
              <Pressable
                onPress={() => setShowDiceRewardModal(false)}
                className="w-full bg-white py-6 rounded-[2rem]"
              >
                <Text
                  className="text-indigo-950 font-black text-center uppercase text-[10px]"
                  style={{ letterSpacing: 2 }}
                >
                  Reclamar Recompensa
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
    </Layout>
  );
};

export default Gamification;
