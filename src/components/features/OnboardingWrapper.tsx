import { useState, useEffect } from 'react';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { useAuth } from '@/hooks/useAuth';
import { GuidedOnboarding } from '@/components/GuidedOnboarding';
import { ProfileCompletionModal } from '@/components/ProfileCompletionModal';
import { OAuthErrorHandler } from '@/components/OAuthErrorHandler';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const { hasCompletedOnboarding, isLoading, completeOnboarding } = useOnboardingStatus();
  const { isComplete: profileComplete, isLoading: profileLoading } = useProfileCompletion();
  const { user } = useAuth();
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasCompletedOnboarding && user) {
      setShowOnboarding(true);
    }
  }, [isLoading, hasCompletedOnboarding, user]);

  // Check profile completion after onboarding
  useEffect(() => {
    if (!profileLoading && !profileComplete && user && hasCompletedOnboarding) {
      // Check if user skipped recently (within 24h)
      const skippedAt = localStorage.getItem('profile_completion_skipped');
      if (skippedAt) {
        const skippedTime = parseInt(skippedAt, 10);
        const dayInMs = 24 * 60 * 60 * 1000;
        if (Date.now() - skippedTime < dayInMs) {
          return; // Don't show if skipped within 24h
        }
      }
      setShowProfileModal(true);
    }
  }, [profileLoading, profileComplete, user, hasCompletedOnboarding]);

  const handleOnboardingComplete = async () => {
    await completeOnboarding();
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = async () => {
    await completeOnboarding();
    setShowOnboarding(false);
  };

  if (isLoading) {
    return <>{children}</>;
  }

  if (showOnboarding && user) {
    return (
      <GuidedOnboarding 
        onComplete={handleOnboardingComplete} 
        onSkip={handleOnboardingSkip}
      />
    );
  }

  return (
    <>
      <OAuthErrorHandler />
      <ProfileCompletionModal 
        open={showProfileModal} 
        onOpenChange={setShowProfileModal} 
      />
      {children}
    </>
  );
}
