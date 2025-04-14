import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import CompanySearchesList from '@/components/CompanySearchesList';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { callValuePropositionWebhook, getValuePropositionWebhookUrl } from '@/services/valueProposition';
import { supabase } from '@/integrations/supabase/client';
import { CompanySearch } from '@/hooks/useCompanySearches';
import { useCompanySearches } from '@/hooks/useCompanySearches';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ValuePropositionTab = () => {
  const { user, userProfile } = useAuth();
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const { toast } = useToast();
  const { searches, isLoading, isDeleting, handleDeleteSearch, fetchSearches } = useCompanySearches();

  const filteredAndSortedSearches = React.useMemo(() => {
    const filtered = searches.filter(search => 
      search.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (search.contact && search.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (search.email && search.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'az':
          return a.company_name.localeCompare(b.company_name);
        case 'za':
          return b.company_name.localeCompare(a.company_name);
        case 'score_high':
          if (a.score === null && b.score === null) return 0;
          if (a.score === null) return 1;
          if (b.score === null) return -1;
          return b.score - a.score;
        case 'score_low':
          if (a.score === null && b.score === null) return 0;
          if (a.score === null) return 1;
          if (b.score === null) return -1;
          return a.score - b.score;
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [searches, searchTerm, sortOption]);

  const handleGenerateAllPropositions = async (searches: CompanySearch[]) => {
    if (!user || !userProfile || searches.length === 0) return;
    
    setIsGeneratingAll(true);
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

  const handleBack = () => {
    console.log("Back button clicked");
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-full sm:w-[220px] bg-gray-50 border-gray-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="az">Company Name (A-Z)</SelectItem>
                <SelectItem value="za">Company Name (Z-A)</SelectItem>
                <SelectItem value="score_high">Score (High to Low)</SelectItem>
                <SelectItem value="score_low">Score (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <CompanySearchesList 
            searches={filteredAndSortedSearches}
            isLoading={isLoading}
            isDeleting={isDeleting}
            onDelete={handleDeleteSearch}
            onRefresh={fetchSearches}
            onBatchAction={(searches) => handleGenerateAllPropositions(searches)}
            showDeleteButton={false}
            showBackButton={false}
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
