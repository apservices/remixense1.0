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
 * Get a public URL for an audio file in the tracks bucket
 */
export async function getAudioUrl(filePath: string): Promise<string> {
  if (!filePath) {
    console.error('getAudioUrl: No file path provided');
    return '';
  }

  // Clean the path - remove any leading slashes
  const cleanPath = filePath.replace(/^\/+/, '');
  
  console.log('🔗 Getting audio URL for:', cleanPath);

  // The 'tracks' bucket is public, so use public URL
  const { data } = supabase.storage.from('tracks').getPublicUrl(cleanPath);
  
  // Verify the URL is valid
  if (!data?.publicUrl) {
    console.error('Failed to get public URL for:', cleanPath);
    return '';
  }

  console.log('✅ Audio URL:', data.publicUrl);
  return data.publicUrl;
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
