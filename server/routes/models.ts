import { Router } from 'express';
import { db } from '../db/index';
import { aiModels } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const models = await db.query.aiModels.findMany({
      where: eq(aiModels.isActive, true),
    });

    res.json({ models });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

export default router;
