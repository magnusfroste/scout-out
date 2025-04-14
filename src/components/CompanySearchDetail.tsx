
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
import SendEmailButton from '@/components/dashboard/SendEmailButton';
import { Input } from '@/components/ui/input';
import { CompanySearchRecord } from '@/types/company';

interface CompanySearchDetailProps {
  searchId: string;
  onBack: () => void;
  onUpdate?: (id: string, data: any) => void;
}

interface CompanySearch {
  id: string;
  company_name: string;
  contact?: string | null;
  contact_info?: any | null;
  created_at: string;
  email?: string | null;
  phone?: string | null;
  result?: any | null;
  role?: string | null;
  score?: number | null;
  advice?: string | null;
  introduction?: string | null;
  subject?: string | null;
  user_id: string;
  www?: string | null;
}

const CompanySearchDetail = ({ searchId, onBack, onUpdate }: CompanySearchDetailProps) => {
  const [companySearch, setCompanySearch] = useState<CompanySearch | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [displayScore, setDisplayScore] = useState<string>('');
  const [displayAdvice, setDisplayAdvice] = useState<string>('');
  const [displayIntroduction, setDisplayIntroduction] = useState<string>('');
  const [displaySubject, setDisplaySubject] = useState<string>('');
  
  const [dbScore, setDbScore] = useState<string>('');
  const [dbAdvice, setDbAdvice] = useState<string>('');
  const [dbIntroduction, setDbIntroduction] = useState<string>('');
  const [dbSubject, setDbSubject] = useState<string>('');
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const { user, userProfile } = useAuth();
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
      setDbSubject(searchData.subject || '');
      
      setDisplayScore(searchData.score?.toString() || '');
      setDisplayAdvice(searchData.advice || '');
      setDisplayIntroduction(searchData.introduction || '');
      setDisplaySubject(searchData.subject || '');

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

  const generateWebhookExampleBody = () => {
    if (!companySearch || !questionAnswers.length) {
      return {
        company_id: "example-id-12345",
        company_name: "Example Company",
        search_data: {
          company_name: "Example Company",
          industry: "Technology",
          products: ["Software", "Hardware", "Services"],
          website: "https://example.com",
          employees: "100-500",
          headquarters: "New York, USA",
        },
        questions: [
          {
            id: "q1",
            question: "What are your company's main products?",
            answer: "Our company specializes in developing enterprise software solutions."
          },
        ],
        user_business_data: {
          company_name: "Your Business Name",
          about_us: "Brief description of what your business does",
          services: {
            "Service 1": "Description of service 1",
            "Service 2": "Description of service 2"
          },
          value_proposition: "What makes your business unique",
          clients: ["Client 1", "Client 2"],
          website: "https://yourbusiness.com"
        }
      };
    }

    const businessData = userProfile?.business_data || {
      company_name: "Your Business",
      about_us: "Information about your company would appear here",
      services: {
        "Service Category": "Service description would appear here"
      },
      value_proposition: "Your unique value proposition would appear here",
      clients: ["Example Client"],
      website: userProfile?.website_url || "https://example.com"
    };

    const searchData = {
      company_name: companySearch.company_name,
      website: companySearch.www || "https://example.com",
      industry: "Industry information would appear here",
      products: ["Product information would appear here"],
      founded: "Foundation year would appear here",
      employees: "Employee count would appear here",
      headquarters: "Headquarters location would appear here",
      revenue: "Revenue information would appear here",
      contact: companySearch.contact || null,
      email: companySearch.email || null,
      phone: companySearch.phone || null,
      role: companySearch.role || null
    };

    const questions = questionAnswers.map((qa) => ({
      id: qa.question_id,
      question: qa.agent_questions.question,
      answer: qa.answer || "No answer available"
    }));

    return {
      company_id: searchId,
      company_name: companySearch.company_name,
      search_data: searchData,
      questions: questions,
      user_business_data: businessData,
      expected_response: {
        score: "A number from 1-5 representing the fit/potential",
        advice: "Strategic advice for approaching this company",
        introduction: "A draft introduction message to send"
      }
    };
  };

  const handleSave = async () => {
    if (!user || !searchId || !companySearch) return;

    setIsSaving(true);
    try {
      console.log('Starting save operation for search ID:', searchId);
      console.log('Value proposition data to save:', {
        score: displayScore ? parseInt(displayScore) : null,
        advice: displayAdvice,
        introduction: displayIntroduction,
        subject: displaySubject
      });

      const scoreValue = displayScore ? parseInt(displayScore) : null;
      
      const success = await saveValuePropositionData(
        searchId,
        scoreValue,
        displayAdvice,
        displayIntroduction,
        displaySubject
      );

      if (success) {
        setDbScore(displayScore);
        setDbAdvice(displayAdvice);
        setDbIntroduction(displayIntroduction);
        setDbSubject(displaySubject);
        
        setHasUnsavedChanges(false);

        setCompanySearch({
          ...companySearch,
          score: scoreValue,
          advice: displayAdvice,
          introduction: displayIntroduction,
          subject: displaySubject
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
            introduction: displayIntroduction,
            subject: displaySubject
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

  const handleMagicSuccess = (newScore: number, newAdvice: string, newIntroduction: string, newSubject: string) => {
    console.log('Magic value proposition generated:', { newScore, newAdvice, newIntroduction, newSubject });
    
    setDisplayScore(newScore.toString());
    setDisplayAdvice(newAdvice);
    setDisplayIntroduction(newIntroduction);
    setDisplaySubject(newSubject);
    
    setHasUnsavedChanges(true);
  };

  const handleCopySuccess = () => {
    setCopySuccess(true);
    toast({
      title: "Copied!",
      description: "Introduction text copied to clipboard",
      duration: 2000,
    });
    
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
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
      displayIntroduction !== dbIntroduction || 
      displaySubject !== dbSubject;
    
    setHasUnsavedChanges(hasChanges);
  }, [displayScore, displayAdvice, displayIntroduction, displaySubject, dbScore, dbAdvice, dbIntroduction, dbSubject]);

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

  const webhookExampleBody = generateWebhookExampleBody();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={onBack} size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
      </div>

      <Card className="shadow-md border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight">{companySearch?.company_name}</CardTitle>
            <CardDescription className="text-sm mt-1">
              Searched on {companySearch ? formatDate(companySearch.created_at) : ''}
            </CardDescription>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !hasUnsavedChanges}
            className={`${hasUnsavedChanges ? 'bg-green-600 hover:bg-green-700' : ''} transition-all duration-200`}
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
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Value Proposition</h3>
              <MagicValuePropositionButton 
                companyId={searchId} 
                onSuccess={handleMagicSuccess} 
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="advice" className="text-sm font-medium">AI Advice</Label>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg whitespace-pre-wrap min-h-[200px] text-sm border border-gray-200 dark:border-gray-800 shadow-inner">
                  {displayAdvice || 'No advice generated yet. Use the "Magic Write Value Proposition" button to generate advice.'}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">Email Subject</Label>
                <Input
                  id="subject"
                  value={displaySubject}
                  onChange={(e) => {
                    setDisplaySubject(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Enter email subject line..."
                  className="mb-3 p-2 text-base font-sans border-gray-200 dark:border-gray-800 shadow-inner focus:border-primary focus:ring-1 focus:ring-primary"
                />

                <Label htmlFor="introduction" className="text-sm font-medium">Introduction Draft</Label>
                <Textarea
                  id="introduction"
                  value={displayIntroduction}
                  onChange={(e) => {
                    setDisplayIntroduction(e.target.value);
                    setHasUnsavedChanges(true);
                    adjustTextareaHeight(e);
                  }}
                  placeholder="Draft an introduction email or message..."
                  className="min-h-[200px] p-4 text-base resize-none overflow-hidden font-sans border-gray-200 dark:border-gray-800 shadow-inner focus:border-primary focus:ring-1 focus:ring-primary"
                  onFocus={(e) => adjustTextareaHeight(e as unknown as React.ChangeEvent<HTMLTextAreaElement>)}
                  copyable={true}
                  onCopy={handleCopySuccess}
                />
                <div className="flex justify-end mt-2 gap-2">
                  {companySearch?.email && (
                    <SendEmailButton
                      recipientEmail={companySearch.email}
                      recipientName={companySearch.company_name}
                      subject={displaySubject}
                      content={displayIntroduction}
                      disabled={!displayIntroduction}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-2" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="space-y-3">
                {companySearch.www && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium min-w-24">Website:</span>
                    <a 
                      href={companySearch.www.startsWith('http') ? companySearch.www : `https://${companySearch.www}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {companySearch.www}
                    </a>
                  </div>
                )}
                {companySearch.contact && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium min-w-24">Contact:</span>
                    <span>{companySearch.contact}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {companySearch.email && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium min-w-24">Email:</span>
                    <a
                      href={`mailto:${companySearch.email}`}
                      className="text-blue-600 hover:underline break-all"
                    >
                      {companySearch.email}
                    </a>
                  </div>
                )}
                {companySearch.phone && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium min-w-24">Phone:</span>
                    <a
                      href={`tel:${companySearch.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {companySearch.phone}
                    </a>
                  </div>
                )}
                {companySearch.role && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium min-w-24">Role:</span>
                    <span>{companySearch.role}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Separator className="my-2" />

          {questionAnswers.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Questions & Answers</h3>
              <Card className="border border-gray-200 dark:border-gray-800">
                <CardContent className="p-5">
                  <div className="space-y-6">
                    {questionAnswers.map((qa) => (
                      <div key={qa.id} className="pb-4">
                        <h4 className="font-medium text-md mb-2">{qa.agent_questions.question}</h4>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                          <p className="whitespace-pre-wrap text-sm">{qa.answer || 'No answer available'}</p>
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Questions & Answers</h3>
              <p className="text-muted-foreground">No questions or answers available for this company.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySearchDetail;
