import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UploadEvent {
  id: string;
  user_id: string;
  event_type: 'upload_started' | 'upload_completed' | 'upload_failed' | 'upload_retry';
  track_id?: string;
  file_size?: number;
  file_type?: string;
  duration_ms?: number;
  error_message?: string;
  retry_count?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UploadStats {
  totalUploads: number;
  successfulUploads: number;
  failedUploads: number;
  averageFileSize: number;
  averageUploadTime: number;
  successRate: number;
  retryRate: number;
  commonErrors: { error: string; count: number }[];
  uploadTrends: { date: string; uploads: number; success: number }[];
  fileTypeStats: { type: string; count: number; successRate: number }[];
}

export function useUploadAnalytics() {
  const [stats, setStats] = useState<UploadStats>({
    totalUploads: 0,
    successfulUploads: 0,
    failedUploads: 0,
    averageFileSize: 0,
    averageUploadTime: 0,
    successRate: 0,
    retryRate: 0,
    commonErrors: [],
    uploadTrends: [],
    fileTypeStats: [],
  });
  
  const [loading, setLoading] = useState(false);
  const [recentEvents, setRecentEvents] = useState<UploadEvent[]>([]);
  const { user } = useAuth();

  // Log upload event
  const logUploadEvent = useCallback(async (event: Omit<UploadEvent, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('upload_analytics')
        .insert({
          user_id: user.id,
          ...event,
        });

      if (error) {
        console.error('Failed to log upload event:', error);
      }
    } catch (error) {
      console.error('Failed to log upload event:', error);
    }
  }, [user]);

  // Load analytics data
  const loadAnalytics = useCallback(async (timeRange: 'day' | 'week' | 'month' | 'all' = 'month') => {
    if (!user) return;

    setLoading(true);
    try {
      // Calculate date filter
      let dateFilter = '';
      if (timeRange !== 'all') {
        const daysBack = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30;
        const filterDate = new Date();
        filterDate.setDate(filterDate.getDate() - daysBack);
        dateFilter = filterDate.toISOString();
      }

      // Get upload events
      let query = supabase
        .from('upload_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }

      const { data: events, error } = await query.limit(1000);

      if (error) throw error;

      setRecentEvents(events || []);

      // Calculate statistics
      const uploadEvents = events || [];
      const startedEvents = uploadEvents.filter(e => e.event_type === 'upload_started');
      const completedEvents = uploadEvents.filter(e => e.event_type === 'upload_completed');
      const failedEvents = uploadEvents.filter(e => e.event_type === 'upload_failed');
      const retryEvents = uploadEvents.filter(e => e.event_type === 'upload_retry');

      const totalUploads = startedEvents.length;
      const successfulUploads = completedEvents.length;
      const failedUploads = failedEvents.length;
      const successRate = totalUploads > 0 ? (successfulUploads / totalUploads) * 100 : 0;
      const retryRate = totalUploads > 0 ? (retryEvents.length / totalUploads) * 100 : 0;

      // Average file size
      const fileSizes = uploadEvents.filter(e => e.file_size).map(e => e.file_size!);
      const averageFileSize = fileSizes.length > 0 
        ? fileSizes.reduce((sum, size) => sum + size, 0) / fileSizes.length 
        : 0;

      // Average upload time
      const uploadTimes = completedEvents.filter(e => e.duration_ms).map(e => e.duration_ms!);
      const averageUploadTime = uploadTimes.length > 0
        ? uploadTimes.reduce((sum, time) => sum + time, 0) / uploadTimes.length
        : 0;

      // Common errors
      const errorCounts = failedEvents.reduce((acc, event) => {
        const error = event.error_message || 'Unknown error';
        acc[error] = (acc[error] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const commonErrors = Object.entries(errorCounts)
        .map(([error, count]) => ({ error, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Upload trends (last 30 days)
      const trendDays = 30;
      const trends: { date: string; uploads: number; success: number }[] = [];
      
      for (let i = trendDays - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayEvents = uploadEvents.filter(e => 
          e.created_at.startsWith(dateStr)
        );
        
        const dayStarted = dayEvents.filter(e => e.event_type === 'upload_started').length;
        const daySuccess = dayEvents.filter(e => e.event_type === 'upload_completed').length;
        
        trends.push({
          date: dateStr,
          uploads: dayStarted,
          success: daySuccess,
        });
      }

      // File type statistics
      const fileTypeCounts = uploadEvents.reduce((acc, event) => {
        if (!event.file_type) return acc;
        
        if (!acc[event.file_type]) {
          acc[event.file_type] = { total: 0, success: 0 };
        }
        
        if (event.event_type === 'upload_started') {
          acc[event.file_type].total++;
        } else if (event.event_type === 'upload_completed') {
          acc[event.file_type].success++;
        }
        
        return acc;
      }, {} as Record<string, { total: number; success: number }>);

      const fileTypeStats = Object.entries(fileTypeCounts)
        .map(([type, stats]) => ({
          type,
          count: stats.total,
          successRate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      setStats({
        totalUploads,
        successfulUploads,
        failedUploads,
        averageFileSize,
        averageUploadTime,
        successRate,
        retryRate,
        commonErrors,
        uploadTrends: trends,
        fileTypeStats,
      });

    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load analytics on mount and when user changes
  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, loadAnalytics]);

  // Utility functions for logging common events
  const logUploadStarted = useCallback((trackId: string, fileSize: number, fileType: string) => {
    return logUploadEvent({
      event_type: 'upload_started',
      track_id: trackId,
      file_size: fileSize,
      file_type: fileType,
    });
  }, [logUploadEvent]);

  const logUploadCompleted = useCallback((trackId: string, durationMs: number, metadata?: Record<string, any>) => {
    return logUploadEvent({
      event_type: 'upload_completed',
      track_id: trackId,
      duration_ms: durationMs,
      metadata,
    });
  }, [logUploadEvent]);

  const logUploadFailed = useCallback((trackId: string, error: string, retryCount?: number) => {
    return logUploadEvent({
      event_type: 'upload_failed',
      track_id: trackId,
      error_message: error,
      retry_count: retryCount,
    });
  }, [logUploadEvent]);

  const logUploadRetry = useCallback((trackId: string, retryCount: number) => {
    return logUploadEvent({
      event_type: 'upload_retry',
      track_id: trackId,
      retry_count: retryCount,
    });
  }, [logUploadEvent]);

  return {
    stats,
    recentEvents,
    loading,
    loadAnalytics,
    logUploadStarted,
    logUploadCompleted,
    logUploadFailed,
    logUploadRetry,
  };
}