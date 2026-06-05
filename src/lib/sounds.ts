let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(freq: number, duration: number, volume = 0.08): void {
  const ctx = getContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.stop(ctx.currentTime + duration);
}

export function playMoveSound(): void {
  playTone(440, 0.08);
}

export function playCaptureSound(): void {
  playTone(330, 0.1);
}

export function playCheckSound(): void {
  playTone(550, 0.12);
  setTimeout(() => playTone(660, 0.1), 80);
}

export function playGameEndSound(): void {
  playTone(392, 0.15);
  setTimeout(() => playTone(523, 0.2), 120);
}
