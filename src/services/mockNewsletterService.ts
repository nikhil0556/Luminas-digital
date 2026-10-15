/**
 * Mock Newsletter & Waitlist Service
 * Simulates an enterprise email marketing & lead-capture service (e.g., Mailchimp, Loops, ConvertKit, Beehiiv)
 * Provides persistent local lead storage, email validation, duplicate detection, and position generation.
 */

export interface WaitlistLead {
  id: string;
  email: string;
  createdAt: string;
  source: string;
  waitlistPosition: number;
  referralCode: string;
  perksUnlocked: string[];
}

export interface WaitlistResponse {
  success: boolean;
  message: string;
  lead?: WaitlistLead;
  alreadyRegistered?: boolean;
}

const STORAGE_KEY = 'lumina_waitlist_leads';

const INITIAL_BASE_COUNT = 1420; // Starting baseline community waitlist count

// Helper to retrieve saved leads safely
export function getSavedWaitlistLeads(): WaitlistLead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading waitlist leads:', err);
    return [];
  }
}

// Helper to get total count including simulated base
export function getTotalWaitlistCount(): number {
  const customLeads = getSavedWaitlistLeads();
  return INITIAL_BASE_COUNT + customLeads.length;
}

/**
 * Asynchronously captures a user lead to the waitlist with simulated network latency,
 * duplicate handling, and rich lead response payload.
 */
export async function captureWaitlistLead(
  email: string,
  options: {
    source?: string;
    interest?: string;
  } = {}
): Promise<WaitlistResponse> {
  // Simulate network request latency (550ms)
  await new Promise(resolve => setTimeout(resolve, 550));

  const trimmedEmail = email.trim().toLowerCase();

  // Basic RFC email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    return {
      success: false,
      message: 'Please enter a valid email address (e.g., name@domain.com).'
    };
  }

  const existingLeads = getSavedWaitlistLeads();
  const existing = existingLeads.find(l => l.email === trimmedEmail);

  if (existing) {
    return {
      success: true,
      alreadyRegistered: true,
      message: `You're already on the VIP waitlist at #${existing.waitlistPosition}! We sent an early access link to your inbox.`,
      lead: existing
    };
  }

  const waitlistPosition = INITIAL_BASE_COUNT + existingLeads.length + 1;
  const referralCode = `LUMINA-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const newLead: WaitlistLead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email: trimmedEmail,
    createdAt: new Date().toISOString(),
    source: options.source || 'Home Page Waitlist',
    waitlistPosition,
    referralCode,
    perksUnlocked: [
      'Early Beta Drop Access (48h Headstart)',
      'Exclusive 35% Launch Discount Voucher',
      'Free 100+ AI Mega Prompt Pack'
    ]
  };

  const updatedLeads = [newLead, ...existingLeads];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
  } catch (err) {
    console.warn('Failed to persist waitlist lead to localStorage:', err);
  }

  return {
    success: true,
    message: `You're in! You've secured VIP Waitlist spot #${waitlistPosition}. Check your email for your welcome bundle.`,
    lead: newLead
  };
}
