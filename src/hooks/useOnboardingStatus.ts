import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStatus {
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export function useOnboardingStatus(): OnboardingStatus {
  const { user } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const checkOnboardingStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('updated_at, created_at')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking onboarding status:', error);
          setHasCompletedOnboarding(true);
          setIsLoading(false);
          return;
        }

        // Check if profile was just created (within last 5 minutes)
        const createdAt = new Date(data.created_at);
        const now = new Date();
        const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
        
        // Also check localStorage for explicit completion
        const localCompleted = localStorage.getItem(`onboarding_completed_${user.id}`);
        
        setHasCompletedOnboarding(localCompleted === 'true' || diffMinutes > 5);
      } catch (error) {
        console.error('Error in onboarding check:', error);
        setHasCompletedOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const completeOnboarding = useCallback(async () => {
    if (!user) return;
    
    localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    setHasCompletedOnboarding(true);
  }, [user]);

  const resetOnboarding = useCallback(async () => {
    if (!user) return;
    
    localStorage.removeItem(`onboarding_completed_${user.id}`);
    setHasCompletedOnboarding(false);
  }, [user]);

  return {
    hasCompletedOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  };
}
