import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CompanySearch } from '@/types/search';

import QuestionManager from '@/components/dashboard/QuestionManager';
import MyBusiness from '@/components/dashboard/MyBusiness';
import CompanySearchComponent from '@/components/dashboard/CompanySearch';
import ValuePropositionTab from '@/components/dashboard/ValuePropositionTab';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import WorkflowStepper from '@/components/dashboard/WorkflowStepper';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import Confetti from '@/components/ui/confetti';
import { useOnboarding, WorkflowStep } from '@/hooks/useOnboarding';

const CELEBRATION_KEY = 'workflow_celebration_shown';

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
  const [showConfetti, setShowConfetti] = useState(false);
  const prevCompletedCount = useRef<number>(0);
  const { toast } = useToast();

  const { user, loading, userProfile } = useAuth();

  // Extract first name from profile or email
  const firstName = userProfile?.first_name || 
    (user?.email?.split('@')[0]?.split('.')[0]?.charAt(0).toUpperCase() + 
     user?.email?.split('@')[0]?.split('.')[0]?.slice(1)) || 
    undefined;

  // Calculate workflow progress
  const businessProfileComplete = !!(userProfile?.business_data);
  const questionsComplete = questions.length > 0;
  const researchComplete = searches.length > 0;
  const valuePropositionComplete = searches.some(s => s.introduction || s.subject || s.advice);

  // Find latest research without value proposition
  const pendingProspect = React.useMemo(() => {
    const pending = searches.find(s => s.result && !(s.introduction || s.subject || s.advice));
    return pending ? { id: pending.id, companyName: pending.company_name } : null;
  }, [searches]);

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
    showOnboardingAgain,
    firstIncompleteStep,
    completedStepCount,
  } = useOnboarding(workflowProgress);

  // Celebration when all steps complete
  useEffect(() => {
    if (completedStepCount === 4 && prevCompletedCount.current < 4) {
      const hasSeenCelebration = localStorage.getItem(CELEBRATION_KEY);
      if (!hasSeenCelebration) {
        setShowConfetti(true);
        localStorage.setItem(CELEBRATION_KEY, 'true');
        toast({
          title: "🎉 Congratulations!",
          description: "You have completed all steps in the workflow!",
        });
      }
    }
    prevCompletedCount.current = completedStepCount;
  }, [completedStepCount, toast]);

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
        <main className="flex-grow container mx-auto px-4 py-6 md:py-12">
          <DashboardSkeleton />
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
      
      {/* Confetti celebration */}
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      
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
          {/* Personal Header */}
          <DashboardHeader
            firstName={firstName}
            credits={userProfile?.credits}
            firstIncompleteStep={firstIncompleteStep}
            completedStepCount={completedStepCount}
            onShowHelp={showOnboardingAgain}
          />

          {/* Unified Workflow Stepper */}
          <div className="mb-6">
            <WorkflowStepper
              businessProfileComplete={businessProfileComplete}
              questionsComplete={questionsComplete}
              researchComplete={researchComplete}
              valuePropositionComplete={valuePropositionComplete}
              activeStep={activeTab as WorkflowStep}
              onStepClick={handleTabChange}
              pendingProspect={pendingProspect}
              onCreateProposal={(prospectId) => {
                setActiveTab('valueproposition');
                // The ValuePropositionTab will handle showing the company
              }}
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
              <ValuePropositionTab onDataChange={fetchSearches} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
