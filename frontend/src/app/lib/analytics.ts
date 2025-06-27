// Analytics and monitoring utilities

interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  userId?: string;
  timestamp: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private userId?: string;

  setUserId(userId: string) {
    this.userId = userId;
  }

  track(event: string, properties: Record<string, any> = {}) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      },
      userId: this.userId,
      timestamp: Date.now(),
    };

    this.events.push(analyticsEvent);
    
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalyticsService(analyticsEvent);
    } else {
      console.log('Analytics Event:', analyticsEvent);
    }
  }

  private async sendToAnalyticsService(event: AnalyticsEvent) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  // Track specific DeFi events
  trackLoanCreated(loanAmount: number, propertyValue: number) {
    this.track('loan_created', {
      loan_amount: loanAmount,
      property_value: propertyValue,
      ltv: (loanAmount / propertyValue) * 100,
    });
  }

  trackPropertyMinted(propertyValue: number, propertyType: string) {
    this.track('property_minted', {
      property_value: propertyValue,
      property_type: propertyType,
    });
  }

  trackWalletConnected(address: string) {
    this.track('wallet_connected', {
      wallet_address: address.slice(0, 6) + '...' + address.slice(-4), // Privacy
    });
  }
}

export const analytics = new Analytics();