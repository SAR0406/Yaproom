const DEFAULT_BLOCKED_TERMS = [
  'slur',
  'hateword',
  'kys',
  'nazi'
];

const MAX_MESSAGE_LENGTH = 300;

const blockedTerms = (process.env.BLOCKED_TERMS ?? DEFAULT_BLOCKED_TERMS.join(','))
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export function hasAbusiveLanguage(text: string): boolean {
  const normalized = normalizeText(text);
  return blockedTerms.some((term) => normalized.includes(term));
}

export function assertSafeText(text: string): { ok: true } | { ok: false; message: string } {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, message: 'Message cannot be empty.' };
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.` };
  }
  if (hasAbusiveLanguage(trimmed)) {
    return { ok: false, message: 'Abusive language is not allowed.' };
  }
  return { ok: true };
}

export function sanitizeEmojiReaction(value: string): string | null {
  const candidate = value.trim();
  if (!candidate) return null;
  if (candidate.length > 8) return null;
  if (!/^[\p{Extended_Pictographic}\uFE0F\u200D]+$/u.test(candidate)) {
    return null;
  }
  return candidate;
}

export function sanitizeMemeUrl(input?: string): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') {
      return null;
    }
    const allowed = ['i.imgur.com', 'imgur.com', 'media.giphy.com', 'tenor.com', 'images.tenor.com'];
    if (!allowed.includes(url.hostname.toLowerCase())) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\s+/g, ' ')
    .trim();
}
