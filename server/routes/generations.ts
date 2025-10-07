import { Router } from 'express';
import { db } from '../db';
import { generationJobs, users, aiModels } from '../db/schema';
import { createGenerationJobSchema } from '../validators/generation';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const router = Router();

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const validatedData = createGenerationJobSchema.parse(req.body);

    const user = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const model = await db.query.aiModels.findFirst({
      where: eq(aiModels.id, validatedData.modelId),
    });

    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    const numberOfImages = validatedData.parameters.numberOfImages || 1;
    const totalCost = model.costPerUse * numberOfImages;

    if (user.credits < totalCost) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }

    const [job] = await db.insert(generationJobs).values({
      userId: req.userId!,
      modelId: validatedData.modelId,
      toolType: validatedData.toolType,
      prompt: validatedData.prompt,
      parameters: validatedData.parameters,
      status: 'completed',
      resultUrl: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1024',
    }).returning();

    await db.update(users)
      .set({ credits: user.credits - totalCost })
      .where(eq(users.id, req.userId!));

    res.json({ job });
  } catch (error: any) {
    console.error('Create generation error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to create generation job' });
  }
});

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const jobs = await db.query.generationJobs.findMany({
      where: eq(generationJobs.userId, req.userId!),
    });

    res.json({ jobs });
  } catch (error) {
    console.error('Get generations error:', error);
    res.status(500).json({ error: 'Failed to fetch generations' });
  }
});

export default router;
