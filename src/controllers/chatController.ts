import { Request, Response } from 'express';
import { generateChatCompletion, MessagePayload } from '../services/groqService.js';
import { searchWeb } from '../services/tavilyService.js';

export const handleChatRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, enableWebSearch, model } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Invalid input: messages array is required.' });
      return;
    }

    let conversation: MessagePayload[] = [...messages];

    if (enableWebSearch) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      if (lastUserMessage && lastUserMessage.content) {
        try {
          const searchData = await searchWeb(lastUserMessage.content, 3);
          if (searchData.results && searchData.results.length > 0) {
            const contextText = searchData.results
              .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\nSnippet: ${r.content}`)
              .join('\n\n');

            conversation.unshift({
              role: 'system',
              content: `Real-time web search context for query:\n${contextText}`
            });
          }
        } catch (searchErr) {
          console.warn('Web search failed, proceeding without web context:', searchErr);
        }
      }
    }

    const aiResponse: any = await generateChatCompletion(conversation, model || 'llama-3.3-70b-versatile');
    const responseText = aiResponse.choices[0]?.message?.content || '';

    res.status(200).json({
      role: 'assistant',
      content: responseText,
      usage: aiResponse.usage || null
    });
  } catch (error: any) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({
      error: 'Failed to process chat request.',
      details: error?.message || 'Unknown server error'
    });
  }
};
