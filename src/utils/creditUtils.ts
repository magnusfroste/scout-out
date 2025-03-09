
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Log a credit transaction
export const logCreditTransaction = async (userId: string, amount: number, description: string) => {
  if (!userId) return;
  
  try {
    const { error } = await supabase
      .from('credit_transactions')
      .insert([{
        user_id: userId,
        amount: amount,
        description: description
      }]);
      
    if (error) throw error;
  } catch (error: any) {
    console.error('Error logging credit transaction:', error);
  }
};

// Deduct credits from a user's account
export const deductCredits = async (
  userId: string, 
  currentCredits: number, 
  amount: number, 
  reason: string,
  onSuccess?: () => Promise<void>
) => {
  if (!userId) return false;
  
  try {
    if (currentCredits < amount) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${amount} credits for this action. You currently have ${currentCredits} credits.`,
        variant: "destructive",
      });
      return false;
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({ credits: currentCredits - amount })
      .eq('id', userId);
      
    if (error) throw error;
    
    await logCreditTransaction(userId, -amount, reason);
    
    if (onSuccess) {
      await onSuccess();
    }
    
    return true;
  } catch (error: any) {
    console.error('Error deducting credits:', error);
    toast({
      title: "Error",
      description: "Failed to deduct credits. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};

// Calculate credit cost based on questions count
export const calculateCreditCost = (questionsCount: number) => {
  return Math.max(1, Math.ceil(questionsCount / 10));
};
