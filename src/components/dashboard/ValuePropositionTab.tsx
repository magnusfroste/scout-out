
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import CompanySearchesList from '@/components/CompanySearchesList';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { callValuePropositionWebhook, getValuePropositionWebhookUrl } from '@/services/valuePropositionWebhookService';
import { supabase } from '@/integrations/supabase/client';
import { CompanySearch } from '@/hooks/useCompanySearches';
import { useCompanySearches } from '@/hooks/useCompanySearches';

const ValuePropositionTab = () => {
  const { user, userProfile } = useAuth();
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const { toast } = useToast();
  const { searches, isLoading, isDeleting, handleDeleteSearch, fetchSearches } = useCompanySearches();

  const handleGenerateAllPropositions = async (searches: CompanySearch[]) => {
    if (!user || !userProfile || searches.length === 0) return;
    
    setIsGeneratingAll(true);
    try {
      // Get the webhook URL for value proposition
      const webhookUrl = await getValuePropositionWebhookUrl();
      if (!webhookUrl) {
        throw new Error('Value Proposition Webhook URL not configured');
      }
      
      // Get business data from user profile
      const businessData = userProfile?.business_data || {};
      
      const updatedCompanies = [];
      
      // Process each company search
      for (const search of searches) {
        if (!search.score) { // Only generate for companies without a score
          try {
            console.log(`Processing company: ${search.company_name}`);
            
            // Call the webhook
            const response = await callValuePropositionWebhook(webhookUrl, search, businessData);
            
            if (!response.ok) {
              console.error(`Error generating value proposition for ${search.company_name}`);
              continue;
            }
            
            const data = await response.json();
            console.log(`Webhook response for ${search.company_name}:`, data);
            
            // Update the company search record
            const { error: updateError } = await supabase
              .from('company_searches')
              .update({
                score: data.score,
                advice: data.advice,
                introduction: data.introduction
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
      
      // Refresh the searches to show updated data
      await fetchSearches();
      
    } catch (error: any) {
      console.error('Error generating value propositions:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate value propositions',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-opacity-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-semibold tracking-tight">Value Proposition</CardTitle>
          <CardDescription className="text-base">
            Review your researched companies, rate their potential, and prepare your approach.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <CompanySearchesList 
            searches={searches}
            isLoading={isLoading}
            isDeleting={isDeleting}
            onDelete={handleDeleteSearch}
            onRefresh={fetchSearches}
            onBatchAction={(searches) => handleGenerateAllPropositions(searches)}
            batchActionButton={
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {}} 
                disabled={isGeneratingAll}
                className="bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 shadow-sm"
              >
                {isGeneratingAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Magic Generate All
                  </>
                )}
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ValuePropositionTab;
