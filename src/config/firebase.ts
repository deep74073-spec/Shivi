// Path: src/config/firebase.ts
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const credentialsJson = process.env.FIREBASE_CREDENTIALS_JSON;

  if (!credentialsJson) {
    console.warn('[SHIVI Warning]: FIREBASE_CREDENTIALS_JSON is missing. Database features will be limited.');
    return null;
  }

  try {
    const serviceAccount = JSON.parse(credentialsJson);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error('[SHIVI Error]: Failed to parse FIREBASE_CREDENTIALS_JSON:', error);
    return null;
  }
};

export const firebaseApp = initializeFirebase();
export const db = firebaseApp ? admin.firestore() : null;
export const auth = firebaseApp ? admin.auth() : null;
