/**
 * Multi-Track Wedding Audio Engine (Mobile & Desktop Optimized)
 * - Generates warm, polyphonic 16-bit PCM WAV audio buffers for preset wedding melodies
 * - Uses HTML5 <audio playsinline loop> and a single shared Web Audio Context for maximum compatibility
 * - Graceful user-gesture unlock without recursive event loops or leaking AudioContexts
 */

interface SynthesizedTrack {
  tempoSec: number;
  decaySec: number;
  harmonic2: number;
  harmonic3: number;
  notes: number[][]; // Array of chord arpeggio note arrays (Hz)
}

const PRESET_MELODIES: Record<string, SynthesizedTrack> = {
  // 1. Canon in D (Pachelbel) - Stately classical progression
  'canon-d': {
    tempoSec: 0.46,
    decaySec: 1.5,
    harmonic2: 0.35,
    harmonic3: 0.12,
    notes: [
      [146.83, 220.00, 293.66, 369.99, 440.00, 587.33], // D maj
      [110.00, 164.81, 220.00, 277.18, 329.63, 440.00], // A maj
      [123.47, 185.00, 246.94, 293.66, 369.99, 493.88], // B min
      [92.50, 138.59, 185.00, 220.00, 277.18, 369.99],  // F# min
      [98.00, 146.83, 196.00, 246.94, 293.66, 392.00],  // G maj
      [146.83, 220.00, 293.66, 369.99, 293.66, 369.99], // D maj
      [98.00, 146.83, 196.00, 246.94, 293.66, 392.00],  // G maj
      [110.00, 164.81, 220.00, 277.18, 329.63, 440.00]  // A maj
    ]
  },

  // 2. A Thousand Years - Tender 6/8 waltz with celesta bell timbre
  'thousand-years': {
    tempoSec: 0.38,
    decaySec: 1.9,
    harmonic2: 0.25,
    harmonic3: 0.08,
    notes: [
      [233.08, 293.66, 349.23, 466.16, 587.33, 466.16], // Bb maj
      [174.61, 261.63, 349.23, 440.00, 523.25, 440.00], // F maj
      [196.00, 233.08, 293.66, 392.00, 466.16, 392.00], // G min
      [155.56, 233.08, 311.13, 392.00, 466.16, 392.00], // Eb maj
      [174.61, 220.00, 261.63, 349.23, 440.00, 349.23]  // F maj
    ]
  },

  // 3. Until I Found You - 50s romantic slow dance
  'until-found-you': {
    tempoSec: 0.52,
    decaySec: 1.4,
    harmonic2: 0.28,
    harmonic3: 0.1,
    notes: [
      [155.56, 196.00, 233.08, 311.13, 392.00, 311.13], // Eb maj
      [196.00, 233.08, 293.66, 392.00, 466.16, 392.00], // G min
      [207.65, 261.63, 311.13, 415.30, 523.25, 415.30], // Ab maj
      [116.54, 174.61, 233.08, 293.66, 349.23, 293.66]  // Bb7
    ]
  },

  // 4. Acoustic Harpsichord Romance - Bright romantic fingerstyle
  'acoustic-romance': {
    tempoSec: 0.44,
    decaySec: 1.65,
    harmonic2: 0.32,
    harmonic3: 0.14,
    notes: [
      [130.81, 196.00, 246.94, 293.66, 329.63, 392.00], // C maj9
      [110.00, 164.81, 220.00, 261.63, 329.63, 440.00], // Am9
      [174.61, 220.00, 261.63, 329.63, 392.00, 523.25], // F maj7
      [196.00, 246.94, 293.66, 392.00, 440.00, 493.88]  // G6
    ]
  }
};

const wavBlobUrlCache: Record<string, string> = {};

function buildWavBlobUrlForTrack(trackId: string): string {
  if (wavBlobUrlCache[trackId]) {
    return wavBlobUrlCache[trackId];
  }

  const config = PRESET_MELODIES[trackId] || PRESET_MELODIES['acoustic-romance'];
  const sampleRate = 22050;
  const flatNotes: number[] = [];
  for (const chord of config.notes) {
    for (const freq of chord) {
      flatNotes.push(freq);
    }
  }

  const totalNotes = flatNotes.length;
  const loopDurationSec = totalNotes * config.tempoSec;
  const totalSamples = Math.max(1, Math.floor(loopDurationSec * sampleRate));
  const buffer = new Float32Array(totalSamples);

  for (let idx = 0; idx < totalNotes; idx++) {
    const freq = flatNotes[idx];
    const startSample = Math.floor(idx * config.tempoSec * sampleRate);
    const noteSamples = Math.floor(config.decaySec * sampleRate);
    const attackSamples = Math.max(1, Math.floor(0.022 * sampleRate));

    for (let s = 0; s < noteSamples; s++) {
      const t = s / sampleRate;
      const env =
        s < attackSamples
          ? s / attackSamples
          : Math.exp((-3.4 * (s - attackSamples)) / noteSamples);

      const wave =
        Math.sin(2 * Math.PI * freq * t) +
        config.harmonic2 * Math.sin(2 * Math.PI * freq * 2 * t) +
        config.harmonic3 * Math.sin(2 * Math.PI * freq * 3 * t) +
        0.18 * Math.sin(2 * Math.PI * (freq * 1.002) * t);

      // Wrap around end of loop for smooth looping
      const targetIdx = (startSample + s) % totalSamples;
      buffer[targetIdx] += wave * env * 0.32;
    }
  }

  // Encode 16-bit mono WAV
  const wavBytes = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(wavBytes);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + totalSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeStr(36, 'data');
  view.setUint32(40, totalSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  const blob = new Blob([wavBytes], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  wavBlobUrlCache[trackId] = url;
  return url;
}

// Global Singleton AudioContext to strictly prevent browser "Too many AudioContexts" limit
let sharedAudioCtx: AudioContext | null = null;
function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      try {
        sharedAudioCtx = new AudioCtx();
      } catch {
        // ignore
      }
    }
  }
  return sharedAudioCtx;
}

class WeddingAudioPlayer {
  private htmlAudio: HTMLAudioElement | null = null;
  private isRunning: boolean = false;
  private wantsToPlay: boolean = false;
  private currentVolume: number = 0.85;
  private currentTrackId: string = 'acoustic-romance';
  private customAudioUrl?: string;
  private unlockListenersBound: boolean = false;
  private stateListeners: Set<(playing: boolean) => void> = new Set();
  private isSynthesizingWebAudio: boolean = false;
  private webAudioTimerId: ReturnType<typeof setInterval> | null = null;

  private notifyState(playing: boolean) {
    this.isRunning = playing;
    this.stateListeners.forEach((cb) => {
      try {
        cb(playing);
      } catch {
        // ignore
      }
    });
  }

  public subscribe(cb: (playing: boolean) => void): () => void {
    this.stateListeners.add(cb);
    return () => {
      this.stateListeners.delete(cb);
    };
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.bindMobileGestureUnlocker();
    }
  }

  private ensureAudioElement(): HTMLAudioElement {
    try {
      if (typeof navigator !== 'undefined' && (navigator as any).audioSession) {
        (navigator as any).audioSession.type = 'playback';
      }
    } catch {
      // ignore
    }

    if (!this.htmlAudio && typeof document !== 'undefined') {
      let audio = document.getElementById('wedding-bg-audio') as HTMLAudioElement | null;
      if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'wedding-bg-audio';
      }
      audio.loop = true;
      audio.preload = 'auto';
      audio.autoplay = true;
      audio.volume = this.currentVolume;
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.style.position = 'fixed';
      audio.style.bottom = '0';
      audio.style.right = '0';
      audio.style.width = '1px';
      audio.style.height = '1px';
      audio.style.opacity = '0';
      audio.style.pointerEvents = 'none';

      const targetSrc = this.resolveTargetSrc();
      if (!audio.src || !audio.src.includes(targetSrc)) {
        audio.src = targetSrc;
      }

      audio.addEventListener('play', () => {
        this.stopWebAudioSynth();
        this.notifyState(true);
      });
      audio.addEventListener('playing', () => {
        this.stopWebAudioSynth();
        this.notifyState(true);
      });
      audio.addEventListener('pause', () => {
        if (!this.wantsToPlay && !this.isSynthesizingWebAudio) {
          this.notifyState(false);
        }
      });
      audio.addEventListener('error', () => {
        // Fallback to real-time Web Audio synthesizer if HTML5 audio encounters an error
        if (this.wantsToPlay) {
          this.startWebAudioSynth();
        }
      });

      try {
        if (document.body && !document.getElementById('wedding-bg-audio')) {
          document.body.appendChild(audio);
        } else if (!document.body) {
          window.addEventListener('DOMContentLoaded', () => {
            if (document.body && !document.getElementById('wedding-bg-audio')) {
              document.body.appendChild(audio);
            }
          });
        }
      } catch {}

      this.htmlAudio = audio;
    }
    return this.htmlAudio!;
  }

  private resolveTargetSrc(): string {
    if (this.customAudioUrl && this.customAudioUrl.trim()) {
      return this.customAudioUrl.trim();
    }
    const trackKey = this.currentTrackId && PRESET_MELODIES[this.currentTrackId]
      ? this.currentTrackId
      : 'acoustic-romance';
    return buildWavBlobUrlForTrack(trackKey);
  }

  public bindMobileGestureUnlocker() {
    if (this.unlockListenersBound || typeof window === 'undefined') return;
    this.unlockListenersBound = true;

    const unlockHandler = (e: Event) => {
      // Resume shared audio context on first user action
      const ctx = getSharedAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      if (!this.wantsToPlay) return;

      const audio = this.ensureAudioElement();
      const targetSrc = this.resolveTargetSrc();
      if (!audio.src || !audio.src.includes(targetSrc)) {
        audio.src = targetSrc;
      }
      audio.volume = this.currentVolume;
      audio.muted = false;

      const p = audio.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          this.notifyState(true);
          removeUnlockListeners();
        }).catch(() => {
          // If HTML5 audio is still blocked, activate web audio synthesizer fallback
          this.startWebAudioSynth();
        });
      }
    };

    const removeUnlockListeners = () => {
      if (!this.unlockListenersBound) return;
      this.unlockListenersBound = false;
      const events = ['touchstart', 'touchend', 'touchmove', 'pointerdown', 'pointerup', 'pointermove', 'click', 'keydown', 'scroll', 'wheel'];
      events.forEach((evt) => {
        window.removeEventListener(evt, unlockHandler, true);
        document.removeEventListener(evt, unlockHandler, true);
      });
    };

    const events = ['touchstart', 'touchend', 'touchmove', 'pointerdown', 'pointerup', 'pointermove', 'click', 'keydown', 'scroll', 'wheel'];
    events.forEach((evt) => {
      window.addEventListener(evt, unlockHandler, { capture: true, passive: true });
      document.addEventListener(evt, unlockHandler, { capture: true, passive: true });
    });
  }

  // Real-time Web Audio Synthesizer fallback if HTML5 Audio is blocked by browser policies
  private startWebAudioSynth() {
    if (this.isSynthesizingWebAudio || !this.wantsToPlay) return;
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    this.isSynthesizingWebAudio = true;
    this.notifyState(true);

    const config = PRESET_MELODIES[this.currentTrackId] || PRESET_MELODIES['acoustic-romance'];
    const flatNotes: number[] = [];
    for (const chord of config.notes) {
      for (const freq of chord) {
        flatNotes.push(freq);
      }
    }

    let noteIdx = 0;
    const playNextNote = () => {
      if (!this.wantsToPlay || !this.isSynthesizingWebAudio || !ctx) {
        this.stopWebAudioSynth();
        return;
      }
      try {
        const freq = flatNotes[noteIdx % flatNotes.length];
        noteIdx++;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.28 * this.currentVolume, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + config.decaySec);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + config.decaySec);
      } catch {
        // ignore
      }
    };

    playNextNote();
    this.webAudioTimerId = setInterval(playNextNote, config.tempoSec * 1000);
  }

  private stopWebAudioSynth() {
    this.isSynthesizingWebAudio = false;
    if (this.webAudioTimerId) {
      clearInterval(this.webAudioTimerId);
      this.webAudioTimerId = null;
    }
  }

  public init() {
    this.ensureAudioElement();
    this.bindMobileGestureUnlocker();
  }

  public setTrack(trackId: string, customUrl?: string) {
    const changed = this.currentTrackId !== trackId || this.customAudioUrl !== customUrl;
    this.currentTrackId = trackId || 'acoustic-romance';
    this.customAudioUrl = customUrl;

    if (changed) {
      const wasPlaying = this.isRunning || this.wantsToPlay;
      if (this.htmlAudio) {
        this.htmlAudio.src = this.resolveTargetSrc();
        try {
          this.htmlAudio.load();
        } catch {}
      }
      if (wasPlaying) {
        this.play();
      }
    }
  }

  public play() {
    this.wantsToPlay = true;
    this.bindMobileGestureUnlocker();

    // 1. Resume singleton Web Audio Context
    const ctx = getSharedAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // 2. Play HTML5 audio
    const audio = this.ensureAudioElement();
    const targetSrc = this.resolveTargetSrc();
    if (!audio.src || !audio.src.includes(targetSrc)) {
      audio.src = targetSrc;
    }
    audio.volume = this.currentVolume;
    audio.muted = false;

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => {
          this.stopWebAudioSynth();
          this.notifyState(true);
        })
        .catch(() => {
          // If browser policy blocked HTML5 audio, start Web Audio synthesizer as immediate audible fallback
          this.startWebAudioSynth();
        });
    } else {
      this.notifyState(true);
    }
  }

  public pause() {
    this.wantsToPlay = false;
    this.stopWebAudioSynth();
    if (this.htmlAudio) {
      this.htmlAudio.pause();
    }
    this.notifyState(false);
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public setVolume(val: number) {
    this.currentVolume = Math.max(0, Math.min(1, val));
    if (this.htmlAudio) {
      this.htmlAudio.volume = this.currentVolume;
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }
}

export const acousticAudio = new WeddingAudioPlayer();
