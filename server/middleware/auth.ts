import { Request, Response, NextFunction } from 'express';
import https from 'https';
import crypto from 'crypto';
import { getAdminAuth } from '../firebaseAdmin';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  role?: string;
  admin?: boolean;
  [key: string]: any;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * In-memory cache for Google's public x509 certificates for token verification fallback
 */
let cachedGoogleCerts: Record<string, string> | null = null;
let googleCertsExpiry = 0;

async function getGooglePublicCerts(): Promise<Record<string, string>> {
  if (cachedGoogleCerts && Date.now() < googleCertsExpiry) {
    return cachedGoogleCerts;
  }
  return new Promise((resolve, reject) => {
    https
      .get(
        'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
        (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const certs = JSON.parse(data);
              cachedGoogleCerts = certs;
              const cacheControl = res.headers['cache-control'] || '';
              const match = cacheControl.match(/max-age=(\d+)/);
              const maxAgeSec = match ? parseInt(match[1], 10) : 21600;
              googleCertsExpiry = Date.now() + maxAgeSec * 1000;
              resolve(certs);
            } catch (e) {
              reject(e);
            }
          });
        }
      )
      .on('error', reject);
  });
}

/**
 * Robust Firebase ID Token Verifier:
 * 1. Primary: Uses Firebase Admin SDK with checkRevoked=false.
 *    (Passing checkRevoked=true triggers a call to Google Identity Toolkit which throws auth/internal-error
 *    when running without private service account credentials).
 * 2. Fallback: Cryptographically verifies RS256 signature against Google's public x509 certs
 *    if the Admin SDK encounters an internal error or connectivity issue.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<AuthenticatedUser> {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    'lumina-digital-71601';

  // 1. Primary verification via Firebase Admin SDK
  try {
    const adminAuth = getAdminAuth();
    // Do NOT pass checkRevoked=true; passing true causes auth/internal-error in environments without ADC credentials
    const decodedToken = await adminAuth.verifyIdToken(idToken, false);
    return decodedToken as unknown as AuthenticatedUser;
  } catch (adminError: any) {
    // If it's an explicit expired or argument error, propagate immediately
    if (
      adminError.code === 'auth/id-token-expired' ||
      adminError.code === 'auth/argument-error' ||
      adminError.code === 'auth/invalid-id-token'
    ) {
      throw adminError;
    }

    console.warn(
      '[Auth Middleware] Admin SDK verification notice (' +
        (adminError.code || adminError.message) +
        '), attempting cryptographic fallback verification.'
    );

    // 2. Cryptographic Fallback Verification using Google Public Certificates
    try {
      const parts = idToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Malformed JWT structure');
      }

      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      const signature = parts[2];

      if (header.alg !== 'RS256' || !header.kid) {
        throw new Error('Invalid JWT algorithm or missing kid header');
      }

      if (payload.aud !== projectId) {
        throw new Error(`Audience mismatch: expected ${projectId}, got ${payload.aud}`);
      }

      const expectedIss = `https://securetoken.google.com/${projectId}`;
      if (payload.iss !== expectedIss) {
        throw new Error(`Issuer mismatch: expected ${expectedIss}, got ${payload.iss}`);
      }

      const now = Math.floor(Date.now() / 1000);
      if (typeof payload.exp !== 'number' || payload.exp < now) {
        throw new Error('Firebase ID token has expired');
      }

      if (!payload.sub || typeof payload.sub !== 'string') {
        throw new Error('Firebase ID token missing subject UID');
      }

      const certs = await getGooglePublicCerts();
      const cert = certs[header.kid];
      if (!cert) {
        throw new Error(`No matching public key found for kid ${header.kid}`);
      }

      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(`${parts[0]}.${parts[1]}`);
      const isValid = verifier.verify(cert, signature, 'base64url');

      if (!isValid) {
        throw new Error('Cryptographic signature verification failed');
      }

      return {
        uid: payload.sub,
        email: payload.email,
        email_verified: payload.email_verified,
        name: payload.name,
        role: payload.role,
        admin: payload.admin,
        ...payload
      };
    } catch (fallbackError: any) {
      console.warn('[Auth Middleware] Cryptographic fallback also failed:', fallbackError.message);
      throw adminError;
    }
  }
}

/**
 * Validates whether a verified Firebase token belongs to the authorized owner.
 * Prioritizes:
 * 1. OWNER_UID environment variable
 * 2. Firebase Custom Claims ('owner' or admin === true)
 * 3. OWNER_EMAIL environment variable / verified owner email ('raj.nikhil0556@gmail.com')
 */
export function isOwnerUser(user?: AuthenticatedUser): boolean {
  if (!user || !user.uid) {
    return false;
  }

  const configuredOwnerUid = process.env.OWNER_UID?.trim();
  if (configuredOwnerUid && user.uid === configuredOwnerUid) {
    return true;
  }

  // Check verified custom claims
  if (user.role === 'owner' || user.admin === true) {
    return true;
  }

  // Check verified owner email (aligned with customer care support email)
  const configuredOwnerEmail = (
    process.env.OWNER_EMAIL?.trim() ||
    process.env.SUPPORT_EMAIL?.trim() ||
    'raj.nikhil0556@gmail.com'
  ).toLowerCase();
  if (
    user.email &&
    user.email.toLowerCase() === configuredOwnerEmail &&
    user.email_verified !== false
  ) {
    return true;
  }

  return false;
}

/**
 * Middleware: Verifies the Firebase ID token in Authorization header.
 * Attaches decoded user to req.user.
 * Returns 401 if missing, invalid, or expired.
 */
export async function requireAuthenticatedUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication token required. Please sign in.'
    });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();
  if (!idToken) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Invalid bearer token format.'
    });
    return;
  }

  try {
    const user = await verifyFirebaseIdToken(idToken);
    req.user = user;
    next();
  } catch (error: any) {
    console.warn('[Auth Middleware] Token verification failed:', error.code || error.message);
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Invalid or expired authentication token. Please sign in again.'
    });
  }
}

/**
 * Middleware: Strictly enforces Owner-only authorization.
 * Verifies ID token with Firebase Admin SDK and checks owner credentials.
 * Returns 401 if unauthenticated, 403 if authenticated but not owner.
 */
export async function requireOwner(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication required to access admin control panel.'
    });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();
  if (!idToken) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Bearer token is missing or malformed.'
    });
    return;
  }

  try {
    const user = await verifyFirebaseIdToken(idToken);
    req.user = user;

    if (!isOwnerUser(req.user)) {
      console.warn(`[Security Alert] Non-owner access attempt rejected: UID=${req.user.uid}, email=${req.user.email}`);
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Owner access required. This area is restricted to the store owner.'
      });
      return;
    }

    next();
  } catch (error: any) {
    console.warn('[Security Notice] Owner verification failed:', error.code || error.message);
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication failed or session expired. Please sign in again.'
    });
  }
}
