/**
 * Confession Game UI - Template
 */

import React from 'react';
import { MessageBoard, ProgressBar } from '@/components/GameUIComponents';

interface ConfessionGameUIProps {
  uiData: any;
  onAction: (action: string, payload: unknown) => void;
}

export default function ConfessionGameUI({ uiData, onAction }: ConfessionGameUIProps) {
  if (!uiData) return null;

  // Submit Phase
  if (uiData.phase === 'submit') {
    return (
      <div className="space-y-4">
        <div className="hud-card mission-brief min-h-96 flex flex-col items-center justify-center">
          <div className="text-2xl font-display font-bold mb-4">Share a Secret</div>
          <textarea
            placeholder="Type an anonymous confession..."
            className="w-full h-32 bg-panel border-2 border-ink rounded-lg p-3 font-mono text-sm mb-3 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                const value = e.currentTarget.value.trim();
                if (value) {
                  onAction('submitConfession', { confession: value });
                  e.currentTarget.value = '';
                }
              }
            }}
          />
          <button className="btn btn-primary px-4 py-2 font-bold">
            SUBMIT (Ctrl+Enter)
          </button>
        </div>
      </div>
    );
  }

  // Reveal Phase
  if (uiData.phase === 'reveal' || uiData.phase === 'vote') {
    return (
      <div className="space-y-4">
        <div className="hud-card mission-brief">
          <div className="text-lg font-bold mb-4">
            {uiData.phase === 'reveal' ? '🔓 Revealing Cards...' : '⭐ Vote for Best Confession'}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {uiData.visibleCards?.slice(0, 4).map((card: any) => (
              <div
                key={card.id}
                onClick={() => {
                  if (uiData.phase === 'vote') {
                    onAction('voteForCard', { cardId: card.id });
                  }
                }}
                className="hud-card cursor-pointer p-4 min-h-32 flex flex-col justify-between hover:bg-cyan hover:bg-opacity-20 transition-colors"
              >
                <div className="text-xs leading-relaxed">{card.confession}</div>
                <div className="text-xs font-bold text-pink mt-2">
                  ⭐ {card.votes || 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        {uiData.submissionCount && (
          <ProgressBar
            current={uiData.submissionCount}
            total={uiData.submissionCount}
            label="CONFESSIONS"
            className="hud-card"
          />
        )}
      </div>
    );
  }

  // Recap Phase
  if (uiData.phase === 'recap') {
    return (
      <div className="space-y-4">
        <div className="hud-card mission-brief">
          <h2 className="text-xl font-display font-bold mb-4">🏆 WINNER</h2>

          {uiData.winningCard && (
            <div className="bg-gradient-to-r from-gold to-orange p-4 rounded-lg mb-4 text-center">
              <div className="text-lg font-bold text-ink mb-2">
                {uiData.winningCard.confession}
              </div>
              <div className="text-sm text-ink opacity-80">
                ⭐ {uiData.winningCard.votes} votes
              </div>
            </div>
          )}

          {uiData.scores && (
            <div className="mt-4">
              <div className="text-xs font-mono font-bold mb-2 opacity-60">
                LEADERBOARD
              </div>
              {uiData.scores.slice(0, 5).map((score: any, idx: number) => (
                <div key={score.playerId} className="flex justify-between text-sm mb-1">
                  <span>#{idx + 1} {score.nickname}</span>
                  <span className="font-bold">{score.score}pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <div className="hud-card">Loading...</div>;
}
