# Implementation Guide for Fixing Issues

## Overview
This guide outlines all the fixes needed for the application based on the identified issues.

## Issues to Fix

### 1. Image Editor ✅ FIXED
- **Issue**: 404 error on `/api/generations/image-edit`
- **Fix**: Added image editor route to server/index.ts
- **Route**: `/api/image-edit/image-edit`

### 2. Image to Text Tool
- **Issue**: Returns mock text instead of real OCR
- **Solution**: Implement real OCR using OCR.space API or Tesseract.js
- **Files to update**:
  - `src/components/tools/ImageToText.tsx`
  - Create new API route: `server/routes/ocr.ts`

### 3. Interior Design Tool
- **Issue**: Just returns the uploaded image, no actual redesign
- **Solution**: Use AI model from dispatcher with proper prompts
- **Files to update**:
  - `src/components/tools/InteriorDesign.tsx`
  - Add API call to generation endpoint with interior design prompts

### 4. Background Remover
- **Issue**: Returns same image without processing
- **Solution**: Integrate remove.bg API or use AI model
- **Files to update**:
  - `src/components/tools/BackgroundRemover.tsx`
  - Create API route: `server/routes/background-removal.ts`

### 5. Logo Generator
- **Issue**: Generate button not working
- **Solution**: Add onClick handler and API integration
- **Files to update**:
  - `src/components/tools/LogoGenerator.tsx`

### 6. Headshot Generator
- **Issue**: Button not working
- **Solution**: Add onClick handler and API integration
- **Files to update**:
  - `src/components/tools/HeadshotGenerator.tsx`

### 7. Stripe Integration
- **Issue**: No webhook handler for payment confirmation
- **Solution**: Create Stripe checkout session and webhook handler
- **Files to create**:
  - `server/routes/stripe.ts` - Webhook handler
  - Update `src/components/Checkout.tsx` to use Stripe Checkout

## Environment Variables Required

```env
# Stripe (get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Background Removal (get from https://www.remove.bg/api)
REMOVE_BG_API_KEY=your_key_here

# OCR (get from https://ocr.space/ocrapi)
OCR_SPACE_API_KEY=your_key_here

# Or use Replicate for multiple AI services
REPLICATE_API_KEY=your_key_here
```

## Priority Implementation Order

1. ✅ **Image Editor Route** - COMPLETED
2. ✅ **Environment Variables** - COMPLETED
3. **Stripe Webhook & Checkout** - HIGH PRIORITY
4. **Logo Generator Fix** - MEDIUM (simple fix)
5. **Headshot Generator Fix** - MEDIUM (simple fix)
6. **Background Remover** - MEDIUM (API integration)
7. **OCR/Text Extraction** - MEDIUM (API integration)
8. **Interior Design** - MEDIUM (API integration)

## Quick Fixes for Non-Working Buttons

### Logo Generator
Add to the Generate button:
```tsx
onClick={async () => {
  if (!isAuthenticated) {
    onRequestAuth();
    return;
  }
  // Add generation logic here
}}
```

### Headshot Generator
Similar fix - add onClick handler with authentication check.

## Testing Checklist

- [ ] Image Editor can process images
- [ ] Image to Text extracts real text
- [ ] Interior Design redesigns rooms
- [ ] Background Remover removes backgrounds
- [ ] Logo Generator creates logos
- [ ] Headshot Generator creates headshots
- [ ] Stripe payment flow works
- [ ] Webhook updates database after payment
- [ ] Credits are properly deducted
- [ ] All tools require authentication

## Notes

- All tools should check `isAuthenticated` before executing
- All API calls should go through proper routes
- Stripe webhook must verify signature
- Test with Stripe test mode first
- Use Stripe CLI for local webhook testing: `stripe listen --forward-to localhost:5000/api/stripe/webhook`
