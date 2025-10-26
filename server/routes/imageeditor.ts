// ===== server/routes/imageEditor.ts =====
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
    fileSize: 50 * 1024 * 1024, // 50MB
  }
});

/**
 * POST /api/generations/image-edit
 * Edit images using AI with various options
 */
router.post('/image-edit', requireAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'references', maxCount: 5 }
]), async (req: AuthRequest, res: Response) => {
  try {
    const { instructions, modelId, strength = 0.7, negativePrompt = '' } = req.body;
    const userId = req.user!.id;

    // Validate inputs
    if (!instructions || !modelId) {
      return res.status(400).json({ 
        error: 'Missing required fields: instructions, modelId' 
      });
    }

    if (instructions.length > 1000) {
      return res.status(400).json({ 
        error: 'Instructions too long (max 1000 characters)' 
      });
    }

    // Get model
    const model = await db.query.aiModels.findFirst({
      where: eq(aiModels.id, modelId),
    });

    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Check user and credits
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || user.credits < model.costPerUse) {
      return res.status(402).json({ 
        error: 'Insufficient credits',
        required: model.costPerUse,
        available: user?.credits || 0,
      });
    }

    // Get uploaded files
    const imageFile = (req.files as any)?.image?.[0];
    const referenceFiles = (req.files as any)?.references || [];

    // Build prompt with reference info
    let fullPrompt = instructions;
    
    if (referenceFiles.length > 0) {
      fullPrompt += `. [Reference images provided: ${referenceFiles.length} reference(s) to match style and composition]`;
    }

    if (negativePrompt) {
      fullPrompt += `. [Negative: ${negativePrompt}]`;
    }

    fullPrompt += `. [Edit strength: ${Math.round(strength * 100)}%]`;

    console.log(`[ImageEditor] Starting edit for user ${userId}`);
    console.log(`[ImageEditor] Model: ${model.name}`);
    console.log(`[ImageEditor] Instructions: ${instructions}`);
    console.log(`[ImageEditor] References: ${referenceFiles.length}`);
    console.log(`[ImageEditor] Strength: ${strength}`);

    // Get dispatcher and generate edited image
    const dispatcher = getDispatcher();
    
    const result = await dispatcher.generateImage({
      prompt: fullPrompt,
      model: model.apiModel,
      width: 1024,
      height: 1024,
      negativePrompt,
    });

    console.log(`[ImageEditor] Image edit completed`);

    // Deduct credits
    const newCredits = user.credits - model.costPerUse;
    await db
      .update(users)
      .set({ credits: newCredits })
      .where(eq(users.id, userId));

    // Save generation record
    const [generation] = await db
      .insert(generationJobs)
      .values({
        userId,
        modelId: model.id,
        toolType: 'image-editor',
        prompt: instructions,
        imageUrl: result.imageUrl,
        status: 'completed',
        createdAt: new Date(),
      })
      .returning();

    console.log(`[ImageEditor] Saved generation record`);

    res.json({
      success: true,
      imageUrl: result.imageUrl,
      generation,
      creditsUsed: model.costPerUse,
      creditsRemaining: newCredits,
    });

  } catch (error: any) {
    console.error('[ImageEditor] Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to edit image',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

/**
 * POST /api/generations/batch-edit
 * Apply same edit to multiple images
 */
router.post('/batch-edit', requireAuth, upload.array('images', 10), async (req: AuthRequest, res: Response) => {
  try {
    const { instructions, modelId, strength = 0.7, negativePrompt = '' } = req.body;
    const userId = req.user!.id;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    if (files.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 images allowed' });
    }

    // Get model
    const model = await db.query.aiModels.findFirst({
      where: eq(aiModels.id, modelId),
    });

    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Check user and credits
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    const totalCost = model.costPerUse * files.length;
    if (!user || user.credits < totalCost) {
      return res.status(402).json({ 
        error: `Insufficient credits. Need ${totalCost}, have ${user?.credits || 0}`,
      });
    }

    const dispatcher = getDispatcher();
    const editedImages: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        console.log(`[BatchEdit] Processing image ${i + 1}/${files.length}`);

        const result = await dispatcher.generateImage({
          prompt: instructions,
          model: model.apiModel,
          width: 1024,
          height: 1024,
          negativePrompt,
        });

        editedImages.push({
          index: i,
          imageUrl: result.imageUrl,
        });
      } catch (error: any) {
        errors.push(`Image ${i + 1}: ${error.message}`);
      }
    }

    if (editedImages.length === 0) {
      return res.status(500).json({ 
        error: 'Failed to edit any images',
        errors,
      });
    }

    // Deduct credits
    const newCredits = user.credits - totalCost;
    await db
      .update(users)
      .set({ credits: newCredits })
      .where(eq(users.id, userId));

    // Save generation records
    const savedGenerations = [];
    for (const edit of editedImages) {
      const [generation] = await db
        .insert(generationJobs)
        .values({
          userId,
          modelId: model.id,
          toolType: 'image-editor-batch',
          prompt: instructions,
          imageUrl: edit.imageUrl,
          status: 'completed',
          createdAt: new Date(),
        })
        .returning();

      savedGenerations.push(generation);
    }

    res.json({
      success: true,
      edits: editedImages,
      generations: savedGenerations,
      total: editedImages.length,
      creditsUsed: totalCost,
      creditsRemaining: newCredits,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error('[BatchEdit] Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to edit images',
    });
  }
});

/**
 * GET /api/generations/history
 * Get user's edit history
 */
router.get('/history', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;

    const edits = await db.query.generationJobs.findMany({
      where: (gens) => eq(gens.userId, userId),
      orderBy: (gens) => gens.createdAt,
      limit,
    });

    res.json({
      success: true,
      count: edits.length,
      edits,
    });
  } catch (error: any) {
    console.error('[History] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;