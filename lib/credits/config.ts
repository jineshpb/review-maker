/**
 * Credit System Configuration
 *
 * This is the CENTRAL SOURCE OF TRUTH for all credit plans, pricing, and limits.
 * Change values here to update plans across the entire application.
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Plan type - determines how credits are provided
 */
export enum PlanType {
  /** One-time credit pack purchase */
  CREDIT_PACK = "credit_pack",
  /** Recurring subscription with monthly credits */
  SUBSCRIPTION = "subscription",
  /** Free tier with limited credits */
  FREE = "free",
}

/**
 * Subscription billing interval
 */
export enum BillingInterval {
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

/**
 * Credit pack size tiers
 */
export enum CreditPackTier {
  STARTER = "starter",
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  XLARGE = "xlarge",
}

/**
 * Subscription tier names
 */
export enum SubscriptionTier {
  FREE = "free",
  STARTER = "starter",
  PRO = "pro",
  ENTERPRISE = "enterprise",
}

// ============================================================================
// TYPES
// ============================================================================

/**
 * Base plan configuration
 */
export interface BasePlan {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number; // in smallest currency unit (paise for INR, cents for USD)
  currency: "INR" | "USD";
}

/**
 * Credit pack plan (one-time purchase)
 */
export interface CreditPackPlan extends BasePlan {
  type: PlanType.CREDIT_PACK;
  tier: CreditPackTier;
  bonusCredits?: number; // Optional bonus credits for promotional packs
  expiresInDays?: number | null; // Credits expire after X days (null = no expiration)
}

/**
 * Subscription plan (recurring)
 */
export interface SubscriptionPlan extends BasePlan {
  type: PlanType.SUBSCRIPTION;
  tier: SubscriptionTier;
  interval: BillingInterval;
  creditsPerPeriod: number; // Credits per billing period
  rolloverLimit?: number | null; // Max credits that can rollover (null = unlimited)
  features: string[]; // List of features included
}

/**
 * Free tier plan
 */
export interface FreePlan extends BasePlan {
  type: PlanType.FREE;
  tier: SubscriptionTier.FREE;
  creditsPerMonth: number; // Credits reset monthly
}

/**
 * Union type for all plan types
 */
export type CreditPlan = CreditPackPlan | SubscriptionPlan | FreePlan;

// ============================================================================
// CREDIT PACK CONFIGURATIONS
// ============================================================================

/**
 * One-time credit pack plans
 * Users purchase credits that can be used anytime
 */
export const CREDIT_PACKS: Record<CreditPackTier, CreditPackPlan> = {
  [CreditPackTier.STARTER]: {
    id: "credit_starter",
    type: PlanType.CREDIT_PACK,
    tier: CreditPackTier.STARTER,
    name: "Starter Pack",
    description: "Perfect for trying out the service",
    credits: 20,
    bonusCredits: 0, // No bonus
    price: 500, // ₹5.00 (500 paise)
    currency: "INR",
    expiresInDays: null, // Credits never expire
  },
  [CreditPackTier.SMALL]: {
    id: "credit_small",
    type: PlanType.CREDIT_PACK,
    tier: CreditPackTier.SMALL,
    name: "Small Pack",
    description: "Great for occasional use",
    credits: 75,
    bonusCredits: 5, // 5 bonus credits
    price: 1500, // ₹15.00
    currency: "INR",
    expiresInDays: null,
  },
  [CreditPackTier.MEDIUM]: {
    id: "credit_medium",
    type: PlanType.CREDIT_PACK,
    tier: CreditPackTier.MEDIUM,
    name: "Medium Pack",
    description: "Best value for regular users",
    credits: 200,
    bonusCredits: 25, // 25 bonus credits (12.5% bonus)
    price: 3500, // ₹35.00
    currency: "INR",
    expiresInDays: null,
  },
  [CreditPackTier.LARGE]: {
    id: "credit_large",
    type: PlanType.CREDIT_PACK,
    tier: CreditPackTier.LARGE,
    name: "Large Pack",
    description: "For power users and teams",
    credits: 500,
    bonusCredits: 100, // 100 bonus credits (20% bonus)
    price: 8000, // ₹80.00
    currency: "INR",
    expiresInDays: null,
  },
  [CreditPackTier.XLARGE]: {
    id: "credit_xlarge",
    type: PlanType.CREDIT_PACK,
    tier: CreditPackTier.XLARGE,
    name: "XL Pack",
    description: "Maximum value for heavy usage",
    credits: 1000,
    bonusCredits: 250, // 250 bonus credits (25% bonus)
    price: 15000, // ₹150.00
    currency: "INR",
    expiresInDays: null,
  },
};

// ============================================================================
// SUBSCRIPTION PLANS CONFIGURATIONS
// ============================================================================

/**
 * Monthly subscription plans
 */
export const MONTHLY_SUBSCRIPTIONS: Record<SubscriptionTier, SubscriptionPlan> =
  {
    [SubscriptionTier.FREE]: {
      id: "sub_free_monthly",
      type: PlanType.SUBSCRIPTION,
      tier: SubscriptionTier.FREE,
      interval: BillingInterval.MONTHLY,
      name: "Free Plan",
      description: "Perfect for getting started",
      credits: 10,
      creditsPerPeriod: 10, // 10 credits per month
      price: 0,
      currency: "INR",
      rolloverLimit: 0, // No rollover for free tier
      features: [
        "10 credits per month",
        "Basic templates",
        "Standard resolution exports",
      ],
    },
    [SubscriptionTier.STARTER]: {
      id: "sub_starter_monthly",
      type: PlanType.SUBSCRIPTION,
      tier: SubscriptionTier.STARTER,
      interval: BillingInterval.MONTHLY,
      name: "Starter",
      description: "For regular users",
      credits: 100,
      creditsPerPeriod: 100, // 100 credits per month
      price: 1200, // ₹12.00/month
      currency: "INR",
      rolloverLimit: 200, // Can accumulate up to 200 credits
      features: [
        "100 credits per month",
        "All templates",
        "High resolution exports",
        "Credit rollover (up to 200)",
        "Priority support",
      ],
    },
    [SubscriptionTier.PRO]: {
      id: "sub_pro_monthly",
      type: PlanType.SUBSCRIPTION,
      tier: SubscriptionTier.PRO,
      interval: BillingInterval.MONTHLY,
      name: "Pro",
      description: "For power users and small teams",
      credits: 500,
      creditsPerPeriod: 500, // 500 credits per month
      price: 4900, // ₹49.00/month
      currency: "INR",
      rolloverLimit: 1000, // Can accumulate up to 1000 credits
      features: [
        "500 credits per month",
        "All templates",
        "Ultra high resolution exports",
        "Credit rollover (up to 1000)",
        "Priority support",
        "API access",
        "Custom branding",
      ],
    },
    [SubscriptionTier.ENTERPRISE]: {
      id: "sub_enterprise_monthly",
      type: PlanType.SUBSCRIPTION,
      tier: SubscriptionTier.ENTERPRISE,
      interval: BillingInterval.MONTHLY,
      name: "Enterprise",
      description: "For large teams and agencies",
      credits: 2000,
      creditsPerPeriod: 2000, // 2000 credits per month
      price: 19900, // ₹199.00/month
      currency: "INR",
      rolloverLimit: null, // Unlimited rollover
      features: [
        "2000 credits per month",
        "Everything in Pro",
        "Unlimited credit rollover",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
        "Team management",
      ],
    },
  };

/**
 * Yearly subscription plans (with discount)
 */
export const YEARLY_SUBSCRIPTIONS: Record<SubscriptionTier, SubscriptionPlan> =
  {
    [SubscriptionTier.FREE]: {
      ...MONTHLY_SUBSCRIPTIONS[SubscriptionTier.FREE],
      id: "sub_free_yearly",
      interval: BillingInterval.YEARLY,
      price: 0,
    },
    [SubscriptionTier.STARTER]: {
      ...MONTHLY_SUBSCRIPTIONS[SubscriptionTier.STARTER],
      id: "sub_starter_yearly",
      interval: BillingInterval.YEARLY,
      price: 12000, // ₹120.00/year (save ₹24, 2 months free)
      creditsPerPeriod: 1200, // 100 credits × 12 months
    },
    [SubscriptionTier.PRO]: {
      ...MONTHLY_SUBSCRIPTIONS[SubscriptionTier.PRO],
      id: "sub_pro_yearly",
      interval: BillingInterval.YEARLY,
      price: 49000, // ₹490.00/year (save ₹98, 2 months free)
      creditsPerPeriod: 6000, // 500 credits × 12 months
    },
    [SubscriptionTier.ENTERPRISE]: {
      ...MONTHLY_SUBSCRIPTIONS[SubscriptionTier.ENTERPRISE],
      id: "sub_enterprise_yearly",
      interval: BillingInterval.YEARLY,
      price: 199000, // ₹1990.00/year (save ₹398, 2 months free)
      creditsPerPeriod: 24000, // 2000 credits × 12 months
    },
  };

// ============================================================================
// FREE PLAN CONFIGURATION
// ============================================================================

export const FREE_PLAN: FreePlan = {
  id: "free",
  type: PlanType.FREE,
  tier: SubscriptionTier.FREE,
  name: "Free",
  description: "Get started with free credits",
  credits: 10,
  creditsPerMonth: 10,
  price: 0,
  currency: "INR",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all credit pack plans
 */
export function getAllCreditPacks(): CreditPackPlan[] {
  return Object.values(CREDIT_PACKS);
}

/**
 * Get credit pack by tier
 */
export function getCreditPackByTier(tier: CreditPackTier): CreditPackPlan {
  return CREDIT_PACKS[tier];
}

/**
 * Get credit pack by ID
 */
export function getCreditPackById(id: string): CreditPackPlan | undefined {
  return Object.values(CREDIT_PACKS).find((pack) => pack.id === id);
}

/**
 * Get subscription plan by tier and interval
 */
export function getSubscriptionPlan(
  tier: SubscriptionTier,
  interval: BillingInterval
): SubscriptionPlan {
  if (interval === BillingInterval.YEARLY) {
    return YEARLY_SUBSCRIPTIONS[tier];
  }
  return MONTHLY_SUBSCRIPTIONS[tier];
}

/**
 * Get subscription plan by ID
 */
export function getSubscriptionById(id: string): SubscriptionPlan | undefined {
  const allSubs = [
    ...Object.values(MONTHLY_SUBSCRIPTIONS),
    ...Object.values(YEARLY_SUBSCRIPTIONS),
  ];
  return allSubs.find((sub) => sub.id === id);
}

/**
 * Get all subscription plans
 */
export function getAllSubscriptions(): SubscriptionPlan[] {
  return [
    ...Object.values(MONTHLY_SUBSCRIPTIONS),
    ...Object.values(YEARLY_SUBSCRIPTIONS),
  ];
}

/**
 * Get plan by ID (works for both credit packs and subscriptions)
 */
export function getPlanById(id: string): CreditPlan | undefined {
  // Try credit packs first
  const creditPack = getCreditPackById(id);
  if (creditPack) return creditPack;

  // Try subscriptions
  const subscription = getSubscriptionById(id);
  if (subscription) return subscription;

  // Try free plan
  if (id === FREE_PLAN.id) return FREE_PLAN;

  return undefined;
}

/**
 * Calculate total credits including bonus for a credit pack
 */
export function getTotalCreditsForPack(pack: CreditPackPlan): number {
  return pack.credits + (pack.bonusCredits || 0);
}

/**
 * Calculate price per credit for a plan
 */
export function getPricePerCredit(plan: CreditPlan): number {
  if (plan.price === 0) return 0;

  if (plan.type === PlanType.CREDIT_PACK) {
    const totalCredits = getTotalCreditsForPack(plan);
    return plan.price / totalCredits;
  }

  if (plan.type === PlanType.SUBSCRIPTION) {
    return plan.price / plan.creditsPerPeriod;
  }

  return 0;
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: "INR" | "USD"): string {
  if (currency === "INR") {
    return `₹${(price / 100).toFixed(2)}`;
  }
  return `$${(price / 100).toFixed(2)}`;
}

/**
 * Get all plans sorted by price (ascending)
 */
export function getAllPlansSortedByPrice(): CreditPlan[] {
  const allPlans: CreditPlan[] = [
    FREE_PLAN,
    ...getAllCreditPacks(),
    ...getAllSubscriptions(),
  ];

  return allPlans.sort((a, b) => a.price - b.price);
}

// ============================================================================
// OPERATION COSTS (CREDITS PER ACTION)
// ============================================================================
//
// ⚠️ THIS IS THE SINGLE SOURCE OF TRUTH FOR ALL OPERATION COSTS
// Change values here to update costs across the entire application
//
// Keep it simple - one place to change, affects everywhere!

/**
 * Credits required per action
 *
 * @example
 * // To change AI generation cost from 10 to 15 credits:
 * AI_GENERATE: 15,
 */
export const CREDITS_PER_ACTION = {
  /** Generate/download a single screenshot */
  SCREENSHOT: 1,

  /** Use AI to generate review content */
  AI_GENERATE: 5,

  // Future operations can be added here:
  // HIGH_RES_EXPORT: 2,
  // ULTRA_HIGH_RES_EXPORT: 5,
} as const;

/**
 * Type for action names (for type safety)
 */
export type CreditAction = keyof typeof CREDITS_PER_ACTION;

/**
 * Get cost for a specific action
 *
 * @example
 * const cost = getActionCost('SCREENSHOT'); // Returns 1
 * const aiCost = getActionCost('AI_GENERATE'); // Returns 10
 */
export function getActionCost(action: CreditAction): number {
  return CREDITS_PER_ACTION[action];
}

/**
 * Check if user has enough credits for an action
 *
 * @example
 * if (hasEnoughCredits(userCredits, 'SCREENSHOT')) {
 *   // Proceed with screenshot generation
 * }
 */
export function hasEnoughCredits(
  userCredits: number,
  action: CreditAction
): boolean {
  return userCredits >= CREDITS_PER_ACTION[action];
}

/**
 * Calculate total credits needed for multiple actions
 *
 * @example
 * const total = calculateCreditsNeeded([
 *   { action: 'SCREENSHOT', count: 5 },    // 5 credits
 *   { action: 'AI_GENERATE', count: 2 }    // 20 credits
 * ]); // Returns 25
 */
export function calculateCreditsNeeded(
  actions: Array<{ action: CreditAction; count: number }>
): number {
  return actions.reduce((total, { action, count }) => {
    return total + CREDITS_PER_ACTION[action] * count;
  }, 0);
}
