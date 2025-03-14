
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { callValuePropositionWebhook, getValuePropositionWebhookUrl } from '@/services/valuePropositionWebhookService';
import { supabase } from '@/integrations/supabase/client';

interface MagicValuePropositionButtonProps {
  companyId: string;
  onSuccess: (score: number, advice: string, introduction: string) => void;
}

const MagicValuePropositionButton = ({ companyId, onSuccess }: MagicValuePropositionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const generateValueProposition = async () => {
    if (!user || !companyId) return;

    setIsLoading(true);
    try {
      // Get the webhook URL for value proposition
      const webhookUrl = await getValuePropositionWebhookUrl();
      if (!webhookUrl) {
        throw new Error('Value Proposition Webhook URL not configured');
      }

      // Get the company data
      const { data: companyData, error: companyError } = await supabase
        .from('company_searches')
        .select('*')
        .eq('id', companyId)
        .single();

      if (companyError) throw companyError;
      if (!companyData) throw new Error('Company data not found');

      // Get business data from user profile
      const businessData = userProfile?.business_data || {};

      console.log('Calling webhook with company data:', companyData);
      console.log('Calling webhook with business data:', businessData);
      
      // Call the webhook
      const response = await callValuePropositionWebhookService(webhookUrl, companyData, businessData);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Webhook error: ${errorText}`);
      }

      const data = await response.json();
      console.log('Raw webhook response:', JSON.stringify(data));
      
      // Extract data directly from the response - simplifying the extraction logic
      // This assumes the response follows our expected format:
      // { score: number, advice: string, introduction: string }
      let score = 0;
      let advice = '';
      let introduction = '';
      
      // Check for direct properties first
      if (typeof data.score === 'number') {
        score = data.score;
        advice = data.advice || '';
        introduction = data.introduction || '';
      } 
      // Check for nested output object
      else if (data.output) {
        score = typeof data.output.score === 'number' ? data.output.score : 0;
        advice = data.output.advice || '';
        introduction = data.output.introduction || '';
      } 
      // Check for array format with output object
      else if (Array.isArray(data) && data.length > 0 && data[0].output) {
        score = typeof data[0].output.score === 'number' ? data[0].output.score : 0;
        advice = data[0].output.advice || '';
        introduction = data[0].output.introduction || '';
      }
      
      console.log('Extracted data:', { score, advice, introduction });
      
      // Ensure we have valid data
      if (!score && !advice && !introduction) {
        throw new Error('Could not extract valid data from webhook response');
      }
      
      // Call the success callback with the extracted data WITHOUT saving to database
      onSuccess(score, advice, introduction);

      toast({
        title: 'Success',
        description: 'AI has generated value proposition content',
      });
    } catch (error: any) {
      console.error('Error generating value proposition:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate value proposition',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Wrapper function to ensure we correctly parse the webhook response
  const callValuePropositionWebhookService = async (
    webhookUrl: string,
    companyData: any,
    businessData: any
  ): Promise<Response> => {
    const response = await callValuePropositionWebhook(webhookUrl, companyData, businessData);
    
    // Fix typo in function name from previous code
    console.log('Webhook response received');
    return response;
  };

  return (
    <Button 
      onClick={generateValueProposition} 
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Magic Write Value Proposition
        </>
      )}
    </Button>
  );
};

export default MagicValuePropositionButton;
