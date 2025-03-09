
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type Question = {
  id: string;
  question: string;
};

type Answer = {
  question_id: string;
  answer: string;
};

type SearchResults = {
  results?: Answer[];
};

type CompanySearch = {
  id: string;
  company_name: string;
  created_at: string;
  result: any;
};

const Dashboard = () => {
  // Question state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);

  // Search state
  const [companyName, setCompanyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('webhookUrl') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResults | null>(null);
  
  // Searches history state
  const [searches, setSearches] = useState<CompanySearch[]>([]);
  const [isLoadingSearches, setIsLoadingSearches] = useState(false);
  const [isDeletingSearch, setIsDeletingSearch] = useState<string | null>(null);

  const { user, loading } = useAuth();
  const { toast } = useToast();

  // If not loading and no user, redirect to auth page
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (webhookUrl) {
      localStorage.setItem('webhookUrl', webhookUrl);
    }
  }, [webhookUrl]);

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
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Failed to load company searches",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSearches(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim() || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('agent_questions')
        .insert([{ question: newQuestion, user_id: user.id }])
        .select();
        
      if (error) throw error;
      
      setQuestions([...questions, data[0]]);
      setNewQuestion('');
      setIsQuestionDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Question added successfully",
      });
    } catch (error: any) {
      console.error('Error adding question:', error);
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    }
  };

  const handleEditQuestion = async () => {
    if (!editingQuestion || !editingQuestion.question.trim() || !user) return;
    
    try {
      const { error } = await supabase
        .from('agent_questions')
        .update({ question: editingQuestion.question })
        .eq('id', editingQuestion.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setQuestions(questions.map(q => 
        q.id === editingQuestion.id ? editingQuestion : q
      ));
      setEditingQuestion(null);
      setIsQuestionDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Question updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating question:', error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('agent_questions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setQuestions(questions.filter(q => q.id !== id));
      
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a company name",
        variant: "destructive",
      });
      return;
    }

    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const functionUrl = 'https://pqskutdrekcinpymvigm.supabase.co/functions/v1/trigger-n8n-workflow';
      
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      const questionsToSend = questions.map(q => ({
        id: q.id,
        text: q.question
      }));

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          company: companyName,
          questions: questionsToSend,
          webhookUrl,
          userId: user?.id
        })
      });
      
      const responseData = await response.json();
      
      if (responseData.success) {
        setResult(responseData.data);
        toast({
          title: "Success",
          description: "Questions answered successfully",
        });
        // Refresh the searches list
        fetchSearches();
      } else {
        setResult(responseData);
        toast({
          title: "Warning",
          description: "Got a response, but it may not contain answers",
        });
      }
    } catch (error: any) {
      console.error("Error calling webhook:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to call webhook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSearch = async (id: string) => {
    if (!user) return;
    
    setIsDeletingSearch(id);
    try {
      // First delete related answers
      const { error: answersError } = await supabase
        .from('company_question_answers')
        .delete()
        .eq('company_search_id', id);
      
      if (answersError) throw answersError;
      
      // Then delete the search
      const { error } = await supabase
        .from('company_searches')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setSearches(searches.filter(s => s.id !== id));
      
      toast({
        title: "Success",
        description: "Search deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting search:', error);
      toast({
        title: "Error",
        description: "Failed to delete search",
        variant: "destructive",
      });
    } finally {
      setIsDeletingSearch(null);
    }
  };

  const renderResults = () => {
    if (!result) return null;
    
    if (result.results && Array.isArray(result.results)) {
      return (
        <div className="space-y-4">
          {result.results.map((item: Answer, index: number) => {
            const questionObj = questions.find(q => q.id === item.question_id);
            const questionText = questionObj ? questionObj.question : `Question ${index + 1}`;
            
            return (
              <div key={item.question_id || index} className="border p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <h3 className="font-medium text-lg mb-2">{questionText}</h3>
                <p className="text-sm whitespace-pre-wrap">{item.answer || "No answer provided"}</p>
              </div>
            );
          })}
        </div>
      );
    }
    
    return (
      <pre className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Company Intelligence Dashboard</h1>
          
          <Tabs defaultValue="search" className="w-full mb-10">
            <TabsList className="mb-6">
              <TabsTrigger value="search">Search Company</TabsTrigger>
              <TabsTrigger value="questions">Manage Questions</TabsTrigger>
              <TabsTrigger value="history">Search History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ask Questions About a Company</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="webhookUrl">Webhook URL</Label>
                      <Input
                        id="webhookUrl"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="Enter your webhook URL"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Example: https://agent.froste.eu/webhook/lovable
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Enter company name to research"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <Button type="submit" disabled={isLoading || questions.length === 0}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              {questions.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Questions We'll Ask ({questions.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal pl-5 space-y-2">
                      {questions.map(question => (
                        <li key={question.id} className="text-sm">
                          {question.question}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                      No questions available. Please add questions in the Manage Questions tab first.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {result && (
                <Card>
                  <CardHeader>
                    <CardTitle>Results for {companyName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-auto max-h-[500px]">
                      {renderResults()}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="questions" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Manage Questions</CardTitle>
                  <Button 
                    onClick={() => {
                      setEditingQuestion(null);
                      setNewQuestion('');
                      setIsQuestionDialogOpen(true);
                    }}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </CardHeader>
                <CardContent>
                  {questions.length > 0 ? (
                    <div className="space-y-4 mt-4">
                      {questions.map(question => (
                        <div key={question.id} className="flex items-start justify-between p-3 border rounded-lg">
                          <div className="flex-1 mr-4">
                            <p className="text-sm">{question.question}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setEditingQuestion(question);
                                setIsQuestionDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No questions found. Add your first question to get started.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Search History</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingSearches ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : searches.length > 0 ? (
                    <div className="space-y-4">
                      {searches.map(search => (
                        <div key={search.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium">{search.company_name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(search.created_at)}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSearch(search.id)}
                            disabled={isDeletingSearch === search.id}
                          >
                            {isDeletingSearch === search.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="ml-2">Delete</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No search history found. Search for a company to get started.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={editingQuestion ? editingQuestion.question : newQuestion}
                onChange={(e) => 
                  editingQuestion 
                    ? setEditingQuestion({...editingQuestion, question: e.target.value})
                    : setNewQuestion(e.target.value)
                }
                placeholder="Enter your question here"
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsQuestionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={editingQuestion ? handleEditQuestion : handleAddQuestion}
              disabled={editingQuestion ? !editingQuestion.question.trim() : !newQuestion.trim()}
            >
              {editingQuestion ? 'Save Changes' : 'Add Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
