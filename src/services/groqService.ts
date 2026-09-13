import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  console.warn('[SHIVI Service Warning]: GROQ_API_KEY is missing from environment variables.');
}

const groq = new Groq({
  apiKey: groqApiKey || ''
});

export interface MessagePayload {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const generateChatCompletion = async (
  messages: MessagePayload[],
  model: string = 'llama-3.3-70b-versatile'
) => {
  try {
    const systemIdentityPrompt: MessagePayload = {
      role: 'system',
      content: 'You are SHIVI, a production-grade AI assistant platform created by Deepak. Never claim to be built by OpenAI, Anthropic, Meta, or any other company. You are created solely by Deepak.'
    };

    const completion = await groq.chat.completions.create({
      messages: [systemIdentityPrompt, ...messages],
      model: model,
      temperature: 0.7,
      max_tokens: 2048
    });

    return completion;
  } catch (error: any) {
    console.error('Groq Service Error:', error);
    throw new Error(`Groq AI Processing Failed: ${error?.message || error}`);
  }
};
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
