import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'neon' | 'premium';
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'tilt' | 'none';
  children: React.ReactNode;
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, variant = 'default', hoverEffect = 'lift', children, ...props }, ref) => {
    const variants = {
      default: 'bg-card border border-border/30',
      glass: 'glass',
      neon: 'glass border-primary/30 shadow-[0_0_15px_rgba(123,47,247,0.15)]',
      premium: 'premium-card'
    };

    const hoverEffects = {
      lift: {
        rest: { y: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
        hover: { y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }
      },
      glow: {
        rest: { boxShadow: '0 0 0 rgba(123, 47, 247, 0)' },
        hover: { boxShadow: '0 0 30px rgba(123, 47, 247, 0.3)' }
      },
      scale: {
        rest: { scale: 1 },
        hover: { scale: 1.02 }
      },
      tilt: {
        rest: { rotateX: 0, rotateY: 0 },
        hover: { rotateX: 2, rotateY: 2 }
      },
      none: {
        rest: {},
        hover: {}
      }
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-lg p-4 transition-colors',
          variants[variant],
          className
        )}
        initial="rest"
        whileHover="hover"
        whileTap={{ scale: 0.98 }}
        variants={hoverEffects[hoverEffect]}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

export { AnimatedCard };
