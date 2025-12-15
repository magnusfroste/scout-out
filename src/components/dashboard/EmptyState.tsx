import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  hint?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  hint,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">{description}</p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel && onAction && (
          <Button onClick={onAction} size="lg">
            {actionLabel}
          </Button>
        )}
        {secondaryLabel && onSecondaryAction && (
          <Button variant="outline" onClick={onSecondaryAction} size="lg">
            {secondaryLabel}
          </Button>
        )}
      </div>
      
      {hint && (
        <p className="text-xs text-muted-foreground mt-6 text-center max-w-sm">
          {hint}
        </p>
      )}
    </div>
  );
};

export default EmptyState;
