import { getApps, initializeApp, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { env } from '@/config/env';

const initializeFirebaseAdmin = () => {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const clientEmail = env.FIREBASE_CLIENT_EMAIL;
  const privateKey = env.FIREBASE_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    return initializeApp({
      credential: cert({
        projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: clientEmail,
        privateKey: formattedPrivateKey,
      }),
      storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }

  // Fallback for development where direct cloud credentials aren't passed yet
  if (env.NODE_ENV !== 'production') {
    console.log('Firebase Admin: Initializing using local application credentials or empty config for emulation.');
    return initializeApp({
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }

  throw new Error('Firebase Admin configuration parameters FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are missing.');
};

const adminApp = initializeFirebaseAdmin();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);

export { adminApp };
