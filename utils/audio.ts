
// Retro 8-bit/16-bit Web Audio API wrapper

let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export type SoundType = 'click' | 'pop' | 'success' | 'delete' | 'pet-happy' | 'pet-surprised' | 'open' | 'scribble' | 'retro-jump';

export const playSfx = (type: SoundType) => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // Oscillator helper for retro sounds
    const playOsc = (
        oscType: OscillatorType, 
        freqStart: number, 
        freqEnd: number, 
        dur: number, 
        vol: number,
        delay: number = 0
    ) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);

        osc.type = oscType;
        osc.frequency.setValueAtTime(freqStart, now + delay);
        if (freqStart !== freqEnd) {
            osc.frequency.exponentialRampToValueAtTime(freqEnd, now + delay + dur);
        }
        
        oscGain.gain.setValueAtTime(vol, now + delay);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
        
        osc.start(now + delay);
        osc.stop(now + delay + dur);
    };

    // Noise helper for percussive retro sounds
    const playNoise = (dur: number, vol: number, lowPass: number = 1000) => {
         const bufSize = ctx.sampleRate * dur;
         const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
         const data = buffer.getChannelData(0);
         for(let i=0; i<bufSize; i++) data[i] = Math.random() * 2 - 1;

         const noise = ctx.createBufferSource();
         noise.buffer = buffer;
         const noiseGain = ctx.createGain();
         
         const filter = ctx.createBiquadFilter();
         filter.type = 'lowpass';
         filter.frequency.value = lowPass;

         noise.connect(filter);
         filter.connect(noiseGain);
         noiseGain.connect(ctx.destination);
         
         noiseGain.gain.setValueAtTime(vol, now);
         noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
         noise.start(now);
    };

    switch (type) {
      case 'click':
        // 8-bit blip (Square wave)
        playOsc('square', 600, 600, 0.05, 0.1);
        break;

      case 'pop':
        // Retro pop (Triangle wave)
        playOsc('triangle', 300, 600, 0.08, 0.2);
        break;

      case 'open':
      case 'scribble':
        // Retro scratch (Filtered noise)
        playNoise(0.1, 0.1, 1500);
        break;

      case 'success':
        // Retro Arpeggio (Square wave)
        playOsc('square', 523.25, 523.25, 0.1, 0.08, 0);
        playOsc('square', 659.25, 659.25, 0.1, 0.08, 0.1);
        playOsc('square', 783.99, 783.99, 0.15, 0.08, 0.2);
        break;

      case 'delete':
        // Low retro explosion/crash
        playNoise(0.25, 0.2, 400);
        break;
      
      case 'retro-jump':
        // Classic NES Jump: Fast frequency sweep up on a square wave
        playOsc('square', 180, 750, 0.18, 0.1);
        break;

      case 'pet-happy':
        // Retro happy chirp
        playOsc('square', 900, 1200, 0.08, 0.08);
        playOsc('square', 1200, 1500, 0.08, 0.08, 0.1);
        break;

      case 'pet-surprised':
        // Retro alert
        playOsc('square', 400, 1000, 0.1, 0.06);
        break;
    }
  } catch (e) {
    console.warn("Audio play failed", e);
  }
};
