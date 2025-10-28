# Virtual Try-On Setup Guide

## Overview

This application now includes **professional virtual try-on** functionality powered by specialized AI models from Replicate, specifically **IDM-VTON** (Image-based Virtual Try-On Network).

## Features

- ✅ **Photorealistic Results**: Professional-quality virtual try-on with realistic fabric draping
- ✅ **Pose Preservation**: Maintains original body pose, proportions, and orientation
- ✅ **Face Preservation**: Keeps facial features, skin tone, and identity intact
- ✅ **Smart Body Recognition**: Advanced AI detects body shape and pose automatically
- ✅ **Realistic Fabric Simulation**: Natural draping, texture, and fabric physics
- ✅ **Color & Lighting Preservation**: Maintains original lighting conditions
- ✅ **Multi-Layer Processing**: Handles complex clothing with layers and accessories
- ✅ **Quality Assurance**: Professional e-commerce grade output

## Supported Models

### 1. IDM-VTON (Recommended)
- **Best for**: Upper body garments (shirts, sweaters, jackets)
- **Quality**: Excellent - State-of-the-art virtual try-on
- **Speed**: ~30-60 seconds per image
- **Model ID**: `idm-vton`

### 2. VITON-HD
- **Best for**: High-resolution fashion photography
- **Quality**: High - Professional e-commerce quality
- **Speed**: ~30-60 seconds per image
- **Model ID**: `viton-hd`

### 3. OOT-Diffusion
- **Best for**: Advanced clothing transformations
- **Quality**: Experimental - Cutting-edge research model
- **Speed**: ~45-90 seconds per image
- **Model ID**: `oot-diffusion`

## Setup Instructions

### Step 1: Get Replicate API Token

1. Go to [Replicate.com](https://replicate.com)
2. Sign up for a free account
3. Navigate to your [API Tokens page](https://replicate.com/account/api-tokens)
4. Copy your API token (starts with `r8_...`)

### Step 2: Add to Environment Variables

Add the following to your `.env` file:

```bash
REPLICATE_API_TOKEN=r8_your_token_here
```

### Step 3: Seed the Database

Run the database seed to add virtual try-on models:

```bash
npm run db:push
```

This will add the following models to your database:
- IDM-VTON (Virtual Try-On)
- VITON-HD (Virtual Try-On)
- OOT-Diffusion (Virtual Try-On)

### Step 4: Restart Your Server

```bash
npm run dev
```

## How to Use

### 1. Navigate to Cloth Changer Tool

Click on **"Cloth Changer"** in the left sidebar.

### 2. Upload Images

**Person Image:**
- Upload a clear, front-facing photo of a person
- Best results: Good lighting, neutral background, visible upper body
- Supported formats: PNG, JPG, WebP
- Max file size: 10MB

**Garment Image:**
- Upload a photo of the clothing item
- Best results: Flat lay or on mannequin, clear garment details
- Supported formats: PNG, JPG, WebP
- Max file size: 10MB

### 3. Generate Virtual Try-On

1. (Optional) Add a description like "professional business suit"
2. Select number of variations (1-4)
3. Click **"Generate Virtual Try-On"**
4. Wait 30-60 seconds for AI processing
5. Download your results!

## Technical Details

### API Flow

```
USER UPLOADS IMAGES
├─ Person Image (human_img)
└─ Garment Image (garm_img)
      ↓
FRONTEND (ClothChanger.tsx)
├─ Validates both images uploaded
├─ Finds Replicate virtual try-on model
├─ Sends POST to /api/generationJobs
│   ├─ inputImage: person
│   ├─ maskImage: garment
│   └─ toolType: virtual-tryon
      ↓
BACKEND (generations.ts)
├─ Authenticates user
├─ Loads model from database
├─ Dispatches to Replicate provider
      ↓
REPLICATE PROVIDER (replicate.ts)
├─ Converts images to base64
├─ Calls IDM-VTON model on Replicate
│   ├─ human_img: personImageBase64
│   ├─ garm_img: garmentImageBase64
│   ├─ garment_des: prompt
│   ├─ category: 'upper_body'
│   ├─ n_samples: 1
│   └─ n_steps: 20
      ↓
REPLICATE API
├─ Processes images with IDM-VTON
├─ Returns photorealistic try-on result
├─ Preserves face, pose, body features
└─ Returns hosted image URL
      ↓
FRONTEND DISPLAYS
└─ Shows result with download button
```

### Code Structure

```
server/
├── services/
│   ├── providers/
│   │   └── replicate.ts          # Replicate API integration
│   ├── imageDispatcher.ts        # Routes to correct provider
│   └── types.ts                  # TypeScript interfaces
└── routes/
    └── generations.ts            # Generation API endpoint

src/
└── components/
    └── tools/
        └── ClothChanger.tsx      # Virtual try-on UI
```

### Model Parameters

**IDM-VTON Parameters:**
```typescript
{
  human_img: string,        // Base64 person image
  garm_img: string,         // Base64 garment image
  garment_des: string,      // Description (optional)
  category: 'upper_body',   // Garment category
  n_samples: 1,             // Number of outputs
  n_steps: 20,              // Denoising steps (quality)
  image_scale: 1.0,         // Image scale factor
  seed: number              // Random seed
}
```

## Pricing

### Replicate Pricing
- **Cost**: ~$0.003-0.01 per generation
- **Free Tier**: $5 credit for new users
- **Pay-as-you-go**: No subscription required

### Your App Pricing
- Virtual Try-On models: **3 credits** per generation
- Users can purchase credits through Stripe integration

## Troubleshooting

### Error: "Virtual try-on model not available"

**Solution**: Make sure `REPLICATE_API_TOKEN` is set in your `.env` file and the server has been restarted.

### Error: "Failed to generate virtual try-on"

**Possible causes**:
1. Invalid API token - Check your Replicate account
2. Insufficient credits - Add credits to your Replicate account
3. Image format issues - Try converting to PNG
4. Network timeout - Try again or use smaller images

### Poor Quality Results

**Best practices for better results**:
1. Use clear, high-resolution images
2. Ensure good lighting in person photo
3. Use front-facing person photos
4. Upload garment on white/neutral background
5. Avoid heavily cropped images
6. Use images with clear garment details

### Model Not Found in Database

Run the seed command:
```bash
npm run db:push
```

## Example Use Cases

### E-Commerce Fashion
- Virtual fitting rooms
- Product visualization
- Customer try-before-buy
- Size and fit preview

### Fashion Design
- Design prototyping
- Collection previews
- Model portfolio creation
- Style experimentation

### Personal Styling
- Outfit planning
- Wardrobe management
- Shopping assistance
- Style consultation

## Performance Optimization

### Frontend
- Image compression before upload
- Progress indicators for long operations
- Error boundary for graceful failures
- Optimistic UI updates

### Backend
- Async/await for non-blocking operations
- Proper error handling and logging
- Request timeout handling
- Rate limiting (recommended)

## Security Considerations

1. **API Key Protection**: Never expose `REPLICATE_API_TOKEN` to frontend
2. **Authentication**: Virtual try-on requires user authentication
3. **File Validation**: Images validated on server-side
4. **Rate Limiting**: Implement to prevent abuse
5. **Credit System**: Users must have credits to generate

## Next Steps

### Enhancements to Consider

1. **Lower Body Support**: Add pants/skirts virtual try-on
2. **Full Body Try-On**: Support full outfits
3. **Multiple Garments**: Try on multiple items at once
4. **Style Transfer**: Apply different styles to garments
5. **Size Recommendations**: AI-powered size suggestions
6. **Virtual Mannequin**: Generate try-on without person photo
7. **3D Rotation**: Show try-on from multiple angles
8. **Batch Processing**: Upload multiple garments at once

### Performance Improvements

1. **Image Caching**: Cache generated try-ons
2. **Queue System**: Handle multiple requests efficiently
3. **Webhooks**: Use Replicate webhooks for async processing
4. **CDN Integration**: Serve results via CDN
5. **Thumbnail Generation**: Create thumbnails automatically

## Support

For issues or questions:
1. Check Replicate documentation: https://replicate.com/docs
2. Review IDM-VTON model page: https://replicate.com/yisol/idm-vton
3. Check application logs for detailed errors
4. Ensure all environment variables are set correctly

## License & Attribution

**IDM-VTON Model**:
- Created by: Yisol Choi (yisol)
- License: See Replicate model page
- Research Paper: https://arxiv.org/abs/2108.01665

**Your Application**:
- Integration code: Your license
- Replicate API: Replicate Terms of Service
