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

router.post('/extract', requireAuth, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const file = req.file;
    const { context, useAdvanced } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    const creditCost = useAdvanced === 'true' ? 15 : 5;

    if (!user || user.credits < creditCost) {
      return res.status(402).json({
        error: 'Insufficient credits',
        required: creditCost,
        available: user?.credits || 0,
      });
    }

    const ocrApiKey = process.env.OCR_SPACE_API_KEY;

    if (!ocrApiKey) {
      return res.status(503).json({
        error: 'OCR service not configured. Please add OCR_SPACE_API_KEY to .env file.'
      });
    }

    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append('file', blob, file.originalname);
    formData.append('apikey', ocrApiKey);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');

    if (useAdvanced === 'true') {
      formData.append('OCREngine', '2');
    }

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('OCR API request failed');
    }

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      throw new Error(data.ErrorMessage?.[0] || 'OCR processing failed');
    }

    const extractedText = data.ParsedResults?.[0]?.ParsedText || '';

    if (!extractedText) {
      throw new Error('No text found in image');
    }

    await db.update(users)
      .set({ credits: user.credits - creditCost })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      text: extractedText,
      confidence: data.ParsedResults?.[0]?.TextOrientation || 'N/A',
      creditsUsed: creditCost,
      creditsRemaining: user.credits - creditCost,
    });

  } catch (error: any) {
    console.error('[OCR] Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to extract text',
    });
  }
});

export default router;
