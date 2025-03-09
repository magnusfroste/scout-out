
import React from 'react';
import { CreditCard } from 'lucide-react';

interface CreditDisplayProps {
  credits: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const CreditDisplay: React.FC<CreditDisplayProps> = ({ 
  credits, 
  showLabel = true,
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5",
    md: "px-4 py-2",
    lg: "px-5 py-3"
  };
  
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };
  
  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };
  
  return (
    <div className={`flex items-center gap-2 bg-slate-100 dark:bg-slate-800 ${sizeClasses[size]} rounded-full`}>
      <CreditCard className={`${iconSizes[size]} text-primary`} />
      <div className={`${textSizes[size]} font-medium`}>
        <span>{credits}</span>
        {showLabel && <span className="ml-1 text-muted-foreground">credits</span>}
      </div>
    </div>
  );
};

export default CreditDisplay;
