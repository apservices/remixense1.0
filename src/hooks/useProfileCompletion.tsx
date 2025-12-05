import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface ProfileCompletionStatus {
  isComplete: boolean;
  isLoading: boolean;
  missingFields: string[];
  completionPercentage: number;
}

const REQUIRED_FIELDS = ['dj_name', 'bio', 'avatar_url'] as const;
const OPTIONAL_FIELDS = ['location', 'website', 'social_links'] as const;

export function useProfileCompletion(): ProfileCompletionStatus {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const [status, setStatus] = useState<ProfileCompletionStatus>({
    isComplete: true,
    isLoading: true,
    missingFields: [],
    completionPercentage: 0,
  });

  useEffect(() => {
    if (loading || !user) {
      setStatus(prev => ({ ...prev, isLoading: loading }));
      return;
    }

    if (!profile) {
      setStatus({
        isComplete: false,
        isLoading: false,
        missingFields: [...REQUIRED_FIELDS],
        completionPercentage: 0,
      });
      return;
    }

    const missingFields: string[] = [];
    let filledRequired = 0;
    let filledOptional = 0;

    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      const value = profile[field as keyof typeof profile];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(field);
      } else {
        filledRequired++;
      }
    });

    // Check optional fields for percentage
    OPTIONAL_FIELDS.forEach(field => {
      const value = profile[field as keyof typeof profile];
      if (value && (typeof value !== 'string' || value.trim() !== '')) {
        filledOptional++;
      }
    });

    const totalFields = REQUIRED_FIELDS.length + OPTIONAL_FIELDS.length;
    const filledFields = filledRequired + filledOptional;
    const completionPercentage = Math.round((filledFields / totalFields) * 100);

    setStatus({
      isComplete: missingFields.length === 0,
      isLoading: false,
      missingFields,
      completionPercentage,
    });
  }, [profile, loading, user]);

  return status;
}

export function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    dj_name: 'Nome de DJ',
    bio: 'Biografia',
    avatar_url: 'Foto de perfil',
    location: 'Localização',
    website: 'Website',
    social_links: 'Redes sociais',
  };
  return labels[field] || field;
}
