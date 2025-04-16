
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WebhookFormProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  isDisabled: boolean;
  showDescription?: boolean;
  labelText?: string;
  description?: string;
  urlPattern?: string;
  testEndpoint?: boolean;
}

const WebhookForm: React.FC<WebhookFormProps> = ({
  webhookUrl,
  setWebhookUrl,
  isDisabled,
  showDescription = false,
  labelText = "Webhook URL",
  description = "Enter your webhook URL",
  urlPattern = "",
  testEndpoint = false
}) => {
  const [inputValue, setInputValue] = useState(webhookUrl);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  
  useEffect(() => {
    // Update input value when the parent webhook URL changes
    setInputValue(webhookUrl);
  }, [webhookUrl]);
  
  const validateUrl = (url: string): boolean => {
    if (!url) {
      setValidationMessage('URL cannot be empty');
      return false;
    }
    
    try {
      new URL(url);
      
      // Check if URL matches pattern if provided
      if (urlPattern && !new RegExp(urlPattern).test(url)) {
        setValidationMessage(`URL should match pattern: ${urlPattern}`);
        return false;
      }
      
      setValidationMessage('');
      return true;
    } catch (e) {
      setValidationMessage('Please enter a valid URL');
      return false;
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsValidUrl(value === '' || validateUrl(value));
  };
  
  const handleSave = () => {
    const isValid = validateUrl(inputValue);
    setIsValidUrl(isValid);
    
    if (isValid) {
      setWebhookUrl(inputValue);
      console.log('Saved webhook URL:', inputValue);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="webhookUrl" className="flex items-center gap-2">
          {labelText}
          {!isValidUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{validationMessage}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Label>
        <div className="flex gap-2">
          <Input
            id="webhookUrl"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={`Enter your ${labelText.toLowerCase()}`}
            disabled={isDisabled}
            className={`flex-1 ${!isValidUrl ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
          <Button 
            onClick={handleSave}
            disabled={isDisabled || inputValue === webhookUrl || !isValidUrl}
          >
            Save
          </Button>
        </div>
        {showDescription && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {!isValidUrl && validationMessage && (
          <p className="text-xs text-red-500 mt-1">
            {validationMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default WebhookForm;
