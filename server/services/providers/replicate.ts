import Replicate from 'replicate';
import type { ImageGenerationRequest, ImageGenerationResponse, APIProvider } from '../types';

export class ReplicateProvider implements APIProvider {
  private client: Replicate;
  public supportsImageToImage = true;

  constructor(apiKey: string) {
    this.client = new Replicate({
      auth: apiKey,
    });
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    if (request.inputImage && request.maskImage) {
      console.log('[Replicate] Using virtual try-on mode (person + garment)');
      return this.virtualTryOn(request);
    }

    if (request.inputImage) {
      console.log('[Replicate] Using image-to-image mode');
      return this.imageToImage(request);
    }

    console.log('[Replicate] Using text-to-image mode');
    return this.textToImage(request);
  }

  private async virtualTryOn(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const model = this.mapModel(request.model);

    console.log('[Replicate] Virtual try-on with model:', model);
    console.log('[Replicate] Person image size:', request.inputImage!.length, 'bytes');
    console.log('[Replicate] Garment image size:', request.maskImage!.length, 'bytes');

    const personImageBase64 = `data:image/png;base64,${request.inputImage!.toString('base64')}`;
    const garmentImageBase64 = `data:image/png;base64,${request.maskImage!.toString('base64')}`;

    const input: any = {
      human_img: personImageBase64,
      garm_img: garmentImageBase64,
      garment_des: request.prompt || "a garment",
    };

    if (model.includes('idm-vton')) {
      input.category = 'upper_body';
      input.n_samples = 1;
      input.n_steps = 20;
      input.image_scale = 1.0;
      input.seed = Math.floor(Math.random() * 1000000);
    }

    console.log('[Replicate] Running virtual try-on...');
    const output = await this.client.run(model as any, { input });

    let imageUrl: string;
    if (Array.isArray(output)) {
      imageUrl = output[0] as string;
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else if (output && typeof output === 'object' && 'output' in output) {
      imageUrl = (output as any).output;
    } else {
      throw new Error('Unexpected output format from Replicate');
    }

    console.log('[Replicate] Virtual try-on completed');

    return {
      imageUrl,
      revisedPrompt: request.prompt,
    };
  }

  private async imageToImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const model = this.mapModel(request.model);

    console.log('[Replicate] Image-to-image with model:', model);

    const imageBase64 = `data:image/png;base64,${request.inputImage!.toString('base64')}`;

    const input: any = {
      prompt: request.prompt,
      image: imageBase64,
      num_outputs: 1,
    };

    if (request.strength !== undefined) {
      input.prompt_strength = request.strength;
    }

    const output = await this.client.run(model as any, { input });

    let imageUrl: string;
    if (Array.isArray(output)) {
      imageUrl = output[0] as string;
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      throw new Error('Unexpected output format from Replicate');
    }

    return {
      imageUrl,
      revisedPrompt: request.prompt,
    };
  }

  private async textToImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const model = this.mapModel(request.model);

    console.log('[Replicate] Text-to-image with model:', model);

    const input: any = {
      prompt: request.prompt,
      num_outputs: 1,
      width: request.width || 1024,
      height: request.height || 1024,
    };

    const output = await this.client.run(model as any, { input });

    let imageUrl: string;
    if (Array.isArray(output)) {
      imageUrl = output[0] as string;
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      throw new Error('Unexpected output format from Replicate');
    }

    return {
      imageUrl,
      revisedPrompt: request.prompt,
    };
  }

  private mapModel(apiModel: string): string {
    const mapping: Record<string, string> = {
      'viton-hd': 'yisol/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4',
      'idm-vton': 'yisol/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4',
      'oot-diffusion': 'cuuupid/idm-vton:c6a5c7fdced7e41072e7267930e65c2d6f4e9a4e2b5c9e0eda3f5b7d7f2d1e1a',
      'sdxl': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      'replicate-default': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    };
    return mapping[apiModel] || mapping['idm-vton'];
  }
}
