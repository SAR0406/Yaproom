"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/Button";

type SoundProfile = "airhorn" | "suspense" | "roast";

const NOISE_AMPLITUDE = 0.05;
// Keep frequency strictly positive for exponential ramps in Web Audio API.
const MIN_FREQUENCY = 1;
const SOUND_PROFILES: Record<
  SoundProfile,
  {
    osc: OscillatorType;
    start: number;
    end: number;
    duration: number;
    noiseGain: number;
  }
> = {
  airhorn: { osc: "sawtooth", start: 260, end: 690, duration: 0.9, noiseGain: 0.18 },
  suspense: { osc: "triangle", start: 180, end: 250, duration: 1.4, noiseGain: 0.08 },
  roast: { osc: "square", start: 420, end: 190, duration: 0.45, noiseGain: 0.08 },
};

export function SoundButton({
  label,
  profile = "airhorn",
}: {
  label: string;
  profile?: SoundProfile;
}) {
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(
    () => () => {
      void contextRef.current?.close();
      contextRef.current = null;
    },
    []
  );

  const playSound = async () => {
    try {
      if (typeof window === "undefined") return;
      const AudioContextCtor =
        window.AudioContext ??
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextCtor) return;

      if (!contextRef.current || contextRef.current.state === "closed") {
        contextRef.current = new AudioContextCtor();
      }
      const context = contextRef.current;
      if (!context) return;

      if (context.state === "suspended") {
        await context.resume();
      }

      const config = SOUND_PROFILES[profile];
      const now = context.currentTime;
      const master = context.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
      master.gain.exponentialRampToValueAtTime(0.0001, now + config.duration);
      master.connect(context.destination);

      const oscillator = context.createOscillator();
      oscillator.type = config.osc;
      oscillator.frequency.setValueAtTime(config.start, now);
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(config.end, MIN_FREQUENCY),
        now + config.duration
      );
      oscillator.connect(master);

      const noise = context.createBufferSource();
      const noiseBuffer = context.createBuffer(
        1,
        context.sampleRate * config.duration,
        context.sampleRate
      );
      const channel = noiseBuffer.getChannelData(0);
      for (let sample = 0; sample < channel.length; sample += 1) {
        channel[sample] = (Math.random() * 2 - 1) * NOISE_AMPLITUDE;
      }
      noise.buffer = noiseBuffer;

      const noiseFilter = context.createBiquadFilter();
      noiseFilter.type = "highpass";
      noiseFilter.frequency.value = 900;
      const noiseGain = context.createGain();
      noiseGain.gain.value = config.noiseGain;

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);

      oscillator.start(now);
      noise.start(now);
      oscillator.stop(now + config.duration);
      noise.stop(now + config.duration);
    } catch {
      // ignore audio playback errors in unsupported/restricted environments
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={playSound}>
      🔊 {label}
    </Button>
  );
}
