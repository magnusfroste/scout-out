
/**
 * @deprecated Use the modular version from '@/services/valueProposition' instead
 * This file exists for backward compatibility and will be removed in a future update
 */

// Re-export everything from the new modular structure
export { 
  callValuePropositionWebhook,
  getValuePropositionWebhookUrl, 
  saveValuePropositionData,
  USE_MOCK_DATA,
  getMockValuePropositionResponse
} from './valueProposition';
