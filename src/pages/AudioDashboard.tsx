import React from 'react';
import { AudioManagementDashboard } from '@/components/AudioManagementDashboard';
import { RoleAuthProvider } from '@/hooks/useRoleAuth';
import { AppLayout } from '@/components/layout/AppLayout';

export default function AudioDashboard() {
  return (
    <AppLayout>
      <RoleAuthProvider>
        <AudioManagementDashboard />
      </RoleAuthProvider>
    </AppLayout>
  );
}
