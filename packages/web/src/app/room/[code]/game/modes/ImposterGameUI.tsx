/**
 * Imposter Game UI
 * Role reveal, voting, discussion, and accusation interface
 */

import React, { useState } from 'react';
import {
  VotingBoard,
  TimerDisplay,
  MessageBoard,
  PlayerAvatar,
  ProgressBar,
  ParticleEffect
} from '@/components/GameUIComponents';

interface ImposterGameUIProps {
  uiData: any;
  onAction: (action: string, payload: unknown) => void;
}

export default function ImposterGameUI({ uiData, onAction }: ImposterGameUIProps) {
  const [celebrating, setCelebrating] = useState(false);

  if (!uiData) return null;

  const handleVote = (playerId: string) => {
    onAction('vote', { targetId: playerId });
  };

  const handleDiscussionPost = (message: string) => {
    onAction('postMessage', { text: message });
  };

  // Role Reveal Phase
  if (uiData.phase === 'role') {
    return (
      <div className="space-y-4">
        <div className="hud-card role-panel min-h-96 flex flex-col items-center justify-center">
          <div className="text-sm font-mono text-ink opacity-60 mb-4">YOUR ROLE</div>

          <div
            className={`text-6xl font-display font-bold mb-4 transition-colors ${
              uiData.roleData.isImposter
                ? 'text-pink animate-pulse'
                : 'text-lime'
            }`}
          >
            {uiData.roleData.isImposter ? '🕵️' : '👥'}
          </div>

          <div className="text-2xl font-display font-bold mb-6 uppercase">
            {uiData.roleData.isImposter ? 'Imposter' : 'Crew'}
          </div>

          <div className="bg-panel rounded-xl p-4 mb-4 w-full text-center">
            <div className="text-xs font-mono text-ink opacity-60 mb-2">YOUR WORD</div>
            <div className="text-xl font-mono font-bold text-cyan">
              {uiData.roleData.myWord}
            </div>
          </div>

          {uiData.roleData.isImposter && (
            <div className="text-xs text-pink text-center italic">
              ⚠️ Everyone has this word except you. Find them before they find you.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Discussion Phase
  if (uiData.phase === 'discussion') {
    return (
      <div className="space-y-4">
        <div className="hud-card mission-brief">
          <h2 className="text-lg font-mono font-bold text-ink mb-2">DISCUSSION</h2>
          <p className="text-sm opacity-75">
            Talk to figure out who the imposter is!
          </p>
        </div>

        <MessageBoard messages={uiData.discussionMessages || []} className="h-48" />

        <div className="hud-card comms-panel">
          <input
            type="text"
            placeholder="Say something..."
            className="w-full bg-panel border border-ink rounded-lg px-3 py-2 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                handleDiscussionPost(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
      </div>
    );
  }

  // Voting Phase
  if (uiData.phase === 'vote') {
    return (
      <div className="space-y-4">
        <div className="hud-card mission-brief">
          <h2 className="text-lg font-mono font-bold text-ink mb-2">VOTING TIME</h2>
          <p className="text-sm opacity-75">
            Vote to eliminate who you think is the imposter
          </p>
        </div>

        <VotingBoard
          players={uiData.players || []}
          onVote={handleVote}
          selectedId={uiData.selectedTarget}
          isLocked={!uiData.canVote}
          className="hud-card"
        />

        {uiData.voteLeaders && uiData.voteLeaders.length > 0 && (
          <div className="hud-card intel-panel">
            <h3 className="text-sm font-mono font-bold text-ink mb-3">VOTE LEADERS</h3>
            <div className="space-y-2">
              {uiData.voteLeaders.slice(0, 3).map((leader: any, idx: number) => (
                <div key={leader.targetId} className="flex justify-between items-center">
                  <span className="text-sm">
                    #{idx + 1} {leader.nickname}
                  </span>
                  <span className="font-bold text-pink">{leader.count} votes</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Reveal Phase
  if (uiData.phase === 'reveal') {
    return (
      <div className="space-y-4">
        <div className="hud-card mission-brief animate-pulse">
          <h2 className="text-2xl font-display font-bold text-ink mb-4">RESULTS</h2>
          <div className="text-center py-6">
            <div className="text-sm opacity-60 mb-2">ELIMINATED</div>
            <div className="text-3xl font-bold text-pink mb-3">
              {uiData.eliminatedNickname || '...'}
            </div>
            <div className="text-lg font-mono">
              {uiData.wasCorrect ? '✅ Crew wins!' : '❌ Imposter wins!'}
            </div>
          </div>
        </div>

        {celebrating && <ParticleEffect type="celebrate" />}
      </div>
    );
  }

  // Recap Phase
  if (uiData.phase === 'recap') {
    return (
      <div className="space-y-4">
        <div className="hud-card mission-brief">
          <h2 className="text-xl font-display font-bold text-ink mb-4">ROUND SUMMARY</h2>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-panel p-3 rounded">
              <div className="text-xs opacity-60 mb-1">Imposter</div>
              <div className="font-bold">{uiData.imposterNickname}</div>
            </div>
            <div className="bg-panel p-3 rounded">
              <div className="text-xs opacity-60 mb-1">Outcome</div>
              <div className="font-bold">
                {uiData.wasCorrect ? 'Eliminated ✅' : 'Won ❌'}
              </div>
            </div>
          </div>

          {uiData.scores && (
            <div className="mt-4 pt-4 border-t border-ink border-opacity-20">
              <div className="text-xs font-mono font-bold mb-2 text-ink opacity-60">
                POINTS THIS ROUND
              </div>
              {uiData.scores.map((score: any) => (
                <div key={score.playerId} className="flex justify-between text-sm mb-1">
                  <span>{score.nickname}</span>
                  <span className="font-bold text-lime">+{score.points}</span>
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
