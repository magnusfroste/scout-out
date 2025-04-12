
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkflowTabs } from '@/hooks/useWorkflowTabs';
import { useQuestions } from '@/hooks/useQuestions';
import { useDashboardSearches } from '@/hooks/useDashboardSearches';

import QuestionManager from '@/components/dashboard/QuestionManager';
import CompanySearchComponent from '@/components/dashboard/CompanySearch';
import ValuePropositionTab from '@/components/dashboard/ValuePropositionTab';
import MyBusiness from '@/components/dashboard/MyBusiness';
import CreditDisplay from '@/components/dashboard/CreditDisplay';
import WorkflowProgress from '@/components/dashboard/WorkflowProgress';
import WorkflowDescription from '@/components/dashboard/WorkflowDescription';
import DashboardLoading from '@/components/dashboard/DashboardLoading';

const Dashboard = () => {
  const { user, loading, userProfile } = useAuth();
  const { activeTab, setActiveTab, getProgressPercentage } = useWorkflowTabs();
  const { questions, setQuestions } = useQuestions(user?.id);
  const { 
    searches, 
    isLoadingSearches, 
    isDeletingSearch, 
    fetchSearches, 
    handleDeleteSearch 
  } = useDashboardSearches(user?.id);

  useEffect(() => {
    if (user) {
      fetchSearches();
    }
  }, [user, fetchSearches]);

  if (loading) {
    return <DashboardLoading />;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Workflow</h1>
            
            {userProfile && (
              <CreditDisplay credits={userProfile.credits} />
            )}
          </div>
          
          <Tabs 
            defaultValue="mybusiness" 
            className="w-full mb-10"
            onValueChange={(value) => setActiveTab(value as any)}
            value={activeTab}
          >
            <div className="mb-8 relative">
              <WorkflowProgress 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                progressPercentage={getProgressPercentage()}
              />
              
              <WorkflowDescription activeTab={activeTab} />
            </div>
            
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
