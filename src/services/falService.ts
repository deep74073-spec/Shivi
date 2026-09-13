// Path: src/services/falService.ts
import * as fal from '@fal-ai/serverless-client';
import dotenv from 'dotenv';

dotenv.config();

const falKey = process.env.FAL_KEY;

if (!falKey) {
  console.warn('[SHIVI Warning]: FAL_KEY is not set in environment variables.');
}

// Configure Fal SDK client credentials
fal.config({
  credentials: falKey
});

export interface ImageGenerationOptions {
  prompt: string;
  imageSize?: 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';
  numImages?: number;
}

export interface VideoGenerationOptions {
  prompt: string;
  imageUrl?: string;
  duration?: number;
}

/**
 * Generates images via Fal.ai modular models
 */
export const generateImage = async (options: ImageGenerationOptions) => {
  if (!falKey) {
    throw new Error('FAL_KEY is missing from server configuration.');
  }

  try {
    const result: any = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt: options.prompt,
        image_size: options.imageSize || 'square_hd',
        num_images: options.numImages || 1,
        enable_safety_checker: true
      },
      logs: true
    });

    return {
      images: result.images || [],
      seed: result.seed,
      hasNSFW: result.has_nsfw_concepts || [false]
    };
  } catch (error: any) {
    console.error('[Fal Image Error]:', error?.message || error);
    throw new Error(`Image generation failed: ${error?.message || 'Unknown error'}`);
  }
};

/**
 * Generates video via Fal.ai text-to-video / image-to-video models
 */
export const generateVideo = async (options: VideoGenerationOptions) => {
  if (!falKey) {
    throw new Error('FAL_KEY is missing from server configuration.');
  }

  try {
    const endpoint = options.imageUrl ? 'fal-ai/kling-video/v1.5/pro/image-to-video' : 'fal-ai/kling-video/v1.5/pro/text-to-video';

    const inputPayload: Record<string, any> = {
      prompt: options.prompt
    };

    if (options.imageUrl) {
      inputPayload.image_url = options.imageUrl;
    }

    const result: any = await fal.subscribe(endpoint, {
      input: inputPayload,
      logs: true
    });

    return {
      videoUrl: result.video?.url || null,
      requestId: result.request_id
    };
  } catch (error: any) {
    console.error('[Fal Video Error]:', error?.message || error);
    throw new Error(`Video generation failed: ${error?.message || 'Unknown error'}`);
  }
};
