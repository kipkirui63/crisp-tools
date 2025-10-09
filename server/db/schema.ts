import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  credits: integer('credits').default(100).notNull(),
  subscriptionTier: text('subscription_tier').default('free').notNull(),
  hasPaid: boolean('has_paid').default(false).notNull(),
  subscriptionStatus: text('subscription_status').default('none').notNull(),
  subscriptionEndsAt: timestamp('subscription_ends_at'),
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const aiModels = pgTable('ai_models', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  provider: text('provider').notNull(),
  apiModel: text('api_model').notNull(), 
  modelType: text('model_type').notNull(),
  capabilities: jsonb('capabilities').default({}).notNull(),
  costPerUse: integer('cost_per_use').default(1).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const generationJobs = pgTable('generation_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  modelId: uuid('model_id').notNull().references(() => aiModels.id),
  toolType: text('tool_type').notNull(),
  prompt: text('prompt').notNull(),
  parameters: jsonb('parameters').default({}).notNull(),
  status: text('status').default('pending').notNull(),
  imageUrl: text('image_url'), 
  resultUrl: text('result_url'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const userAssets = pgTable('user_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id').references(() => generationJobs.id, { onDelete: 'set null' }),
  assetUrl: text('asset_url').notNull(),
  assetType: text('asset_type').default('image').notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  isFavorite: boolean('is_favorite').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planType: text('plan_type').notNull(),
  creditsIncluded: integer('credits_included').default(0).notNull(),
  amountPaid: integer('amount_paid').notNull(),
  status: text('status').default('active').notNull(),
  startsAt: timestamp('starts_at').defaultNow().notNull(),
  endsAt: timestamp('ends_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
