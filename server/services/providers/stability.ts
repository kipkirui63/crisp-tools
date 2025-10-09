import type { ImageGenerationRequest, ImageGenerationResponse, APIProvider } from '../types';

export class StabilityAIProvider implements APIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const endpoint = this.getEndpoint(request.model);
    
    const formData = new FormData();
    formData.append('prompt', request.prompt);
    if (request.negativePrompt) {
      formData.append('negative_prompt', request.negativePrompt);
    }
    formData.append('output_format', 'png');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'image/*',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Stability AI failed: ${error}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');
    
    return {
      imageUrl: `data:image/png;base64,${base64}`,
    };
  }

  private getEndpoint(model: string): string {
    const mapping: Record<string, string> = {
      'stable-diffusion-xl': 'https://api.stability.ai/v2beta/stable-image/generate/core',
      'stable-diffusion-3': 'https://api.stability.ai/v2beta/stable-image/generate/sd3',
      'stable-diffusion-3.5-large': 'https://api.stability.ai/v2beta/stable-image/generate/sd3',
      'stable-diffusion-3.5-large-turbo': 'https://api.stability.ai/v2beta/stable-image/generate/sd3-turbo',
    };
    return mapping[model] || mapping['stable-diffusion-xl'];
  }
}