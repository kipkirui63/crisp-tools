import type { ImageGenerationRequest, ImageGenerationResponse, APIProvider } from '../types';

export class BlackForestLabsProvider implements APIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const response = await fetch('https://api.bfl.ml/v1/flux-pro', {
      method: 'POST',
      headers: {
        'X-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        width: request.width || 1024,
        height: request.height || 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`BFL API failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Poll for result
    const resultId = data.id;
    const result = await this.pollResult(resultId);
    
    return {
      imageUrl: result.sample,
      metadata: { id: resultId },
    };
  }

  private async pollResult(id: string, maxAttempts = 30): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(`https://api.bfl.ml/v1/get_result?id=${id}`, {
        headers: { 'X-Key': this.apiKey },
      });
      
      const data = await response.json();
      
      if (data.status === 'Ready') {
        return data.result;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('FLUX generation timeout');
  }
}