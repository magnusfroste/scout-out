/**
 * Question domain models
 */

export interface AgentQuestion {
  id: string;
  question: string;
  rationale?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AgentQuestionInsert {
  question: string;
  rationale?: string | null;
  user_id: string;
}

export interface AgentQuestionUpdate {
  question?: string;
  rationale?: string | null;
}

export interface QuestionResponse {
  question: string;
  rationale: string;
}
