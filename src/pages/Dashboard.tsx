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
import { Building, ListChecks, Search, ArrowRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

import QuestionManager from '@/components/dashboard/QuestionManager';
import SearchHistory from '@/components/dashboard/SearchHistory';
import CreditDisplay from '@/components/dashboard/CreditDisplay';
import MyBusiness from '@/components/dashboard/MyBusiness';
import CompanySearchComponent from '@/components/dashboard/CompanySearch';
import ValuePropositionTab from '@/components/dashboard/ValuePropositionTab';

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

  const getProgressPercentage = () => {
    switch (activeTab) {
      case 'mybusiness': return 25;
      case 'questions': return 50;
      case 'search': return 75;
      case 'valueproposition': return 100;
      default: return 0;
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
            <h1 className="text-3xl font-bold">Workflow</h1>
            
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
            <div className="mb-8 relative">
              <div className="mb-6">
                <Progress value={getProgressPercentage()} className="h-2" />
              </div>
              
              <div className="flex items-center justify-between mb-4 relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/60 -z-10"></div>
                
                <div className="flex flex-col items-center z-10">
                  <button 
                    onClick={() => setActiveTab('mybusiness')}
                    className={cn(
                      "flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-300 mb-3 shadow-md",
                      activeTab === 'mybusiness' 
                        ? "bg-primary text-primary-foreground border-primary scale-110" 
                        : activeTab === 'questions' || activeTab === 'search' || activeTab === 'valueproposition'
                          ? "bg-primary/20 border-primary/30 text-primary" 
                          : "bg-background border-muted hover:border-muted-foreground"
                    )}
                  >
                    <Building className="h-6 w-6" />
                  </button>
                  <span className={cn(
                    "text-sm font-semibold mb-1",
                    activeTab === 'mybusiness' 
                      ? "text-primary" 
                      : activeTab === 'questions' || activeTab === 'search' || activeTab === 'valueproposition'
                        ? "text-primary/70"
                        : "text-muted-foreground"
                  )}>
                    Step 1
                  </span>
                  <span className={cn(
                    "text-xs",
                    activeTab === 'mybusiness' ? "font-medium" : ""
                  )}>Business Profile</span>
                </div>
                
                <div className={cn(
                  "flex items-center transition-opacity duration-300",
                  activeTab === 'questions' || activeTab === 'search' || activeTab === 'valueproposition' ? "text-primary" : "text-muted-foreground"
                )}>
                  <ArrowRight className="h-5 w-5" />
                </div>
                
                <div className="flex flex-col items-center z-10">
                  <button 
                    onClick={() => setActiveTab('questions')}
                    className={cn(
                      "flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-300 mb-3 shadow-md",
                      activeTab === 'questions' 
                        ? "bg-primary text-primary-foreground border-primary scale-110" 
                        : activeTab === 'search' || activeTab === 'valueproposition'
                          ? "bg-primary/20 border-primary/30 text-primary" 
                          : "bg-background border-muted hover:border-muted-foreground"
                    )}
                  >
                    <ListChecks className="h-6 w-6" />
                  </button>
                  <span className={cn(
                    "text-sm font-semibold mb-1",
                    activeTab === 'questions' 
                      ? "text-primary" 
                      : activeTab === 'search' || activeTab === 'valueproposition'
                        ? "text-primary/70"
                        : "text-muted-foreground"
                  )}>
                    Step 2
                  </span>
                  <span className={cn(
                    "text-xs",
                    activeTab === 'questions' ? "font-medium" : ""
                  )}>Questions</span>
                </div>
                
                <div className={cn(
                  "flex items-center transition-opacity duration-300",
                  activeTab === 'search' || activeTab === 'valueproposition' ? "text-primary" : "text-muted-foreground"
                )}>
                  <ArrowRight className="h-5 w-5" />
                </div>
                
                <div className="flex flex-col items-center z-10">
                  <button 
                    onClick={() => setActiveTab('search')}
                    className={cn(
                      "flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-300 mb-3 shadow-md",
                      activeTab === 'search' 
                        ? "bg-primary text-primary-foreground border-primary scale-110" 
                        : activeTab === 'valueproposition'
                          ? "bg-primary/20 border-primary/30 text-primary" 
                          : "bg-background border-muted hover:border-muted-foreground"
                    )}
                  >
                    <Search className="h-6 w-6" />
                  </button>
                  <span className={cn(
                    "text-sm font-semibold mb-1",
                    activeTab === 'search' 
                      ? "text-primary" 
                      : activeTab === 'valueproposition'
                        ? "text-primary/70"
                        : "text-muted-foreground"
                  )}>
                    Step 3
                  </span>
                  <span className={cn(
                    "text-xs",
                    activeTab === 'search' ? "font-medium" : ""
                  )}>Research Company</span>
                </div>
                
                <div className={cn(
                  "flex items-center transition-opacity duration-300",
                  activeTab === 'valueproposition' ? "text-primary" : "text-muted-foreground"
                )}>
                  <ArrowRight className="h-5 w-5" />
                </div>
                
                <div className="flex flex-col items-center z-10">
                  <button 
                    onClick={() => setActiveTab('valueproposition')}
                    className={cn(
                      "flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-300 mb-3 shadow-md",
                      activeTab === 'valueproposition' 
                        ? "bg-primary text-primary-foreground border-primary scale-110" 
                        : "bg-background border-muted hover:border-muted-foreground"
                    )}
                  >
                    <Star className="h-6 w-6" />
                  </button>
                  <span className={cn(
                    "text-sm font-semibold mb-1",
                    activeTab === 'valueproposition' 
                      ? "text-primary" 
                      : "text-muted-foreground"
                  )}>
                    Step 4
                  </span>
                  <span className={cn(
                    "text-xs",
                    activeTab === 'valueproposition' ? "font-medium" : ""
                  )}>Value Proposition</span>
                </div>
              </div>
              
              <div className={cn(
                "p-5 rounded-lg text-sm border-l-4 shadow-sm transition-all duration-300",
                activeTab === 'mybusiness' ? "bg-primary/5 border-primary" :
                activeTab === 'questions' ? "bg-primary/5 border-primary" :
                activeTab === 'search' ? "bg-primary/5 border-primary" :
                "bg-primary/5 border-primary"
              )}>
                {activeTab === 'mybusiness' && (
                  <div className="flex items-start">
                    <Building className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                    <div>
                      <h3 className="font-semibold text-base mb-1">Step 1: Set Up Your Business Profile</h3>
                      <p className="text-muted-foreground">Configure your business profile and settings to personalize your experience.</p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'questions' && (
                  <div className="flex items-start">
                    <ListChecks className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                    <div>
                      <h3 className="font-semibold text-base mb-1">Step 2: Manage Your Questions</h3>
                      <p className="text-muted-foreground">Create and organize questions to ask potential clients. Use the Magic button to generate questions based on your website.</p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'search' && (
                  <div className="flex items-start">
                    <Search className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                    <div>
                      <h3 className="font-semibold text-base mb-1">Step 3: Research Company</h3>
                      <p className="text-muted-foreground">Gather insights about potential clients to discover opportunities for your business. Our AI analyzes companies to help you identify the best prospects and understand their needs.</p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'valueproposition' && (
                  <div className="flex items-start">
                    <Star className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                    <div>
                      <h3 className="font-semibold text-base mb-1">Step 4: Value Proposition</h3>
                      <p className="text-muted-foreground">Review your researched companies, rate their potential, and prepare your value proposition to approach them effectively.</p>
                    </div>
                  </div>
                )}
              </div>
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
