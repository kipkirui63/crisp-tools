// ===== server/routes/generationJobs.ts - FOR IMAGEGENERATOR ONLY =====
import { Router, Response } from 'express';
import multer from 'multer';
import { getDispatcher } from '../services/imageDispatcher';
import { db } from '../db';
import { aiModels, generationJobs, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  }
});

/**
 * POST /api/generationJobs
 * Generate images using the selected AI model
 */
router.post('/', requireAuth, upload.single('inputImage'), async (req: AuthRequest, res: Response) => {
  try {
    const { modelId, toolType, prompt, options: optionsRaw, strength } = req.body;
    const userId = req.user!.id;
    const inputImageFile = (req as any).file;

    // Parse options if it's a JSON string (from FormData)
    let options: any = optionsRaw;
    if (typeof optionsRaw === 'string') {
      try {
        options = JSON.parse(optionsRaw);
      } catch (e) {
        options = {};
      }
    }

    const numberOfImages = options?.numberOfImages || 1;

    // Validate inputs
    if (!modelId || !prompt || !toolType) {
      console.error('[Generation] Missing fields:', { modelId, prompt, toolType, body: req.body });
      return res.status(400).json({
        error: 'Missing required fields: modelId, prompt, toolType'
      });
    }

    if (prompt.length > 1000) {
      return res.status(400).json({ 
        error: 'Prompt is too long (max 1000 characters)' 
      });
    }

    // Get model from database (modelId is a UUID string)
    const model = await db.query.aiModels.findFirst({
      where: eq(aiModels.id, modelId),
    });

    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Get user and check credits
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalCost = model.costPerUse * numberOfImages;
    if (user.credits < totalCost) {
      return res.status(402).json({ 
        error: `Insufficient credits. You have ${user.credits} but need ${totalCost}`,
        required: totalCost,
        available: user.credits,
      });
    }

    console.log(`[Generation] Starting generation for user ${userId}`);
    console.log(`[Generation] Model: ${model.name} (${model.apiModel})`);
    console.log(`[Generation] Prompt: ${prompt.substring(0, 100)}...`);
    console.log(`[Generation] Number of images: ${numberOfImages}`);

    // Get dispatcher and generate images
    const dispatcher = getDispatcher();
    const generatedImages: string[] = [];
    const generationErrors: string[] = [];

    for (let i = 0; i < numberOfImages; i++) {
      try {
        console.log(`[Generation] Generating image ${i + 1}/${numberOfImages}...`);
        if (inputImageFile) {
          console.log(`[Generation] Using input image: ${inputImageFile.originalname}, size: ${inputImageFile.size} bytes`);
        }

        const result = await dispatcher.generateImage({
          prompt,
          model: model.apiModel,
          width: options?.width || 1024,
          height: options?.height || 1024,
          inputImage: inputImageFile?.buffer,
          strength: strength ? parseFloat(strength) : 0.7,
        });

        generatedImages.push(result.imageUrl);
        console.log(`[Generation] Image ${i + 1} generated successfully`);
      } catch (error: any) {
        console.error(`[Generation] Failed to generate image ${i + 1}:`, error.message);
        generationErrors.push(`Image ${i + 1}: ${error.message}`);
      }
    }

    // Check if at least one image was generated
    if (generatedImages.length === 0) {
      return res.status(500).json({ 
        error: 'Failed to generate any images',
        details: generationErrors,
      });
    }

    console.log(`[Generation] Successfully generated ${generatedImages.length} images`);

    // Deduct credits from user
    const newCredits = user.credits - totalCost;
    await db
      .update(users)
      .set({ credits: newCredits })
      .where(eq(users.id, userId));

    console.log(`[Generation] Credits deducted: ${totalCost} (${user.credits} -> ${newCredits})`);

    // Save generation records
    const savedgenerationJobs = [];
    for (const imageUrl of generatedImages) {
      try {
        const [generation] = await db
          .insert(generationJobs)
          .values({
            userId,
            modelId: model.id,
            toolType,
            prompt,
            imageUrl,
            status: 'completed',
            createdAt: new Date(),
          })
          .returning();

        savedgenerationJobs.push(generation);
      } catch (dbError: any) {
        console.error('[Generation] Error saving generation record:', dbError);
      }
    }

    console.log(`[Generation] Saved ${savedgenerationJobs.length} generation records`);

    // Return successful response
    res.json({
    success: true,
    images: generatedImages,
    generationJobs: savedgenerationJobs,
    creditsUsed: totalCost,
    creditsRemaining: newCredits,
    warnings: generationErrors.length > 0 ? generationErrors : undefined,
});

  } catch (error: any) {
    console.error('[Generation] Unexpected error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate images',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

/**
 * GET /api/generationJobs/user
 * Get user's generation history
 */
router.get('/user', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const usergenerationJobs = await db.query.generationJobs.findMany({
      where: eq(generationJobs.userId, userId),
      orderBy: (gens) => gens.createdAt,
      limit: 50,
    });

    res.json({
      success: true,
      count: usergenerationJobs.length,
      generationJobs: usergenerationJobs,
    });
  } catch (error: any) {
    console.error('[generationJobs] Error fetching history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/generationJobs/:id
 * Get a specific generation
 */
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const generation = await db.query.generationJobs.findFirst({
      where: eq(generationJobs.id, id),
    });

    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    // Verify ownership
    if (generation.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      generation,
    });
  } catch (error: any) {
    console.error('[generationJobs] Error fetching generation:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;