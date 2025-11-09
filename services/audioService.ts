import { BUY_SELL_SFX, TRAVEL_SFX, NEWS_ALERT_SFX, BUST_SFX } from '../assets/sounds';

type SoundName = 'buySell' | 'travel' | 'news' | 'bust';

const sounds: Record<SoundName, string> = {
  buySell: BUY_SELL_SFX,
  travel: TRAVEL_SFX,
  news: NEWS_ALERT_SFX,
  bust: BUST_SFX,
};

class AudioService {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<SoundName, AudioBuffer> = new Map();
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  private async decodeAudioData(data: ArrayBuffer): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error("AudioContext not initialized");
    }
    return new Promise((resolve, reject) => {
      this.audioContext!.decodeAudioData(data, resolve, reject);
    });
  }
  
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const soundNames = Object.keys(sounds) as SoundName[];

      for (const name of soundNames) {
        const base64Data = sounds[name].split(',')[1];
        const audioData = this.base64ToArrayBuffer(base64Data);
        const buffer = await this.decodeAudioData(audioData);
        this.audioBuffers.set(name, buffer);
      }
      
      this.isInitialized = true;
      console.log("Audio service initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize audio service:", error);
      // Fallback: disable audio if context fails
      this.isMuted = true;
    }
  }

  play(soundName: SoundName) {
    if (this.isMuted || !this.isInitialized || !this.audioContext) return;

    const buffer = this.audioBuffers.get(soundName);
    if (buffer) {
      try {
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);
      } catch (error) {
        console.error(`Error playing sound: ${soundName}`, error);
      }
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    // If unmuting for the first time, resume context if needed
    if (!this.isMuted && this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
    }
    return this.isMuted;
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const audioService = new AudioService();