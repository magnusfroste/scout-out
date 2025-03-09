
import React from 'react';
import { CreditCard } from 'lucide-react';

interface CreditDisplayProps {
  credits: number;
}

const CreditDisplay: React.FC<CreditDisplayProps> = ({ credits }) => {
  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
      <CreditCard className="h-5 w-5 text-primary" />
      <div className="text-sm font-medium">
        <span>{credits}</span>
        <span className="ml-1 text-muted-foreground">credits</span>
      </div>
    </div>
  );
};

export default CreditDisplay;
