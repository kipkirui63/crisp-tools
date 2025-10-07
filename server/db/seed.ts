import { db } from './index';
import { aiModels } from './schema';
import dotenv from 'dotenv';

dotenv.config();

const seedModels = [
  {
    name: 'Stable Diffusion XL',
    provider: 'Stability AI',
    modelType: 'image_generation',
    capabilities: { styles: ['realistic', 'artistic', 'anime'], maxResolution: '1024x1024' },
    costPerUse: 1,
  },
  {
    name: 'DALL-E 3',
    provider: 'OpenAI',
    modelType: 'image_generation',
    capabilities: { styles: ['realistic', 'artistic'], maxResolution: '1792x1024' },
    costPerUse: 2,
  },
  {
    name: 'Midjourney V6',
    provider: 'Midjourney',
    modelType: 'image_generation',
    capabilities: { styles: ['artistic', 'photorealistic'], maxResolution: '2048x2048' },
    costPerUse: 3,
  },
  {
    name: 'Imagen 2',
    provider: 'Google',
    modelType: 'image_generation',
    capabilities: { styles: ['realistic', 'artistic'], maxResolution: '1536x1536' },
    costPerUse: 2,
  },
  {
    name: 'FLUX Pro',
    provider: 'Black Forest Labs',
    modelType: 'image_generation',
    capabilities: { styles: ['realistic', 'artistic'], maxResolution: '1440x1440' },
    costPerUse: 2,
  },
  {
    name: 'Leonardo AI',
    provider: 'Leonardo',
    modelType: 'image_generation',
    capabilities: { styles: ['game_assets', 'portraits', '3d'], maxResolution: '1024x1024' },
    costPerUse: 1,
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
