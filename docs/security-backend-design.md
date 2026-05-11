# Yapzi Secure Backend Design

## 1) Trust boundaries
- Browser clients are untrusted.
- Realtime authority is server-side only (Socket.IO handlers enforce room ownership and moderation rules).
- Admin authority is separate from host authority and guarded behind `/admin` HTTP Basic auth.

## 2) Authentication and authorization
- **Host auth**: host-only operations require `socket.data.playerId === room.hostId`.
- **Admin auth**: `/admin/*` requires Basic auth with:
  - `ADMIN_USERNAME` (defaults to `Frontman`)
  - `ADMIN_PASSWORD_HASH` (required, `scrypt:<salt-hex>:<hash-hex>`)
- Passwords are never hardcoded in repository files.

## 3) Content safety and abuse prevention
- Nicknames and free-text inputs are blocked when abusive terms are detected.
- Emoji reactions are constrained to emoji-only payloads.
- Meme URLs are constrained to HTTPS + allowlisted providers.
- Socket actions use server-side rate limiting to reduce spam/flood abuse.

## 4) Realtime moderation controls
- Host moderation: mute, kick, ban in-room.
- Admin moderation: global room moderation via `/admin/rooms/:code/*`.
- Ban persistence: `bannedPlayerIds` is persisted in room state and checked on join/reconnect.
- Muted users are prevented from sending moderated content paths.

## 5) Data protection and leakage controls
- Security headers on all HTTP responses (anti-sniff, frame deny, stricter cross-origin policies).
- Optional encryption for persisted event payloads using AES-256-GCM when `APP_ENCRYPTION_KEY` is configured.
- Database writes use parameterized SQL.

## 6) Operational endpoints
- `GET /health` for liveness.
- `GET /admin` for privileged control-plane status.
- `GET /admin/rooms` for room inventory.
- `POST /admin/rooms/:code/status` lock/open/end room.
- `POST /admin/rooms/:code/mute` mute user.
- `POST /admin/rooms/:code/kick` remove user.
- `POST /admin/rooms/:code/ban` ban + remove user.
- `POST /admin/rooms/:code/announce` broadcast safe admin notice.

## 7) Recommended production controls
- Put API behind TLS (WSS/HTTPS only).
- Rotate `ADMIN_PASSWORD_HASH` and `APP_ENCRYPTION_KEY` regularly.
- Ship logs to SIEM and alert on abusive-language/rate-limit spikes.
- Add WAF and IP-based throttling at edge/load-balancer.
