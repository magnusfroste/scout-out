
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import MagicValuePropositionButton from '@/components/dashboard/MagicValuePropositionButton';
import SendEmailButton from '@/components/dashboard/SendEmailButton';

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
  onMagicSuccess: (
    score: number | null,
    advice: string | null,
    introduction: string | null,
    subject: string | null
  ) => void;
  onCopySuccess: () => void;
  adjustTextareaHeight: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
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
  adjustTextareaHeight
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Value Proposition</h3>
        <MagicValuePropositionButton 
          companyId={companyId} 
          onSuccess={onMagicSuccess} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="advice" className="text-sm font-medium">AI Advice</Label>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg whitespace-pre-wrap min-h-[200px] text-sm border border-gray-200 dark:border-gray-800 shadow-inner">
            {displayAdvice || 'No advice generated yet. Use the "Magic Write Value Proposition" button to generate advice.'}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-sm font-medium">Email Subject</Label>
          <Input
            id="subject"
            value={displaySubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Enter email subject line..."
            className="mb-3 p-2 text-base font-sans border-gray-200 dark:border-gray-800 shadow-inner focus:border-primary focus:ring-1 focus:ring-primary"
          />

          <Label htmlFor="introduction" className="text-sm font-medium">Introduction Draft</Label>
          <Textarea
            id="introduction"
            value={displayIntroduction}
            onChange={(e) => {
              onIntroductionChange(e.target.value);
              adjustTextareaHeight(e);
            }}
            placeholder="Draft an introduction email or message..."
            className="min-h-[200px] p-4 text-base resize-none overflow-hidden font-sans border-gray-200 dark:border-gray-800 shadow-inner focus:border-primary focus:ring-1 focus:ring-primary"
            onFocus={(e) => adjustTextareaHeight(e as unknown as React.ChangeEvent<HTMLTextAreaElement>)}
            copyable={true}
            onCopy={onCopySuccess}
          />
          <div className="flex justify-end mt-2 gap-2">
            {companyEmail && (
              <SendEmailButton
                recipientEmail={companyEmail}
                recipientName={companyName}
                subject={displaySubject}
                content={displayIntroduction}
                disabled={!displayIntroduction}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValuePropositionSection;
