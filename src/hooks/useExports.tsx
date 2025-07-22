
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
      const { data, error } = await supabase
        .from('exports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExports(data || []);
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
      const { data, error } = await supabase
        .from('exports')
        .insert({
          user_id: user.id,
          track_id: exportData.track_id,
          platform: exportData.platform,
          status: 'pending',
          metadata: exportData.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;

      setExports(prev => [data, ...prev]);
      
      toast({
        title: "Exportação iniciada",
        description: "A exportação foi adicionada à fila.",
      });

      // Start the actual export process
      startExportProcess(data.id, exportData);
      
      return { data };
    } catch (error) {
      console.error('Error creating export:', error);
      return { error };
    }
  };

  const startExportProcess = async (exportId: string, exportData: ExportCreateData) => {
    try {
      // Update status to uploading
      await updateExportStatus(exportId, 'uploading');

      // Call the appropriate edge function based on platform
      const { data, error } = await supabase.functions.invoke(`export-to-${exportData.platform}`, {
        body: {
          export_id: exportId,
          track_id: exportData.track_id,
          metadata: exportData.metadata,
        },
      });

      if (error) throw error;

      // The edge function will handle updating the final status
    } catch (error) {
      console.error('Export process error:', error);
      await updateExportStatus(exportId, 'error', {
        error_message: error.message || 'Export failed',
      });
    }
  };

  const updateExportStatus = async (
    id: string, 
    status: Export['status'], 
    updates?: Partial<Pick<Export, 'error_message' | 'external_id' | 'external_url' | 'metadata'>>
  ) => {
    if (!user) return { error: 'No user found' };

    try {
      const { data, error } = await supabase
        .from('exports')
        .update({
          status,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setExports(prev => prev.map(exp => exp.id === id ? data : exp));
      return { data };
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
