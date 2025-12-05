import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { removeBackground } from '@/utils/backgroundRemoval';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const textSizeMap = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

const LOGO_SRC = '/lovable-uploads/23e55981-72ea-4de5-a422-fa6833eeb2b0.png';

export function Logo({ size = 'md', showText = false, className }: LogoProps) {
  const [transparentSrc, setTransparentSrc] = useState<string>(LOGO_SRC);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processLogo = async () => {
      // Check if we already processed this logo in sessionStorage
      const cachedLogo = sessionStorage.getItem('remixense-logo-transparent');
      if (cachedLogo) {
        setTransparentSrc(cachedLogo);
        return;
      }

      try {
        setIsProcessing(true);
        
        // Load the image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = LOGO_SRC;
        });

        // Remove background
        const blob = await removeBackground(img);
        const url = URL.createObjectURL(blob);
        
        // Cache in sessionStorage as base64
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            sessionStorage.setItem('remixense-logo-transparent', reader.result);
          }
        };
        reader.readAsDataURL(blob);
        
        setTransparentSrc(url);
      } catch (error) {
        console.warn('Logo background removal failed, using original:', error);
        setTransparentSrc(LOGO_SRC);
      } finally {
        setIsProcessing(false);
      }
    };

    processLogo();
  }, []);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img
        src={transparentSrc}
        alt="RemiXense"
        className={cn(
          sizeMap[size], 
          'object-contain drop-shadow-lg',
          isProcessing && 'opacity-75'
        )}
      />
      {showText && (
        <span className={cn('font-bold gradient-text', textSizeMap[size])}>
          RemiXense
        </span>
      )}
    </div>
  );
}
