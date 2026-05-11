# Yapzi Spec Gap Checklist

Status legend: ✅ complete · 🟡 partial · ⬜ pending

## Room system
- ✅ Private room codes and invite links
- ✅ Guest-first nickname join flow
- ✅ Host/admin controls for kick/mute/ban
- ✅ Reconnect sync and host handoff on disconnect
- ✅ Room lock/unlock and max-player enforcement
- 🟡 Advanced audience/spectator workflow

## Mini-games (5 modes)
- ✅ Imposter baseline loop (role, vote, reveal scoring)
- ✅ Drawing baseline loop (drawer, guesses, reveal scoring)
- ✅ Expose baseline loop (prompt, votes, reveal scoring)
- ✅ Confession baseline loop (submit, guess, reveal scoring)
- ✅ Split-or-steal baseline loop (pair choices, reveal scoring)
- 🟡 Rich mode-specific polish and advanced modifiers

## Moderation
- ✅ Host moderation panel with kick/mute/ban actions
- ✅ Ban persistence via room banned IDs
- ✅ Host/target safety guardrails in UI and server checks
- 🟡 Message-level moderation/report queue

## PWA / mobile / accessibility
- ✅ Service worker registration and installable shell
- ✅ Mobile-first layout across key pages
- 🟡 Expanded reduced-motion and keyboard coverage
- 🟡 Full unsupported-browser and media-permission UX matrix

## AI recap/share
- ✅ Optional local recap generator with fallback-safe behavior
- ✅ Shareable recap copy action
- 🟡 External AI provider integration for dynamic prompts/cards

## Tests
- ✅ Existing server/shared unit tests
- 🟡 Additional tests needed for room lifecycle moderation and per-mode scoring

## Deployment
- ✅ Monorepo scripts and environment docs
- 🟡 Provider-specific deployment manifests/checks (Vercel + backend target)

## Final verification
- 🟡 Full acceptance criteria verification still in progress via iterative milestones
