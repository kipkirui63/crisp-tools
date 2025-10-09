import type { ImageGenerationRequest, ImageGenerationResponse, APIProvider } from '../types';


export class RunwayProvider implements APIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    throw new Error('Runway Gen-4 API integration pending');
  }
}