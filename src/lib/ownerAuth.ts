import { User } from 'firebase/auth';

export interface OwnerCheckResult {
  authorized: boolean;
  role?: string;
  email?: string;
  uid?: string;
  error?: string;
  status?: number;
}

// In-memory verification cache (NEVER persisted to localStorage or sessionStorage)
let cachedAuthToken: string | null = null;
let cachedResult: OwnerCheckResult | null = null;
let activeVerificationPromise: Promise<OwnerCheckResult> | null = null;

/**
 * Checks server-side owner authorization via GET /api/admin/me.
 * Sends the Firebase ID token in Authorization header.
 * Backend verifies token with Firebase Admin SDK and validates OWNER_UID / claims.
 */
export async function verifyOwnerWithServer(user: User | null, forceRefresh = false): Promise<OwnerCheckResult> {
  if (!user) {
    clearOwnerAuthCache();
    return { authorized: false, error: 'Not authenticated', status: 401 };
  }

  try {
    const idToken = await user.getIdToken(forceRefresh);

    if (!forceRefresh && cachedAuthToken === idToken && cachedResult) {
      return cachedResult;
    }

    if (activeVerificationPromise && !forceRefresh) {
      return await activeVerificationPromise;
    }

    activeVerificationPromise = (async () => {
      try {
        const response = await fetch('/api/admin/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const result: OwnerCheckResult = {
            authorized: Boolean(data.authorized && data.role === 'owner'),
            role: data.role,
            email: data.email,
            uid: data.uid,
            status: 200
          };
          cachedAuthToken = idToken;
          cachedResult = result;
          return result;
        }

        const errData = await response.json().catch(() => ({}));
        const failureResult: OwnerCheckResult = {
          authorized: false,
          error: errData.message || (response.status === 403 ? 'Owner authorization required.' : 'Authentication failed.'),
          status: response.status
        };
        cachedAuthToken = idToken;
        cachedResult = failureResult;
        return failureResult;
      } catch (err: any) {
        return {
          authorized: false,
          error: err.message || 'Network error verifying owner authorization.',
          status: 500
        };
      } finally {
        activeVerificationPromise = null;
      }
    })();

    return await activeVerificationPromise;
  } catch (err: any) {
    return {
      authorized: false,
      error: err.message || 'Failed to retrieve Firebase ID token.',
      status: 401
    };
  }
}

/**
 * Clears in-memory owner authorization state upon logout or session termination.
 */
export function clearOwnerAuthCache(): void {
  cachedAuthToken = null;
  cachedResult = null;
  activeVerificationPromise = null;
}
