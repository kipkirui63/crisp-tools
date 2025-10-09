export interface ImageGenerationRequest {
  prompt: string;
  model: string;
  width?: number;
  height?: number;
  style?: string;
  negativePrompt?: string;
}

export interface ImageGenerationResponse {
  imageUrl: string;
  revisedPrompt?: string;
  metadata?: Record<string, any>;
}

export interface APIProvider {
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
}