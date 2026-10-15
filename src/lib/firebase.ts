import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  deleteUser,
  linkWithPopup,
  linkWithCredential,
  unlink
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDocFromServer,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// Your web app's Firebase configuration loaded from firebase-applet-config.json
export const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey,
  authDomain: firebaseAppletConfig.authDomain,
  projectId: firebaseAppletConfig.projectId,
  storageBucket: firebaseAppletConfig.storageBucket,
  messagingSenderId: firebaseAppletConfig.messagingSenderId,
  appId: firebaseAppletConfig.appId,
  measurementId: firebaseAppletConfig.measurementId || "G-JF709JZH1R",
  firestoreDatabaseId: firebaseAppletConfig.firestoreDatabaseId
};

// Initialize Firebase
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics (safely guarded for browser execution)
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.warn('Firebase Analytics not initialized:', err);
    });
}

// Initialize Firestore with specific database ID and forced long-polling for iframe resilience
export const db = (() => {
  const dbId = firebaseConfig.firestoreDatabaseId || 'ai-studio-luminadigital-5a9efa51-5c26-4687-86f2-158cad7d5cbc';
  try {
    return initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true
      },
      dbId
    );
  } catch (_e) {
    return getFirestore(app, dbId);
  }
})();

// Initialize Auth
export const auth = getAuth(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export {
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  deleteUser,
  linkWithPopup,
  linkWithCredential,
  unlink
};

// Safe connection validator (invoked only on-demand, never executed automatically at boot)
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (_err) {
    return false;
  }
}

// Standardized error handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
