import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Wand2, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { fetchQuestionsFromWebhook, QuestionResponse } from '@/services/questionService';
import { useProfile } from '@/hooks/useProfile';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import QuestionsDeveloperLog from './QuestionsDeveloperLog';

type Question = {
  id: string;
  question: string;
  rationale?: string;
};

interface QuestionManagerProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  userId: string | undefined;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({ questions, setQuestions, userId }) => {
  const [newQuestion, setNewQuestion] = useState('');
  const [newRationale, setNewRationale] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isMagicDialogOpen, setIsMagicDialogOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isLoadingMagicQuestions, setIsLoadingMagicQuestions] = useState(false);
  const [magicQuestions, setMagicQuestions] = useState<QuestionResponse[]>([]);
  const [selectedMagicQuestions, setSelectedMagicQuestions] = useState<string[]>([]);
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
  const [questionsWebhookUrl, setQuestionsWebhookUrl] = useState<string | null>(null);
  const [requestBody, setRequestBody] = useState<any>(null);
  const { toast } = useToast();
  const { userProfile, loading: loadingProfile } = useProfile(userId);

  useEffect(() => {
    if (userProfile?.website_url) {
      setWebsiteUrl(userProfile.website_url);
    }
  }, [userProfile]);

  const handleAddQuestion = async () => {
    if (!newQuestion.trim() || !userId) return;
    
    try {
      const { data, error } = await supabase
        .from('agent_questions')
        .insert([{ 
          question: newQuestion, 
          rationale: newRationale.trim() || null,
          user_id: userId 
        }])
        .select();
        
      if (error) throw error;
      
      setQuestions([...questions, data[0]]);
      setNewQuestion('');
      setNewRationale('');
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
    if (!editingQuestion || !editingQuestion.question.trim() || !userId) return;
    
    try {
      const { error } = await supabase
        .from('agent_questions')
        .update({ 
          question: editingQuestion.question,
          rationale: editingQuestion.rationale || null
        })
        .eq('id', editingQuestion.id);
        
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
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('agent_questions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
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

  const handleFetchMagicQuestions = async () => {
    if (!websiteUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a website URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingMagicQuestions(true);
    setMagicQuestions([]);
    setSelectedMagicQuestions([]);
    
    const newRequestBody = { url: websiteUrl };
    setRequestBody(newRequestBody);

    try {
      const questions = await fetchQuestionsFromWebhook(websiteUrl);
      
      if (questions && questions.length > 0) {
        setMagicQuestions(questions);
        setSelectedMagicQuestions(questions.map(q => q.question));
        
        toast({
          title: "Success",
          description: `Found ${questions.length} questions for this website`,
        });
      } else {
        toast({
          title: "No Questions Found",
          description: "No questions were found for this website",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error fetching magic questions:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch questions",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMagicQuestions(false);
    }
  };

  const handleAddMagicQuestions = async () => {
    if (!selectedMagicQuestions.length || !userId) return;
    
    try {
      const selectedQuestionsWithRationales = magicQuestions
        .filter(item => selectedMagicQuestions.includes(item.question))
        .map(item => ({
          question: item.question,
          rationale: item.rationale,
          user_id: userId
        }));
      
      const { data, error } = await supabase
        .from('agent_questions')
        .insert(selectedQuestionsWithRationales)
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setQuestions([...questions, ...data]);
      }
      
      setIsMagicDialogOpen(false);
      setWebsiteUrl('');
      setMagicQuestions([]);
      setSelectedMagicQuestions([]);
      
      toast({
        title: "Success",
        description: `${selectedMagicQuestions.length} questions added successfully`,
      });
    } catch (error: any) {
      console.error('Error adding magic questions:', error);
      toast({
        title: "Error",
        description: "Failed to add questions",
        variant: "destructive",
      });
    }
  };

  const toggleQuestionSelection = (question: string) => {
    if (selectedMagicQuestions.includes(question)) {
      setSelectedMagicQuestions(selectedMagicQuestions.filter(q => q !== question));
    } else {
      setSelectedMagicQuestions([...selectedMagicQuestions, question]);
    }
  };

  const toggleQuestionExpand = (questionId: string) => {
    if (expandedQuestions.includes(questionId)) {
      setExpandedQuestions(expandedQuestions.filter(id => id !== questionId));
    } else {
      setExpandedQuestions([...expandedQuestions, questionId]);
    }
  };

  const handleEditQuestionClick = (question: Question) => {
    setEditingQuestion(question);
    setIsQuestionDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Manage Questions</CardTitle>
          <div className="flex space-x-2">
            <Button 
              onClick={() => setIsMagicDialogOpen(true)}
              size="sm"
              variant="outline"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Magic
            </Button>
            <Button 
              onClick={() => {
                setEditingQuestion(null);
                setNewQuestion('');
                setNewRationale('');
                setIsQuestionDialogOpen(true);
              }}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mt-4">
            {questions.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No questions added yet. Add your first question or use the Magic button to generate questions.
              </div>
            ) : (
              questions.map(question => (
                <div key={question.id} className="border rounded-lg overflow-hidden">
                  <div className="flex items-start p-3">
                    <div className="flex-1 mr-4">
                      <div className="flex items-start">
                        {question.rationale && (
                          <button 
                            onClick={() => toggleQuestionExpand(question.id)}
                            className="mr-2 mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={expandedQuestions.includes(question.id) ? "Collapse rationale" : "Expand rationale"}
                          >
                            {expandedQuestions.includes(question.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        <div>
                          <p className="text-sm font-medium">{question.question}</p>
                          {question.rationale && !expandedQuestions.includes(question.id) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mt-1">
                                    <Info className="h-3 w-3 mr-1" />
                                    Has rationale
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">Click the arrow to view the rationale</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditQuestionClick(question)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {question.rationale && expandedQuestions.includes(question.id) && (
                    <div className="px-3 pb-3 pt-0 bg-muted/20 border-t">
                      <div className="text-xs text-muted-foreground font-medium uppercase mt-1 mb-1">Rationale</div>
                      <p className="text-sm">{question.rationale}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <QuestionsDeveloperLog 
            webhookUrl={questionsWebhookUrl}
            websiteUrl={websiteUrl}
            requestBody={requestBody}
            isVisible={false}
          />
        </CardContent>
      </Card>

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
            
            <div className="space-y-2">
              <Label htmlFor="rationale">Rationale (Optional)</Label>
              <Textarea
                id="rationale"
                value={editingQuestion ? editingQuestion.rationale || '' : newRationale}
                onChange={(e) => 
                  editingQuestion 
                    ? setEditingQuestion({...editingQuestion, rationale: e.target.value})
                    : setNewRationale(e.target.value)
                }
                placeholder="Why is this question important? (optional)"
                className="min-h-[80px]"
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

      <Dialog open={isMagicDialogOpen} onOpenChange={setIsMagicDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Magic Questions Generator
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="websiteUrl"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1"
                  disabled={isLoadingMagicQuestions}
                />
                <Button
                  type="button"
                  onClick={handleFetchMagicQuestions}
                  disabled={!websiteUrl.trim() || isLoadingMagicQuestions}
                >
                  {isLoadingMagicQuestions ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  {isLoadingMagicQuestions ? 'Generating...' : 'Generate'}
                </Button>
              </div>
              {userProfile?.website_url && (
                <p className="text-xs text-muted-foreground mt-1">
                  Using website URL from your profile. You can change it if needed.
                </p>
              )}
              {loadingProfile && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Loading your profile...
                </p>
              )}
            </div>
            
            {magicQuestions.length > 0 && (
              <div className="space-y-2 mt-4">
                <Label>Select Questions to Add</Label>
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                  {magicQuestions.map((item, index) => (
                    <div key={index} className="flex items-start space-x-2 p-2 border rounded-md">
                      <input
                        type="checkbox"
                        id={`question-${index}`}
                        checked={selectedMagicQuestions.includes(item.question)}
                        onChange={() => toggleQuestionSelection(item.question)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor={`question-${index}`} className="font-medium cursor-pointer">
                          {item.question}
                        </label>
                        {item.rationale && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mt-1">
                                  <Info className="h-3 w-3 mr-1" />
                                  View rationale
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" align="start" className="max-w-sm">
                                <p className="text-sm">{item.rationale}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsMagicDialogOpen(false);
                setWebsiteUrl('');
                setMagicQuestions([]);
                setSelectedMagicQuestions([]);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddMagicQuestions}
              disabled={!selectedMagicQuestions.length}
            >
              Add Selected Questions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuestionManager;
