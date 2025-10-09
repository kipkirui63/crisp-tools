import { db } from './index';
import { aiModels } from './schema';
import dotenv from 'dotenv';

dotenv.config();

const seedModels = [
  // ===== OpenAI =====
  {
    name: 'GPT Image 1',
    provider: 'OpenAI',
    modelType: 'image_generation',
    apiModel: 'gpt-image-1',
    capabilities: { styles: ['realistic', 'artistic'], maxResolution: '2048x2048' },
    costPerUse: 2,
  },
  {
    name: 'GPT Image 1 Mini',
    provider: 'OpenAI',
    modelType: 'image_generation',
    apiModel: 'gpt-image-1-mini',
    capabilities: { styles: ['fast', 'cheap'], maxResolution: '1024x1024' },
    costPerUse: 1,
  },
  {
    name: 'DALL-E 3',
    provider: 'OpenAI',
    modelType: 'image_generation',
    apiModel: 'dall-e-3',
    capabilities: { styles: ['realistic', 'artistic'], maxResolution: '1792x1024' },
    costPerUse: 2,
  },

  // ===== Stability AI =====
  {
    name: 'Stable Diffusion XL',
    provider: 'Stability AI',
    modelType: 'image_generation',
    apiModel: 'stable-diffusion-xl',
    capabilities: { styles: ['realistic', 'artistic', 'anime'], maxResolution: '1024x1024' },
    costPerUse: 1,
  },
  {
    name: 'Stable Diffusion 3',
    provider: 'Stability AI',
    modelType: 'image_generation',
    apiModel: 'stable-diffusion-3',
    capabilities: { styles: ['advanced'], maxResolution: '2048x2048' },
    costPerUse: 2,
  },
  {
    name: 'Stable Diffusion 3.5 Large',
    provider: 'Stability AI',
    modelType: 'image_generation',
    apiModel: 'stable-diffusion-3.5-large',
    capabilities: { styles: ['artistic', 'detailed'], maxResolution: '2048x2048' },
    costPerUse: 3,
  },
  {
    name: 'Stable Diffusion 3.5 Large Turbo',
    provider: 'Stability AI',
    modelType: 'image_generation',
    apiModel: 'stable-diffusion-3.5-large-turbo',
    capabilities: { styles: ['fast'], maxResolution: '1024x1024' },
    costPerUse: 2,
  },

  // ===== Google =====
  {
    name: 'Nano-Banana',
    provider: 'Google',
    modelType: 'image_generation',
    apiModel: 'gemini-nano-banana', // placeholder
    capabilities: { styles: ['flash'], maxResolution: '1024x1024' },
    costPerUse: 2,
  },
  {
    name: 'Wan 2.5',
    provider: 'Google',
    modelType: 'image_generation',
    apiModel: 'wan-2.5', // placeholder
    capabilities: { styles: ['charts', 'text'], maxResolution: '1024x1024' },
    costPerUse: 2,
  },
  {
    name: 'Wan v2.2',
    provider: 'Google',
    modelType: 'image_generation',
    apiModel: 'wan-v2.2', // placeholder
    capabilities: { styles: ['high-fidelity'], maxResolution: '1024x1024' },
    costPerUse: 2,
  },
  {
    name: 'Imagen 3',
    provider: 'Google',
    modelType: 'image_generation',
    apiModel: 'imagen-3',
    capabilities: { styles: ['photorealistic'], maxResolution: '2048x2048' },
    costPerUse: 3,
  },
  {
    name: 'Imagen 4',
    provider: 'Google',
    modelType: 'image_generation',
    apiModel: 'imagen-4',
    capabilities: { styles: ['highest-quality'], maxResolution: '2048x2048' },
    costPerUse: 4,
  },

  // ===== Midjourney =====
  {
    name: 'Midjourney',
    provider: 'Midjourney',
    modelType: 'image_generation',
    apiModel: 'midjourney', // via Discord bot
    capabilities: { styles: ['artistic', 'creative'], maxResolution: '2048x2048' },
    costPerUse: 3,
  },

  // ===== Black Forest Labs (FLUX) =====
  {
    name: 'FLUX Pro',
    provider: 'Black Forest Labs',
    modelType: 'image_generation',
    apiModel: 'flux-pro',
    capabilities: { styles: ['realistic', 'artistic'], maxResolution: '1440x1440' },
    costPerUse: 2,
  },
  {
    name: 'FLUX 1.1 Pro',
    provider: 'Black Forest Labs',
    modelType: 'image_generation',
    apiModel: 'flux-1.1-pro',
    capabilities: { styles: ['detailed'], maxResolution: '2048x2048' },
    costPerUse: 3,
  },
  {
    name: 'FLUX 1.1 Pro Ultra',
    provider: 'Black Forest Labs',
    modelType: 'image_generation',
    apiModel: 'flux-1.1-pro-ultra',
    capabilities: { styles: ['ultimate-quality'], maxResolution: '2048x2048' },
    costPerUse: 4,
  },
  {
    name: 'FLUX Kontext',
    provider: 'Black Forest Labs',
    modelType: 'image_generation',
    apiModel: 'flux-kontext',
    capabilities: { styles: ['character-consistency'], maxResolution: '2048x2048' },
    costPerUse: 3,
  },
  {
    name: 'FLUX Kontext Max',
    provider: 'Black Forest Labs',
    modelType: 'image_generation',
    apiModel: 'flux-kontext-max',
    capabilities: { styles: ['typography'], maxResolution: '2048x2048' },
    costPerUse: 4,
  },

  // ===== Leonardo AI =====
  {
    name: 'Leonardo Phoenix',
    provider: 'Leonardo',
    modelType: 'image_generation',
    apiModel: 'leonardo-phoenix',
    capabilities: { styles: ['high-quality'], maxResolution: '2048x2048' },
    costPerUse: 3,
  },
  {
    name: 'Leonardo Photoreal v2',
    provider: 'Leonardo',
    modelType: 'image_generation',
    apiModel: 'leonardo-photoreal-v2',
    capabilities: { styles: ['photorealistic'], maxResolution: '2048x2048' },
    costPerUse: 3,
  },
  {
    name: 'Leonardo Transparency',
    provider: 'Leonardo',
    modelType: 'image_generation',
    apiModel: 'leonardo-transparency',
    capabilities: { styles: ['transparent'], maxResolution: '1024x1024' },
    costPerUse: 2,
  },

  // ===== Ideogram =====
  {
    name: 'Ideogram v2',
    provider: 'Ideogram',
    modelType: 'image_generation',
    apiModel: 'ideogram-v2',
    capabilities: { styles: ['high-quality'], maxResolution: '2048x2048' },
    costPerUse: 2,
  },
  {
    name: 'Ideogram v2a',
    provider: 'Ideogram',
    modelType: 'image_generation',
    apiModel: 'ideogram-v2a',
    capabilities: { styles: ['fast', 'cheap'], maxResolution: '1024x1024' },
    costPerUse: 1,
  },
  {
    name: 'Ideogram v2 Turbo',
    provider: 'Ideogram',
    modelType: 'image_generation',
    apiModel: 'ideogram-v2-turbo',
    capabilities: { styles: ['fast'], maxResolution: '1024x1024' },
    costPerUse: 1,
  },
  {
    name: 'Ideogram v2a Turbo',
    provider: 'Ideogram',
    modelType: 'image_generation',
    apiModel: 'ideogram-v2a-turbo',
    capabilities: { styles: ['fast', 'cheap'], maxResolution: '1024x1024' },
    costPerUse: 1,
  },
  {
    name: 'Ideogram v3',
    provider: 'Ideogram',
    modelType: 'image_generation',
    apiModel: 'ideogram-v3',
    capabilities: { styles: ['stunning-realism'], maxResolution: '2048x2048' },
    costPerUse: 3,
  },

  // ===== ByteDance =====
  {
    name: 'Seedream V3',
    provider: 'ByteDance',
    modelType: 'image_generation',
    apiModel: 'seedream-v3',
    capabilities: { styles: ['2k-resolution'], maxResolution: '2048x2048' },
    costPerUse: 2,
  },
  {
    name: 'Seedream V4',
    provider: 'ByteDance',
    modelType: 'image_generation',
    apiModel: 'seedream-v4',
    capabilities: { styles: ['4k-resolution'], maxResolution: '4096x4096' },
    costPerUse: 4,
  },
  {
    name: 'Dreamina V3.1',
    provider: 'ByteDance',
    modelType: 'image_generation',
    apiModel: 'dreamina-v3.1',
    capabilities: { styles: ['picture-effects'], maxResolution: '2048x2048' },
    costPerUse: 3,
  },

  // ===== Runway =====
  {
    name: 'Runway Gen-4',
    provider: 'Runway',
    modelType: 'image_generation',
    apiModel: 'runway-gen-4',
    capabilities: { styles: ['consistent-characters'], maxResolution: '2048x2048' },
    costPerUse: 3,
  },

  // ===== Tencent =====
  {
    name: 'Hunyuan 3.0',
    provider: 'Tencent',
    modelType: 'image_generation',
    apiModel: 'hunyuan-3.0',
    capabilities: { styles: ['state-of-the-art'], maxResolution: '2048x2048' },
    costPerUse: 3,
  },

  // ===== xAI =====
  {
    name: 'Grok 2 Image',
    provider: 'xAI',
    modelType: 'image_generation',
    apiModel: 'grok-2-image',
    capabilities: { styles: ['high-quality'], maxResolution: '2048x2048' },
    costPerUse: 3,
  },

  // ===== Luma =====
  {
    name: 'Luma Photon',
    provider: 'Luma',
    modelType: 'image_generation',
    apiModel: 'luma-photon',
    capabilities: { styles: ['creative'], maxResolution: '2048x2048' },
    costPerUse: 2,
  },
  {
    name: 'Luma Photon Flash',
    provider: 'Luma',
    modelType: 'image_generation',
    apiModel: 'luma-photon-flash',
    capabilities: { styles: ['fast', 'creative'], maxResolution: '2048x2048' },
    costPerUse: 2,
  },

  // ===== Recraft =====
  {
    name: 'Recraft V3',
    provider: 'Recraft',
    modelType: 'image_generation',
    apiModel: 'recraft-v3',
    capabilities: { styles: ['artistic-illustrations'], maxResolution: '2048x2048' },
    costPerUse: 2,
  },
];

async function seed() {
  try {
    console.log('Seeding database...');
    for (const model of seedModels) {
      await db.insert(aiModels).values(model).onConflictDoNothing();
    }
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
