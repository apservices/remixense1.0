import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Export {
  id: string;
  user_id: string;
  track_id: string;
  platform: 'dropbox' | 'soundcloud' | 'spotify';
  status: 'pending' | 'uploading' | 'success' | 'error';
  error_message?: string;
  external_id?: string;
  external_url?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ExportCreateData {
  track_id: string;
  platform: 'dropbox' | 'soundcloud' | 'spotify';
  metadata?: Record<string, any>;
}

export function useExports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exports, setExports] = useState<Export[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchExports();
    } else {
      setExports([]);
      setLoading(false);
    }
  }, [user]);

  const fetchExports = async () => {
    if (!user) return;

    try {
      // For now, use localStorage to persist exports until DB table is ready
      const savedExports = localStorage.getItem(`exports_${user.id}`);
      if (savedExports) {
        setExports(JSON.parse(savedExports));
      } else {
        setExports([]);
      }
    } catch (error) {
      console.error('Error fetching exports:', error);
      setExports([]);
    } finally {
      setLoading(false);
    }
  };

  const createExport = async (exportData: ExportCreateData) => {
    if (!user) return { error: 'No user found' };

    try {
      // Create a mock export for now
      const mockExport: Export = {
        id: crypto.randomUUID(),
        user_id: user.id,
        track_id: exportData.track_id,
        platform: exportData.platform,
        status: 'pending',
        metadata: exportData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setExports(prev => {
        const updated = [mockExport, ...prev];
        // Save to localStorage
        localStorage.setItem(`exports_${user.id}`, JSON.stringify(updated));
        return updated;
      });
      
      toast({
        title: "Exportação iniciada",
        description: "A exportação foi adicionada à fila.",
      });
      
      return { data: mockExport };
    } catch (error) {
      console.error('Error creating export:', error);
      return { error };
    }
  };

  const updateExportStatus = async (
    id: string, 
    status: Export['status'], 
    updates?: Partial<Pick<Export, 'error_message' | 'external_id' | 'external_url' | 'metadata'>>
  ) => {
    if (!user) return { error: 'No user found' };

    try {
      // Update local state
      const updatedExport = exports.find(exp => exp.id === id);
      if (!updatedExport) return { error: 'Export not found' };

      const updated: Export = {
        ...updatedExport,
        status,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      setExports(prev => {
        const updatedList = prev.map(exp => exp.id === id ? updated : exp);
        // Save to localStorage
        localStorage.setItem(`exports_${user.id}`, JSON.stringify(updatedList));
        return updatedList;
      });
      return { data: updated };
    } catch (error) {
      console.error('Error updating export status:', error);
      return { error };
    }
  };

  const getExportsByTrack = (trackId: string) => {
    return exports.filter(exp => exp.track_id === trackId);
  };

  const getExportsByPlatform = (platform: Export['platform']) => {
    return exports.filter(exp => exp.platform === platform);
  };

  return {
    exports,
    loading,
    createExport,
    updateExportStatus,
    getExportsByTrack,
    getExportsByPlatform,
    refetch: fetchExports,
  };
}