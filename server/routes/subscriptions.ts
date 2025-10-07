import { Router } from 'express';
import { db } from '../db';
import { subscriptions, users } from '../db/schema';
import { purchaseSubscriptionSchema } from '../validators/generation';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const router = Router();

const PLANS = {
  starter: { credits: 500, price: 9 },
  pro: { credits: 2000, price: 29 },
  enterprise: { credits: 10000, price: 99 },
};

router.post('/purchase', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const validatedData = purchaseSubscriptionSchema.parse(req.body);

    const user = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const plan = PLANS[validatedData.planType];
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + 30);

    await db.insert(subscriptions).values({
      userId: req.userId!,
      planType: validatedData.planType,
      creditsIncluded: plan.credits,
      amountPaid: plan.price,
      status: 'active',
      endsAt,
    });

    await db.update(users)
      .set({
        credits: user.credits + plan.credits,
        hasPaid: true,
        subscriptionStatus: 'active',
        subscriptionTier: validatedData.planType,
        subscriptionEndsAt: endsAt,
        onboardingCompleted: true,
      })
      .where(eq(users.id, req.userId!));

    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser!;
    res.json({ user: userWithoutPassword });
  } catch (error: any) {
    console.error('Purchase subscription error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

export default router;
