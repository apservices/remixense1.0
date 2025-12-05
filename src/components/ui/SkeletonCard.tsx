import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  variant?: 'default' | 'track' | 'post' | 'profile';
}

export function SkeletonCard({ className, variant = 'default' }: SkeletonCardProps) {
  if (variant === 'track') {
    return (
      <div className={cn('glass glass-border rounded-xl p-4 animate-pulse', className)}>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-lg bg-muted/50" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted/50" />
            <div className="h-3 w-1/2 rounded bg-muted/50" />
          </div>
          <div className="h-8 w-8 rounded-full bg-muted/50" />
        </div>
      </div>
    );
  }

  if (variant === 'post') {
    return (
      <div className={cn('glass glass-border rounded-xl p-4 space-y-4 animate-pulse', className)}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted/50" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 rounded bg-muted/50" />
            <div className="h-2.5 w-16 rounded bg-muted/50" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-muted/50" />
          <div className="h-3 w-4/5 rounded bg-muted/50" />
        </div>
        <div className="h-40 rounded-lg bg-muted/50" />
        <div className="flex items-center gap-4">
          <div className="h-8 w-16 rounded bg-muted/50" />
          <div className="h-8 w-16 rounded bg-muted/50" />
          <div className="h-8 w-16 rounded bg-muted/50" />
        </div>
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className={cn('glass glass-border rounded-xl p-6 animate-pulse', className)}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-muted/50" />
          <div className="space-y-2 text-center">
            <div className="h-5 w-32 rounded bg-muted/50 mx-auto" />
            <div className="h-3 w-24 rounded bg-muted/50 mx-auto" />
          </div>
          <div className="flex gap-6 mt-2">
            <div className="space-y-1 text-center">
              <div className="h-5 w-8 rounded bg-muted/50 mx-auto" />
              <div className="h-3 w-12 rounded bg-muted/50" />
            </div>
            <div className="space-y-1 text-center">
              <div className="h-5 w-8 rounded bg-muted/50 mx-auto" />
              <div className="h-3 w-12 rounded bg-muted/50" />
            </div>
            <div className="space-y-1 text-center">
              <div className="h-5 w-8 rounded bg-muted/50 mx-auto" />
              <div className="h-3 w-12 rounded bg-muted/50" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('glass glass-border rounded-xl p-4 animate-pulse', className)}>
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded bg-muted/50" />
        <div className="h-3 w-full rounded bg-muted/50" />
        <div className="h-3 w-2/3 rounded bg-muted/50" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3, variant = 'default' }: { count?: number; variant?: SkeletonCardProps['variant'] }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  );
}
