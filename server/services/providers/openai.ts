import OpenAI from 'openai';
import type { ImageGenerationRequest, ImageGenerationResponse, APIProvider } from '../types';

export class OpenAIProvider implements APIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  const size = this.getValidSize(request.width, request.height);
  const model = this.mapModel(request.model);
  
  const response = await this.client.images.generate({
    model,
    prompt: request.prompt,
    n: 1,
    size,
    quality: 'standard',
  });

  if (!response.data || response.data.length === 0 || !response.data[0].url) {
    throw new Error("OpenAI did not return an image URL.");
  }

  return {
    imageUrl: response.data[0].url,
    revisedPrompt: response.data[0].revised_prompt ?? undefined,
  };
}


  private mapModel(apiModel: string): string {
    // Map our API models to OpenAI's actual model names
    const mapping: Record<string, string> = {
      'gpt-image-1': 'dall-e-3',
      'gpt-image-1-mini': 'dall-e-3',
      'dall-e-3': 'dall-e-3',
    };
    return mapping[apiModel] || 'dall-e-3';
  }

  private getValidSize(width?: number, height?: number): '1024x1024' | '1792x1024' | '1024x1792' {
    const w = width || 1024;
    const h = height || 1024;

    if (w > h && w >= 1792) return '1792x1024';
    if (h > w && h >= 1792) return '1024x1792';
    return '1024x1024';
  }
}