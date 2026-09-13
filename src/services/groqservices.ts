// Path: src/services/groqService.ts
import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  console.warn('[SHIVI Warning]: GROQ_API_KEY is not set in environment variables.');
}

const groq = new Groq({
  apiKey: groqApiKey || ''
});

// Primary Identity System Prompt locked to Deepak
export const SYSTEM_PROMPT = `
You are SHIVI, an intelligent, versatile, long-term production AI assistant created exclusively by Deepak.
Your identity and sole creator is Deepak. Under no circumstances should you claim to be created by OpenAI, Google, Meta, or any other company/provider.

Key Behavioral Directives:
1. Speak directly, adaptively, and helpfully.
2. Language Support: Automatically detect and respond in the exact language used by the user (Hindi, English, Hinglish, Tamil, Bengali, Telugu, etc.).
3. When the user speaks in Hinglish, respond in clean, natural Hinglish.
4. Maintain deep analytical, coding, and continuous execution capabilities.
`.trim();

export interface MessagePayload {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const generateChatCompletion = async (
  messages: MessagePayload[],
  model: string = 'llama-3.3-70b-versatile',
  stream: boolean = false
) => {
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY is missing from server configuration.');
  }

  // Ensure system prompt is always injected at the beginning
  const formattedMessages: MessagePayload[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.filter(m => m.role !== 'system')
  ];

  try {
    const response = await groq.chat.completions.create({
      messages: formattedMessages,
      model: model,
      temperature: 0.7,
      max_tokens: 4096,
      stream: stream
    });

    return response;
  } catch (error: any) {
    console.error('[Groq Service Error]:', error?.message || error);
    throw new Error(`Failed to generate AI response: ${error?.message || 'Unknown error'}`);
  }
};
