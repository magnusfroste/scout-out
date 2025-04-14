
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { callValuePropositionWebhook, getValuePropositionWebhookUrl } from '@/services/valuePropositionWebhookService';
import { supabase } from '@/integrations/supabase/client';

interface MagicValuePropositionButtonProps {
  companyId: string;
  onSuccess: (score: number, advice: string, introduction: string, subject: string) => void;
}

const MagicValuePropositionButton: React.FC<MagicValuePropositionButtonProps> = ({ 
  companyId,
  onSuccess
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  const handleGenerateValueProposition = async () => {
    if (!user || !userProfile) {
      toast({
        title: 'Error',
        description: 'You must be logged in to generate a value proposition',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Starting value proposition generation for company ID:', companyId);

      // Get the company data first
      const { data: companyData, error: companyError } = await supabase
        .from('company_searches')
        .select('*')
        .eq('id', companyId)
        .single();

      if (companyError) {
        throw companyError;
      }

      if (!companyData) {
        throw new Error('Company data not found');
      }

      console.log('Retrieved company data:', companyData);

      // Get webhook URL from settings
      const webhookUrl = await getValuePropositionWebhookUrl();
      if (!webhookUrl) {
        throw new Error('Value Proposition Webhook URL not configured');
      }

      console.log('Using webhook URL:', webhookUrl);
      console.log('Using business data:', userProfile.business_data);

      // Call the webhook
      const response = await callValuePropositionWebhook(
        webhookUrl,
        companyData,
        userProfile.business_data || {},
        null,
        {
          first_name: userProfile.first_name,
          last_name: userProfile.last_name
        }
      );

      if (!response.ok) {
        throw new Error(`Webhook request failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Webhook response data:', data);

      if (!data) {
        throw new Error('No data returned from webhook');
      }

      // Extract the relevant data
      const score = typeof data.score === 'number' ? data.score : null;
      const advice = data.advice || null;
      const introduction = data.introduction || null;
      const subject = data.subject || null;

      console.log('Extracted data:', { score, advice, introduction, subject });

      // Call the success callback with the data
      onSuccess(score, advice, introduction, subject);

      toast({
        title: 'Success',
        description: 'Value proposition generated successfully',
      });
    } catch (error: any) {
      console.error('Error generating value proposition:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      toast({
        title: 'Error',
        description: `Failed to generate value proposition: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="default" 
      size="sm" 
      onClick={handleGenerateValueProposition}
      disabled={isGenerating}
      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Magic Write Value Proposition
        </>
      )}
    </Button>
  );
};

export default MagicValuePropositionButton;
