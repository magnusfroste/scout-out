
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseCompanyDetailCallbacksProps {
  setDisplayScore: (score: number | null) => void;
  setDisplayAdvice: (advice: string) => void;
  setDisplayIntroduction: (introduction: string) => void;
  setDisplaySubject: (subject: string) => void;
}

export const useCompanyDetailCallbacks = ({
  setDisplayScore,
  setDisplayAdvice,
  setDisplayIntroduction,
  setDisplaySubject
}: UseCompanyDetailCallbacksProps) => {
  const { toast } = useToast();

  // Handle magic button success
  const handleMagicSuccess = (
    score: number | null, 
    advice: string | null, 
    introduction: string | null, 
    subject: string | null
  ) => {
    if (score !== null) setDisplayScore(score);
    if (advice) setDisplayAdvice(advice);
    if (introduction) setDisplayIntroduction(introduction);
    if (subject) setDisplaySubject(subject);
  };
  
  // Handle copy success
  const handleCopySuccess = () => {
    toast({
      title: 'Copied',
      description: 'Introduction copied to clipboard',
    });
  };
  
  // Function to adjust textarea height
  const adjustTextareaHeight = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  return {
    handleMagicSuccess,
    handleCopySuccess,
    adjustTextareaHeight
  };
};
