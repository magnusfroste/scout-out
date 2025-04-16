
export interface OAuth2Settings {
  user: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export interface SenderSettings {
  provider: string;
  email: string;
  password?: string;
  host: string;
  port: number;
  oauth2?: OAuth2Settings;
}

export interface EmailRequest {
  to: string;
  to_name?: string;
  subject: string;
  html_content: string;
  sender_settings: SenderSettings;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates the email request structure
 */
export function validateEmailRequest(request: EmailRequest): ValidationResult {
  const errors: string[] = [];
  
  if (!request.to) {
    errors.push('Recipient email is required');
  }
  
  if (!request.subject) {
    errors.push('Email subject is required');
  }
  
  if (!request.html_content) {
    errors.push('Email content is required');
  }
  
  if (!request.sender_settings) {
    errors.push('Sender settings are required');
    return { isValid: errors.length === 0, errors };
  }
  
  const settings = request.sender_settings;
  
  if (!settings.email) {
    errors.push('Sender email is required');
  }
  
  if (!settings.host) {
    errors.push('SMTP host is required');
  }
  
  if (!settings.port) {
    errors.push('SMTP port is required');
  }
  
  if (!settings.provider) {
    errors.push('Email provider is required');
  }
  
  // Check for authentication based on provider
  if (settings.provider === 'office365') {
    if (!settings.oauth2) {
      errors.push('OAuth2 settings are required for Office365');
    } else {
      // Validate OAuth2 settings for Office365
      if (!settings.oauth2.user) {
        errors.push('OAuth2 user is required');
      }
      if (!settings.oauth2.clientId) {
        errors.push('OAuth2 client ID is required');
      }
      if (!settings.oauth2.clientSecret) {
        errors.push('OAuth2 client secret is required');
      }
      if (!settings.oauth2.refreshToken) {
        errors.push('OAuth2 refresh token is required');
      }
    }
  } else {
    // For other providers, check for password
    if (!settings.password) {
      errors.push('SMTP password is required');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
