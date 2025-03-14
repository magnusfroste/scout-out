import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Button from '@/components/Button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import MagicValuePropositionButton from '@/components/dashboard/MagicValuePropositionButton';
import { ScrollArea } from "@/components/ui/scroll-area";
import { saveValuePropositionData } from '@/services/valuePropositionWebhookService';

interface CompanySearchDetailProps {
  searchId: string;
  onBack: () => void;
  onUpdate?: (id: string, data: any) => void;
}

const CompanySearchDetail = ({ searchId, onBack, onUpdate }: CompanySearchDetailProps) => {
  const [companySearch, setCompanySearch] = useState<any>(null);
  const [questionAnswers, setQuestionAnswers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [displayScore, setDisplayScore] = useState<string>('');
  const [displayAdvice, setDisplayAdvice] = useState<string>('');
  const [displayIntroduction, setDisplayIntroduction] = useState<string>('');
  
  const [dbScore, setDbScore] = useState<string>('');
  const [dbAdvice, setDbAdvice] = useState<string>('');
  const [dbIntroduction, setDbIntroduction] = useState<string>('');
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (searchId) {
      fetchCompanyDetails();
    }
  }, [searchId]);

  const fetchCompanyDetails = async () => {
    if (!user || !searchId) return;

    setIsLoading(true);
    try {
      const { data: searchData, error: searchError } = await supabase
        .from('company_searches')
        .select('*')
        .eq('id', searchId)
        .single();

      if (searchError) throw searchError;
      console.log('Fetched company search data:', searchData);
      setCompanySearch(searchData);

      setDbScore(searchData.score?.toString() || '');
      setDbAdvice(searchData.advice || '');
      setDbIntroduction(searchData.introduction || '');
      
      setDisplayScore(searchData.score?.toString() || '');
      setDisplayAdvice(searchData.advice || '');
      setDisplayIntroduction(searchData.introduction || '');

      const { data: answersData, error: answersError } = await supabase
        .from('company_question_answers')
        .select(`
          id,
          answer,
          question_id,
          created_at,
          agent_questions (
            id,
            question
          )
        `)
        .eq('company_search_id', searchId)
        .order('created_at', { ascending: true });

      if (answersError) throw answersError;
      setQuestionAnswers(answersData || []);

    } catch (error: any) {
      console.error('Error fetching company details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !searchId || !companySearch) return;

    setIsSaving(true);
    try {
      console.log('Starting save operation for search ID:', searchId);
      console.log('Value proposition data to save:', {
        score: displayScore ? parseInt(displayScore) : null,
        advice: displayAdvice,
        introduction: displayIntroduction
      });

      const scoreValue = displayScore ? parseInt(displayScore) : null;
      
      const success = await saveValuePropositionData(
        searchId,
        scoreValue,
        displayAdvice,
        displayIntroduction
      );

      if (success) {
        setDbScore(displayScore);
        setDbAdvice(displayAdvice);
        setDbIntroduction(displayIntroduction);
        
        setHasUnsavedChanges(false);

        setCompanySearch({
          ...companySearch,
          score: scoreValue,
          advice: displayAdvice,
          introduction: displayIntroduction
        });

        toast({
          title: 'Success',
          description: 'Value proposition updated successfully',
        });

        if (onUpdate) {
          onUpdate(searchId, {
            ...companySearch,
            score: scoreValue,
            advice: displayAdvice,
            introduction: displayIntroduction
          });
        }
      }
    } catch (error: any) {
      console.error('Error updating company details:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast({
        title: 'Error',
        description: `Failed to update value proposition: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMagicSuccess = (newScore: number, newAdvice: string, newIntroduction: string) => {
    console.log('Magic value proposition generated:', { newScore, newAdvice, newIntroduction });
    
    setDisplayScore(newScore.toString());
    setDisplayAdvice(newAdvice);
    setDisplayIntroduction(newIntroduction);
    
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    const introTextarea = document.getElementById('introduction') as HTMLTextAreaElement;
    if (introTextarea) {
      introTextarea.style.height = 'auto';
      introTextarea.style.height = `${introTextarea.scrollHeight}px`;
    }
  }, [displayIntroduction]);

  useEffect(() => {
    const hasChanges = 
      displayScore !== dbScore || 
      displayAdvice !== dbAdvice || 
      displayIntroduction !== dbIntroduction;
    
    setHasUnsavedChanges(hasChanges);
  }, [displayScore, displayAdvice, displayIntroduction, dbScore, dbAdvice, dbIntroduction]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!companySearch) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">Company search not found</p>
        <Button onClick={onBack}>Back to List</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{companySearch.company_name}</CardTitle>
          <CardDescription>
            Searched on {formatDate(companySearch.created_at)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="space-y-2">
                {companySearch.www && (
                  <div>
                    <strong>Website:</strong>{' '}
                    <a 
                      href={companySearch.www.startsWith('http') ? companySearch.www : `https://${companySearch.www}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {companySearch.www}
                    </a>
                  </div>
                )}
                {companySearch.contact && (
                  <div>
                    <strong>Contact:</strong> {companySearch.contact}
                  </div>
                )}
                {companySearch.email && (
                  <div>
                    <strong>Email:</strong>{' '}
                    <a
                      href={`mailto:${companySearch.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {companySearch.email}
                    </a>
                  </div>
                )}
                {companySearch.phone && (
                  <div>
                    <strong>Phone:</strong>{' '}
                    <a
                      href={`tel:${companySearch.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {companySearch.phone}
                    </a>
                  </div>
                )}
                {companySearch.role && (
                  <div>
                    <strong>Role:</strong> {companySearch.role}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Value Proposition</h3>
                <MagicValuePropositionButton 
                  companyId={searchId} 
                  onSuccess={handleMagicSuccess} 
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="score">Score (1-5)</Label>
                  <div className="bg-muted p-3 rounded-md text-lg font-medium">
                    {displayScore ? displayScore : 'Not rated yet'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advice">AI Advice</Label>
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap min-h-[120px]">
                    {displayAdvice || 'No advice generated yet. Use the "Magic Write Value Proposition" button to generate advice.'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="introduction">Introduction Draft</Label>
                  <Textarea
                    id="introduction"
                    value={displayIntroduction}
                    onChange={(e) => {
                      setDisplayIntroduction(e.target.value);
                      setHasUnsavedChanges(true);
                      adjustTextareaHeight(e);
                    }}
                    placeholder="Draft an introduction email or message..."
                    className="min-h-[180px] resize-none overflow-hidden"
                    onFocus={(e) => adjustTextareaHeight(e as unknown as React.ChangeEvent<HTMLTextAreaElement>)}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Company Data</h3>
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="p-4">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(companySearch.result, null, 2)}
                </pre>
              </div>
            </ScrollArea>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !hasUnsavedChanges}
            className={`ml-auto ${hasUnsavedChanges ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {hasUnsavedChanges ? 'Save Changes' : 'No Changes to Save'}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {questionAnswers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Questions & Answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questionAnswers.map((qa) => (
              <div key={qa.id} className="pb-4">
                <h4 className="font-medium text-md mb-2">{qa.agent_questions.question}</h4>
                <div className="bg-muted p-4 rounded-md">
                  <p className="whitespace-pre-wrap text-sm">{qa.answer || 'No answer available'}</p>
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Questions & Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No questions or answers available for this company.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompanySearchDetail;

