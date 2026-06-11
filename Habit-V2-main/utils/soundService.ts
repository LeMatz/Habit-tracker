class SoundService {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playSuccess() {
    // Arpegio ascendente
    this.playTone(440, 'sine', 0.5, 0.1);
    setTimeout(() => this.playTone(554.37, 'sine', 0.5, 0.1), 100);
    setTimeout(() => this.playTone(659.25, 'sine', 0.6, 0.1), 200);
    setTimeout(() => this.playTone(880, 'sine', 0.8, 0.05), 300);
  }

  playTaskComplete() {
    // Tono doble de confirmación
    this.playTone(523.25, 'triangle', 0.3, 0.1);
    setTimeout(() => this.playTone(783.99, 'triangle', 0.4, 0.1), 150);
  }

  playDiceTick() {
    // Click percusivo seco
    this.playTone(150, 'square', 0.05, 0.02);
  }

  playDiceResult() {
    // Sonido de caída/revelación
    this.playTone(392, 'sine', 0.5, 0.1);
    setTimeout(() => this.playTone(523.25, 'sine', 0.8, 0.1), 150);
  }

  playPurchase() {
    // Sonido metálico "Ka-ching"
    this.playTone(987.77, 'sine', 0.4, 0.08);
    setTimeout(() => this.playTone(1318.51, 'sine', 0.6, 0.05), 100);
  }
}

export const soundService = new SoundService();