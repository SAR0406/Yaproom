"use client";

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

type PhaserSceneType = Phaser.Types.Scenes.SceneType;

class PlaceholderStageScene extends Phaser.Scene {
  private label: string;

  constructor(label: string) {
    super({ key: 'PlaceholderStageScene' });
    this.label = label;
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#f7e85f');

    const panel = this.add.rectangle(width / 2, height / 2, width * 0.78, height * 0.68, 0xffffff, 1);
    panel.setStrokeStyle(6, 0x111111, 1);
    panel.setRotation(-0.03);

    this.add.text(width / 2, height / 2 - 28, 'PHASER STAGE', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '22px',
      color: '#111111',
      fontStyle: '700'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 4, this.label, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '14px',
      color: '#111111'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 32, 'Hook the live scene here next.', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      color: '#444444'
    }).setOrigin(0.5);
  }
}

export interface PhaserStageProps {
  label?: string;
  width?: number;
  height?: number;
  scene?: PhaserSceneType | PhaserSceneType[];
  className?: string;
}

export function PhaserStage({
  label = 'Canvas mode',
  width = 960,
  height = 540,
  scene,
  className = ''
}: PhaserStageProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const activeScene = scene ?? new PlaceholderStageScene(label);
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: mountRef.current,
      width,
      height,
      backgroundColor: '#f7e85f',
      transparent: false,
      scene: activeScene
    } satisfies Phaser.Types.Core.GameConfig);

    return () => {
      game.destroy(true);
    };
  }, [height, label, scene, width]);

  return <div ref={mountRef} className={`overflow-hidden rounded-[28px_42px_24px_38px] border-4 border-ink shadow-[10px_10px_0_#111] ${className}`} />;
}
