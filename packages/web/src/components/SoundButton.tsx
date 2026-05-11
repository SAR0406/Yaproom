"use client";

import { useRef } from "react";
import { Button } from "@/components/Button";

type SoundProfile = "airhorn" | "suspense" | "roast";

const defaultProfiles: Record<SoundProfile, { osc: OscillatorType; start: number; end: number; duration: number }> = {
  airhorn: { osc: "sawtooth", start: 260, end: 690, duration: 0.9 },
  suspense: { osc: "triangle", start: 180, end: 250, duration: 1.4 },
  roast: { osc: "square", start: 420, end: 190, duration: 0.45 },
};

export function SoundButton({
  label,
  profile = "airhorn",
}: {
  label: string;
  profile?: SoundProfile;
}) {
  const contextRef = useRef<AudioContext | null>(null);

  const playSound = async () => {
    if (typeof window === "undefined") return;
    const AudioContextCtor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextCtor) return;

    const context = contextRef.current ?? new AudioContextCtor();
    contextRef.current = context;
    if (context.state === "suspended") {
      await context.resume();
    }

    const config = defaultProfiles[profile];
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
      Math.max(config.end, 1),
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
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * 0.05;
    }
    noise.buffer = noiseBuffer;

    const noiseFilter = context.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 900;
    const noiseGain = context.createGain();
    noiseGain.gain.value = profile === "airhorn" ? 0.18 : 0.08;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);

    oscillator.start(now);
    noise.start(now);
    oscillator.stop(now + config.duration);
    noise.stop(now + config.duration);
  };

  return (
    <Button variant="ghost" size="sm" onClick={playSound}>
      🔊 {label}
    </Button>
  );
}
