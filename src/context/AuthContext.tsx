import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
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
  unlink,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import {
  getAuthErrorMessage,
  getLinkedProviderIds,
  canUnlinkProvider
} from '../lib/authProviders';
import {
  UserProfile,
  UserPreferences,
  FirestorePurchase,
  FirestoreDownload,
  FirestoreOrder,
  ChatSessionRecord
} from '../types';
import { verifyOwnerWithServer, clearOwnerAuthCache } from '../lib/ownerAuth';

/**
 * Recursively removes any undefined fields from an object so Firestore setDoc does not throw
 * "Unsupported field value: undefined" errors.
 */
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  const result: any = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = cleanFirestoreData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

export interface StoredEnquiry {
  id: string;
  userId: string;
  userEmail?: string;
  message: string;
  sender: 'user' | 'agent';
  timestamp: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isOwner: boolean;
  ownerVerified: boolean;
  checkOwnerAccess: (forceRefresh?: boolean) => Promise<boolean>;
  userPurchases: FirestorePurchase[];
  userDownloads: FirestoreDownload[];
  userOrders: FirestoreOrder[];
  // Auth modal controls
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup' | 'forgot';
  openAuthModal: (initialTab?: 'login' | 'signup' | 'forgot') => void;
  closeAuthModal: () => void;
  // Auth actions
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (name: string, email: string, pass: string, role?: 'customer' | 'creator') => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  sendVerification: () => Promise<{ success: boolean; message?: string; error?: string }>;
  updateUserProfileData: (updates: {
    displayName?: string;
    name?: string;
    photoURL?: string;
    preferences?: Partial<UserPreferences>;
  }) => Promise<{ success: boolean; error?: string }>;
  linkGoogleAccount: () => Promise<{ success: boolean; error?: string }>;
  linkEmailPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  unlinkProviderAccount: (providerId: string) => Promise<{ success: boolean; error?: string }>;
  reloadUser: () => Promise<void>;
  linkedProviders: string[];
  canUnlink: boolean;
  deleteAccount: (passwordForReauth?: string) => Promise<{ success: boolean; error?: string; requiresReauth?: boolean }>;
  logout: () => Promise<void>;
  // Firestore sync methods
  syncPurchasedProducts: (productIds: string[]) => Promise<void>;
  syncSavedProducts: (productIds: string[]) => Promise<void>;
  recordPurchase: (purchase: {
    productId: string;
    orderId: string;
    paymentId?: string;
    productTitle?: string;
    amountPaid?: number;
    amount?: number;
    currency?: string;
    status?: 'completed' | 'pending' | 'failed' | 'refunded';
    verificationToken?: string;
  }) => Promise<boolean>;
  recordDownload: (productId: string, productTitle?: string, fileName?: string) => Promise<void>;
  recordOrder: (order: {
    orderId: string;
    products: { productId: string; title: string; price: number; format?: string }[];
    amount: number;
    currency: string;
    paymentStatus: 'completed' | 'pending' | 'failed';
    paymentMethod?: string;
  }) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  saveCustomerEnquiry: (enquiry: { id: string; message: string; sender: 'user' | 'agent'; timestamp?: string }) => Promise<void>;
  fetchCustomerEnquiries: () => Promise<StoredEnquiry[]>;
  saveChatSession: (sessionId: string, messages: any[]) => Promise<void>;
  fetchChatSession: (sessionId: string) => Promise<any | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPurchases, setUserPurchases] = useState<FirestorePurchase[]>([]);
  const [userDownloads, setUserDownloads] = useState<FirestoreDownload[]>([]);
  const [userOrders, setUserOrders] = useState<FirestoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [ownerVerified, setOwnerVerified] = useState<boolean>(false);

  const checkOwnerAccess = async (forceRefresh = false): Promise<boolean> => {
    if (!auth.currentUser) {
      clearOwnerAuthCache();
      setIsOwner(false);
      setOwnerVerified(true);
      return false;
    }
    const res = await verifyOwnerWithServer(auth.currentUser, forceRefresh);
    setIsOwner(res.authorized);
    setOwnerVerified(true);
    return res.authorized;
  };

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'forgot'>('login');

  const openAuthModal = (tab: 'login' | 'signup' | 'forgot' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Authenticate with server to verify owner authorization
        const ownerCheck = await verifyOwnerWithServer(currentUser);
        setIsOwner(ownerCheck.authorized);
        setOwnerVerified(true);

        await loadOrCreateUserProfile(currentUser, 'customer', ownerCheck.authorized);
        await loadUserData(currentUser.uid);
      } else {
        clearOwnerAuthCache();
        setIsOwner(false);
        setOwnerVerified(true);
        setUserProfile(null);
        setUserPurchases([]);
        setUserDownloads([]);
        setUserOrders([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (uid: string) => {
    try {
      // 1. Fetch user purchases
      const purchasesRef = collection(db, 'purchases');
      const qPurchases = query(purchasesRef, where('userId', '==', uid));
      const pSnap = await getDocs(qPurchases);
      const purchasesList: FirestorePurchase[] = [];
      pSnap.forEach((docSnap) => {
        purchasesList.push({ id: docSnap.id, ...(docSnap.data() as FirestorePurchase) });
      });
      setUserPurchases(purchasesList);

      // 2. Fetch user downloads
      const downloadsRef = collection(db, 'downloads');
      const qDownloads = query(downloadsRef, where('userId', '==', uid));
      const dSnap = await getDocs(qDownloads);
      const downloadsList: FirestoreDownload[] = [];
      dSnap.forEach((docSnap) => {
        downloadsList.push({ id: docSnap.id, ...(docSnap.data() as FirestoreDownload) });
      });
      setUserDownloads(downloadsList);

      // 3. Fetch user orders
      const ordersRef = collection(db, 'orders');
      const qOrders = query(ordersRef, where('userId', '==', uid));
      const oSnap = await getDocs(qOrders);
      const ordersList: FirestoreOrder[] = [];
      oSnap.forEach((docSnap) => {
        ordersList.push(docSnap.data() as FirestoreOrder);
      });
      // Sort in memory by createdAt descending
      ordersList.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
      setUserOrders(ordersList);
    } catch (err) {
      console.warn('Notice loading secondary user Firestore data:', err);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await loadOrCreateUserProfile(user);
      await loadUserData(user.uid);
    }
  };

  const loadOrCreateUserProfile = async (
    firebaseUser: User,
    desiredRole: 'customer' | 'creator' = 'customer',
    isVerifiedOwner = false
  ) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const provider = firebaseUser.providerData[0]?.providerId || 'password';
    const defaultPreferences: UserPreferences = {
      newsletterSubscribed: true,
      currency: 'INR',
      emailReceipts: true,
      productUpdates: true
    };

    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        const updated: UserProfile = {
          ...data,
          name: firebaseUser.displayName || data.displayName || data.name || 'Customer',
          displayName: firebaseUser.displayName || data.displayName || data.name || 'Customer',
          email: firebaseUser.email || data.email,
          photoURL: firebaseUser.photoURL || data.photoURL || '',
          authProvider: data.authProvider || provider,
          preferences: { ...defaultPreferences, ...(data.preferences || {}) },
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          role: isVerifiedOwner ? 'admin' : (data.role || desiredRole)
        };
        setUserProfile(updated);
        setDoc(userDocRef, cleanFirestoreData(updated), { merge: true }).catch(() => {});
      } else {
        // Create initial profile in Firestore
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Customer',
          displayName: firebaseUser.displayName || 'Customer',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || '',
          role: isVerifiedOwner ? 'admin' : desiredRole,
          authProvider: provider,
          purchasedProductIds: [],
          savedProductIds: [],
          preferences: defaultPreferences,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        await setDoc(userDocRef, cleanFirestoreData(newProfile));
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Error in loadOrCreateUserProfile:', error);
      setUserProfile({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Customer',
        displayName: firebaseUser.displayName || 'Customer',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        role: isVerifiedOwner ? 'admin' : desiredRole,
        authProvider: provider,
        purchasedProductIds: [],
        savedProductIds: [],
        preferences: defaultPreferences,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await loadOrCreateUserProfile(result.user);
        await loadUserData(result.user.uid);
        closeAuthModal();
        return { success: true };
      }
      return { success: false, error: 'Sign-in incomplete.' };
    } catch (error: any) {
      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request' ||
        error?.code === 'auth/popup-blocked'
      ) {
        return { success: false, error: 'Sign-in popup closed by user.' };
      }
      console.error('Sign in with Google error:', error);
      return { success: false, error: getAuthErrorMessage(error) };
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
      if (result.user) {
        await loadOrCreateUserProfile(result.user);
        await loadUserData(result.user.uid);
        closeAuthModal();
        return { success: true };
      }
      return { success: false, error: 'User not found.' };
    } catch (error: any) {
      console.error('Sign in with email error:', error);
      return { success: false, error: getAuthErrorMessage(error) };
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string, role: 'customer' | 'creator' = 'customer') => {
    try {
      if (!name.trim()) {
        return { success: false, error: 'Please enter your full name.' };
      }
      if (pass.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }
      const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (result.user) {
        // Update display name immediately
        if (name.trim()) {
          await updateProfile(result.user, { displayName: name.trim() });
        }
        // Send initial email verification link in background
        sendEmailVerification(result.user).catch((e) => {
          console.warn('Initial verification email trigger notice:', e);
        });
        await loadOrCreateUserProfile(result.user, role);
        await loadUserData(result.user.uid);
        closeAuthModal();
        return { success: true };
      }
      return { success: false, error: 'Registration could not be completed.' };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { success: false, error: getAuthErrorMessage(error) };
    }
  };

  const sendPasswordReset = async (emailToReset: string) => {
    try {
      await sendPasswordResetEmail(auth, emailToReset.trim());
      return {
        success: true,
        message: `Password reset link sent to ${emailToReset.trim()}. Please check your inbox and spam folders.`
      };
    } catch (err: any) {
      console.error('Password reset error:', err);
      return { success: false, error: getAuthErrorMessage(err) };
    }
  };

  const sendVerification = async () => {
    if (!auth.currentUser) {
      return { success: false, error: 'Please sign in first.' };
    }
    try {
      await sendEmailVerification(auth.currentUser);
      return {
        success: true,
        message: `Verification link sent to ${auth.currentUser.email}. Please click the link to verify your address.`
      };
    } catch (err: any) {
      console.error('Email verification error:', err);
      return { success: false, error: getAuthErrorMessage(err) };
    }
  };

  const reloadUser = async () => {
    if (!auth.currentUser) return;
    try {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
      await loadOrCreateUserProfile(auth.currentUser);
    } catch (err) {
      console.warn('Reload user notice:', err);
    }
  };

  const updateUserProfileData = async (updates: {
    displayName?: string;
    name?: string;
    photoURL?: string;
    preferences?: Partial<UserPreferences>;
  }) => {
    if (!user || !auth.currentUser) return { success: false, error: 'Not authenticated.' };

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const newName = updates.displayName || updates.name;

      if (newName && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: newName,
          photoURL: updates.photoURL ?? auth.currentUser.photoURL
        });
      }

      const mergedPreferences: UserPreferences = {
        ...(userProfile?.preferences || {}),
        ...(updates.preferences || {})
      };

      const docUpdates: any = {
        updatedAt: new Date().toISOString()
      };
      if (newName) {
        docUpdates.name = newName;
        docUpdates.displayName = newName;
      }
      if (updates.photoURL !== undefined) {
        docUpdates.photoURL = updates.photoURL;
      }
      if (updates.preferences) {
        docUpdates.preferences = mergedPreferences;
      }

      await setDoc(userDocRef, docUpdates, { merge: true });

      setUserProfile(prev =>
        prev
          ? {
              ...prev,
              ...docUpdates,
              preferences: mergedPreferences
            }
          : null
      );

      return { success: true };
    } catch (err: any) {
      console.error('Error updating user profile:', err);
      return { success: false, error: err?.message || 'Failed to update profile.' };
    }
  };

  const linkGoogleAccount = async () => {
    if (!auth.currentUser) return { success: false, error: 'Not authenticated.' };
    try {
      const result = await linkWithPopup(auth.currentUser, googleProvider);
      if (result.user) {
        await loadOrCreateUserProfile(result.user);
        return { success: true };
      }
      return { success: false, error: 'Linking could not be completed.' };
    } catch (err: any) {
      console.error('Account linking error:', err);
      return { success: false, error: getAuthErrorMessage(err) };
    }
  };

  const linkEmailPassword = async (pass: string) => {
    if (!auth.currentUser || !auth.currentUser.email) {
      return { success: false, error: 'Authenticated user email not found.' };
    }
    if (pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, pass);
      const result = await linkWithCredential(auth.currentUser, credential);
      if (result.user) {
        await loadOrCreateUserProfile(result.user);
        return { success: true };
      }
      return { success: false, error: 'Could not link email password credentials.' };
    } catch (err: any) {
      console.error('Link email credential error:', err);
      return { success: false, error: getAuthErrorMessage(err) };
    }
  };

  const unlinkProviderAccount = async (providerId: string) => {
    if (!auth.currentUser) return { success: false, error: 'Not authenticated.' };
    if (!canUnlinkProvider(auth.currentUser)) {
      return {
        success: false,
        error: 'Cannot unlink this provider because it is your only remaining login method. Please link another method before unlinking.'
      };
    }
    try {
      const result = await unlink(auth.currentUser, providerId);
      if (result) {
        await loadOrCreateUserProfile(result);
        return { success: true };
      }
      return { success: false, error: 'Provider unlinking was not completed.' };
    } catch (err: any) {
      console.error('Unlink provider error:', err);
      return { success: false, error: getAuthErrorMessage(err) };
    }
  };

  const deleteAccount = async (passwordForReauth?: string) => {
    if (!auth.currentUser) {
      return { success: false, error: 'No authenticated user found.' };
    }

    const currentUser = auth.currentUser;
    const uid = currentUser.uid;
    const providerId = currentUser.providerData[0]?.providerId || 'password';

    try {
      // 1. Mandatory re-authentication handling
      if (providerId === 'password') {
        if (!passwordForReauth) {
          return {
            success: false,
            error: 'Current account password is required to verify identity before permanent deletion.',
            requiresReauth: true
          };
        }
        if (currentUser.email) {
          const cred = EmailAuthProvider.credential(currentUser.email, passwordForReauth);
          await reauthenticateWithCredential(currentUser, cred);
        }
      } else if (providerId === 'google.com') {
        try {
          await reauthenticateWithPopup(currentUser, googleProvider);
        } catch (popupErr: any) {
          console.warn('Google reauth popup status:', popupErr);
          if (popupErr?.code === 'auth/popup-closed-by-user') {
            return {
              success: false,
              error: 'Google re-authentication window was closed. Account was not deleted.'
            };
          }
        }
      }

      // 2. Anonymize retained legal financial order records (preserves statutory accounting integrity without private data)
      try {
        const ordersRef = collection(db, 'orders');
        const qOrders = query(ordersRef, where('userId', '==', uid));
        const oSnap = await getDocs(qOrders);
        const anonymizePromises = oSnap.docs.map(docSnap =>
          updateDoc(docSnap.ref, {
            customerName: 'Former Customer (Account Deleted)',
            customerEmail: 'anonymized@deleted.luminadigital.com',
            accountStatus: 'deleted_user_retained_record',
            anonymizedAt: new Date().toISOString()
          }).catch(e => console.warn('Order anonymize notice:', e))
        );
        await Promise.all(anonymizePromises);
      } catch (orderErr) {
        console.warn('Orders retention notice:', orderErr);
      }

      // 3. Revoke access entitlement records on purchases
      try {
        const purchasesRef = collection(db, 'purchases');
        const qPurchases = query(purchasesRef, where('userId', '==', uid));
        const pSnap = await getDocs(qPurchases);
        const pPromises = pSnap.docs.map(docSnap =>
          updateDoc(docSnap.ref, {
            accessStatus: 'revoked',
            accountStatus: 'deleted_user',
            revokedAt: new Date().toISOString()
          }).catch(e => console.warn('Purchase revoke notice:', e))
        );
        await Promise.all(pPromises);
      } catch (pErr) {
        console.warn('Purchases revoke notice:', pErr);
      }

      // 4. Delete private customer support enquiries
      try {
        const enquiriesRef = collection(db, 'users', uid, 'enquiries');
        const enqSnap = await getDocs(enquiriesRef);
        const delEnqPromises = enqSnap.docs.map(d => deleteDoc(d.ref).catch(() => {}));
        await Promise.all(delEnqPromises);
      } catch (enqErr) {
        console.warn('Enquiries delete notice:', enqErr);
      }

      // 5. Delete private chat sessions
      try {
        const chatRef = collection(db, 'chat_sessions');
        const qChat = query(chatRef, where('userId', '==', uid));
        const cSnap = await getDocs(qChat);
        const delChatPromises = cSnap.docs.map(d => deleteDoc(d.ref).catch(() => {}));
        await Promise.all(delChatPromises);
      } catch (cErr) {
        console.warn('Chat sessions delete notice:', cErr);
      }

      // 6. Delete private download tracking
      try {
        const downloadsRef = collection(db, 'downloads');
        const qDownloads = query(downloadsRef, where('userId', '==', uid));
        const dSnap = await getDocs(qDownloads);
        const delDownloads = dSnap.docs.map(d => deleteDoc(d.ref).catch(() => {}));
        await Promise.all(delDownloads);
      } catch (dErr) {
        console.warn('Downloads delete notice:', dErr);
      }

      // 7. Delete personal user document in Firestore
      try {
        const userDocRef = doc(db, 'users', uid);
        await deleteDoc(userDocRef);
      } catch (docErr) {
        console.warn('User profile deleteDoc notice:', docErr);
      }

      // 8. Delete Firebase Auth User (with automatic re-auth retry if session is stale)
      try {
        await deleteUser(currentUser);
      } catch (delUserErr: any) {
        if (delUserErr?.code === 'auth/requires-recent-login') {
          if (providerId === 'google.com') {
            await reauthenticateWithPopup(currentUser, googleProvider);
            await deleteUser(currentUser);
          } else {
            return {
              success: false,
              error: 'Security checkpoint: Please re-authenticate before deleting your account.',
              requiresReauth: true
            };
          }
        } else {
          throw delUserErr;
        }
      }

      // 9. Clear all client-side session and temporary cached state
      setUser(null);
      setUserProfile(null);
      setUserPurchases([]);
      setUserDownloads([]);
      setUserOrders([]);

      try {
        sessionStorage.clear();
        localStorage.removeItem('lumina_orders');
        localStorage.removeItem('lumina_cart');
        localStorage.removeItem('lumina_checkout_state');
        localStorage.removeItem('lumina_temp_session');
      } catch (_storageErr) {
        // ignore storage errors
      }

      return { success: true };
    } catch (err: any) {
      console.error('Delete account error:', err);
      if (err?.code === 'auth/requires-recent-login') {
        return {
          success: false,
          error: 'Security checkpoint: Please re-authenticate before deleting your account.',
          requiresReauth: true
        };
      }
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        return { success: false, error: 'Incorrect password for confirmation.' };
      }
      return { success: false, error: err?.message || 'Failed to delete account. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      clearOwnerAuthCache();
      setIsOwner(false);
      setOwnerVerified(false);
      setUser(null);
      setUserProfile(null);
      setUserPurchases([]);
      setUserDownloads([]);
      setUserOrders([]);

      try {
        sessionStorage.clear();
        localStorage.removeItem('lumina_orders');
        localStorage.removeItem('lumina_checkout_state');
        localStorage.removeItem('lumina_temp_session');
        localStorage.removeItem('lumina_is_admin');
      } catch (_storageErr) {
        // ignore
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const syncPurchasedProducts = async (productIds: string[]) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const currentIds = userProfile?.purchasedProductIds || [];
      const merged = Array.from(new Set([...currentIds, ...productIds]));
      await setDoc(
        userDocRef,
        {
          purchasedProductIds: merged,
          lastLoginAt: new Date().toISOString()
        },
        { merge: true }
      );
      setUserProfile((prev) => (prev ? { ...prev, purchasedProductIds: merged } : null));
    } catch (error) {
      console.error('Failed to sync purchased products:', error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const syncSavedProducts = async (productIds: string[]) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(
        userDocRef,
        {
          savedProductIds: productIds,
          lastLoginAt: new Date().toISOString()
        },
        { merge: true }
      );
      setUserProfile((prev) => (prev ? { ...prev, savedProductIds: productIds } : null));
    } catch (error) {
      console.error('Failed to sync saved products:', error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  // Record a verified purchase into Firestore `purchases` collection
  const recordPurchase = async (purchase: {
    productId: string;
    orderId: string;
    paymentId?: string;
    productTitle?: string;
    amountPaid?: number;
    amount?: number;
    currency?: string;
    status?: 'completed' | 'pending' | 'failed' | 'refunded';
    verificationToken?: string;
  }): Promise<boolean> => {
    if (!user) return false;
    const purchaseId = `${user.uid}_${purchase.productId}`;
    const purchaseDocRef = doc(db, 'purchases', purchaseId);

    // Ensure verification token is never undefined (strictly required for Firestore setDoc)
    const token =
      purchase.verificationToken ||
      `tok_${purchase.orderId || 'ord'}_${purchase.productId}`;

    const newPurchase: FirestorePurchase = {
      userId: user.uid,
      productId: purchase.productId,
      orderId: purchase.orderId,
      paymentId: purchase.paymentId || 'pay_verified',
      amount: purchase.amount ?? purchase.amountPaid ?? 0,
      currency: purchase.currency || 'INR',
      status: purchase.status || 'completed',
      purchasedAt: new Date().toISOString(),
      accessStatus: 'active',
      productTitle: purchase.productTitle || 'Digital Deliverable',
      amountPaid: purchase.amountPaid ?? purchase.amount ?? 0,
      verificationToken: token
    };

    try {
      const sanitized = cleanFirestoreData(newPurchase);
      await setDoc(purchaseDocRef, sanitized);
      setUserPurchases((prev) => {
        const filtered = prev.filter((p) => p.productId !== purchase.productId);
        return [...filtered, { ...newPurchase, id: purchaseId }];
      });
      await syncPurchasedProducts([purchase.productId]);
      return true;
    } catch (err) {
      console.error('Failed to record purchase in Firestore:', err);
      handleFirestoreError(err, OperationType.CREATE, `purchases/${purchaseId}`);
      return false;
    }
  };

  // Record a file download event in Firestore `downloads` collection
  const recordDownload = async (productId: string, productTitle?: string, fileName?: string) => {
    if (!user) return;
    const downloadDocId = `${user.uid}_${productId}`;
    const downloadDocRef = doc(db, 'downloads', downloadDocId);

    try {
      const existing = userDownloads.find((d) => d.productId === productId);
      const newCount = (existing?.downloadCount || 0) + 1;
      const downloadPayload: FirestoreDownload = {
        userId: user.uid,
        productId,
        downloadCount: newCount,
        lastDownloadedAt: new Date().toISOString(),
        productTitle: productTitle || existing?.productTitle || '',
        fileName: fileName || existing?.fileName || ''
      };

      await setDoc(downloadDocRef, cleanFirestoreData(downloadPayload), { merge: true });
      setUserDownloads((prev) => {
        const filtered = prev.filter((d) => d.productId !== productId);
        return [...filtered, { ...downloadPayload, id: downloadDocId }];
      });
    } catch (err) {
      console.warn('Notice recording download in Firestore:', err);
    }
  };

  // Record an order in Firestore `orders` collection
  const recordOrder = async (orderData: {
    orderId: string;
    products: { productId: string; title: string; price: number; format?: string }[];
    amount: number;
    currency: string;
    paymentStatus: 'completed' | 'pending' | 'failed';
    paymentMethod?: string;
  }): Promise<boolean> => {
    if (!user) return false;
    const orderDocRef = doc(db, 'orders', orderData.orderId);
    const payload: FirestoreOrder = {
      orderId: orderData.orderId,
      userId: user.uid,
      customerEmail: user.email || '',
      products: orderData.products.map(p => ({
        productId: p.productId,
        title: p.title || 'Digital Product',
        price: p.price ?? 0,
        ...(p.format ? { format: p.format } : {})
      })),
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      paymentStatus: orderData.paymentStatus,
      paymentMethod: orderData.paymentMethod || 'razorpay',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(orderDocRef, cleanFirestoreData(payload));
      setUserOrders((prev) => [payload, ...prev]);
      return true;
    } catch (err) {
      console.error('Failed to save order in Firestore:', err);
      handleFirestoreError(err, OperationType.CREATE, `orders/${orderData.orderId}`);
      return false;
    }
  };

  // Save enquiry to user subcollection
  const saveCustomerEnquiry = async (enquiry: {
    id: string;
    message: string;
    sender: 'user' | 'agent';
    timestamp?: string;
  }) => {
    if (!user) return;
    const enquiryDocRef = doc(db, 'users', user.uid, 'enquiries', enquiry.id);
    const payload: StoredEnquiry = {
      id: enquiry.id,
      userId: user.uid,
      userEmail: user.email || '',
      message: enquiry.message,
      sender: enquiry.sender,
      timestamp:
        enquiry.timestamp ||
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(enquiryDocRef, cleanFirestoreData(payload));
    } catch (error) {
      console.warn('Enquiry save notice:', error);
    }
  };

  const fetchCustomerEnquiries = async (): Promise<StoredEnquiry[]> => {
    if (!user) return [];
    const enquiriesRef = collection(db, 'users', user.uid, 'enquiries');
    try {
      const q = query(enquiriesRef, orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data() as StoredEnquiry);
    } catch (error) {
      console.warn('Could not fetch enquiries:', error);
      return [];
    }
  };

  // Chat session persistence in `chat_sessions` collection
  const saveChatSession = async (sessionId: string, messages: any[]) => {
    if (!user) return;
    const sessionDocRef = doc(db, 'chat_sessions', sessionId);
    const payload: ChatSessionRecord = {
      sessionId,
      userId: user.uid,
      messages: messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp,
        sources: m.sources || []
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(sessionDocRef, cleanFirestoreData(payload), { merge: true });
    } catch (err) {
      console.warn('Chat session save notice:', err);
    }
  };

  const fetchChatSession = async (sessionId: string) => {
    if (!user) return null;
    const sessionDocRef = doc(db, 'chat_sessions', sessionId);
    try {
      const snap = await getDoc(sessionDocRef);
      return snap.exists() ? (snap.data() as ChatSessionRecord) : null;
    } catch (err) {
      return null;
    }
  };

  const linkedProviders = getLinkedProviderIds(user);
  const canUnlink = canUnlinkProvider(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isOwner,
        ownerVerified,
        checkOwnerAccess,
        userPurchases,
        userDownloads,
        userOrders,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        sendVerification,
        updateUserProfileData,
        linkGoogleAccount,
        linkEmailPassword,
        unlinkProviderAccount,
        reloadUser,
        linkedProviders,
        canUnlink,
        deleteAccount,
        logout,
        syncPurchasedProducts,
        syncSavedProducts,
        recordPurchase,
        recordDownload,
        recordOrder,
        refreshUserData,
        saveCustomerEnquiry,
        fetchCustomerEnquiries,
        saveChatSession,
        fetchChatSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
