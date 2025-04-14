
import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import Button from '@/components/Button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { callValuePropositionWebhook, getValuePropositionWebhookUrl } from '@/services/valueProposition';

interface MagicValuePropositionButtonProps {
  companyId: string;
  onSuccess: (score: number | null, advice: string | null, introduction: string | null, subject: string | null) => void;
}

const MagicValuePropositionButton = ({ companyId, onSuccess }: MagicValuePropositionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  const handleGenerateValueProposition = async () => {
    if (!user || !companyId) return;

    setIsLoading(true);
    try {
      // Fetch company data
      const { data: companyData, error: companyError } = await supabase
        .from('company_searches')
        .select('*')
        .eq('id', companyId)
        .single();

      if (companyError) throw companyError;

      // Fetch webhook URL
      const webhookUrl = await getValuePropositionWebhookUrl();
      if (!webhookUrl) {
        throw new Error("Value proposition webhook URL not configured");
      }

      // Get business data from user profile
      const businessData = userProfile?.business_data || null;
      const userInfo = {
        first_name: userProfile?.first_name || "",
        last_name: userProfile?.last_name || ""
      };

      // Call the webhook
      const response = await callValuePropositionWebhook(
        webhookUrl,
        companyData,
        businessData,
        null,
        userInfo
      );

      const responseData = await response.json();
      console.log('Webhook response data:', responseData);

      // Extract data from response
      let extractedData = { score: null, advice: null, introduction: null, subject: null };
      
      if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
        const output = responseData[0].output;
        extractedData = {
          score: output.score || null,
          advice: output.advice || null,
          introduction: output.introduction || null,
          subject: output.subject || null
        };
      } else if (responseData.score !== undefined || responseData.advice || responseData.introduction || responseData.subject) {
        extractedData = {
          score: responseData.score || null,
          advice: responseData.advice || null,
          introduction: responseData.introduction || null,
          subject: responseData.subject || null
        };
      }
      
      console.log('Extracted data:', extractedData);
      
      // Call onSuccess with properly handled null values
      onSuccess(
        extractedData.score,
        extractedData.advice,
        extractedData.introduction,
        extractedData.subject
      );

      toast({
        title: "Success",
        description: "Value proposition generated successfully",
      });
      
    } catch (error: any) {
      console.error('Error generating value proposition:', error);
      console.error('Error details:', error.details || {});
      
      toast({
        title: "Error",
        description: `Failed to generate value proposition: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerateValueProposition}
      variant="outline"
      disabled={isLoading}
      className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 border-none"
    >
      {isLoading ? (
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
