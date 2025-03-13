
import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CompanySearch } from '@/types/search';

// Import refactored components
import QuestionManager from '@/components/dashboard/QuestionManager';
import SearchHistory from '@/components/dashboard/SearchHistory';
import CreditDisplay from '@/components/dashboard/CreditDisplay';
import MyBusiness from '@/components/dashboard/MyBusiness';
import CompanySearchComponent from '@/components/dashboard/CompanySearch';

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

  // IMPORTANT: Moving the conditional return after all hooks
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

  // Use useCallback to memoize the fetchSearches function
  const fetchSearches = useCallback(async () => {
    if (!user) {
      console.log("fetchSearches called but no user is logged in");
      return;
    }
    
    console.log("fetchSearches called - refreshing search history");
    setIsLoadingSearches(true);
    try {
      // Clear the searches first to ensure UI updates
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
      
      // Debug: Log the search IDs to help with debugging
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

  // Direct delete function in the Dashboard component
  const handleDeleteSearch = async (id: string) => {
    if (!id || !user) {
      console.error("Invalid search ID or user not logged in");
      return;
    }

    console.log(`Starting deletion process for search ID: ${id}`);
    setIsDeletingSearch(id);

    try {
      // First, delete related answers
      console.log(`Deleting answers for search ID: ${id}`);
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

      // Then delete the search record
      console.log(`Deleting search record with ID: ${id}`);
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
      
      // Update local state to remove the deleted search immediately
      setSearches(prev => prev.filter(search => search.id !== id));
      
      // Also refresh the list from the server to ensure consistency
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
      
      // Try to refresh the list anyway
      fetchSearches();
    } finally {
      setIsDeletingSearch(null);
    }
  };

  // During loading, show a loading indicator with the full layout
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
  
  // Silent redirect to auth page if not logged in - no toast message
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            
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
              <TabsTrigger value="search">Company Search</TabsTrigger>
              <TabsTrigger value="questions">Manage Questions</TabsTrigger>
              <TabsTrigger value="history">Search History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mybusiness">
              <MyBusiness />
            </TabsContent>
            
            <TabsContent value="search">
              <CompanySearchComponent 
                questions={questions}
                onSearch={fetchSearches} 
                onNavigateToHistory={() => setActiveTab('history')}
              />
            </TabsContent>
            
            <TabsContent value="questions">
              <QuestionManager 
                questions={questions} 
                setQuestions={setQuestions} 
                userId={user?.id} 
              />
            </TabsContent>
            
            <TabsContent value="history">
              <div className="md:col-span-2">
                <SearchHistory 
                  searches={searches} 
                  isLoadingSearches={isLoadingSearches}
                  questions={questions}
                  onSearchDeleted={fetchSearches}
                  isDeletingSearch={isDeletingSearch}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
