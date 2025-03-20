
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
  additionalData?: any;
}

const MagicValuePropositionButton = ({ 
  companyId, 
  onSuccess, 
  additionalData 
}: MagicValuePropositionButtonProps) => {
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

      // Create user info object with first and last name
      const userInfo = {
        first_name: userProfile?.first_name || '',
        last_name: userProfile?.last_name || ''
      };

      console.log('Calling webhook with company data:', companyData);
      console.log('Calling webhook with business data:', businessData);
      console.log('Calling webhook with additional data:', additionalData);
      console.log('Calling webhook with user info:', userInfo);
      
      // Call the webhook with the additional data and user info
      const response = await callValuePropositionWebhook(webhookUrl, companyData, businessData, additionalData, userInfo);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Webhook error: ${errorText}`);
      }

      const data = await response.json();
      console.log('Raw webhook response:', JSON.stringify(data));
      
      // Extract data from the response with more robust parsing
      let score = 0;
      let advice = '';
      let introduction = '';
      
      // Direct format
      if (typeof data.score === 'number' || typeof data.score === 'string') {
        score = typeof data.score === 'number' ? data.score : parseInt(data.score, 10) || 0;
        advice = data.advice || '';
        introduction = data.introduction || '';
      } 
      // Nested in output object
      else if (data.output) {
        const output = data.output;
        score = typeof output.score === 'number' ? output.score : parseInt(output.score, 10) || 0;
        advice = output.advice || '';
        introduction = output.introduction || '';
      } 
      // Array format with output object
      else if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        if (firstItem.output) {
          const output = firstItem.output;
          score = typeof output.score === 'number' ? output.score : parseInt(output.score, 10) || 0;
          advice = output.advice || '';
          introduction = output.introduction || '';
        } else if (typeof firstItem.score === 'number' || typeof firstItem.score === 'string') {
          score = typeof firstItem.score === 'number' ? firstItem.score : parseInt(firstItem.score, 10) || 0;
          advice = firstItem.advice || '';
          introduction = firstItem.introduction || '';
        }
      }
      
      console.log('Extracted data for callback:', { score, advice, introduction });
      
      // Call the success callback with the extracted data
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
