import { OpenAIProvider } from './providers/openai';
import { StabilityAIProvider } from './providers/stability';
import { GoogleProvider } from './providers/google';
import { BlackForestLabsProvider } from './providers/blackforestlabs';
import { LeonardoProvider } from './providers/leonardo';
import { IdeogramProvider } from './providers/ideogram';
import { ByteDanceProvider } from './providers/bytedance';
import { MidjourneyProvider } from './providers/midjourney';
import { RunwayProvider } from './providers/runway';
import { TencentProvider } from './providers/tencent';
import { XAIProvider } from './providers/xai';
import { LumaProvider } from './providers/luma';
import { RecraftProvider } from './providers/recraft';
import { ReplicateProvider } from './providers/replicate';
import type { ImageGenerationRequest, ImageGenerationResponse, APIProvider } from './types';

export class ImageGenerationDispatcher {
  private providers: Map<string, APIProvider>;
  private modelToProvider: Map<string, string>;

  constructor(apiKeys: Record<string, string>) {
    this.providers = new Map();
    this.modelToProvider = new Map();

    // Initialize all providers
    if (apiKeys.openai) {
      this.providers.set('OpenAI', new OpenAIProvider(apiKeys.openai));
    }
    if (apiKeys.stabilityai) {
      this.providers.set('Stability AI', new StabilityAIProvider(apiKeys.stabilityai));
    }
    if (apiKeys.google) {
      this.providers.set('Google', new GoogleProvider(apiKeys.google));
    }
    if (apiKeys.blackforestlabs) {
      this.providers.set('Black Forest Labs', new BlackForestLabsProvider(apiKeys.blackforestlabs));
    }
    if (apiKeys.leonardo) {
      this.providers.set('Leonardo', new LeonardoProvider(apiKeys.leonardo));
    }
    if (apiKeys.ideogram) {
      this.providers.set('Ideogram', new IdeogramProvider(apiKeys.ideogram));
    }
    if (apiKeys.bytedance) {
      this.providers.set('ByteDance', new ByteDanceProvider(apiKeys.bytedance));
    }
    if (apiKeys.midjourney) {
      this.providers.set('Midjourney', new MidjourneyProvider(apiKeys.midjourney));
    }
    if (apiKeys.runway) {
      this.providers.set('Runway', new RunwayProvider(apiKeys.runway));
    }
    if (apiKeys.tencent) {
      this.providers.set('Tencent', new TencentProvider(apiKeys.tencent));
    }
    if (apiKeys.xai) {
      this.providers.set('xAI', new XAIProvider(apiKeys.xai));
    }
    if (apiKeys.luma) {
      this.providers.set('Luma', new LumaProvider(apiKeys.luma));
    }
    if (apiKeys.recraft) {
      this.providers.set('Recraft', new RecraftProvider(apiKeys.recraft));
    }
    if (apiKeys.replicate) {
      this.providers.set('Replicate', new ReplicateProvider(apiKeys.replicate));
    }

    this.initializeModelMapping();
  }

  private initializeModelMapping() {
    // ===== OpenAI (3 models) =====
    this.modelToProvider.set('gpt-image-1', 'OpenAI');
    this.modelToProvider.set('gpt-image-1-mini', 'OpenAI');
    this.modelToProvider.set('dall-e-3', 'OpenAI');

    // ===== Stability AI (4 models) =====
    this.modelToProvider.set('stable-diffusion-xl', 'Stability AI');
    this.modelToProvider.set('stable-diffusion-3', 'Stability AI');
    this.modelToProvider.set('stable-diffusion-3.5-large', 'Stability AI');
    this.modelToProvider.set('stable-diffusion-3.5-large-turbo', 'Stability AI');

    // ===== Google (5 models) =====
    this.modelToProvider.set('gemini-nano-banana', 'Google');
    this.modelToProvider.set('wan-2.5', 'Google');
    this.modelToProvider.set('wan-v2.2', 'Google');
    this.modelToProvider.set('imagen-3', 'Google');
    this.modelToProvider.set('imagen-4', 'Google');

    // ===== Black Forest Labs (5 FLUX models) =====
    this.modelToProvider.set('flux-pro', 'Black Forest Labs');
    this.modelToProvider.set('flux-1.1-pro', 'Black Forest Labs');
    this.modelToProvider.set('flux-1.1-pro-ultra', 'Black Forest Labs');
    this.modelToProvider.set('flux-kontext', 'Black Forest Labs');
    this.modelToProvider.set('flux-kontext-max', 'Black Forest Labs');

    // ===== Leonardo (3 models) =====
    this.modelToProvider.set('leonardo-phoenix', 'Leonardo');
    this.modelToProvider.set('leonardo-photoreal-v2', 'Leonardo');
    this.modelToProvider.set('leonardo-transparency', 'Leonardo');

    // ===== Ideogram (5 models) =====
    this.modelToProvider.set('ideogram-v2', 'Ideogram');
    this.modelToProvider.set('ideogram-v2a', 'Ideogram');
    this.modelToProvider.set('ideogram-v2-turbo', 'Ideogram');
    this.modelToProvider.set('ideogram-v2a-turbo', 'Ideogram');
    this.modelToProvider.set('ideogram-v3', 'Ideogram');

    // ===== ByteDance (3 models) =====
    this.modelToProvider.set('seedream-v3', 'ByteDance');
    this.modelToProvider.set('seedream-v4', 'ByteDance');
    this.modelToProvider.set('dreamina-v3.1', 'ByteDance');

    // ===== Single model providers =====
    this.modelToProvider.set('midjourney', 'Midjourney');
    this.modelToProvider.set('runway-gen-4', 'Runway');
    this.modelToProvider.set('hunyuan-3.0', 'Tencent');
    this.modelToProvider.set('grok-2-image', 'xAI');
    this.modelToProvider.set('luma-photon', 'Luma');
    this.modelToProvider.set('luma-photon-flash', 'Luma');
    this.modelToProvider.set('recraft-v3', 'Recraft');

    // ===== Replicate (Virtual Try-On models) =====
    this.modelToProvider.set('viton-hd', 'Replicate');
    this.modelToProvider.set('idm-vton', 'Replicate');
    this.modelToProvider.set('oot-diffusion', 'Replicate');
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const providerName = this.modelToProvider.get(request.model);

    if (!providerName) {
      throw new Error(`Unknown model: ${request.model}. Model not registered in dispatcher.`);
    }

    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(
        `Provider not configured: ${providerName}. Please add API key to environment variables.`
      );
    }

    console.log(`[Dispatcher] Using provider: ${providerName} for model: ${request.model}`);
    console.log(`[Dispatcher] Has input image: ${!!request.inputImage}, Size: ${request.inputImage?.length || 0} bytes`);
    console.log(`[Dispatcher] Provider supports img2img: ${provider.supportsImageToImage || false}`);

    try {
      return await provider.generateImage(request);
    } catch (error: any) {
      throw new Error(`Image generation failed for ${request.model}: ${error.message}`);
    }
  }

  getProviderForModel(model: string): string | undefined {
    return this.modelToProvider.get(model);
  }

  isModelSupported(model: string): boolean {
    const providerName = this.modelToProvider.get(model);
    return providerName !== undefined && this.providers.has(providerName);
  }

  getSupportedModels(): string[] {
    return Array.from(this.modelToProvider.keys()).filter(model => 
      this.isModelSupported(model)
    );
  }

  getModelsByProvider(providerName: string): string[] {
    const models: string[] = [];
    for (const [model, provider] of this.modelToProvider.entries()) {
      if (provider === providerName && this.providers.has(providerName)) {
        models.push(model);
      }
    }
    return models;
  }
}

// Singleton instance
let dispatcher: ImageGenerationDispatcher | null = null;

export function getDispatcher(): ImageGenerationDispatcher {
  if (!dispatcher) {
    dispatcher = new ImageGenerationDispatcher({
      openai: process.env.OPENAI_API_KEY || '',
      stabilityai: process.env.STABILITY_API_KEY || '',
      google: process.env.GOOGLE_API_KEY || '',
      blackforestlabs: process.env.BFL_API_KEY || '',
      leonardo: process.env.LEONARDO_API_KEY || '',
      ideogram: process.env.IDEOGRAM_API_KEY || '',
      bytedance: process.env.BYTEDANCE_API_KEY || '',
      midjourney: process.env.MIDJOURNEY_API_KEY || '',
      runway: process.env.RUNWAY_API_KEY || '',
      tencent: process.env.TENCENT_API_KEY || '',
      xai: process.env.XAI_API_KEY || '',
      luma: process.env.LUMA_API_KEY || '',
      recraft: process.env.RECRAFT_API_KEY || '',
      replicate: process.env.REPLICATE_API_TOKEN || '',
    });
  }
  return dispatcher;
}

export function resetDispatcher(): void {
  dispatcher = null;
}

















































// import { z } from 'zod';

// // ==================== Types ====================

// export interface ImageGenerationRequest {
//   prompt: string;
//   model: string;
//   width?: number;
//   height?: number;
//   style?: string;
//   negativePrompt?: string;
// }

// export interface ImageGenerationResponse {
//   imageUrl: string;
//   revisedPrompt?: string;
//   metadata?: Record<string, any>;
// }

// export interface APIProvider {
//   generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
// }

// // ==================== Provider Implementations ====================

// class OpenAIProvider implements APIProvider {
//   private apiKey: string;

//   constructor(apiKey: string) {
//     this.apiKey = apiKey;
//   }

//   async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
//     const response = await fetch('https://api.openai.com/v1/images/generations', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${this.apiKey}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: request.model,
//         prompt: request.prompt,
//         n: 1,
//         size: `${request.width || 1024}x${request.height || 1024}`,
//       }),
//     });

//     const data = await response.json();
//     return {
//       imageUrl: data.data[0].url,
//       revisedPrompt: data.data[0].revised_prompt,
//     };
//   }
// }

// class StabilityAIProvider implements APIProvider {
//   private apiKey: string;

//   constructor(apiKey: string) {
//     this.apiKey = apiKey;
//   }

//   async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
//     const engineId = this.getEngineId(request.model);
//     const response = await fetch(
//       `https://api.stability.ai/v1/generation/${engineId}/text-to-image`,
//       {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${this.apiKey}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           text_prompts: [
//             { text: request.prompt, weight: 1 },
//             ...(request.negativePrompt ? [{ text: request.negativePrompt, weight: -1 }] : []),
//           ],
//           width: request.width || 1024,
//           height: request.height || 1024,
//           samples: 1,
//         }),
//       }
//     );

//     const data = await response.json();
//     const base64Image = data.artifacts[0].base64;
//     return {
//       imageUrl: `data:image/png;base64,${base64Image}`,
//       metadata: { seed: data.artifacts[0].seed },
//     };
//   }

//   private getEngineId(model: string): string {
//     const mapping: Record<string, string> = {
//       'stable-diffusion-xl': 'stable-diffusion-xl-1024-v1-0',
//       'stable-diffusion-3': 'stable-diffusion-v3',
//       'stable-diffusion-3.5-large': 'stable-diffusion-v3-5-large',
//       'stable-diffusion-3.5-large-turbo': 'stable-diffusion-v3-5-large-turbo',
//     };
//     return mapping[model] || model;
//   }
// }

// class GoogleProvider implements APIProvider {
//   private apiKey: string;

//   constructor(apiKey: string) {
//     this.apiKey = apiKey;
//   }

//   async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1/models/${request.model}:generateImage?key=${this.apiKey}`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           prompt: request.prompt,
//           numberOfImages: 1,
//         }),
//       }
//     );

//     const data = await response.json();
//     return {
//       imageUrl: data.generatedImages[0].imageUrl,
//     };
//   }
// }

// class BlackForestLabsProvider implements APIProvider {
//   private apiKey: string;

//   constructor(apiKey: string) {
//     this.apiKey = apiKey;
//   }

//   async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
//     const response = await fetch('https://api.bfl.ml/v1/flux', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${this.apiKey}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         prompt: request.prompt,
//         model: request.model,
//         width: request.width || 1024,
//         height: request.height || 1024,
//       }),
//     });

//     const data = await response.json();
//     return {
//       imageUrl: data.result.sample,
//       metadata: { id: data.id },
//     };
//   }
// }

// class LeonardoProvider implements APIProvider {
//   private apiKey: string;

//   constructor(apiKey: string) {
//     this.apiKey = apiKey;
//   }

//   async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
//     const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${this.apiKey}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         prompt: request.prompt,
//         modelId: this.getModelId(request.model),
//         width: request.width || 1024,
//         height: request.height || 1024,
//         num_images: 1,
//       }),
//     });

//     const data = await response.json();
//     return {
//       imageUrl: data.generations[0].url,
//       metadata: { generationId: data.generationId },
//     };
//   }

//   private getModelId(model: string): string {
//     const mapping: Record<string, string> = {
//       'leonardo-phoenix': 'phoenix-1.0',
//       'leonardo-photoreal-v2': 'photoreal-v2',
//       'leonardo-transparency': 'transparency-1.0',
//     };
//     return mapping[model] || model;
//   }
// }

// class IdeogramProvider implements APIProvider {
//   private apiKey: string;

//   constructor(apiKey: string) {
//     this.apiKey = apiKey;
//   }

//   async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
//     const response = await fetch('https://api.ideogram.ai/generate', {
//       method: 'POST',
//       headers: {
//         'Api-Key': this.apiKey,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         prompt: request.prompt,
//         model: request.model,
//         aspect_ratio: this.getAspectRatio(request.width, request.height),
//       }),
//     });

//     const data = await response.json();
//     return {
//       imageUrl: data.data[0].url,
//     };
//   }

//   private getAspectRatio(width?: number, height?: number): string {
//     if (!width || !height) return 'ASPECT_1_1';
//     const ratio = width / height;
//     if (ratio > 1.5) return 'ASPECT_16_9';
//     if (ratio > 1.2) return 'ASPECT_3_2';
//     if (ratio < 0.7) return 'ASPECT_9_16';
//     if (ratio < 0.9) return 'ASPECT_2_3';
//     return 'ASPECT_1_1';
//   }
// }

// class ByteDanceProvider implements APIProvider {
//   private apiKey: string;

//   constructor(apiKey: string) {
//     this.apiKey = apiKey;
//   }

//   async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
//     const response = await fetch('https://api.bytedance.com/v1/image/generation', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${this.apiKey}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         prompt: request.prompt,
//         model: request.model,
//         width: request.width || 1024,
//         height: request.height || 1024,
//       }),
//     });

//     const data = await response.json();
//     return {
//       imageUrl: data.images[0].url,
//     };
//   }
// }

// class GenericProvider implements APIProvider {
//   private apiKey: string;
//   private baseUrl: string;

//   constructor(apiKey: string, baseUrl: string) {
//     this.apiKey = apiKey;
//     this.baseUrl = baseUrl;
//   }

//   async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
//     const response = await fetch(`${this.baseUrl}/generate`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${this.apiKey}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         prompt: request.prompt,
//         model: request.model,
//         width: request.width || 1024,
//         height: request.height || 1024,
//       }),
//     });

//     const data = await response.json();
//     return {
//       imageUrl: data.imageUrl || data.url || data.images?.[0]?.url,
//     };
//   }
// }

// // ==================== Dispatcher ====================

// export class ImageGenerationDispatcher {
//   private providers: Map<string, APIProvider>;
//   private modelToProvider: Map<string, string>;

//   constructor(apiKeys: Record<string, string>) {
//     this.providers = new Map();
//     this.modelToProvider = new Map();

//     // Initialize providers
//     if (apiKeys.openai) {
//       this.providers.set('OpenAI', new OpenAIProvider(apiKeys.openai));
//     }
//     if (apiKeys.stabilityai) {
//       this.providers.set('Stability AI', new StabilityAIProvider(apiKeys.stabilityai));
//     }
//     if (apiKeys.google) {
//       this.providers.set('Google', new GoogleProvider(apiKeys.google));
//     }
//     if (apiKeys.blackforestlabs) {
//       this.providers.set('Black Forest Labs', new BlackForestLabsProvider(apiKeys.blackforestlabs));
//     }
//     if (apiKeys.leonardo) {
//       this.providers.set('Leonardo', new LeonardoProvider(apiKeys.leonardo));
//     }
//     if (apiKeys.ideogram) {
//       this.providers.set('Ideogram', new IdeogramProvider(apiKeys.ideogram));
//     }
//     if (apiKeys.bytedance) {
//       this.providers.set('ByteDance', new ByteDanceProvider(apiKeys.bytedance));
//     }

//     // Generic providers for others
//     if (apiKeys.midjourney) {
//       this.providers.set('Midjourney', new GenericProvider(apiKeys.midjourney, 'https://api.midjourney.com'));
//     }
//     if (apiKeys.runway) {
//       this.providers.set('Runway', new GenericProvider(apiKeys.runway, 'https://api.runwayml.com'));
//     }
//     if (apiKeys.tencent) {
//       this.providers.set('Tencent', new GenericProvider(apiKeys.tencent, 'https://api.tencent.com'));
//     }
//     if (apiKeys.xai) {
//       this.providers.set('xAI', new GenericProvider(apiKeys.xai, 'https://api.x.ai'));
//     }
//     if (apiKeys.luma) {
//       this.providers.set('Luma', new GenericProvider(apiKeys.luma, 'https://api.lumalabs.ai'));
//     }
//     if (apiKeys.recraft) {
//       this.providers.set('Recraft', new GenericProvider(apiKeys.recraft, 'https://api.recraft.ai'));
//     }

//     this.initializeModelMapping();
//   }

//   private initializeModelMapping() {
//     // OpenAI models
//     this.modelToProvider.set('gpt-image-1', 'OpenAI');
//     this.modelToProvider.set('gpt-image-1-mini', 'OpenAI');
//     this.modelToProvider.set('dall-e-3', 'OpenAI');

//     // Stability AI models
//     this.modelToProvider.set('stable-diffusion-xl', 'Stability AI');
//     this.modelToProvider.set('stable-diffusion-3', 'Stability AI');
//     this.modelToProvider.set('stable-diffusion-3.5-large', 'Stability AI');
//     this.modelToProvider.set('stable-diffusion-3.5-large-turbo', 'Stability AI');

//     // Google models
//     this.modelToProvider.set('gemini-nano-banana', 'Google');
//     this.modelToProvider.set('wan-2.5', 'Google');
//     this.modelToProvider.set('wan-v2.2', 'Google');
//     this.modelToProvider.set('imagen-3', 'Google');
//     this.modelToProvider.set('imagen-4', 'Google');

//     // Black Forest Labs models
//     this.modelToProvider.set('flux-pro', 'Black Forest Labs');
//     this.modelToProvider.set('flux-1.1-pro', 'Black Forest Labs');
//     this.modelToProvider.set('flux-1.1-pro-ultra', 'Black Forest Labs');
//     this.modelToProvider.set('flux-kontext', 'Black Forest Labs');
//     this.modelToProvider.set('flux-kontext-max', 'Black Forest Labs');

//     // Leonardo models
//     this.modelToProvider.set('leonardo-phoenix', 'Leonardo');
//     this.modelToProvider.set('leonardo-photoreal-v2', 'Leonardo');
//     this.modelToProvider.set('leonardo-transparency', 'Leonardo');

//     // Ideogram models
//     this.modelToProvider.set('ideogram-v2', 'Ideogram');
//     this.modelToProvider.set('ideogram-v2a', 'Ideogram');
//     this.modelToProvider.set('ideogram-v2-turbo', 'Ideogram');
//     this.modelToProvider.set('ideogram-v2a-turbo', 'Ideogram');
//     this.modelToProvider.set('ideogram-v3', 'Ideogram');

//     // ByteDance models
//     this.modelToProvider.set('seedream-v3', 'ByteDance');
//     this.modelToProvider.set('seedream-v4', 'ByteDance');
//     this.modelToProvider.set('dreamina-v3.1', 'ByteDance');

//     // Other providers
//     this.modelToProvider.set('midjourney', 'Midjourney');
//     this.modelToProvider.set('runway-gen-4', 'Runway');
//     this.modelToProvider.set('hunyuan-3.0', 'Tencent');
//     this.modelToProvider.set('grok-2-image', 'xAI');
//     this.modelToProvider.set('luma-photon', 'Luma');
//     this.modelToProvider.set('luma-photon-flash', 'Luma');
//     this.modelToProvider.set('recraft-v3', 'Recraft');
//   }

//   async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
//     const providerName = this.modelToProvider.get(request.model);
    
//     if (!providerName) {
//       throw new Error(`Unknown model: ${request.model}`);
//     }

//     const provider = this.providers.get(providerName);
    
//     if (!provider) {
//       throw new Error(`Provider not configured: ${providerName}`);
//     }

//     return await provider.generateImage(request);
//   }

//   getProviderForModel(model: string): string | undefined {
//     return this.modelToProvider.get(model);
//   }

//   isModelSupported(model: string): boolean {
//     return this.modelToProvider.has(model);
//   }

//   getSupportedModels(): string[] {
//     return Array.from(this.modelToProvider.keys());
//   }

//   getProviders(): string[] {
//     return Array.from(this.providers.keys());
//   }
// }

// // ==================== Usage Example ====================

// // Initialize dispatcher
// const dispatcher = new ImageGenerationDispatcher({
//   openai: process.env.OPENAI_API_KEY!,
//   stabilityai: process.env.STABILITY_API_KEY!,
//   google: process.env.GOOGLE_API_KEY!,
//   blackforestlabs: process.env.BFL_API_KEY!,
//   leonardo: process.env.LEONARDO_API_KEY!,
//   ideogram: process.env.IDEOGRAM_API_KEY!,
//   bytedance: process.env.BYTEDANCE_API_KEY!,
//   // Add other API keys as needed
// });

// // Export for use in your application
// export default dispatcher;

