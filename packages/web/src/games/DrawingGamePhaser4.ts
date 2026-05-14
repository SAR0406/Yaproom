/**
 * Drawing Game Phaser Scene
 * Phaser 4.1.0 implementation for real-time collaborative drawing
 * Integrates with DrawingGameScene game logic
 */

import Phaser from 'phaser';
import { DrawingGameScene, DrawingStroke } from '@/games/DrawingGameScene';

export interface DrawingPhaser4Config {
  gameScene: DrawingGameScene;
  onStrokeComplete?: (stroke: DrawingStroke) => void;
  isCurrentUser: boolean;
  canDraw: boolean;
}

export class DrawingGamePhaser4Scene extends Phaser.Scene {
  private gameScene: DrawingGameScene;
  private isDrawing = false;
  private graphics: Phaser.GameObjects.Graphics | null = null;
  private currentLine: Phaser.Curves.Path | null = null;
  private isCurrentUser: boolean = false;
  private canDraw: boolean = false;
  private onStrokeComplete?: (stroke: DrawingStroke) => void;

  constructor(config: DrawingPhaser4Config) {
    super({ key: 'DrawingGameScene' });
    this.gameScene = config.gameScene;
    this.isCurrentUser = config.isCurrentUser;
    this.canDraw = config.canDraw;
    this.onStrokeComplete = config.onStrokeComplete;
  }

  create() {
    const { width, height } = this.scale;

    // Setup camera and background
    this.cameras.main.setBackgroundColor('#f7e85f');

    // Create graphics layer for drawing
    this.graphics = this.add.graphics();
    this.graphics.clear();

    // Draw existing strokes
    this.renderAllStrokes();

    // Input handling (only if current user and can draw)
    if (this.isCurrentUser && this.canDraw) {
      this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.startStroke(pointer.x, pointer.y);
      });

      this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (this.isDrawing) {
          this.addStrokePoint(pointer.x, pointer.y);
        }
      });

      this.input.on('pointerup', () => {
        this.endStroke();
      });

      this.input.on('pointerout', () => {
        this.endStroke();
      });
    }

    // Draw UI overlay
    this.drawUI(width, height);
  }

  private startStroke(x: number, y: number) {
    if (!this.canDraw) return;

    this.isDrawing = this.gameScene.startStroke(x, y, '#111111', 4) ?? false;

    if (this.isDrawing) {
      // Create new graphics for this stroke
      if (this.graphics) {
        this.graphics.lineStyle(4, 0x111111, 1);
        this.graphics.beginPath();
        this.graphics.moveTo(x, y);
      }
    }
  }

  private addStrokePoint(x: number, y: number) {
    if (!this.isDrawing || !this.graphics) return;

    this.gameScene.addStrokePoint(x, y);
    this.graphics.lineTo(x, y);
    this.graphics.strokePath();
  }

  private endStroke() {
    if (!this.isDrawing || !this.graphics) return;

    this.isDrawing = false;
    const stroke = this.gameScene.endStroke();

    if (stroke) {
      this.onStrokeComplete?.(stroke);
    }
  }

  private renderAllStrokes() {
    if (!this.graphics) return;

    this.graphics.clear();

    const strokes = this.gameScene.getCanvasStrokes();

    strokes.forEach((stroke) => {
      this.graphics!.lineStyle(stroke.width, parseInt(stroke.color.replace('#', '0x'), 16), 1);
      this.graphics!.beginPath();

      if (stroke.points.length > 0) {
        this.graphics!.moveTo(stroke.points[0].x, stroke.points[0].y);

        for (let i = 1; i < stroke.points.length; i++) {
          this.graphics!.lineTo(stroke.points[i].x, stroke.points[i].y);
        }

        this.graphics!.strokePath();
      }
    });
  }

  private drawUI(width: number, height: number) {
    const uiBarHeight = 60;

    // UI background
    const uiBar = this.add.rectangle(width / 2, height - uiBarHeight / 2, width, uiBarHeight, 0xffffff, 0.95);
    uiBar.setDepth(100);

    // Mode indicator
    const mode = this.add.text(20, height - uiBarHeight / 2, 'DRAWING', {
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '14px',
      color: '#111111',
      fontStyle: '700'
    });
    mode.setOrigin(0, 0.5);
    mode.setDepth(101);

    // Status
    const status = this.add.text(140, height - uiBarHeight / 2, this.canDraw ? '✏️ Draw' : '👁️ Watch', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      color: this.canDraw ? '#64ddff' : '#ff5ec8'
    });
    status.setOrigin(0, 0.5);
    status.setDepth(101);

    // Clear button (if can draw)
    if (this.canDraw) {
      const clearBtn = this.add.rectangle(width - 100, height - uiBarHeight / 2, 80, 40, 0xff5ec8, 0.8);
      clearBtn.setInteractive();
      clearBtn.on('pointerover', () => clearBtn.setFillStyle(0xffa5d8, 0.9));
      clearBtn.on('pointerout', () => clearBtn.setFillStyle(0xff5ec8, 0.8));
      clearBtn.on('pointerdown', () => {
        this.gameScene.clearCanvas();
        this.renderAllStrokes();
      });
      clearBtn.setDepth(101);

      const clearText = this.add.text(width - 100, height - uiBarHeight / 2, 'CLEAR', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '11px',
        color: '#ffffff',
        fontStyle: '700'
      });
      clearText.setOrigin(0.5);
      clearText.setDepth(102);
    }
  }

  public updateStrokes(strokes: DrawingStroke[]) {
    this.gameScene['canvasHistory'] = strokes;
    this.renderAllStrokes();
  }

  public setCanDraw(canDraw: boolean) {
    this.canDraw = canDraw;
  }
}

/**
 * React Hook: usePhaserDrawing
 * Manages Phaser scene lifecycle for drawing mode
 */
import { useEffect, useRef, useState } from 'react';

export function usePhaserDrawing(config: {
  gameScene: DrawingGameScene;
  onStrokeComplete?: (stroke: DrawingStroke) => void;
  isCurrentUser: boolean;
  canDraw: boolean;
  width?: number;
  height?: number;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new DrawingGamePhaser4Scene({
      gameScene: config.gameScene,
      onStrokeComplete: config.onStrokeComplete,
      isCurrentUser: config.isCurrentUser,
      canDraw: config.canDraw
    });

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: mountRef.current,
      width: config.width ?? 960,
      height: config.height ?? 540,
      backgroundColor: '#f7e85f',
      transparent: false,
      scene: scene,
      render: {
        pixelArt: false,
        antialias: true
      }
    } as Phaser.Types.Core.GameConfig);

    gameRef.current = game;
    setIsReady(true);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [config.gameScene, config.onStrokeComplete, config.isCurrentUser, config.canDraw, config.width, config.height]);

  // Update canDraw capability
  useEffect(() => {
    if (!gameRef.current) return;

    const scene = gameRef.current.scene.getScene('DrawingGameScene') as DrawingGamePhaser4Scene;
    if (scene) {
      scene.setCanDraw(config.canDraw);
    }
  }, [config.canDraw]);

  return { mountRef, isReady, game: gameRef.current };
}
