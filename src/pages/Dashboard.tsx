
import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CompanySearch } from '@/types/search';
import { cn } from '@/lib/utils';

import QuestionManager from '@/components/dashboard/QuestionManager';
import SearchHistory from '@/components/dashboard/SearchHistory';
import CreditDisplay from '@/components/dashboard/CreditDisplay';
import MyBusiness from '@/components/dashboard/MyBusiness';
import CompanySearchComponent from '@/components/dashboard/CompanySearch';
import ValuePropositionTab from '@/components/dashboard/ValuePropositionTab';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import WorkflowStepper from '@/components/dashboard/WorkflowStepper';
import { useOnboarding, WorkflowStep } from '@/hooks/useOnboarding';

type Question = {
  id: string;
  question: string;
};

const Dashboard = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searches, setSearches] = useState<CompanySearch[]>([]);
  const [isLoadingSearches, setIsLoadingSearches] = useState(false);
  const [isDeletingSearch, setIsDeletingSearch] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('mybusiness');
  const { toast } = useToast();

  const { user, loading, userProfile } = useAuth();

  // Calculate workflow progress
  const businessProfileComplete = !!(userProfile?.business_data);
  const questionsComplete = questions.length > 0;
  const researchComplete = searches.length > 0;
  const valuePropositionComplete = searches.some(s => s.introduction || s.subject || s.advice);

  const workflowProgress = {
    businessProfileComplete,
    questionsComplete,
    researchComplete,
    valuePropositionComplete,
  };

  const { 
    showOnboarding, 
    isLoaded, 
    completeOnboarding, 
    firstIncompleteStep,
    completedStepCount,
  } = useOnboarding(workflowProgress);

  // Auto-navigate to first incomplete step on initial load
  useEffect(() => {
    if (isLoaded && !showOnboarding && firstIncompleteStep && activeTab === 'mybusiness') {
      // Only auto-navigate if user hasn't manually selected a tab
      setActiveTab(firstIncompleteStep);
    }
  }, [isLoaded, showOnboarding, firstIncompleteStep]);

  useEffect(() => {
    if (user) {
      fetchQuestions();
      fetchSearches();
    }
  }, [user]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_questions')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      setQuestions(data || []);
    } catch (error: any) {
      console.error('Error fetching questions:', error);
    }
  };

  const fetchSearches = useCallback(async () => {
    if (!user) {
      console.log("fetchSearches called but no user is logged in");
      return;
    }
    
    console.log("fetchSearches called - refreshing search history");
    setIsLoadingSearches(true);
    try {
      setSearches([]);
      
      const { data, error } = await supabase
        .from('company_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching searches:', error);
        console.log('Error details:', JSON.stringify(error));
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} searches for user ${user.id}`);
      
      if (data && data.length > 0) {
        console.log('Search IDs:', data.map(s => s.id).join(', '));
      }
      
      setSearches(data || []);
    } catch (error: any) {
      console.error('Error fetching searches:', error);
      toast({
        title: "Error",
        description: "Failed to refresh search history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSearches(false);
    }
  }, [user, toast]);

  const handleDeleteSearch = async (id: string) => {
    if (!id || !user) {
      console.error("Invalid search ID or user not logged in");
      return;
    }

    console.log(`Starting deletion process for search ID: ${id}`);
    setIsDeletingSearch(id);

    try {
      const { error: answersError } = await supabase
        .from('company_question_answers')
        .delete()
        .eq('company_search_id', id);
      
      if (answersError) {
        console.error('Error deleting answers:', answersError);
        console.log('Error details:', JSON.stringify(answersError));
      } else {
        console.log('Successfully deleted answers');
      }

      const { error: deleteError } = await supabase
        .from('company_searches')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting search:', deleteError);
        console.log('Error details:', JSON.stringify(deleteError));
        throw new Error(`Failed to delete search: ${deleteError.message}`);
      }

      console.log(`Successfully deleted search with ID: ${id}`);
      
      setSearches(prev => prev.filter(search => search.id !== id));
      
      await fetchSearches();
      
      toast({
        title: "Success",
        description: "Search deleted successfully",
      });
    } catch (error: any) {
      console.error('Error during delete operation:', error);
      
      toast({
        title: "Error",
        description: "Failed to delete search. Please try again.",
        variant: "destructive",
      });
      
      fetchSearches();
    } finally {
      setIsDeletingSearch(null);
    }
  };

  const handleTabChange = (step: WorkflowStep) => {
    setActiveTab(step);
  };
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      {/* Onboarding Modal */}
      {isLoaded && (
        <OnboardingModal 
          open={showOnboarding} 
          onComplete={(navigateToStep) => {
            completeOnboarding();
            if (navigateToStep) {
              setActiveTab(navigateToStep);
            }
          }}
          businessProfileComplete={businessProfileComplete}
          questionsComplete={questionsComplete}
          researchComplete={researchComplete}
          valuePropositionComplete={valuePropositionComplete}
          firstIncompleteStep={firstIncompleteStep}
          completedStepCount={completedStepCount}
        />
      )}
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header with credits */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Workflow</h1>
              <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
                Följ stegen för att hitta och engagera potentiella kunder
              </p>
            </div>
            {userProfile && (
              <CreditDisplay credits={userProfile.credits} />
            )}
          </div>

          {/* Unified Workflow Stepper */}
          <div className="mb-6">
            <WorkflowStepper
              businessProfileComplete={businessProfileComplete}
              questionsComplete={questionsComplete}
              researchComplete={researchComplete}
              valuePropositionComplete={valuePropositionComplete}
              activeStep={activeTab as WorkflowStep}
              onStepClick={handleTabChange}
            />
          </div>
          
          <Tabs 
            defaultValue="mybusiness" 
            className="w-full"
            onValueChange={(value) => handleTabChange(value as WorkflowStep)}
            value={activeTab}
          >
            <TabsContent value="mybusiness">
              <MyBusiness />
            </TabsContent>
            
            <TabsContent value="questions">
              <QuestionManager 
                questions={questions} 
                setQuestions={setQuestions} 
                userId={user?.id} 
              />
            </TabsContent>
            
            <TabsContent value="search">
              <CompanySearchComponent 
                questions={questions}
                onSearch={fetchSearches}
                searches={searches}
                isLoadingSearches={isLoadingSearches}
                onSearchDeleted={fetchSearches}
                isDeletingSearch={isDeletingSearch}
              />
            </TabsContent>
            
            <TabsContent value="valueproposition">
              <ValuePropositionTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
