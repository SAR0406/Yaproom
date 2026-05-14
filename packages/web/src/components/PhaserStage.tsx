"use client";

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

type PhaserSceneType = Phaser.Types.Scenes.SceneType;

class ArcadePreviewScene extends Phaser.Scene {
  private label: string;
  private subtitle: string;
  private highlights: string[];

  constructor(label: string, subtitle: string, highlights: string[]) {
    super({ key: 'ArcadePreviewScene' });
    this.label = label;
    this.subtitle = subtitle;
    this.highlights = highlights;
  }

  private addGlow(x: number, y: number, radius: number, color: number, alpha: number) {
    const orb = this.add.circle(x, y, radius, color, alpha);
    this.tweens.add({
      targets: orb,
      scale: { from: 0.92, to: 1.08 },
      alpha: { from: alpha * 0.7, to: alpha },
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#080913');

    this.addGlow(width * 0.78, height * 0.2, 160, 0x7cf7ff, 0.18);
    this.addGlow(width * 0.18, height * 0.72, 190, 0xff74cc, 0.14);
    this.addGlow(width * 0.52, height * 0.34, 130, 0x9dff6a, 0.12);

    for (let index = 0; index < 24; index += 1) {
      const star = this.add.circle(
        Phaser.Math.Between(16, width - 16),
        Phaser.Math.Between(16, height - 16),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.22, 0.75)
      );
      this.tweens.add({
        targets: star,
        y: `-=${Phaser.Math.Between(10, 24)}`,
        alpha: { from: star.alpha, to: Phaser.Math.FloatBetween(0.18, 0.82) },
        duration: Phaser.Math.Between(2400, 5200),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: index * 36
      });
    }

    const panel = this.add.container(width / 2, height / 2 - 8);
    const panelBody = this.add.rectangle(0, 0, width * 0.76, height * 0.66, 0x10131c, 0.96);
    panelBody.setStrokeStyle(5, 0xffffff, 0.95);
    panelBody.setRotation(-0.025);
    panel.add(panelBody);

    const innerFrame = this.add.rectangle(0, 0, width * 0.66, height * 0.5, 0x171b28, 1);
    innerFrame.setStrokeStyle(2, 0x7cf7ff, 0.8);
    panel.add(innerFrame);

    this.tweens.add({
      targets: panel,
      y: '+=10',
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.rectangle(width * 0.15, height * 0.18, 114, 28, 0x7cf7ff, 1).setStrokeStyle(2, 0x111111, 1);
    this.add.text(width * 0.15, height * 0.18, 'PHASER 4 LIVE', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      color: '#080913',
      fontStyle: '700'
    }).setOrigin(0.5);

    this.add.text(width * 0.5, height * 0.36, this.label, {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: '700'
    }).setOrigin(0.5);

    this.add.text(width * 0.5, height * 0.42, this.subtitle, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '14px',
      color: '#c7cee6',
      align: 'center',
      wordWrap: { width: width * 0.52 }
    }).setOrigin(0.5);

    const highlightRow = this.highlights.slice(0, 3);
    highlightRow.forEach((highlight, index) => {
      const chipWidth = Math.min(180, Math.max(110, highlight.length * 7.3));
      const chipX = width * 0.28 + index * (chipWidth + 12);
      const chipY = height * 0.62;
      this.add.rectangle(chipX, chipY, chipWidth, 28, 0xffffff, 0.1).setStrokeStyle(1, 0xffffff, 0.4);
      this.add.text(chipX, chipY, highlight, {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '11px',
        color: '#ffffff'
      }).setOrigin(0.5);
    });

    const meterBaseX = width * 0.75;
    const meterBaseY = height * 0.18;
    this.add.text(meterBaseX, meterBaseY - 22, 'ROOM SIGNAL', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      color: '#9fb1d4'
    }).setOrigin(1, 0.5);

    [0.32, 0.56, 0.88, 0.72].forEach((barScale, index) => {
      const barHeight = 18 + index * 16;
      this.add.rectangle(meterBaseX - index * 20, meterBaseY + 8, 10, barHeight * barScale, 0x9dff6a, 0.8);
    });

    const footer = this.add.text(width * 0.5, height * 0.78, 'Mode previews, lobby state, and live room energy all flow through one stage.', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      color: '#9fb1d4',
      align: 'center',
      wordWrap: { width: width * 0.62 }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: footer,
      alpha: { from: 0.68, to: 1 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}

export interface PhaserStageProps {
  label?: string;
  subtitle?: string;
  highlights?: string[];
  width?: number;
  height?: number;
  scene?: PhaserSceneType | PhaserSceneType[];
  className?: string;
}

export function PhaserStage({
  label = 'Canvas mode',
  subtitle = 'The room-stage preview keeps the whole session feeling like a game.',
  highlights = ['Live rooms', 'Mode flow', 'Neon stage'],
  width = 960,
  height = 540,
  scene,
  className = ''
}: PhaserStageProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const activeScene = scene ?? new ArcadePreviewScene(label, subtitle, highlights);
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: mountRef.current,
      width,
      height,
      backgroundColor: '#080913',
      transparent: false,
      scene: activeScene
    } satisfies Phaser.Types.Core.GameConfig);

    return () => {
      game.destroy(true);
    };
  }, [height, label, scene, width]);

  return <div ref={mountRef} className={`overflow-hidden rounded-[28px_42px_24px_38px] border-4 border-ink shadow-[10px_10px_0_#111] ${className}`} />;
}
