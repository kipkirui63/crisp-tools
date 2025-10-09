import type { ImageGenerationRequest, ImageGenerationResponse, APIProvider } from '../types';

export class MidjourneyProvider implements APIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    // Use a Midjourney API wrapper service
    throw new Error('Midjourney requires Discord bot integration');
  }
}