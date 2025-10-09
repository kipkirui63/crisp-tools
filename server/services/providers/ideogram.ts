import type { ImageGenerationRequest, ImageGenerationResponse, APIProvider } from '../types';

export class IdeogramProvider implements APIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const response = await fetch('https://api.ideogram.ai/generate', {
      method: 'POST',
      headers: {
        'Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_request: {
          prompt: request.prompt,
          model: request.model.toUpperCase().replace(/-/g, '_'),
          magic_prompt_option: 'AUTO',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ideogram API failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      imageUrl: data.data[0].url,
    };
  }
}