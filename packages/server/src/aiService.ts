import type { AiPromptInput, AiPromptResult, AiRecapInput, AiRecapResult } from '@yapzi/shared';

const DEFAULT_NIM_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const DEFAULT_MODEL = 'moonshotai/kimi-k2.6';
const REQUEST_TIMEOUT_MS = 12000;

const fallbackRoasts = [
  'Bro defended like a Wi-Fi signal in a basement.',
  'That vote looked confident and wrong at the same time.',
  'Peak suspicious behavior with zero evidence.'
] as const;

const fallbackTruth = [
  'What is one chaotic thing you did this month and never admitted?',
  'Which friend in this room is the biggest yapper and why?',
  'What secret playlist are you gatekeeping right now?'
] as const;

const fallbackDare = [
  'Send your last used emoji in chat with no explanation.',
  'Do a dramatic apology to the room in 10 words.',
  'Type your most cursed food combo in all caps.'
] as const;

const fallbackIcebreakers = [
  'If this room had a warning label, what would it say?',
  'What is your current main-character delusion?',
  'Which meme best describes your week?'
] as const;

export async function generateAiRecap(input: AiRecapInput): Promise<AiRecapResult> {
  const fallback = buildFallbackRecap(input);
  const apiKey = process.env.NVIDIA_API_KEY?.trim();
  if (!apiKey) {
    return { ...fallback, source: 'fallback' };
  }

  const playerSnapshot = input.players
    .map((player) => `${sanitizeForModel(player.nickname, 24)}(${player.score})`)
    .join(', ');
  const highlights = (input.highlights ?? [])
    .slice(0, 4)
    .map((line) => sanitizeForModel(line, 80))
    .join(' | ');

  const userPrompt = [
    `Create a short recap and roast for a Gen Z party game room.`,
    `Room: ${sanitizeForModel(input.roomCode, 12)}`,
    `Mode: ${input.mode}`,
    `Players+scores: ${playerSnapshot}`,
    highlights ? `Highlights: ${highlights}` : '',
    `Format strictly as JSON: {"summary":"...","roast":"..."}`
  ]
    .filter(Boolean)
    .join('\n');

  const content = await callNim(apiKey, [
    {
      role: 'system',
      content:
        'You are a witty but safe party-game commentator. Keep output playful, non-abusive, and under 30 words per field.'
    },
    { role: 'user', content: userPrompt }
  ]);

  if (!content) {
    return { ...fallback, source: 'fallback' };
  }

  const parsed = tryParseJson<{ summary?: string; roast?: string }>(content);
  if (!parsed?.summary || !parsed?.roast) {
    return { ...fallback, source: 'fallback' };
  }

  return {
    summary: parsed.summary.trim().slice(0, 200),
    roast: parsed.roast.trim().slice(0, 200),
    source: 'nim'
  };
}

export async function generateAiPrompts(input: AiPromptInput): Promise<AiPromptResult> {
  const count = clamp(Math.floor(input.count ?? 3), 1, 5);
  const fallback = fallbackPrompts(input.kind, count);
  const apiKey = process.env.NVIDIA_API_KEY?.trim();
  if (!apiKey) {
    return { prompts: fallback, source: 'fallback' };
  }

  const userPrompt = [
    `Generate ${count} ${input.kind} prompts for a browser party game.`,
    `Tone: ${input.tone ?? 'chaotic'}`,
    input.topic ? `Topic: ${sanitizeForModel(input.topic, 80)}` : '',
    `Safety rules: no hate, no harassment, no illegal or sexual content.`,
    `Return strict JSON: {"prompts":["..."]}`
  ]
    .filter(Boolean)
    .join('\n');

  const content = await callNim(apiKey, [
    {
      role: 'system',
      content:
        'You write short, high-energy social game prompts that are safe for mixed friend groups.'
    },
    { role: 'user', content: userPrompt }
  ]);

  if (!content) {
    return { prompts: fallback, source: 'fallback' };
  }

  const parsed = tryParseJson<{ prompts?: string[] }>(content);
  const prompts = parsed?.prompts
    ?.map((prompt) => prompt.trim())
    .filter((prompt) => Boolean(prompt))
    .slice(0, count);

  if (!prompts?.length) {
    return { prompts: fallback, source: 'fallback' };
  }

  return { prompts, source: 'nim' };
}

async function callNim(
  apiKey: string,
  messages: Array<{ role: 'system' | 'user'; content: string }>
): Promise<string | null> {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(process.env.NVIDIA_NIM_URL ?? DEFAULT_NIM_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        model: process.env.NVIDIA_NIM_MODEL ?? DEFAULT_MODEL,
        messages,
        max_tokens: 500,
        temperature: 0.9,
        top_p: 1
      }),
      signal: abortController.signal
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function buildFallbackRecap(input: AiRecapInput): Omit<AiRecapResult, 'source'> {
  const leader = [...input.players].sort((a, b) => b.score - a.score)[0]?.nickname ?? 'Unknown';
  const summary = `Room ${input.roomCode} went full ${input.mode} chaos with surprise swings and loud accusations.`;
  const roast = `${pickOne(fallbackRoasts)} MVP right now: ${leader}.`;
  return { summary, roast };
}

function fallbackPrompts(kind: AiPromptInput['kind'], count: number): string[] {
  const source =
    kind === 'truth'
      ? fallbackTruth
      : kind === 'dare'
        ? fallbackDare
        : kind === 'icebreaker'
          ? fallbackIcebreakers
          : fallbackRoasts;

  const prompts: string[] = [];
  while (prompts.length < count) {
    prompts.push(source[prompts.length % source.length]);
  }
  return prompts;
}

function pickOne<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function tryParseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function sanitizeForModel(value: string, maxLength: number): string {
  const withoutControlChars = Array.from(value)
    .map((char) => {
      const code = char.charCodeAt(0);
      return (code >= 0 && code <= 31) || code === 127 ? ' ' : char;
    })
    .join('');
  const collapsed = withoutControlChars.replace(/\s+/g, ' ').trim();
  const blockedInstructionPatterns = [
    /ignore previous instructions/gi,
    /system prompt/gi,
    /you are now/gi,
    /assistant:/gi,
    /developer:/gi,
    /user:/gi
  ];
  const deweaponized = blockedInstructionPatterns.reduce(
    (acc, pattern) => acc.replace(pattern, '[redacted]'),
    collapsed
  );
  return deweaponized.slice(0, maxLength);
}
