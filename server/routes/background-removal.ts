import { Router, Response } from 'express';
import multer from 'multer';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/remove', requireAuth, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const file = req.file;
    const { replaceBackground, backgroundColor } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || user.credits < 10) {
      return res.status(402).json({
        error: 'Insufficient credits',
        required: 10,
        available: user?.credits || 0,
      });
    }

    const removeApiKey = process.env.REMOVE_BG_API_KEY;

    if (!removeApiKey) {
      return res.status(503).json({
        error: 'Background removal service not configured. Please add REMOVE_BG_API_KEY to .env file.'
      });
    }

    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append('image_file', blob, file.originalname);
    formData.append('size', 'auto');

    if (replaceBackground === 'true' && backgroundColor) {
      formData.append('bg_color', backgroundColor.replace('#', ''));
    }

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': removeApiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Remove.bg API error: ${error}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    await db.update(users)
      .set({ credits: user.credits - 10 })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      imageUrl,
      creditsUsed: 10,
      creditsRemaining: user.credits - 10,
    });

  } catch (error: any) {
    console.error('[Background Removal] Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to remove background',
    });
  }
});

export default router;
