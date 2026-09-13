import { Router } from 'express';
import { handleChatRequest } from '../controllers/chatController.js';
import { handleImageGeneration, handleVideoGeneration } from '../controllers/mediaController.js';

const router = Router();

// Chat Endpoint (Groq LLM + Tavily Web Search)
router.post('/chat', handleChatRequest);

// Media Endpoints (Fal.ai Image & Video)
router.post('/media/image', handleImageGeneration);
router.post('/media/video', handleVideoGeneration);

export default router;
