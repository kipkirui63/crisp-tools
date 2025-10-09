import type { ImageGenerationRequest, ImageGenerationResponse, APIProvider } from '../types';


export class XAIProvider implements APIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    throw new Error('xAI Grok Image API integration pending');
  }
}