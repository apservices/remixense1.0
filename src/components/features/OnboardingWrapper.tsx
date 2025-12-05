import { useState, useEffect } from 'react';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { Onboarding } from '@/components/Onboarding';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const { hasCompletedOnboarding, isLoading, completeOnboarding } = useOnboardingStatus();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [isLoading, hasCompletedOnboarding]);

  const handleComplete = async () => {
    await completeOnboarding();
    setShowOnboarding(false);
  };

  if (isLoading) {
    return <>{children}</>;
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleComplete} />;
  }

  return <>{children}</>;
}
