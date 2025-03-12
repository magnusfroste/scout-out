
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

// Import refactored components
import QuestionManager from '@/components/dashboard/QuestionManager';
import CompanySearch from '@/components/dashboard/CompanySearch';
import SearchHistory from '@/components/dashboard/SearchHistory';
import CreditDisplay from '@/components/dashboard/CreditDisplay';
import MyBusiness from '@/components/dashboard/MyBusiness';

type Question = {
  id: string;
  question: string;
};

type CompanySearch = {
  id: string;
  company_name: string;
  created_at: string;
  result: any;
};

const Dashboard = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searches, setSearches] = useState<CompanySearch[]>([]);
  const [isLoadingSearches, setIsLoadingSearches] = useState(false);
  const [activeTab, setActiveTab] = useState('mybusiness');

  const { user, loading, userProfile } = useAuth();

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

  const fetchSearches = async () => {
    if (!user) return;
    
    setIsLoadingSearches(true);
    try {
      const { data, error } = await supabase
        .from('company_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setSearches(data || []);
    } catch (error: any) {
      console.error('Error fetching searches:', error);
    } finally {
      setIsLoadingSearches(false);
    }
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
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Company Intelligence Dashboard</h1>
            
            {userProfile && (
              <CreditDisplay credits={userProfile.credits} />
            )}
          </div>
          
          <Tabs 
            defaultValue="mybusiness" 
            className="w-full mb-10"
            onValueChange={setActiveTab}
            value={activeTab}
          >
            <TabsList className="mb-6 relative">
              <TabsTrigger value="mybusiness">My Business</TabsTrigger>
              <TabsTrigger value="search">Search Company</TabsTrigger>
              <TabsTrigger value="questions">Manage Questions</TabsTrigger>
              <TabsTrigger value="history">Search History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mybusiness">
              <MyBusiness />
            </TabsContent>
            
            <TabsContent value="search">
              <CompanySearch questions={questions} onSearch={fetchSearches} />
            </TabsContent>
            
            <TabsContent value="questions">
              <QuestionManager 
                questions={questions} 
                setQuestions={setQuestions} 
                userId={user?.id} 
              />
            </TabsContent>
            
            <TabsContent value="history">
              <SearchHistory 
                searches={searches} 
                isLoadingSearches={isLoadingSearches} 
                questions={questions}
                onSearchDeleted={fetchSearches}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
