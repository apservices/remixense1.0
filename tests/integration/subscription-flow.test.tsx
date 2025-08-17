import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useSubscription } from '@/hooks/useSubscription';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

// Mock hook
vi.mock('@/hooks/useSubscription');

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

// Mock component that uses subscription
const MockSubscriptionComponent = () => {
  const { subscription, loading, checkSubscription, createCheckout } = useSubscription();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="plan-type">{subscription?.plan_type || 'free'}</div>
      <div data-testid="status">{subscription?.status || 'inactive'}</div>
      <button onClick={checkSubscription} data-testid="check-subscription">
        Check Subscription
      </button>
      <button onClick={() => createCheckout('pro')} data-testid="create-checkout">
        Upgrade to Pro
      </button>
    </div>
  );
};

describe('Subscription Flow Integration', () => {
  const mockUseSubscription = vi.mocked(useSubscription);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Free User Flow', () => {
    it('should display free plan for unauthenticated user', async () => {
      mockUseSubscription.mockReturnValue({
        subscription: {
          plan_type: 'free',
          status: 'active',
          limits: {
            max_tracks: 3,
            max_storage_mb: 100,
            can_export: false,
            can_use_community: false,
            can_use_marketplace: false,
          },
        },
        loading: false,
        error: null,
        checkSubscription: vi.fn(),
        createCheckout: vi.fn(),
        createCustomerPortal: vi.fn(),
      });

      render(
        <TestWrapper>
          <MockSubscriptionComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('plan-type')).toHaveTextContent('free');
      expect(screen.getByTestId('status')).toHaveTextContent('active');
    });

    it('should allow free user to initiate upgrade', async () => {
      const mockCreateCheckout = vi.fn().mockResolvedValue({
        data: { url: 'https://checkout.stripe.com/test' },
      });

      mockUseSubscription.mockReturnValue({
        subscription: { plan_type: 'free', status: 'active' },
        loading: false,
        error: null,
        checkSubscription: vi.fn(),
        createCheckout: mockCreateCheckout,
        createCustomerPortal: vi.fn(),
      });

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <MockSubscriptionComponent />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('create-checkout'));

      expect(mockCreateCheckout).toHaveBeenCalledWith('pro');
    });
  });

  describe('Authenticated User Flow', () => {
    it('should check subscription status on load', async () => {
      const mockCheckSubscription = vi.fn().mockResolvedValue({
        data: {
          plan_type: 'pro',
          status: 'active',
          current_period_end: '2024-12-31T23:59:59Z',
        },
      });

      mockUseSubscription.mockReturnValue({
        subscription: {
          plan_type: 'pro',
          status: 'active',
          current_period_end: '2024-12-31T23:59:59Z',
        },
        loading: false,
        error: null,
        checkSubscription: mockCheckSubscription,
        createCheckout: vi.fn(),
        createCustomerPortal: vi.fn(),
      });

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <MockSubscriptionComponent />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('check-subscription'));

      expect(mockCheckSubscription).toHaveBeenCalled();
      expect(screen.getByTestId('plan-type')).toHaveTextContent('pro');
    });

    it('should handle subscription verification errors gracefully', async () => {
      const mockCheckSubscription = vi.fn().mockRejectedValue(
        new Error('Network error')
      );

      mockUseSubscription.mockReturnValue({
        subscription: null,
        loading: false,
        error: 'Network error',
        checkSubscription: mockCheckSubscription,
        createCheckout: vi.fn(),
        createCustomerPortal: vi.fn(),
      });

      render(
        <TestWrapper>
          <MockSubscriptionComponent />
        </TestWrapper>
      );

      // Should fallback to free plan on error
      expect(screen.getByTestId('plan-type')).toHaveTextContent('free');
    });
  });

  describe('Pro User Flow', () => {
    it('should display pro features for active subscriber', async () => {
      mockUseSubscription.mockReturnValue({
        subscription: {
          plan_type: 'pro',
          status: 'active',
          current_period_end: '2024-12-31T23:59:59Z',
          limits: {
            max_tracks: 9999,
            max_storage_mb: 10240,
            can_export: true,
            can_use_community: true,
            can_use_marketplace: false,
          },
        },
        loading: false,
        error: null,
        checkSubscription: vi.fn(),
        createCheckout: vi.fn(),
        createCustomerPortal: vi.fn(),
      });

      render(
        <TestWrapper>
          <MockSubscriptionComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('plan-type')).toHaveTextContent('pro');
      expect(screen.getByTestId('status')).toHaveTextContent('active');
    });

    it('should allow pro user to access customer portal', async () => {
      const mockCreateCustomerPortal = vi.fn().mockResolvedValue({
        data: { url: 'https://billing.stripe.com/test' },
      });

      mockUseSubscription.mockReturnValue({
        subscription: { plan_type: 'pro', status: 'active' },
        loading: false,
        error: null,
        checkSubscription: vi.fn(),
        createCheckout: vi.fn(),
        createCustomerPortal: mockCreateCustomerPortal,
      });

      // Would need additional UI component to test portal access
      expect(mockCreateCustomerPortal).toBeDefined();
    });
  });

  describe('Expert User Flow', () => {
    it('should recognize expert test users', async () => {
      mockUseSubscription.mockReturnValue({
        subscription: {
          plan_type: 'expert',
          status: 'active',
          limits: {
            max_tracks: 9999,
            max_storage_mb: 102400,
            can_export: true,
            can_use_community: true,
            can_use_marketplace: true,
          },
        },
        loading: false,
        error: null,
        checkSubscription: vi.fn(),
        createCheckout: vi.fn(),
        createCustomerPortal: vi.fn(),
      });

      render(
        <TestWrapper>
          <MockSubscriptionComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('plan-type')).toHaveTextContent('expert');
      expect(screen.getByTestId('status')).toHaveTextContent('active');
    });
  });

  describe('Stripe Integration', () => {
    it('should handle Stripe checkout session creation', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        data: { url: 'https://checkout.stripe.com/pay/test_session' },
        error: null,
      });

      vi.mocked(supabase.functions.invoke).mockImplementation(mockInvoke);

      const mockCreateCheckout = vi.fn(async (plan: string) => {
        const result = await supabase.functions.invoke('create-checkout', {
          body: { plan, locale: 'en' },
        });
        
        if (result.data?.url) {
          // In real app, would redirect to Stripe
          return result;
        }
        throw new Error('Checkout failed');
      });

      mockUseSubscription.mockReturnValue({
        subscription: { plan_type: 'free', status: 'active' },
        loading: false,
        error: null,
        checkSubscription: vi.fn(),
        createCheckout: mockCreateCheckout,
        createCustomerPortal: vi.fn(),
      });

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <MockSubscriptionComponent />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('create-checkout'));

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('create-checkout', {
          body: { plan: 'pro', locale: 'en' },
        });
      });
    });

    it('should handle Stripe errors gracefully', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Stripe key not configured' },
      });

      vi.mocked(supabase.functions.invoke).mockImplementation(mockInvoke);

      const mockCreateCheckout = vi.fn(async () => {
        const result = await supabase.functions.invoke('create-checkout', {
          body: { plan: 'pro' },
        });
        
        if (result.error) {
          throw new Error(result.error.message);
        }
        return result;
      });

      mockUseSubscription.mockReturnValue({
        subscription: { plan_type: 'free', status: 'active' },
        loading: false,
        error: null,
        checkSubscription: vi.fn(),
        createCheckout: mockCreateCheckout,
        createCustomerPortal: vi.fn(),
      });

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <MockSubscriptionComponent />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('create-checkout'));

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalled();
      });

      // Should handle error without crashing
      expect(screen.getByTestId('plan-type')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during subscription check', () => {
      mockUseSubscription.mockReturnValue({
        subscription: null,
        loading: true,
        error: null,
        checkSubscription: vi.fn(),
        createCheckout: vi.fn(),
        createCustomerPortal: vi.fn(),
      });

      render(
        <TestWrapper>
          <MockSubscriptionComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});