
import React, { useState, useRef, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MagicValuePropositionButton from './MagicValuePropositionButton';
import SendEmailButton from '../dashboard/SendEmailButton';

interface ValuePropositionSectionProps {
  companyId: string;
  companyName: string;
  companyEmail?: string | null;
  displayAdvice: string;
  displayIntroduction: string;
  displaySubject: string;
  onAdviceChange: (value: string) => void;
  onIntroductionChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onMagicSuccess?: (score: number | null, advice: string | null, introduction: string | null, subject: string | null) => void;
  onCopySuccess?: () => void;
  adjustTextareaHeight?: (textarea: HTMLTextAreaElement) => void;
  onSave?: () => void;
  onAutoSave?: () => void;
  displayScore?: number | null;
  onScoreChange?: (score: number | null) => void;
}

const ValuePropositionSection: React.FC<ValuePropositionSectionProps> = ({
  companyId,
  companyName,
  companyEmail,
  displayAdvice,
  displayIntroduction,
  displaySubject,
  onAdviceChange,
  onIntroductionChange,
  onSubjectChange,
  onMagicSuccess,
  onCopySuccess,
  adjustTextareaHeight,
  onSave,
  onAutoSave,
  displayScore = null,
  onScoreChange
}) => {
  const [activeTab, setActiveTab] = useState<string>('intro');
  const [copyToastShown, setCopyToastShown] = useState(false);
  const { toast } = useToast();
  const introductionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const adviceTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleIntroductionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onIntroductionChange(event.target.value);
    if (onAutoSave) {
      onAutoSave();
    }
  }, [onIntroductionChange, onAutoSave]);
  
  const handleAdviceChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onAdviceChange(event.target.value);
    if (onAutoSave) {
      onAutoSave();
    }
  }, [onAdviceChange, onAutoSave]);
  
  const handleSubjectChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onSubjectChange(event.target.value);
    if (onAutoSave) {
      onAutoSave();
    }
  }, [onSubjectChange, onAutoSave]);
  
  const handleScoreChange = useCallback((newScore: number) => {
    if (onScoreChange) {
      onScoreChange(newScore);
      if (onAutoSave) {
        onAutoSave();
      }
    }
  }, [onScoreChange, onAutoSave]);
  
  const handleMagicClick = (score: number | null, advice: string | null, introduction: string | null, subject: string | null) => {
    if (onMagicSuccess) {
      onMagicSuccess(score, advice, introduction, subject);
    }
  };
  
  const handleCopyIntro = () => {
    navigator.clipboard.writeText(displayIntroduction);
    if (!copyToastShown) {
      toast({
        title: "Copied!",
        description: "Introduction text copied to clipboard.",
      });
      setCopyToastShown(true);
      setTimeout(() => setCopyToastShown(false), 3000);
    }
    if (onCopySuccess) {
      onCopySuccess();
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
  
  const handleCopySubject = () => {
    navigator.clipboard.writeText(displaySubject);
    if (!copyToastShown) {
      toast({
        title: "Copied!",
        description: "Subject text copied to clipboard.",
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Value Proposition</h3>
        <div className="flex space-x-2">
          <MagicValuePropositionButton
            companyName={companyName}
            companyId={companyId}
            onSuccess={handleMagicClick}
          />
        </div>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="intro">Introduction</TabsTrigger>
            <TabsTrigger value="advice">Advice</TabsTrigger>
            <TabsTrigger value="subject">Email Subject</TabsTrigger>
          </TabsList>
          
          {/* Introduction Tab */}
          <TabsContent value="intro" className="mt-4">
            <div className="space-y-4">
              <Label htmlFor="introduction">Introduction Email Body</Label>
              <Textarea
                id="introduction"
                placeholder="Write an introduction for this company..."
                className="min-h-[200px] font-light leading-relaxed"
                value={displayIntroduction}
                onChange={handleIntroductionChange}
                ref={handleTextareaRef}
              />
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  This introduction will be used in your email to the company.
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyIntro}
                    disabled={!displayIntroduction}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  
                  {companyEmail && (
                    <SendEmailButton 
                      recipientEmail={companyEmail}
                      recipientName={companyName}
                      subject={displaySubject || `Value proposition for ${companyName}`}
                      content={displayIntroduction}
                      companyId={companyId}
                    />
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Advice Tab */}
          <TabsContent value="advice" className="mt-4">
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
          </TabsContent>
          
          {/* Subject Tab */}
          <TabsContent value="subject" className="mt-4">
            <div className="space-y-4">
              <Label htmlFor="subject">Email Subject Line</Label>
              <Input
                id="subject"
                placeholder="Enter subject line for email..."
                className="font-light"
                value={displaySubject}
                onChange={handleSubjectChange}
              />
              
              <div className="flex justify-end mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopySubject}
                  disabled={!displaySubject}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ValuePropositionSection;

