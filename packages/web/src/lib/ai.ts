import type {
  AiPromptInput,
  AiPromptResult,
  AiRecapInput,
  AiRecapResult
} from '@yapzi/shared';
import { resolveBackendOrigin } from '@/lib/backendUrl';

export async function fetchAiRecap(payload: AiRecapInput): Promise<AiRecapResult> {
  const response = await fetch(`${resolveBackendOrigin()}/api/ai/recap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error('Failed to generate AI recap.');
  }
  return (await response.json()) as AiRecapResult;
}

export async function fetchAiPrompts(payload: AiPromptInput): Promise<AiPromptResult> {
  const response = await fetch(`${resolveBackendOrigin()}/api/ai/prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error('Failed to generate AI prompts.');
  }
  return (await response.json()) as AiPromptResult;
}
