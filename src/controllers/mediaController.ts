import { Request, Response } from 'express';
import { generateImage, generateVideo } from '../services/falService.js';

export const handleImageGeneration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, imageSize, numImages } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Invalid input: prompt is required.' });
      return;
    }

    const result = await generateImage({
      prompt,
      imageSize,
      numImages
    });

    res.status(200).json({
      success: true,
      images: result.images,
      seed: result.seed
    });
  } catch (error: any) {
    console.error('Image Generation Controller Error:', error);
    res.status(500).json({
      error: 'Failed to generate image.',
      details: error?.message || 'Unknown server error'
    });
  }
};

export const handleVideoGeneration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, imageUrl } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Invalid input: prompt is required.' });
      return;
    }

    const result = await generateVideo({
      prompt,
      imageUrl
    });

    res.status(200).json({
      success: true,
      videoUrl: result.videoUrl,
      requestId: result.requestId
    });
  } catch (error: any) {
    console.error('Video Generation Controller Error:', error);
    res.status(500).json({
      error: 'Failed to generate video.',
      details: error?.message || 'Unknown server error'
    });
  }
};
