
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CompanySearch } from '@/hooks/useCompanySearches';
import { supabase } from '@/integrations/supabase/client';
import { callValuePropositionWebhook, getValuePropositionWebhookUrl } from '@/services/valueProposition';

interface ValuePropositionGeneratorProps {
  onGenerateStart: () => void;
  onGenerateEnd: () => void;
  onSuccess: () => void;
}

export const useValuePropositionGenerator = ({
  onGenerateStart,
  onGenerateEnd,
  onSuccess
}: ValuePropositionGeneratorProps) => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const generateAllPropositions = async (searches: CompanySearch[]) => {
    if (!user || !userProfile || searches.length === 0) return;
    
    onGenerateStart();
    try {
      const webhookUrl = await getValuePropositionWebhookUrl();
      if (!webhookUrl) {
        throw new Error('Value Proposition Webhook URL not configured');
      }
      
      const businessData = userProfile?.business_data || {};
      
      const updatedCompanies = [];
      
      for (const search of searches) {
        if (!search.score) {
          try {
            console.log(`Processing company: ${search.company_name}`);
            
            const response = await callValuePropositionWebhook(webhookUrl, search, businessData);
            
            if (!response.ok) {
              console.error(`Error generating value proposition for ${search.company_name}`);
              continue;
            }
            
            const data = await response.json();
            console.log(`Webhook response for ${search.company_name}:`, data);
            
            const { error: updateError } = await supabase
              .from('company_searches')
              .update({
                score: data.score,
                advice: data.advice,
                introduction: data.introduction,
                subject: data.subject
              })
              .eq('id', search.id);
              
            if (updateError) {
              console.error('Update error:', updateError);
              continue;
            }
            
            updatedCompanies.push(search.company_name);
          } catch (error) {
            console.error(`Error processing company ${search.company_name}:`, error);
          }
        }
      }
      
      if (updatedCompanies.length > 0) {
        toast({
          title: 'Success',
          description: `Generated value propositions for ${updatedCompanies.length} companies`,
        });
      } else {
        toast({
          title: 'Info',
          description: 'No new value propositions were generated',
        });
      }
      
      onSuccess();
      
    } catch (error: any) {
      console.error('Error generating value propositions:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate value propositions',
        variant: 'destructive',
      });
    } finally {
      onGenerateEnd();
    }
  };

  return { generateAllPropositions };
};
