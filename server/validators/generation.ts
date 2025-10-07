import { z } from 'zod';

export const createGenerationJobSchema = z.object({
  modelId: z.string().uuid('Invalid model ID'),
  toolType: z.string(),
  prompt: z.string().min(1, 'Prompt is required'),
  parameters: z.record(z.any()).default({}),
});

export const purchaseSubscriptionSchema = z.object({
  planType: z.enum(['starter', 'pro', 'enterprise']),
});

export type CreateGenerationJobInput = z.infer<typeof createGenerationJobSchema>;
export type PurchaseSubscriptionInput = z.infer<typeof purchaseSubscriptionSchema>;
