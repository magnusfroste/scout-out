
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

interface GenerateAllButtonProps {
  isGenerating: boolean;
  onClick: () => void;
}

const GenerateAllButton = ({ isGenerating, onClick }: GenerateAllButtonProps) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onClick} 
      disabled={isGenerating}
      className="bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 shadow-sm"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Magic Generate All
        </>
      )}
    </Button>
  );
};

export default GenerateAllButton;
