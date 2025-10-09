import type { ImageGenerationRequest, ImageGenerationResponse, APIProvider } from '../types';

export class GoogleProvider implements APIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const model = this.mapModel(request.model);
    
    const response = await fetch(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/publishers/google/models/${model}:predict`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{ prompt: request.prompt }],
          parameters: {
            sampleCount: 1,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google API failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      imageUrl: `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`,
    };
  }

  private mapModel(apiModel: string): string {
    const mapping: Record<string, string> = {
      'gemini-nano-banana': 'imagegeneration',
      'wan-2.5': 'imagegeneration',
      'wan-v2.2': 'imagegeneration',
      'imagen-3': 'imagen-3.0-generate-001',
      'imagen-4': 'imagen-4.0-generate-001',
    };
    return mapping[apiModel] || 'imagegeneration';
  }
}