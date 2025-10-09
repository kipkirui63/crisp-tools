import type { ImageGenerationRequest, ImageGenerationResponse, APIProvider } from '../types';


export class RecraftProvider implements APIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const response = await fetch('https://api.recraft.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        style: 'realistic_image',
      }),
    });

    if (!response.ok) {
      throw new Error(`Recraft API failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      imageUrl: data.data[0].url,
    };
  }
}