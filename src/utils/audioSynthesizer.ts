/**
 * GlobeCall Web Audio API Synthesizer
 * Provides authentic DTMF dial tones, ringback sounds, call status chimes, and ambient audio visualizers.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private ringbackOsc1: OscillatorNode | null = null;
  private ringbackOsc2: OscillatorNode | null = null;
  private ringbackGain: GainNode | null = null;
  private ringbackTimer: any = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Standard DTMF Dual Tone Multi-Frequency map
  private dtmfFreqs: Record<string, [number, number]> = {
    '1': [697, 1209], '2': [697, 1336], '3': [697, 1477], 'A': [697, 1633],
    '4': [770, 1209], '5': [770, 1336], '6': [770, 1477], 'B': [770, 1633],
    '7': [852, 1209], '8': [852, 1336], '9': [852, 1477], 'C': [852, 1633],
    '*': [941, 1209], '0': [941, 1336], '#': [941, 1477], 'D': [941, 1633],
  };

  public playDtmf(key: string, durationMs = 120) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const freqs = this.dtmfFreqs[key];
      if (!freqs) return;

      const [lowFreq, highFreq] = freqs;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.frequency.value = lowFreq;
      osc2.frequency.value = highFreq;

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + durationMs / 1000);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();

      osc1.stop(this.ctx.currentTime + durationMs / 1000);
      osc2.stop(this.ctx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn("DTMF tone error", e);
    }
  }

  public startRingback() {
    this.stopRingback();
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.ringbackOsc1 = this.ctx.createOscillator();
      this.ringbackOsc2 = this.ctx.createOscillator();
      this.ringbackGain = this.ctx.createGain();

      this.ringbackOsc1.frequency.value = 440; // US standard ringback
      this.ringbackOsc2.frequency.value = 480;

      this.ringbackGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.ringbackOsc1.connect(this.ringbackGain);
      this.ringbackOsc2.connect(this.ringbackGain);
      this.ringbackGain.connect(this.ctx.destination);

      this.ringbackOsc1.start();
      this.ringbackOsc2.start();

      // Pulsing ring pattern (2s tone, 4s silence)
      let isBeeping = true;
      this.ringbackTimer = setInterval(() => {
        if (!this.ringbackGain || !this.ctx) return;
        isBeeping = !isBeeping;
        const now = this.ctx.currentTime;
        this.ringbackGain.gain.setValueAtTime(isBeeping ? 0.08 : 0.0001, now);
      }, 2000);
    } catch (e) {
      console.warn("Ringback error", e);
    }
  }

  public stopRingback() {
    if (this.ringbackTimer) {
      clearInterval(this.ringbackTimer);
      this.ringbackTimer = null;
    }
    if (this.ringbackOsc1) {
      try { this.ringbackOsc1.stop(); } catch(e){}
      this.ringbackOsc1 = null;
    }
    if (this.ringbackOsc2) {
      try { this.ringbackOsc2.stop(); } catch(e){}
      this.ringbackOsc2 = null;
    }
  }

  public playConnectChime() {
    this.stopRingback();
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn("Connect chime error", e);
    }
  }

  public playDisconnectChime() {
    this.stopRingback();
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(349.23, now + 0.12); // F4

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn("Disconnect chime error", e);
    }
  }
}

export const audioSynthesizer = new AudioSynthesizer();
