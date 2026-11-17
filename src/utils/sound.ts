let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctor) audioCtx = new Ctor();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playSfx(type: 'tap' | 'upgrade' | 'reward' | 'battle' | 'error', enabled: boolean): void {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const playTone = (freq: number, dur: number, oscType: OscillatorType, gainVal: number, delay = 0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = oscType;
    osc.frequency.setValueAtTime(freq, now + delay);
    gain.gain.setValueAtTime(gainVal, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + delay);
    osc.stop(now + delay + dur);
  };

  if (type === 'tap') {
    playTone(520, 0.06, 'triangle', 0.05);
    playTone(760, 0.05, 'sine', 0.03, 0.02);
  } else if (type === 'upgrade') {
    playTone(440, 0.09, 'triangle', 0.06);
    playTone(660, 0.11, 'triangle', 0.06, 0.06);
    playTone(880, 0.14, 'sine', 0.06, 0.12);
  } else if (type === 'reward') {
    playTone(523.25, 0.1, 'sine', 0.07);
    playTone(659.25, 0.1, 'sine', 0.07, 0.07);
    playTone(783.99, 0.12, 'sine', 0.07, 0.14);
    playTone(1046.5, 0.22, 'triangle', 0.08, 0.21);
  } else if (type === 'battle') {
    playTone(190, 0.08, 'sawtooth', 0.04);
    playTone(130, 0.12, 'square', 0.04, 0.06);
  } else if (type === 'error') {
    playTone(210, 0.12, 'sawtooth', 0.04);
  }
}
