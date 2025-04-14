
export interface EmailRequest {
  to: string;
  to_name?: string;
  subject: string;
  html_content: string;
  sender_settings: {
    email: string;
    host: string;
    port: number;
    password: string;
    provider: string;
  };
}

/**
 * Validates the email request structure and required fields
 */
export function validateEmailRequest(request: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!request) {
    return { isValid: false, errors: ['Request body is missing'] };
  }
  
  // Check required fields
  if (!request.to) errors.push('Recipient email is missing');
  if (!request.subject) errors.push('Email subject is missing');
  if (!request.html_content) errors.push('Email content is missing');
  
  // Check sender settings
  if (!request.sender_settings) {
    errors.push('Sender settings are missing');
  } else {
    if (!request.sender_settings.email) errors.push('Sender email is missing');
    if (!request.sender_settings.host) errors.push('SMTP host is missing');
    if (!request.sender_settings.port) errors.push('SMTP port is missing');
    if (!request.sender_settings.password) errors.push('SMTP password is missing');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
