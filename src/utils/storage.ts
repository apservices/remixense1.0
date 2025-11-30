import { supabase } from "@/integrations/supabase/client";

export async function getSignedUrl(bucket: string, path: string, expiresInSeconds = 3600) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export async function getAudioUrl(filePath: string): Promise<string> {
  // Try public URL first (faster)
  const { data } = supabase.storage.from('tracks').getPublicUrl(filePath);
  return data.publicUrl;
}
