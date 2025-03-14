
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

      // Call the webhook
      const response = await callValuePropositionWebhook(webhookUrl, companyData, businessData);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Webhook error: ${errorText}`);
      }

      const data = await response.json();
      
      // Update the company search record with the generated data
      const { error: updateError } = await supabase
        .from('company_searches')
        .update({
          score: data.score,
          advice: data.advice,
          introduction: data.introduction
        })
        .eq('id', companyId);

      if (updateError) throw updateError;

      // Call the success callback
      onSuccess(data.score, data.advice, data.introduction);

      toast({
        title: 'Success',
        description: 'AI has generated value proposition content for you',
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
