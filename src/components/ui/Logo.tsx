import { cn } from '@/lib/utils';

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

export function Logo({ size = 'md', showText = false, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img
        src="/lovable-uploads/23e55981-72ea-4de5-a422-fa6833eeb2b0.png"
        alt="RemiXense"
        className={cn(sizeMap[size], 'object-contain drop-shadow-lg')}
      />
      {showText && (
        <span className={cn('font-bold gradient-text', textSizeMap[size])}>
          RemiXense
        </span>
      )}
    </div>
  );
}
