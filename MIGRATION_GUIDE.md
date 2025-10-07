# Crisp AI - Migration to Standalone PostgreSQL Guide

## What Was Done

1. **Removed Supabase** - Uninstalled @supabase/supabase-js
2. **Added Express Backend** - Created full REST API with JWT authentication
3. **Set up Drizzle ORM** - Database schema defined with TypeScript
4. **Added Zod Validation** - Request validation for all endpoints
5. **Created API Client** - Frontend API layer to replace Supabase calls

## Setup Instructions

### 1. Run Database Migration

Execute the `schema.sql` file on your PostgreSQL database:

```bash
psql postgresql://boot1:skoolsang@postgresql-198186-0.cloudclusters.net:10295/boot-camp2 < schema.sql
```

Or connect to your database and run the SQL manually.

### 2. Update Environment Variables

The `.env` file has been updated with:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `VITE_API_URL` - Backend API URL (http://localhost:3001)
- `PORT` - Backend server port

### 3. Start the Application

Option A - Run both servers separately:
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev
```

Option B - Run both together:
```bash
npm run dev:all
```

## Remaining Tasks

### Components to Update

The following components still reference `profile` instead of `user` and need updating:

1. **src/components/Dashboard.tsx**
   - Change `profile` to `user`
   - Update `profile.credits` to `user.credits`
   - Update `profile.fullName` to `user.fullName`
   - Update `profile.email` to `user.email`

2. **src/components/Checkout.tsx**
   - Change `profile` to `user`
   - Update API calls to use new `subscriptions.purchase()` method

3. **src/components/ImageGenerator.tsx**
   - Change `profile` to `user`
   - Replace Supabase calls with `generations.create()` and `models.list()`

4. **src/components/ModelSelector.tsx**
   - Replace Supabase calls with `models.list()` from API client

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Models
- `GET /api/models` - List all active AI models

### Generations
- `POST /api/generations` - Create new generation job
- `GET /api/generations` - List user's generation jobs

### Subscriptions
- `POST /api/subscriptions/purchase` - Purchase subscription plan

## User Object Structure

```typescript
interface User {
  id: string;
  email: string;
  fullName: string | null;
  credits: number;
  subscriptionTier: string;
  hasPaid: boolean;
  subscriptionStatus: string;
  subscriptionEndsAt: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Common Replacements

### Before (Supabase)
```typescript
const { profile } = useAuth();
const { data } = await supabase.from('profiles').select('*');
```

### After (New API)
```typescript
const { user } = useAuth();
const { data } = await api.someMethod();
```

## Testing

1. Start backend: `npm run dev:server`
2. Start frontend: `npm run dev`
3. Test registration at http://localhost:5173
4. Test login
5. Test checkout flow
6. Test image generation

## Notes

- JWT tokens are stored in HTTP-only cookies for security
- All API calls include credentials for cookie-based auth
- Database connection from the build environment may have network restrictions
- Consider using connection pooling for production
