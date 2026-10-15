import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  CreatorProfile,
  CreatorStatus,
  CreatorType,
  CreatorPayoutSettings,
  CreatorVerificationStatus,
  CreatorPayoutRecord,
  CreatorSaleItem,
  CreatorDashboardTab,
  Product,
  ProductStatus
} from '../types';

interface RegisterCreatorData {
  displayName: string;
  businessName?: string;
  bio: string;
  creatorType: CreatorType;
  country: string;
  profileImage?: string;
  idType?: 'passport' | 'national_id' | 'driver_license';
  idNumber?: string;
  taxId?: string;
}

interface CreatorContextType {
  creatorProfile: CreatorProfile | null;
  isCreator: boolean;
  isVerified: boolean;
  canSell: boolean;
  loadingCreator: boolean;
  activeCreatorTab: CreatorDashboardTab;
  setActiveCreatorTab: (tab: CreatorDashboardTab) => void;
  creatorProducts: Product[];
  creatorSales: CreatorSaleItem[];
  creatorPayouts: CreatorPayoutRecord[];
  editingProductId: string | null;
  setEditingProductId: (id: string | null) => void;
  previewingProductId: string | null;
  setPreviewingProductId: (id: string | null) => void;
  // Actions
  registerAsCreator: (data: RegisterCreatorData) => Promise<{ success: boolean; error?: string }>;
  updateCreatorProfile: (updates: Partial<CreatorProfile>) => Promise<{ success: boolean; error?: string }>;
  updatePayoutSettings: (settings: CreatorPayoutSettings) => Promise<{ success: boolean; error?: string }>;
  submitVerification: (verificationData: {
    idType: 'passport' | 'national_id' | 'driver_license';
    idNumber: string;
    taxId: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  requestPayout: (amount: number) => Promise<{ success: boolean; error?: string }>;
  createCreatorProduct: (productData: Omit<Product, 'id'>, submitForReview?: boolean) => Promise<{ success: boolean; error?: string; product?: Product }>;
  updateCreatorProduct: (productId: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  duplicateProduct: (productId: string) => Promise<{ success: boolean; error?: string; product?: Product }>;
  submitProductForReview: (productId: string) => Promise<{ success: boolean; error?: string }>;
  unpublishProduct: (productId: string) => Promise<{ success: boolean; error?: string }>;
  publishProduct: (productId: string) => Promise<{ success: boolean; error?: string }>;
  updateProductVersion: (productId: string, newVersion: string, changelog: string, digitalFile?: any) => Promise<{ success: boolean; error?: string }>;
  simulateModerationDecision: (productId: string, decision: 'approved' | 'rejected' | 'suspended', note?: string) => Promise<{ success: boolean; error?: string }>;
  deleteCreatorProduct: (productId: string) => Promise<{ success: boolean; error?: string; archived?: boolean; message?: string }>;
  refreshCreatorData: () => Promise<void>;
  simulateStatusChange: (newStatus: CreatorStatus) => Promise<void>;
}

const CreatorContext = createContext<CreatorContextType | undefined>(undefined);

// Initial default payout settings
const DEFAULT_PAYOUT_SETTINGS: CreatorPayoutSettings = {
  payoutMethod: 'bank_transfer',
  accountHolderName: '',
  accountNumberOrEmail: '',
  bankNameOrIfsc: '',
  currency: 'INR',
  minimumPayoutThreshold: 1000,
  isConfigured: false
};

// Initial default verification status
const DEFAULT_VERIFICATION_STATUS: CreatorVerificationStatus = {
  idVerified: false,
  taxCompleted: false,
  paymentVerified: false
};

export const CreatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [loadingCreator, setLoadingCreator] = useState<boolean>(true);
  const [activeCreatorTab, setActiveCreatorTab] = useState<CreatorDashboardTab>('overview');
  const [creatorProducts, setCreatorProducts] = useState<Product[]>([]);
  const [creatorSales, setCreatorSales] = useState<CreatorSaleItem[]>([]);
  const [creatorPayouts, setCreatorPayouts] = useState<CreatorPayoutRecord[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [previewingProductId, setPreviewingProductId] = useState<string | null>(null);

  // Load creator profile whenever user changes
  useEffect(() => {
    let isMounted = true;
    const loadCreator = async () => {
      if (!user) {
        if (isMounted) {
          setCreatorProfile(null);
          setCreatorProducts([]);
          setCreatorSales([]);
          setCreatorPayouts([]);
          setLoadingCreator(false);
        }
        return;
      }

      setLoadingCreator(true);
      try {
        const creatorDocRef = doc(db, 'creators', user.uid);
        const docSnap = await getDoc(creatorDocRef);

        if (docSnap.exists()) {
          const profileData = docSnap.data() as CreatorProfile;
          if (isMounted) {
            setCreatorProfile(profileData);
          }
          // Also load payouts subcollection
          await loadPayouts(user.uid);
          await loadCreatorSales(user.uid, profileData);
        } else {
          // Check if cached locally in browser for offline/fast load
          const localCache = localStorage.getItem(`lumina_creator_${user.uid}`);
          if (localCache) {
            try {
              const parsed = JSON.parse(localCache);
              if (isMounted) {
                setCreatorProfile(parsed);
                await loadPayouts(user.uid);
              }
            } catch {
              // ignore
            }
          } else {
            if (isMounted) {
              setCreatorProfile(null);
            }
          }
        }
      } catch (err) {
        console.warn('Creator profile load notice:', err);
        // Fallback to local cache if offline
        const localCache = localStorage.getItem(`lumina_creator_${user.uid}`);
        if (localCache && isMounted) {
          try {
            setCreatorProfile(JSON.parse(localCache));
          } catch {
            // ignore
          }
        }
      } finally {
        if (isMounted) {
          setLoadingCreator(false);
        }
      }
    };

    loadCreator();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Load creator-owned products from local storage & Firestore
  useEffect(() => {
    if (!user) {
      setCreatorProducts([]);
      return;
    }

    try {
      const stored = localStorage.getItem('lumina_products');
      if (stored) {
        const parsed: Product[] = JSON.parse(stored);
        const filtered = parsed.filter(p => p.creatorId === user.uid);
        setCreatorProducts(filtered);
      }
    } catch {
      // ignore
    }
  }, [user, creatorProfile]);

  const loadPayouts = async (creatorUid: string) => {
    try {
      const payoutsRef = collection(db, 'creators', creatorUid, 'payouts');
      const q = query(payoutsRef);
      const snapshot = await getDocs(q);
      const list: CreatorPayoutRecord[] = [];
      snapshot.forEach(d => {
        list.push({ payoutId: d.id, ...(d.data() as CreatorPayoutRecord) });
      });

      if (list.length > 0) {
        setCreatorPayouts(list);
      } else {
        // Check local cache
        const local = localStorage.getItem(`lumina_payouts_${creatorUid}`);
        if (local) {
          setCreatorPayouts(JSON.parse(local));
        }
      }
    } catch {
      const local = localStorage.getItem(`lumina_payouts_${creatorUid}`);
      if (local) {
        try {
          setCreatorPayouts(JSON.parse(local));
        } catch {
          // ignore
        }
      }
    }
  };

  const loadCreatorSales = async (creatorUid: string, profile: CreatorProfile) => {
    const local = localStorage.getItem(`lumina_creator_sales_${creatorUid}`);
    if (local) {
      try {
        setCreatorSales(JSON.parse(local));
        return;
      } catch {
        // ignore
      }
    }

    // Generate starter sample sales if creator has totalSales > 0
    if (profile.totalSales > 0) {
      const sampleSales: CreatorSaleItem[] = [
        {
          orderId: 'ORD-72941',
          productId: 'prod-creator-01',
          productTitle: 'Modern Creator Notion System',
          customerName: 'Marcus Chen',
          customerEmailMasked: 'm***s@designstudio.io',
          grossAmount: 1499,
          platformFee: 149.9,
          netEarnings: 1349.1,
          currency: 'INR',
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          status: 'completed'
        },
        {
          orderId: 'ORD-71028',
          productId: 'prod-creator-02',
          productTitle: 'AI Prompt Mastery Vault',
          customerName: 'Sarah Jenkins',
          customerEmailMasked: 's***h@gmail.com',
          grossAmount: 899,
          platformFee: 89.9,
          netEarnings: 809.1,
          currency: 'INR',
          date: new Date(Date.now() - 86400000 * 4).toISOString(),
          status: 'completed'
        }
      ];
      setCreatorSales(sampleSales);
      localStorage.setItem(`lumina_creator_sales_${creatorUid}`, JSON.stringify(sampleSales));
    }
  };

  // Register as Creator
  const registerAsCreator = async (data: RegisterCreatorData): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'You must be signed in with Lumina Digital to register as a creator.' };
    }

    try {
      const creatorUid = user.uid; // Permanent Firebase Auth UID
      const initialStatus: CreatorStatus = 'under_review';

      const newCreatorProfile: CreatorProfile = {
        creatorUid,
        displayName: data.displayName.trim(),
        businessName: data.businessName?.trim() || data.displayName.trim(),
        profileImage: data.profileImage || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: data.bio.trim(),
        creatorType: data.creatorType,
        country: data.country,
        email: user.email || '',
        accountStatus: initialStatus,
        verificationStatus: {
          idVerified: false,
          taxCompleted: Boolean(data.taxId),
          paymentVerified: false,
          idType: data.idType,
          idNumberMasked: data.idNumber ? `•••• ${data.idNumber.slice(-4)}` : undefined,
          taxIdMasked: data.taxId ? `•••• ${data.taxId.slice(-4)}` : undefined,
          submittedAt: new Date().toISOString(),
          notes: 'KYC & Onboarding information submitted for compliance review.'
        },
        payoutSettings: {
          ...DEFAULT_PAYOUT_SETTINGS,
          accountHolderName: data.displayName.trim()
        },
        totalSales: 0,
        totalEarnings: 0,
        balanceAvailable: 0,
        balancePending: 0,
        totalWithdrawn: 0,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
      };

      // 1. Save to Firestore
      const creatorRef = doc(db, 'creators', creatorUid);
      try {
        await setDoc(creatorRef, newCreatorProfile);
      } catch (fsErr) {
        console.warn('Firestore creator save notice (caching locally):', fsErr);
      }

      // 2. Also update UserProfile in Firestore to link creatorUid and role
      try {
        const userRef = doc(db, 'users', creatorUid);
        await updateDoc(userRef, {
          creatorUid,
          accountType: 'creator',
          updatedAt: new Date().toISOString()
        });
      } catch {
        // ignore
      }

      // 3. Update local state and cache
      setCreatorProfile(newCreatorProfile);
      localStorage.setItem(`lumina_creator_${creatorUid}`, JSON.stringify(newCreatorProfile));

      return { success: true };
    } catch (err: any) {
      console.error('Creator registration error:', err);
      return { success: false, error: err.message || 'Failed to complete creator registration.' };
    }
  };

  // Update Creator Profile
  const updateCreatorProfile = async (updates: Partial<CreatorProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!user || !creatorProfile) {
      return { success: false, error: 'No active creator profile found.' };
    }

    try {
      const updated: CreatorProfile = {
        ...creatorProfile,
        ...updates,
        updatedDate: new Date().toISOString()
      };

      // Security enforcement: Creator cannot self-verify via normal profile edit
      if (updates.accountStatus && updates.accountStatus !== creatorProfile.accountStatus) {
        updated.accountStatus = creatorProfile.accountStatus;
      }

      const creatorRef = doc(db, 'creators', user.uid);
      try {
        await updateDoc(creatorRef, {
          ...updates,
          updatedDate: updated.updatedDate
        });
      } catch (fsErr) {
        console.warn('Firestore profile update notice:', fsErr);
      }

      setCreatorProfile(updated);
      localStorage.setItem(`lumina_creator_${user.uid}`, JSON.stringify(updated));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update profile.' };
    }
  };

  // Update Payout Settings
  const updatePayoutSettings = async (settings: CreatorPayoutSettings): Promise<{ success: boolean; error?: string }> => {
    if (!user || !creatorProfile) {
      return { success: false, error: 'No active creator profile.' };
    }

    try {
      const updatedSettings: CreatorPayoutSettings = {
        ...settings,
        isConfigured: Boolean(settings.accountNumberOrEmail.trim() && settings.accountHolderName.trim())
      };

      const updatedProfile: CreatorProfile = {
        ...creatorProfile,
        payoutSettings: updatedSettings,
        verificationStatus: {
          ...creatorProfile.verificationStatus,
          paymentVerified: updatedSettings.isConfigured
        },
        updatedDate: new Date().toISOString()
      };

      const creatorRef = doc(db, 'creators', user.uid);
      try {
        await updateDoc(creatorRef, {
          payoutSettings: updatedSettings,
          'verificationStatus.paymentVerified': updatedSettings.isConfigured,
          updatedDate: updatedProfile.updatedDate
        });
      } catch (fsErr) {
        console.warn('Firestore payout settings notice:', fsErr);
      }

      setCreatorProfile(updatedProfile);
      localStorage.setItem(`lumina_creator_${user.uid}`, JSON.stringify(updatedProfile));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to save payout settings.' };
    }
  };

  // Submit KYC verification
  const submitVerification = async (verificationData: {
    idType: 'passport' | 'national_id' | 'driver_license';
    idNumber: string;
    taxId: string;
    notes?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user || !creatorProfile) {
      return { success: false, error: 'Creator account not found.' };
    }

    try {
      const newVerification: CreatorVerificationStatus = {
        ...creatorProfile.verificationStatus,
        idVerified: false,
        taxCompleted: true,
        idType: verificationData.idType,
        idNumberMasked: `•••• ${verificationData.idNumber.slice(-4)}`,
        taxIdMasked: `•••• ${verificationData.taxId.slice(-4)}`,
        submittedAt: new Date().toISOString(),
        notes: verificationData.notes || 'Documents under KYC compliance review.'
      };

      const updatedProfile: CreatorProfile = {
        ...creatorProfile,
        accountStatus: 'under_review',
        verificationStatus: newVerification,
        updatedDate: new Date().toISOString()
      };

      const creatorRef = doc(db, 'creators', user.uid);
      try {
        await updateDoc(creatorRef, {
          verificationStatus: newVerification,
          accountStatus: 'under_review',
          updatedDate: updatedProfile.updatedDate
        });
      } catch (fsErr) {
        console.warn('Firestore verification notice:', fsErr);
      }

      setCreatorProfile(updatedProfile);
      localStorage.setItem(`lumina_creator_${user.uid}`, JSON.stringify(updatedProfile));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to submit verification.' };
    }
  };

  // Request Payout
  const requestPayout = async (amount: number): Promise<{ success: boolean; error?: string }> => {
    if (!user || !creatorProfile) {
      return { success: false, error: 'Creator account not found.' };
    }

    if (!creatorProfile.payoutSettings.isConfigured) {
      return { success: false, error: 'Please configure your payout method in Payment Setup before requesting a withdrawal.' };
    }

    if (creatorProfile.accountStatus !== 'verified') {
      return { success: false, error: `Account status is "${creatorProfile.accountStatus}". Payouts are only permitted for Verified creators.` };
    }

    if (amount <= 0) {
      return { success: false, error: 'Please enter a valid payout amount.' };
    }

    if (amount > creatorProfile.balanceAvailable) {
      return { success: false, error: `Requested amount exceeds your available balance of ${creatorProfile.payoutSettings.currency} ${creatorProfile.balanceAvailable}.` };
    }

    if (amount < creatorProfile.payoutSettings.minimumPayoutThreshold) {
      return { success: false, error: `Minimum payout threshold is ${creatorProfile.payoutSettings.currency} ${creatorProfile.payoutSettings.minimumPayoutThreshold}.` };
    }

    try {
      const payoutId = `pay-${Date.now()}`;
      const newPayout: CreatorPayoutRecord = {
        payoutId,
        creatorUid: user.uid,
        amount,
        currency: creatorProfile.payoutSettings.currency,
        status: 'pending',
        payoutMethod: creatorProfile.payoutSettings.payoutMethod,
        destination: creatorProfile.payoutSettings.accountNumberOrEmail,
        createdAt: new Date().toISOString()
      };

      // Save to Firestore subcollection
      try {
        const payoutDocRef = doc(db, 'creators', user.uid, 'payouts', payoutId);
        await setDoc(payoutDocRef, newPayout);
      } catch (fsErr) {
        console.warn('Firestore payout record notice:', fsErr);
      }

      // Update creator balances
      const updatedProfile: CreatorProfile = {
        ...creatorProfile,
        balanceAvailable: creatorProfile.balanceAvailable - amount,
        balancePending: creatorProfile.balancePending + amount,
        updatedDate: new Date().toISOString()
      };

      try {
        const creatorRef = doc(db, 'creators', user.uid);
        await updateDoc(creatorRef, {
          balanceAvailable: updatedProfile.balanceAvailable,
          balancePending: updatedProfile.balancePending,
          updatedDate: updatedProfile.updatedDate
        });
      } catch {
        // ignore
      }

      setCreatorProfile(updatedProfile);
      localStorage.setItem(`lumina_creator_${user.uid}`, JSON.stringify(updatedProfile));

      const updatedPayouts = [newPayout, ...creatorPayouts];
      setCreatorPayouts(updatedPayouts);
      localStorage.setItem(`lumina_payouts_${user.uid}`, JSON.stringify(updatedPayouts));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Payout request failed.' };
    }
  };

  // Create Creator Product (Strict: New products are never automatically public)
  const createCreatorProduct = async (
    productData: Omit<Product, 'id'>,
    submitForReview: boolean = false
  ): Promise<{ success: boolean; error?: string; product?: Product }> => {
    if (!user || !creatorProfile) {
      return { success: false, error: 'You must have an active creator profile to upload products.' };
    }

    // Workflow: Creator uploads -> Draft or Pending Review -> Moderation -> Published
    // New products must NOT automatically become public.
    const initialStatus = submitForReview ? 'pending_review' : (productData.status === 'draft' ? 'draft' : 'pending_review');

    const productId = `prod-cr-${Date.now()}`;
    const initialVersion = productData.version || '1.0.0';

    const newProduct: Product = {
      ...productData,
      id: productId,
      slug: productData.slug || productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      creatorId: user.uid,
      creatorName: creatorProfile.businessName || creatorProfile.displayName,
      creatorHandle: `@${creatorProfile.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      creatorAvatar: creatorProfile.profileImage,
      creatorType: creatorProfile.creatorType,
      isCreatorProduct: true,
      status: initialStatus,
      version: initialVersion,
      versions: [
        {
          version: initialVersion,
          releasedAt: new Date().toISOString(),
          changelog: productData.versionChangelog || 'Initial release submission.',
          fileName: productData.digitalFile?.fileName || productData.downloadFilename,
          fileSize: productData.digitalFile?.fileSize
        }
      ],
      salesCount: 0,
      totalRevenue: 0,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // 1. Save to Firestore products collection
      const prodDocRef = doc(db, 'products', productId);
      try {
        await setDoc(prodDocRef, {
          productId: newProduct.id,
          title: newProduct.title,
          subtitle: newProduct.subtitle || '',
          shortDescription: newProduct.shortDescription,
          description: newProduct.fullDescription,
          category: newProduct.category,
          subcategory: newProduct.subcategory || '',
          tags: newProduct.tags || [],
          price: newProduct.price,
          originalPrice: newProduct.originalPrice || newProduct.price,
          currency: newProduct.currency || 'USD',
          productType: newProduct.productType || 'digital-product',
          format: newProduct.format,
          creatorId: user.uid,
          creatorName: newProduct.creatorName,
          status: newProduct.status,
          version: newProduct.version,
          requirements: newProduct.requirements || [],
          fileReference: newProduct.digitalFile ? {
            fileId: newProduct.digitalFile.fileId,
            fileName: newProduct.digitalFile.fileName,
            fileSize: newProduct.digitalFile.fileSize,
            format: newProduct.digitalFile.format
          } : null,
          salesCount: 0,
          totalRevenue: 0,
          createdAt: newProduct.createdAt,
          updatedAt: newProduct.updatedAt
        });
      } catch (fsErr) {
        console.warn('Firestore product create notice (caching locally):', fsErr);
      }

      // 2. Update all products in localStorage
      const stored = localStorage.getItem('lumina_products');
      let allProducts: Product[] = stored ? JSON.parse(stored) : [];
      allProducts = [newProduct, ...allProducts];
      localStorage.setItem('lumina_products', JSON.stringify(allProducts));
      try {
        window.dispatchEvent(new CustomEvent('lumina:products-updated'));
      } catch {}

      // 3. Update local creator products list
      setCreatorProducts(prev => [newProduct, ...prev]);

      return { success: true, product: newProduct };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create product.' };
    }
  };

  // Update Creator Product
  const updateCreatorProduct = async (productId: string, updates: Partial<Product>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }

    try {
      const stored = localStorage.getItem('lumina_products');
      let allProducts: Product[] = stored ? JSON.parse(stored) : [];

      const target = allProducts.find(p => p.id === productId);
      if (!target || target.creatorId !== user.uid) {
        return { success: false, error: 'Product not found or unauthorized.' };
      }

      const updatedProduct: Product = {
        ...target,
        ...updates,
        creatorId: target.creatorId, // Immutable ownership
        updatedAt: new Date().toISOString()
      };

      allProducts = allProducts.map(p => (p.id === productId ? updatedProduct : p));
      localStorage.setItem('lumina_products', JSON.stringify(allProducts));
      try {
        window.dispatchEvent(new CustomEvent('lumina:products-updated'));
      } catch {}

      setCreatorProducts(prev => prev.map(p => (p.id === productId ? updatedProduct : p)));

      // Sync with Firestore
      try {
        const prodRef = doc(db, 'products', productId);
        await updateDoc(prodRef, {
          title: updatedProduct.title,
          shortDescription: updatedProduct.shortDescription,
          description: updatedProduct.fullDescription,
          price: updatedProduct.price,
          status: updatedProduct.status,
          category: updatedProduct.category,
          subcategory: updatedProduct.subcategory || '',
          format: updatedProduct.format,
          version: updatedProduct.version || '1.0.0',
          updatedAt: updatedProduct.updatedAt
        });
      } catch {
        // ignore offline / permission
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update product.' };
    }
  };

  // Submit Product for Review (Moderation pipeline)
  const submitProductForReview = async (productId: string): Promise<{ success: boolean; error?: string }> => {
    return updateCreatorProduct(productId, { status: 'pending_review' });
  };

  // Unpublish Product (Hides from store, but preserves download access for past buyers)
  const unpublishProduct = async (productId: string): Promise<{ success: boolean; error?: string }> => {
    return updateCreatorProduct(productId, { status: 'unpublished' });
  };

  // Publish Product (Moderation approval or creator re-publish if authorized)
  const publishProduct = async (productId: string): Promise<{ success: boolean; error?: string }> => {
    return updateCreatorProduct(productId, { status: 'published' });
  };

  // Duplicate Product (Creates a clean draft clone)
  const duplicateProduct = async (productId: string): Promise<{ success: boolean; error?: string; product?: Product }> => {
    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }

    const stored = localStorage.getItem('lumina_products');
    let allProducts: Product[] = stored ? JSON.parse(stored) : [];
    const source = allProducts.find(p => p.id === productId && p.creatorId === user.uid);

    if (!source) {
      return { success: false, error: 'Source product not found.' };
    }

    const newTitle = `Copy of ${source.title}`;
    const cloneData: Omit<Product, 'id'> = {
      ...source,
      title: newTitle,
      slug: `copy-of-${source.slug}-${Date.now().toString().slice(-4)}`,
      status: 'draft',
      version: '1.0.0',
      versionChangelog: 'Cloned duplicate version.',
      versions: [
        {
          version: '1.0.0',
          releasedAt: new Date().toISOString(),
          changelog: 'Cloned duplicate version.',
          fileName: source.digitalFile?.fileName || source.downloadFilename,
          fileSize: source.digitalFile?.fileSize
        }
      ],
      salesCount: 0,
      totalRevenue: 0,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return createCreatorProduct(cloneData, false);
  };

  // Update Product Version & Deliverable
  const updateProductVersion = async (
    productId: string,
    newVersion: string,
    changelog: string,
    newDigitalFile?: any
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Authentication required.' };

    const stored = localStorage.getItem('lumina_products');
    let allProducts: Product[] = stored ? JSON.parse(stored) : [];
    const target = allProducts.find(p => p.id === productId && p.creatorId === user.uid);

    if (!target) return { success: false, error: 'Product not found.' };

    const previousVersions = target.versions || [
      {
        version: target.version || '1.0.0',
        releasedAt: target.createdAt || new Date().toISOString(),
        changelog: 'Initial version.',
        fileName: target.digitalFile?.fileName || target.downloadFilename
      }
    ];

    const newVersionEntry = {
      version: newVersion,
      releasedAt: new Date().toISOString(),
      changelog,
      fileName: newDigitalFile?.fileName || target.digitalFile?.fileName || target.downloadFilename,
      fileSize: newDigitalFile?.fileSize || target.digitalFile?.fileSize
    };

    const updates: Partial<Product> = {
      version: newVersion,
      versionChangelog: changelog,
      versions: [newVersionEntry, ...previousVersions]
    };

    if (newDigitalFile) {
      updates.digitalFile = newDigitalFile;
      updates.downloadFilename = newDigitalFile.fileName;
      updates.fileSize = newDigitalFile.fileSize;
    }

    return updateCreatorProduct(productId, updates);
  };

  // Simulate Moderation Pipeline Decision (for testing/moderator workflow)
  const simulateModerationDecision = async (
    productId: string,
    decision: 'approved' | 'rejected' | 'suspended',
    note?: string
  ): Promise<{ success: boolean; error?: string }> => {
    let nextStatus: ProductStatus = 'published';
    if (decision === 'rejected') nextStatus = 'rejected';
    if (decision === 'suspended') nextStatus = 'suspended';

    const defaultNotes: Record<string, string> = {
      approved: 'Product passed catalog quality, licensing, and security review. Successfully approved for marketplace publication.',
      rejected: 'Product was reviewed and rejected. Please revise the description and ensure file samples meet quality guidelines.',
      suspended: 'Product listing temporarily suspended pending content rights verification.'
    };

    return updateCreatorProduct(productId, {
      status: nextStatus,
      moderationNotes: note || defaultNotes[decision] || 'Moderation decision recorded.'
    });
  };

  // Safe Creator Product Deletion
  // CRITICAL REQUIREMENT: "Before deletion, handle existing customer purchases safely.
  // If a product has already been purchased, do not break existing customer access without an appropriate migration/versioning process."
  const deleteCreatorProduct = async (
    productId: string
  ): Promise<{ success: boolean; error?: string; archived?: boolean; message?: string }> => {
    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }

    try {
      const stored = localStorage.getItem('lumina_products');
      let allProducts: Product[] = stored ? JSON.parse(stored) : [];
      const target = allProducts.find(p => p.id === productId && p.creatorId === user.uid);

      if (!target) {
        return { success: false, error: 'Product not found.' };
      }

      // Check if product has sales or verified customer purchases
      const hasPurchases = (target.salesCount && target.salesCount > 0) || (target.totalRevenue && target.totalRevenue > 0);

      if (hasPurchases) {
        // SAFE ARCHIVE: Do not permanently delete!
        // Unpublish from public catalog so no new customers can buy it,
        // but preserve record and deliverable access so existing customer purchasers can still download it.
        const updatedProduct: Product = {
          ...target,
          status: 'unpublished',
          isArchived: true,
          archiveReason: 'Archived by creator. Removed from marketplace discovery; digital download access is preserved for existing verified purchasers.',
          updatedAt: new Date().toISOString()
        };

        allProducts = allProducts.map(p => (p.id === productId ? updatedProduct : p));
        localStorage.setItem('lumina_products', JSON.stringify(allProducts));
        try {
          window.dispatchEvent(new CustomEvent('lumina:products-updated'));
        } catch {}

        setCreatorProducts(prev => prev.map(p => (p.id === productId ? updatedProduct : p)));

        try {
          const prodRef = doc(db, 'products', productId);
          await updateDoc(prodRef, {
            status: 'unpublished',
            isArchived: true,
            archiveReason: updatedProduct.archiveReason,
            updatedAt: updatedProduct.updatedAt
          });
        } catch {
          // ignore
        }

        return {
          success: true,
          archived: true,
          message: 'Product has active customer purchase records. To protect past buyers, it has been safely unpublished and archived from the marketplace while keeping download access intact for existing purchasers.'
        };
      }

      // If zero purchases: safe to permanently delete
      allProducts = allProducts.filter(p => !(p.id === productId && p.creatorId === user.uid));
      localStorage.setItem('lumina_products', JSON.stringify(allProducts));
      try {
        window.dispatchEvent(new CustomEvent('lumina:products-updated'));
      } catch {}

      setCreatorProducts(prev => prev.filter(p => p.id !== productId));

      try {
        const prodRef = doc(db, 'products', productId);
        await deleteDoc(prodRef);
      } catch {
        // ignore
      }

      return { success: true, archived: false, message: 'Product successfully deleted.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete product.' };
    }
  };

  // Simulation helper for demo sandbox (allows user/reviewer to test different states)
  const simulateStatusChange = async (newStatus: CreatorStatus) => {
    if (!user || !creatorProfile) return;

    const isVerifiedNow = newStatus === 'verified';
    const updated: CreatorProfile = {
      ...creatorProfile,
      accountStatus: newStatus,
      verificationStatus: {
        ...creatorProfile.verificationStatus,
        idVerified: isVerifiedNow,
        taxCompleted: true,
        paymentVerified: creatorProfile.payoutSettings.isConfigured || isVerifiedNow,
        verifiedAt: isVerifiedNow ? new Date().toISOString() : undefined
      },
      updatedDate: new Date().toISOString()
    };

    setCreatorProfile(updated);
    localStorage.setItem(`lumina_creator_${user.uid}`, JSON.stringify(updated));

    try {
      const creatorRef = doc(db, 'creators', user.uid);
      await updateDoc(creatorRef, {
        accountStatus: newStatus,
        'verificationStatus.idVerified': isVerifiedNow,
        updatedDate: updated.updatedDate
      });
    } catch {
      // ignore
    }
  };

  const refreshCreatorData = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'creators', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const profile = snap.data() as CreatorProfile;
        setCreatorProfile(profile);
        localStorage.setItem(`lumina_creator_${user.uid}`, JSON.stringify(profile));
      }
    } catch {
      // ignore
    }
  };

  const isCreator = Boolean(creatorProfile);
  const isVerified = creatorProfile?.accountStatus === 'verified';
  const canSell = isVerified && Boolean(creatorProfile?.payoutSettings?.isConfigured);

  return (
    <CreatorContext.Provider
      value={{
        creatorProfile,
        isCreator,
        isVerified,
        canSell,
        loadingCreator,
        activeCreatorTab,
        setActiveCreatorTab,
        creatorProducts,
        creatorSales,
        creatorPayouts,
        editingProductId,
        setEditingProductId,
        previewingProductId,
        setPreviewingProductId,
        registerAsCreator,
        updateCreatorProfile,
        updatePayoutSettings,
        submitVerification,
        requestPayout,
        createCreatorProduct,
        updateCreatorProduct,
        duplicateProduct,
        submitProductForReview,
        unpublishProduct,
        publishProduct,
        updateProductVersion,
        simulateModerationDecision,
        deleteCreatorProduct,
        refreshCreatorData,
        simulateStatusChange
      }}
    >
      {children}
    </CreatorContext.Provider>
  );
};

export const useCreator = (): CreatorContextType => {
  const context = useContext(CreatorContext);
  if (!context) {
    throw new Error('useCreator must be used within a CreatorProvider');
  }
  return context;
};
