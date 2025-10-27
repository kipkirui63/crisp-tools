import OpenAI from 'openai';
import sharp from 'sharp';
import type { ImageGenerationRequest, ImageGenerationResponse, APIProvider } from '../types';

export class OpenAIProvider implements APIProvider {
  private client: OpenAI;
  public supportsImageToImage = true;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    if (request.inputImage) {
      console.log('[OpenAI] Using image edit mode (img2img)');
      return this.editImage(request);
    }

    console.log('[OpenAI] Using text-to-image mode');
    const size = this.getValidSize(request.width, request.height);
    const model = this.mapModel(request.model);

    const response = await this.client.images.generate({
      model,
      prompt: request.prompt,
      n: 1,
      size,
      quality: 'standard',
    });

    if (!response.data || response.data.length === 0 || !response.data[0].url) {
      throw new Error("OpenAI did not return an image URL.");
    }

    return {
      imageUrl: response.data[0].url,
      revisedPrompt: response.data[0].revised_prompt ?? undefined,
    };
  }

  private async editImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const size = this.getValidSize(request.width, request.height);

    console.log('[OpenAI] Preprocessing image for OpenAI requirements...');
    const processedImage = await this.preprocessImage(request.inputImage!);
    console.log('[OpenAI] Image preprocessed, size:', processedImage.length, 'bytes');

    const imageFile = new File([processedImage], 'image.png', { type: 'image/png' });

    let maskFile: File | undefined;
    if (request.maskImage) {
      const processedMask = await this.preprocessImage(request.maskImage);
      maskFile = new File([processedMask], 'mask.png', { type: 'image/png' });
    }

    console.log('[OpenAI] Calling images.edit with preprocessed image');
    const response = await this.client.images.edit({
      image: imageFile,
      prompt: request.prompt,
      n: 1,
      size,
      mask: maskFile,
    });

    if (!response.data || response.data.length === 0 || !response.data[0].url) {
      throw new Error("OpenAI did not return an image URL.");
    }

    return {
      imageUrl: response.data[0].url,
      revisedPrompt: response.data[0].revised_prompt ?? undefined,
    };
  }

  private async preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    console.log('[OpenAI] Original image format:', metadata.format, 'channels:', metadata.channels, 'size:', metadata.width, 'x', metadata.height);

    let processedImage = image
      .ensureAlpha()
      .png();

    const stats = await processedImage.stats();
    console.log('[OpenAI] Image has', stats.channels.length, 'channels after ensureAlpha');

    const buffer = await processedImage.toBuffer();

    if (buffer.length > 4 * 1024 * 1024) {
      console.log('[OpenAI] Image too large, resizing...');
      processedImage = sharp(imageBuffer)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .ensureAlpha()
        .png();

      return await processedImage.toBuffer();
    }

    return buffer;
  }

  private mapModel(apiModel: string): string {
    const mapping: Record<string, string> = {
      'gpt-image-1': 'dall-e-3',
      'gpt-image-1-mini': 'dall-e-3',
      'dall-e-3': 'dall-e-3',
    };
    return mapping[apiModel] || 'dall-e-3';
  }

  private getValidSize(width?: number, height?: number): '1024x1024' | '1792x1024' | '1024x1792' {
    const w = width || 1024;
    const h = height || 1024;

    if (w > h && w >= 1792) return '1792x1024';
    if (h > w && h >= 1792) return '1024x1792';
    return '1024x1024';
  }
}
