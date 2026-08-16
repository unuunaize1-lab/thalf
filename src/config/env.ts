import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_CHECK_PUBLIC_KEY: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

const getEnvValue = (key: string, devFallback: string): string => {
  const value = process.env[key];
  const isProduction = process.env.NODE_ENV === 'production';
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

  if (!value && isProduction && !isBuildPhase) {
    throw new Error(`CRITICAL SECURITY FAILURE: Required environment variable ${key} is missing in production.`);
  }

  return value || devFallback;
};

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_FIREBASE_API_KEY: getEnvValue('NEXT_PUBLIC_FIREBASE_API_KEY', 'thalf-dev-api-key'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: getEnvValue('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'thalf-premium-handmade.firebaseapp.com'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: getEnvValue('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'thalf-premium-handmade'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: getEnvValue('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'thalf-premium-handmade.appspot.com'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: getEnvValue('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', '123456789012'),
  NEXT_PUBLIC_FIREBASE_APP_ID: getEnvValue('NEXT_PUBLIC_FIREBASE_APP_ID', '1:123456789012:web:abcdef123456'),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  NEXT_PUBLIC_FIREBASE_APP_CHECK_PUBLIC_KEY: process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_PUBLIC_KEY,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  CLOUDINARY_CLOUD_NAME: getEnvValue('CLOUDINARY_CLOUD_NAME', 'thalf-dev-cloud'),
  CLOUDINARY_API_KEY: getEnvValue('CLOUDINARY_API_KEY', '123456789012345'),
  CLOUDINARY_API_SECRET: getEnvValue('CLOUDINARY_API_SECRET', 'dev_cloudinary_secret_key_mock'),
});
