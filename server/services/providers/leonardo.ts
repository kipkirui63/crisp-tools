import type { ImageGenerationRequest, ImageGenerationResponse, APIProvider } from '../types';

export class LeonardoProvider implements APIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const modelId = this.getModelId(request.model);
    
    const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        modelId,
        width: request.width || 1024,
        height: request.height || 1024,
        num_images: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Leonardo API failed: ${response.statusText}`);
    }

    const data = await response.json();
    const generationId = data.sdGenerationJob.generationId;
    
    // Poll for completion
    const result = await this.pollGeneration(generationId);
    
    return {
      imageUrl: result.url,
      metadata: { generationId },
    };
  }

  private getModelId(model: string): string {
    const mapping: Record<string, string> = {
      'leonardo-phoenix': '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3',
      'leonardo-photoreal-v2': 'ac614f96-1082-45bf-be9d-757f2d31c174',
      'leonardo-transparency': 'aa77f04e-3eec-4034-9c07-d0f619684628',
    };
    return mapping[model] || mapping['leonardo-phoenix'];
  }

  private async pollGeneration(generationId: string, maxAttempts = 30): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(
        `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
        {
          headers: { 'Authorization': `Bearer ${this.apiKey}` },
        }
      );
      
      const data = await response.json();
      
      if (data.generations_by_pk?.status === 'COMPLETE') {
        return data.generations_by_pk.generated_images[0];
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Leonardo generation timeout');
  }
}