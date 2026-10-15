import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let appInstance: App | null = null;
let firestoreInstance: Firestore | null = null;

/**
 * Initializes and returns the Firebase Admin App singleton.
 * Uses projectId from environment or firebase-applet-config.json ('lumina-digital-71601').
 */
export function getFirebaseAdminApp(): App {
  if (getApps().length === 0) {
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      'lumina-digital-71601';

    if (!process.env.GOOGLE_CLOUD_PROJECT) {
      process.env.GOOGLE_CLOUD_PROJECT = projectId;
    }
    if (!process.env.FIREBASE_PROJECT_ID) {
      process.env.FIREBASE_PROJECT_ID = projectId;
    }
    if (!process.env.GCLOUD_PROJECT) {
      process.env.GCLOUD_PROJECT = projectId;
    }

    try {
      appInstance = initializeApp({
        projectId
      });
      console.log(`[Firebase Admin] Initialized successfully for project: ${projectId}`);
    } catch (err: any) {
      console.error('[Firebase Admin] Initialization error:', err.message);
      appInstance = getApps()[0];
    }
  } else {
    appInstance = getApps()[0];
  }
  return appInstance;
}

export function getAdminAuth(): Auth {
  const app = getFirebaseAdminApp();
  return getAuth(app);
}

export function getAdminFirestore(): Firestore {
  if (!firestoreInstance) {
    const app = getFirebaseAdminApp();
    firestoreInstance = getFirestore(app);
  }
  return firestoreInstance;
}

