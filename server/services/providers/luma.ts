import type { ImageGenerationRequest, ImageGenerationResponse, APIProvider } from '../types';


export class LumaProvider implements APIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    throw new Error('Luma Photon API integration pending');
  }
}