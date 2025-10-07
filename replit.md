# Crisp AI Image Suite

## Overview

Crisp AI is a comprehensive AI-powered image generation and manipulation platform that provides users with 9 different creative tools. The application allows users to generate images from text, edit existing images, create professional headshots, design logos, remove backgrounds, change clothing in photos, redesign interiors, and extract text from images. Users operate on a credit-based system with subscription tiers (Starter, Pro, Enterprise) that provide different credit allocations and feature access.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type safety and component-based UI
- Vite as the build tool and development server
- Tailwind CSS for utility-first styling
- Wouter for lightweight client-side routing
- React Hook Form with Zod for form validation
- TanStack Query for server state management

**Component Structure:**
The application follows a modular component architecture with:
- Context-based authentication (AuthContext) for global user state management
- Tool-based component isolation - each of the 9 AI tools has its own dedicated component
- Shared UI components (ModelSelector, SignUpPrompt) for reusable functionality
- Three main view states: visitor mode, authentication flow, and authenticated dashboard

**Design Decisions:**
- Single-page application (SPA) architecture for seamless user experience
- Conditional rendering based on authentication state (visitor vs authenticated)
- Credit-based access control enforced at the UI level
- Modal-based workflows for model selection and authentication prompts

### Backend Architecture

**Technology Stack:**
- Express.js server with TypeScript
- Drizzle ORM for type-safe database operations
- PostgreSQL as the primary database (via postgres driver)
- JWT-based authentication with HTTP-only cookies
- Zod for request validation
- Bcrypt for password hashing

**API Design:**
RESTful API structure with the following endpoints:
- `/api/auth` - User registration, login, logout, and profile management
- `/api/models` - AI model listing and details
- `/api/generations` - Image generation job creation and management
- `/api/subscriptions` - Subscription purchases and credit allocation

**Authentication Flow:**
- JWT tokens stored in HTTP-only cookies for security
- Middleware-based authentication (`authenticateToken`) for protected routes
- User session maintained across requests via cookie validation
- Password hashing with bcryptjs before storage

**Development Setup:**
- Integrated Vite middleware for seamless frontend-backend development
- Single server setup that serves both API and frontend in development
- HMR (Hot Module Replacement) support through Vite integration

### Data Storage

**Database Schema (Drizzle ORM):**

**Users Table:**
- Stores user credentials, profile information, and subscription status
- Tracks credit balance and subscription tier
- Includes onboarding completion status and payment flags
- UUID primary keys for security

**AI Models Table:**
- Catalogs available AI models with provider information
- Stores model capabilities as JSONB for flexibility
- Defines credit cost per generation
- Active/inactive status flag for model availability

**Generation Jobs Table:**
- Records all image generation requests
- Links to user and selected model via foreign keys
- Stores prompts, parameters, and generation status
- Cascade delete on user removal for data consistency

**User Assets Table:**
- Stores generated images and user uploads
- Links to generation jobs (nullable for manual uploads)
- Metadata stored as JSONB for extensibility

**Subscriptions Table:**
- Tracks subscription purchases and status
- Records credit allocations and pricing
- Manages subscription lifecycle with start/end dates

**Design Rationale:**
- JSONB fields (capabilities, parameters, metadata) provide schema flexibility for varying AI model requirements
- Foreign key relationships with cascade deletes ensure data integrity
- Timestamp fields track creation and updates for audit trails
- UUID identifiers prevent enumeration attacks

### External Dependencies

**AI Model Providers:**
The system is designed to integrate with multiple AI providers:
- OpenAI (DALL-E 3)
- Stability AI (Stable Diffusion XL)
- Midjourney (V6)
- Google (Imagen 2)
- Black Forest Labs (FLUX Pro)
- Leonardo AI

**Note:** The current implementation uses placeholder/demo images. Actual AI provider integrations are designed to be added through the models system.

**Database:**
- PostgreSQL database (currently using CloudClusters hosted instance)
- Connection string stored in environment variables
- Drizzle ORM abstracts database operations

**Development Tools:**
- Drizzle Kit for schema migrations and management
- TSX for TypeScript execution in Node.js
- Concurrently for running multiple development processes

**Frontend Libraries:**
- Lucide React for icon components
- React Hook Form for form state management
- Zod for schema validation (shared between frontend and backend)

**Authentication:**
- JWT (jsonwebtoken) for token generation and verification
- Cookie-parser for cookie handling in Express
- Bcryptjs for password hashing

**CORS Configuration:**
- Enabled for credentials (cookies)
- Configured for frontend-backend communication in development