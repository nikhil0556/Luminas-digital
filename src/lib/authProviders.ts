import {
  AuthProvider,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  User
} from 'firebase/auth';

export interface SupportedProviderConfig {
  id: string; // e.g. 'google.com', 'github.com', 'microsoft.com', 'apple.com', 'password'
  name: string;
  badgeName: string;
  iconType: 'google' | 'github' | 'microsoft' | 'apple' | 'email';
  enabled: boolean;
  createProvider?: () => AuthProvider;
  buttonLabel?: string;
  description?: string;
}

/**
 * Extensible Provider Registry
 * Allows adding more identity providers (GitHub, Microsoft, Apple, etc.) seamlessly
 * while Google and Email+Password are fully activated and active.
 */
export const AUTH_PROVIDERS: SupportedProviderConfig[] = [
  {
    id: 'google.com',
    name: 'Google',
    badgeName: 'Google Account',
    iconType: 'google',
    enabled: true,
    createProvider: () => {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      return provider;
    },
    buttonLabel: 'Continue with Google',
    description: 'Instant 1-click sign in with your Google account'
  },
  {
    id: 'password',
    name: 'Email & Password',
    badgeName: 'Email Credentials',
    iconType: 'email',
    enabled: true,
    buttonLabel: 'Sign in with Email',
    description: 'Traditional credentials with password recovery and verification'
  },
  {
    id: 'github.com',
    name: 'GitHub',
    badgeName: 'GitHub Account',
    iconType: 'github',
    enabled: false, // Configured for easy extension once client keys are provisioned
    createProvider: () => new GithubAuthProvider(),
    buttonLabel: 'Continue with GitHub',
    description: 'Developer sign-in via GitHub OAuth'
  },
  {
    id: 'microsoft.com',
    name: 'Microsoft',
    badgeName: 'Microsoft Account',
    iconType: 'microsoft',
    enabled: false,
    createProvider: () => new OAuthProvider('microsoft.com'),
    buttonLabel: 'Continue with Microsoft',
    description: 'Enterprise / Personal Microsoft identity'
  },
  {
    id: 'apple.com',
    name: 'Apple',
    badgeName: 'Apple ID',
    iconType: 'apple',
    enabled: false,
    createProvider: () => new OAuthProvider('apple.com'),
    buttonLabel: 'Continue with Apple',
    description: 'Sign in with Apple ID'
  }
];

/**
 * Helper to inspect all linked provider IDs on a Firebase user instance
 */
export function getLinkedProviderIds(user: User | null): string[] {
  if (!user || !user.providerData) return [];
  const providers = user.providerData.map(p => p.providerId).filter(Boolean);
  return Array.from(new Set(providers));
}

/**
 * Check if the user can safely unlink a provider without losing account access
 */
export function canUnlinkProvider(user: User | null): boolean {
  if (!user || !user.providerData) return false;
  // A user can unlink only if they have 2 or more providers linked
  return user.providerData.length >= 2;
}

/**
 * Standardized Firebase Auth error translator
 * Translates cryptic codes into clear, empathetic, and actionable messages.
 */
export function getAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const code = typeof error === 'string' ? error : error?.code || '';
  const message = error?.message || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in or use Forgot Password to reset.';

    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address using different sign-in credentials. Please sign in with your existing method (e.g. Email & Password), then link this provider in your Account Settings.';

    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials and try again.';

    case 'auth/user-not-found':
      return 'No account found with this email address. Please create a free account to get started.';

    case 'auth/invalid-email':
      return 'Please enter a valid email address (e.g., name@example.com).';

    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';

    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in popup was closed before completion. Please try again.';

    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.';

    case 'auth/too-many-requests':
      return 'Too many attempts. Access to this account has been temporarily disabled. Please reset your password or try again later.';

    case 'auth/requires-recent-login':
      return 'For your security, this sensitive action requires a fresh login. Please sign out and sign in again before continuing.';

    case 'auth/credential-already-in-use':
      return 'This provider account is already linked to another user on Lumina Digital.';

    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection and try again.';

    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact customer support.';

    case 'auth/operation-not-allowed':
      return 'This sign-in method is currently disabled in your Firebase project. Please enable "Email/Password" and "Google" in the Firebase Console under Authentication > Sign-in method.';

    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Firebase Auth. Please add this domain to Firebase Console > Authentication > Settings > Authorized domains.';

    default:
      if (message.includes('popup-closed')) {
        return 'Sign-in was interrupted. Please try again.';
      }
      return message || 'Authentication failed. Please verify your credentials and try again.';
  }
}
