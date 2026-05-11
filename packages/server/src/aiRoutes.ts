import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { generateAiPrompts, generateAiRecap } from './aiService.js';
import { assertSafeText } from './contentSafety.js';

const playerSchema = z.object({
  nickname: z.string().min(1).max(40),
  score: z.number().int().min(0).max(9999)
});

const recapSchema = z.object({
  roomCode: z.string().min(1).max(12),
  mode: z.enum(['imposter', 'drawing', 'expose', 'confession', 'split']),
  players: z.array(playerSchema).min(1).max(20),
  highlights: z.array(z.string().min(1).max(200)).max(8).optional()
});

const promptSchema = z.object({
  kind: z.enum(['truth', 'dare', 'roast', 'icebreaker']),
  count: z.number().int().min(1).max(5).optional(),
  tone: z.enum(['chaotic', 'playful', 'spicy']).optional(),
  topic: z.string().min(1).max(80).optional()
});

export function registerAiRoutes(app: FastifyInstance) {
  app.post('/api/ai/recap', async (request, reply) => {
    const parsed = recapSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid recap payload.' });
    }

    const body = parsed.data;
    const invalidHighlight = body.highlights?.findIndex((line) => !assertSafeText(line).ok) ?? -1;
    if (invalidHighlight >= 0) {
      return reply
        .code(400)
        .send({ error: `Highlight ${invalidHighlight + 1} contains disallowed content.` });
    }

    const result = await generateAiRecap(body);
    return reply.send(result);
  });

  app.post('/api/ai/prompts', async (request, reply) => {
    const parsed = promptSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid prompt payload.' });
    }

    const body = parsed.data;
    if (body.topic) {
      const topicSafety = assertSafeText(body.topic);
      if (!topicSafety.ok) {
        return reply.code(400).send({ error: topicSafety.message });
      }
    }

    const result = await generateAiPrompts(body);
    return reply.send(result);
  });
}
