import { Request, Response } from 'express';
import { generateChatCompletion, MessagePayload } from '../services/groqService.js';

export const handleChatCompletion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, model } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Invalid request: messages array is required.' });
      return;
    }

    const response = await generateChatCompletion(messages as MessagePayload[], model);
    
    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error: any) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Internal Server Error'
    });
  }
};
