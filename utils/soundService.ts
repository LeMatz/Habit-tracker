import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

const sources = {
  success: require('../assets/sounds/success.wav'),
  taskComplete: require('../assets/sounds/taskComplete.wav'),
  diceTick: require('../assets/sounds/diceTick.wav'),
  diceResult: require('../assets/sounds/diceResult.wav'),
  purchase: require('../assets/sounds/purchase.wav'),
};

type Key = keyof typeof sources;

const players: Partial<Record<Key, AudioPlayer>> = {};

function getPlayer(key: Key): AudioPlayer {
  if (!players[key]) {
    players[key] = createAudioPlayer(sources[key]);
  }
  return players[key]!;
}

function play(key: Key) {
  try {
    const p = getPlayer(key);
    p.seekTo(0);
    p.play();
  } catch {
    // Sounds are secondary — never block UX on audio failures
  }
}

export const soundService = {
  playSuccess: () => play('success'),
  playTaskComplete: () => play('taskComplete'),
  playDiceTick: () => play('diceTick'),
  playDiceResult: () => play('diceResult'),
  playPurchase: () => play('purchase'),
};
