import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AdviceTab from './value-proposition/AdviceTab';
import IntroductionTab from './value-proposition/IntroductionTab';
import SubjectTab from './value-proposition/SubjectTab';
import MagicValuePropositionButton from './MagicValuePropositionButton';
import SendEmailButton from '../dashboard/SendEmailButton';
import { Copy, CheckCircle } from 'lucide-react';

interface ValuePropositionSectionProps {
  companyId: string;
  companyName: string;
  companyEmail?: string | null;
  displayAdvice: string;
  displayIntroduction: string;
  displaySubject: string;
  displayScore: number | null;
  onAdviceChange: (value: string) => void;
  onIntroductionChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onScoreChange: (value: number | null) => void;
  onMagicSuccess: (score: number, advice: string, introduction: string, subject: string) => void;
  onCopySuccess?: () => void;
  adjustTextareaHeight: (textarea: HTMLTextAreaElement) => void;
  onSave?: () => Promise<void>;
  onEmailSent?: () => Promise<void>;
}

const ValuePropositionSection: React.FC<ValuePropositionSectionProps> = ({
  companyId,
  companyName,
  companyEmail,
  displayAdvice,
  displayIntroduction,
  displaySubject,
  displayScore,
  onAdviceChange,
  onIntroductionChange,
  onSubjectChange,
  onScoreChange,
  onMagicSuccess,
  onCopySuccess,
  adjustTextareaHeight,
  onSave,
  onEmailSent
}) => {
  const [activeTab, setActiveTab] = useState<string>('introduction');
  const [justCopied, setJustCopied] = useState(false);
  
  const handleCopy = () => {
    setJustCopied(true);
    setTimeout(() => {
      setJustCopied(false);
    }, 1000);
  };
  
  const handleMagicClick = (score: number, advice: string, introduction: string, subject: string) => {
    if (onMagicSuccess) {
      onMagicSuccess(score, advice, introduction, subject);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Value Proposition</h3>
        
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            size="sm"
            variant="secondary"
          >
            {justCopied ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          
          {companyEmail && (
            <SendEmailButton 
              recipientEmail={companyEmail}
              recipientName={null}
              subject={displaySubject}
              content={displayIntroduction}
              disabled={!displayIntroduction || !displaySubject}
              companyId={companyId}
              onEmailSent={onEmailSent}
            />
          )}
          
          <MagicValuePropositionButton 
            companyId={companyId}
            companyName={companyName} 
            onSuccess={onMagicSuccess}
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="introduction">Introduction</TabsTrigger>
          <TabsTrigger value="advice">Advice</TabsTrigger>
          <TabsTrigger value="subject">Subject</TabsTrigger>
        </TabsList>
        
        {/* Introduction Tab */}
        <TabsContent value="introduction" className="mt-4">
          <IntroductionTab
            companyId={companyId}
            companyName={companyName}
            companyEmail={companyEmail}
            displayIntroduction={displayIntroduction}
            onIntroductionChange={onIntroductionChange}
            onCopySuccess={onCopySuccess}
            adjustTextareaHeight={adjustTextareaHeight}
            onSave={onSave}
            displaySubject={displaySubject}
          />
        </TabsContent>
        
        {/* Advice Tab */}
        <TabsContent value="advice" className="mt-4">
          <AdviceTab
            displayAdvice={displayAdvice}
            onAdviceChange={onAdviceChange}
            onCopySuccess={onCopySuccess}
            adjustTextareaHeight={adjustTextareaHeight}
            displayScore={displayScore}
            onScoreChange={onScoreChange}
          />
        </TabsContent>
        
        {/* Subject Tab */}
        <TabsContent value="subject" className="mt-4">
          <SubjectTab
            displaySubject={displaySubject}
            onSubjectChange={onSubjectChange}
            onCopySuccess={onCopySuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ValuePropositionSection;
