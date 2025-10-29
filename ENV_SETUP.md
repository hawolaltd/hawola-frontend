# Environment Variables Setup Guide

## Quick Start

1. Copy the example file:
```bash
cp .env.example .env
```

2. Fill in your actual values in `.env`

## Required Environment Variables

### 1. API Configuration
```env
NEXT_PUBLIC_API_URL=https://ww3.hawola.com/api/
```
- **Description**: Base URL for the backend Django API
- **Where it's used**: All API calls throughout the app
- **Environments**:
  - Development: `http://localhost:8000/api/`
  - Staging: `https://ww2.hawola.com/api/`
  - Production: `https://ww3.hawola.com/api/`

### 2. Authentication
```env
NEXT_PUBLIC_ACCESS_TOKEN=userAccessToken
NEXT_PUBLIC_REFRESH_TOKEN=userRefreshToken
```
- **Description**: Cookie/localStorage keys for JWT tokens
- **Where it's used**: `src/constant/index.tsx`, `src/libs/api/axiosInstance.ts`
- **Note**: These are storage key names, not actual tokens

### 3. Payment Gateway (Paystack)
```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
```
- **Description**: Paystack public key for payment processing
- **Where it's used**: `src/pages/carts/checkout.tsx`
- **How to get it**:
  1. Go to [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer)
  2. Copy your Public Key (Test or Live)
  3. Test keys start with `pk_test_`
  4. Live keys start with `pk_live_`

### 4. Google Maps API
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```
- **Description**: Google Maps API key for location features
- **Where it's used**: `src/components/map/Map.tsx`
- **How to get it**:
  1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
  2. Create a new project or select existing
  3. Enable "Maps JavaScript API" and "Places API"
  4. Create credentials → API Key
  5. Restrict the API key to your domain for security

## Files Overview

- `.env` - Your local environment variables (DO NOT commit to git)
- `.env.example` - Template file (safe to commit to git)
- `.env.backup` - Backup of your previous .env file

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `.env` file to version control
- `.env` is already in `.gitignore`
- Only `NEXT_PUBLIC_*` variables are exposed to the browser
- Keep your API keys secure
- Use test keys for development
- Restrict API keys to your domains in production

## Troubleshooting

### Environment variables not updating?
1. Restart your development server (`npm run dev`)
2. Clear `.next` cache: `rm -rf .next`
3. Rebuild: `npm run build`

### Getting "undefined" for environment variables?
- Check the variable name starts with `NEXT_PUBLIC_` for client-side use
- Ensure there's no space around the `=` sign
- Restart your dev server after changing `.env`

## Development vs Production

### Development
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
```

### Production
```env
NEXT_PUBLIC_API_URL=https://ww3.hawola.com/api/
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
```

## Need Help?

- [Next.js Environment Variables Docs](https://nextjs.org/docs/basic-features/environment-variables)
- [Paystack API Documentation](https://paystack.com/docs/api/)
- [Google Maps API Documentation](https://developers.google.com/maps/documentation)
