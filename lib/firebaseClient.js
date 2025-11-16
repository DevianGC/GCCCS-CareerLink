import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length && typeof window !== 'undefined') {
  console.warn(`Missing Firebase env vars: ${missing.join(', ')}`);
}

const configOk = !missing.length;
const app = configOk ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : undefined;

export const firebaseAuth = configOk ? getAuth(app) : undefined;
export const firebaseDb = configOk ? getFirestore(app) : undefined;


