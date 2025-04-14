
import React from 'react';
import Button from '@/components/Button';

interface NotFoundStateProps {
  onBack: () => void;
}

const NotFoundState: React.FC<NotFoundStateProps> = ({ onBack }) => {
  return (
    <div className="text-center py-10">
      <p className="text-muted-foreground mb-4">Company search not found</p>
      <Button onClick={onBack}>Back to List</Button>
    </div>
  );
};

export default NotFoundState;
