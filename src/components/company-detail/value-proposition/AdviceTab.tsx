
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdviceTabProps {
  displayAdvice: string;
  onAdviceChange: (value: string) => void;
  onCopySuccess?: () => void;
  adjustTextareaHeight?: (textarea: HTMLTextAreaElement) => void;
  displayScore: number | null;
  onScoreChange?: (score: number | null) => void;
}

const AdviceTab: React.FC<AdviceTabProps> = ({
  displayAdvice,
  onAdviceChange,
  onCopySuccess,
  adjustTextareaHeight,
  displayScore = null,
  onScoreChange
}) => {
  const [copyToastShown, setCopyToastShown] = React.useState(false);
  const { toast } = useToast();

  const handleAdviceChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onAdviceChange(event.target.value);
  };

  const handleScoreChange = (newScore: number) => {
    if (onScoreChange) {
      onScoreChange(newScore);
    }
  };

  const handleCopyAdvice = () => {
    navigator.clipboard.writeText(displayAdvice);
    if (!copyToastShown) {
      toast({
        title: "Copied!",
        description: "Advice text copied to clipboard.",
      });
      setCopyToastShown(true);
      setTimeout(() => setCopyToastShown(false), 3000);
    }
    if (onCopySuccess) {
      onCopySuccess();
    }
  };

  const handleTextareaRef = (textarea: HTMLTextAreaElement | null) => {
    if (textarea && adjustTextareaHeight) {
      adjustTextareaHeight(textarea);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="advice">Internal Notes & Advice</Label>
        
        {/* Score Rating */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm text-muted-foreground">Company Score</span>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((score) => (
              <Star
                key={score}
                className={`h-5 w-5 cursor-pointer transition-all ${
                  score <= (displayScore || 0) 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
                onClick={() => handleScoreChange(score)}
              />
            ))}
          </div>
        </div>
      </div>
      
      <Textarea
        id="advice"
        placeholder="Write advice about approaching this company..."
        className="min-h-[200px] font-light leading-relaxed"
        value={displayAdvice}
        onChange={handleAdviceChange}
        ref={handleTextareaRef}
      />
      
      <div className="flex justify-end mt-4">
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopyAdvice}
          disabled={!displayAdvice}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
      </div>
    </div>
  );
};

export default AdviceTab;
