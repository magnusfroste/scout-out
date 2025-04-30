
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MagicValuePropositionButton from './MagicValuePropositionButton';
import IntroductionTab from './value-proposition/IntroductionTab';
import AdviceTab from './value-proposition/AdviceTab';
import SubjectTab from './value-proposition/SubjectTab';

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
  
  const handleMagicClick = (score: number | null, advice: string | null, introduction: string | null, subject: string | null) => {
    if (onMagicSuccess) {
      onMagicSuccess(score, advice, introduction, subject);
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
            <IntroductionTab
              companyId={companyId}
              companyName={companyName}
              companyEmail={companyEmail}
              displayIntroduction={displayIntroduction}
              onIntroductionChange={onIntroductionChange}
              onCopySuccess={onCopySuccess}
              adjustTextareaHeight={adjustTextareaHeight}
              onAutoSave={onAutoSave}
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
              onAutoSave={onAutoSave}
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
              onAutoSave={onAutoSave}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ValuePropositionSection;
