import { buildApiUrl } from "../config/api";

interface CreatePlanResponse {
  planId: string;
  planName: string;
  amount: number;
  currency: string;
}

interface CreateSubscriptionResponse {
  subscriptionId: string;
  status: string;
  currentEnd: number;
  shortUrl: string;
}

interface VerifySubscriptionRequest {
  razorpay_subscription_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan: 'individual' | 'organization';
}

interface SubscriptionDetails {
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  nextBillingDate?: string;
  isRecurring?: boolean;
  isValid: boolean;
  message: string;
  remainingDays: number;
}

interface UsageDetails {
  scriptsGenerated: number;
  scriptsGeneratedThisMonth: number;
  lastResetDate: string;
  limit: number;
  percentage: number;
  remaining: number;
  hasExceeded: boolean;
}

interface SubscriptionResponse {
  subscription: SubscriptionDetails;
  usage: UsageDetails;
}

interface CheckSubscriptionResponse {
  status: string;
  plan: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  remainingDays: number;
  isRecurring: boolean;
  paymentMethod: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  limits: {
    scriptsPerMonth: number;
    templates: string;
    support: string;
  };
}

export class SubscriptionService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`
    };
  }

  /**
   * Create a subscription plan
   * @param plan Plan type ('individual' or 'organization')
   */
  async createPlan(plan: 'individual' | 'organization'): Promise<CreatePlanResponse> {
    const response = await fetch(buildApiUrl('/subscription/create-plan'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ plan })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create plan');
    }

    return response.json();
  }

  /**
   * Create a subscription with a plan
   * @param planId The Razorpay plan ID
   * @param plan Plan type ('individual' or 'organization')
   */
  async createSubscription(planId: string, plan: 'individual' | 'organization'): Promise<CreateSubscriptionResponse> {
    const response = await fetch(buildApiUrl('/subscription/create-subscription'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ planId, plan })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create subscription');
    }

    return response.json();
  }

  /**
   * Verify a subscription payment
   * @param data Verification data from Razorpay
   */
  async verifySubscription(data: VerifySubscriptionRequest): Promise<{ message: string; subscription: SubscriptionDetails }> {
    const response = await fetch(buildApiUrl('/subscription/verify-subscription'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify subscription');
    }

    return response.json();
  }

  /**
   * Get current subscription status
   */
  async getSubscription(): Promise<SubscriptionResponse> {
    const response = await fetch(buildApiUrl('/subscription'), {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get subscription');
    }

    return response.json();
  }

  /**
   * Check subscription status from Razorpay
   */
  async checkSubscription(): Promise<CheckSubscriptionResponse> {
    const response = await fetch(buildApiUrl('/subscription/check-subscription'), {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to check subscription');
    }

    return response.json();
  }

  /**
   * Cancel subscription
   * @param endOfCycle Whether to keep subscription active until end of billing cycle
   */
  async cancelSubscription(endOfCycle: boolean = false): Promise<{ message: string; subscription: { status: string; endDate: string } }> {
    const response = await fetch(buildApiUrl(`/subscription?endOfCycle=${endOfCycle}`), {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel subscription');
    }

    return response.json();
  }

  /**
   * Get subscription usage statistics
   */
  async getUsage(): Promise<{ current: number; limit: number; percentage: number; total: number; resetDate: string }> {
    const response = await fetch(buildApiUrl('/subscription/usage'), {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get usage statistics');
    }

    return response.json();
  }

  /**
   * Get available subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await fetch(buildApiUrl('/subscription/plans'), {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get subscription plans');
    }

    return response.json();
  }
}

export default SubscriptionService;
