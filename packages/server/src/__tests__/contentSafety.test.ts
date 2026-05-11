import { describe, expect, it } from 'vitest';
import { assertSafeText, hasAbusiveLanguage, sanitizeEmojiReaction, sanitizeMemeUrl } from '../contentSafety';

describe('content safety', () => {
  it('blocks configured abusive terms', () => {
    expect(hasAbusiveLanguage('do not use hateword here')).toBe(true);
    expect(hasAbusiveLanguage('friendly banter only')).toBe(false);
  });

  it('validates emoji-only reactions', () => {
    expect(sanitizeEmojiReaction('🔥')).toBe('🔥');
    expect(sanitizeEmojiReaction('hello')).toBeNull();
  });

  it('allows only safe meme urls', () => {
    expect(sanitizeMemeUrl('https://i.imgur.com/meme.png')).toContain('https://i.imgur.com/');
    expect(sanitizeMemeUrl('http://evil.com/x.png')).toBeNull();
  });

  it('rejects abusive free text', () => {
    const result = assertSafeText('hateword');
    expect(result.ok).toBe(false);
  });
});
