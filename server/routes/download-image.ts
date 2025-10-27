import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/download-image', authenticateToken, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    console.log('[Download] Fetching image:', imageUrl.substring(0, 100));

    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('[Download] Image fetched, size:', buffer.length, 'bytes');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="image-${Date.now()}.png"`);
    res.send(buffer);
  } catch (error: any) {
    console.error('[Download] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to download image' });
  }
});

export default router;
