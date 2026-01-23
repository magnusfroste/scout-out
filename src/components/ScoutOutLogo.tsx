import React from 'react';
import { cn } from '@/lib/utils';

interface ScoutOutLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const ScoutOutLogo: React.FC<ScoutOutLogoProps> = ({ 
  size = 'md', 
  showText = true,
  className 
}) => {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', gap: 'gap-1.5' },
    md: { icon: 'w-8 h-8', text: 'text-xl', gap: 'gap-2' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl', gap: 'gap-2.5' },
  };

  const { icon, text, gap } = sizeClasses[size];

  return (
    <div className={cn('flex items-center', gap, className)}>
      {/* Logo Icon - Abstract compass/target representing research & outreach */}
      <div className={cn('relative flex-shrink-0', icon)}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer ring */}
          <circle
            cx="16"
            cy="16"
            r="14"
            className="stroke-primary"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Inner dynamic shape - represents outreach/movement */}
          <path
            d="M16 6 L22 16 L16 26 L10 16 Z"
            className="fill-primary/20 stroke-primary"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          
          {/* Center dot - focus point */}
          <circle
            cx="16"
            cy="16"
            r="3"
            className="fill-primary"
          />
          
          {/* Scout lines - cardinal directions */}
          <line x1="16" y1="2" x2="16" y2="6" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="26" x2="16" y2="30" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
          <line x1="2" y1="16" x2="6" y2="16" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
          <line x1="26" y1="16" x2="30" y2="16" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <span className={cn('font-bold tracking-tight', text)}>
          <span className="text-foreground">Scout</span>
          <span className="text-primary">Out</span>
        </span>
      )}
    </div>
  );
};

export default ScoutOutLogo;
