import type { ImageGenerationRequest, ImageGenerationResponse, APIProvider } from '../types';

export class ByteDanceProvider implements APIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    // Note: ByteDance models might not have public APIs yet
    // This is a placeholder implementation
    throw new Error('ByteDance models not yet available via public API');
  }
}