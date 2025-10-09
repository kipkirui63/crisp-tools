import type { ImageGenerationRequest, ImageGenerationResponse, APIProvider } from '../types';


export class TencentProvider implements APIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    throw new Error('Tencent Hunyuan API integration pending');
  }
}
