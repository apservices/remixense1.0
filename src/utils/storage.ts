import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = "https://xmjwutsmvshcfnowarnf.supabase.co";

/**
 * Get a signed URL for a file in Supabase Storage
 */
export async function getSignedUrl(bucket: string, path: string, expiresInSeconds = 3600) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }
  return data.signedUrl;
}

/**
 * Get a playable URL for an audio file
 * Tries audio-files bucket (private - needs signed URL), then tracks bucket (public)
 */
export async function getAudioUrl(filePath: string): Promise<string> {
  if (!filePath) {
    console.error('getAudioUrl: No file path provided');
    return '';
  }

  // Clean the path - remove any leading slashes
  const cleanPath = filePath.replace(/^\/+/, '');
  
  console.log('🔗 Getting audio URL for:', cleanPath);

  try {
    // Try audio-files bucket first (private - use signed URL)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('audio-files')
      .createSignedUrl(cleanPath, 3600); // 1 hour expiry

    if (!signedError && signedData?.signedUrl) {
      console.log('✅ Audio URL (signed from audio-files):', signedData.signedUrl);
      return signedData.signedUrl;
    }

    // Fallback to tracks bucket (public)
    const { data } = supabase.storage.from('tracks').getPublicUrl(cleanPath);
    
    if (data?.publicUrl) {
      console.log('✅ Audio URL (public from tracks):', data.publicUrl);
      return data.publicUrl;
    }

    console.error('Failed to get URL for:', cleanPath);
    return '';
  } catch (error) {
    console.error('Error getting audio URL:', error);
    return '';
  }
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: string, 
  path: string, 
  file: File | Blob,
  options?: { contentType?: string; upsert?: boolean }
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options?.contentType || file.type,
      upsert: options?.upsert ?? false
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  return data.path;
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  
  if (error) {
    console.error('Delete error:', error);
    return false;
  }
  
  return true;
}

/**
 * List files in a storage bucket path
 */
export async function listFiles(bucket: string, path: string = '') {
  const { data, error } = await supabase.storage.from(bucket).list(path);
  
  if (error) {
    console.error('List error:', error);
    throw error;
  }
  
  return data;
}
