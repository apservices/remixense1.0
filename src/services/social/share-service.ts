// V3 Social Sharing Service - TikTok, Spotify, Instagram integrations

export interface ShareContent {
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  audioUrl?: string;
  hashtags?: string[];
}

export interface ShareResult {
  success: boolean;
  platform: string;
  url?: string;
  error?: string;
}

class SocialShareService {
  // Generate share URL for different platforms
  generateShareUrl(platform: string, content: ShareContent): string {
    const encodedUrl = encodeURIComponent(content.url);
    const encodedTitle = encodeURIComponent(content.title);
    const encodedDesc = encodeURIComponent(content.description || '');
    const hashtagsStr = content.hashtags?.map(h => `#${h}`).join(' ') || '#RemiXense #Music';

    switch (platform) {
      case 'twitter':
      case 'x':
        return `https://twitter.com/intent/tweet?text=${encodedTitle}%20${hashtagsStr}&url=${encodedUrl}`;
      
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
      
      case 'whatsapp':
        return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
      
      case 'telegram':
        return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
      
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      
      case 'reddit':
        return `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
      
      case 'tiktok':
        // TikTok doesn't have direct share URL, but we can create a prompt
        return `https://www.tiktok.com/upload?caption=${encodedTitle}%20${hashtagsStr}`;
      
      case 'instagram':
        // Instagram requires app deep link
        return `instagram://library?AssetPath=${encodedUrl}`;
      
      default:
        return content.url;
    }
  }

  // Share using Web Share API (mobile-friendly)
  async shareNative(content: ShareContent): Promise<ShareResult> {
    if (!navigator.share) {
      return { 
        success: false, 
        platform: 'native', 
        error: 'Web Share API not supported' 
      };
    }

    try {
      const shareData: ShareData = {
        title: content.title,
        text: content.description,
        url: content.url
      };

      await navigator.share(shareData);
      return { success: true, platform: 'native' };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return { success: false, platform: 'native', error: 'Share cancelled' };
      }
      return { 
        success: false, 
        platform: 'native', 
        error: (error as Error).message 
      };
    }
  }

  // Open share popup
  openSharePopup(platform: string, content: ShareContent): void {
    const url = this.generateShareUrl(platform, content);
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      url,
      `share_${platform}`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0`
    );
  }

  // Copy link to clipboard
  async copyLink(url: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        return true;
      } catch {
        return false;
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }

  // Generate RemiXense share URL for a track/mix
  generateRemiXenseUrl(type: 'track' | 'mix' | 'profile', id: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/${type}/${id}`;
  }

  // Get available share platforms
  getAvailablePlatforms(): { id: string; name: string; icon: string; color: string }[] {
    return [
      { id: 'native', name: 'Compartilhar', icon: 'Share2', color: '#333' },
      { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageCircle', color: '#25D366' },
      { id: 'twitter', name: 'X / Twitter', icon: 'Twitter', color: '#1DA1F2' },
      { id: 'facebook', name: 'Facebook', icon: 'Facebook', color: '#1877F2' },
      { id: 'telegram', name: 'Telegram', icon: 'Send', color: '#0088cc' },
      { id: 'tiktok', name: 'TikTok', icon: 'Music2', color: '#000' },
      { id: 'instagram', name: 'Instagram', icon: 'Instagram', color: '#E4405F' },
      { id: 'copy', name: 'Copiar Link', icon: 'Link', color: '#666' }
    ];
  }

  // Track share analytics
  async trackShare(platform: string, contentType: string, contentId: string): Promise<void> {
    // In production, this would send to analytics
    console.log('Share tracked:', { platform, contentType, contentId, timestamp: new Date() });
  }
}

export const shareService = new SocialShareService();
