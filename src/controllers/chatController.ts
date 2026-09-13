import { Request, Response } from 'express';
import { generateChatCompletion, MessagePayload } from '../services/groqService';

export const handleChatRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, messages, isAppBuilderMode, model } = req.body;

    // Support both single message or chat messages array format
    let conversation: MessagePayload[] = [];

    if (messages && Array.isArray(messages) && messages.length > 0) {
      conversation = [...messages];
    } else if (message) {
      conversation = [{ role: 'user', content: message }];
    } else {
      res.status(400).json({ error: 'Invalid input: message or messages array is required.' });
      return;
    }

    // App Builder Mode System Prompt injection
    if (isAppBuilderMode) {
      const appBuilderSystemPrompt = {
        role: 'system' as const,
        content: `You are SHIVI AI App Builder Engine for Android (Kotlin, Jetpack Compose, MVVM, Retrofit, Gson).
When the user asks to build an app feature, screen, or component, you MUST reply ONLY in strict JSON format with NO markdown code blocks around the entire JSON (or parseable directly) matching this exact schema:
{
  "reply": "A short conversational summary of what was built.",
  "generatedFiles": [
    {
      "fileName": "ExampleScreen.kt",
      "filePath": "app/src/main/java/com/aiappbuilder/ui/",
      "codeContent": "package com.aiappbuilder.ui\\n\\nimport androidx.compose.runtime.*\\n...",
      "explanation": "Brief note about this file."
    }
  ]
}
If it's just a general question and not code building, set generatedFiles to an empty array [] and give a normal reply.`
      };
      conversation.unshift(appBuilderSystemPrompt);
    }

    const aiResponse: any = await generateChatCompletion(
      conversation, 
      model || 'llama-3.3-70b-versatile'
    );
    
    const responseText = aiResponse.choices[0]?.message?.content || '';

    // If App Builder mode is active, try to parse JSON safely, or return structured response
    if (isAppBuilderMode) {
      try {
        // Clean markdown backticks if AI accidentally added them
        let cleanJsonStr = responseText.trim();
        if (cleanJsonStr.startsWith('```json')) {
          cleanJsonStr = cleanJsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (cleanJsonStr.startsWith('```')) {
          cleanJsonStr = cleanJsonStr.replace(/^```/, '').replace(/```$/, '').trim();
        }

        const parsedJson = JSON.parse(cleanJsonStr);
        res.status(200).json({
          reply: parsedJson.reply || responseText,
          generatedFiles: parsedJson.generatedFiles || [],
          usage: aiResponse.usage || null
        });
        return;
      } catch (parseError) {
        // Fallback if AI didn't return pure JSON
        res.status(200).json({
          reply: responseText,
          generatedFiles: [],
          usage: aiResponse.usage || null
        });
        return;
      }
    }

    // Standard Chat Response
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
