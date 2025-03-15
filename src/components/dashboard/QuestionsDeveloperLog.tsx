
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface QuestionsDeveloperLogProps {
  webhookUrl: string | null;
  websiteUrl: string;
  requestBody: any;
  isVisible: boolean;
}

const QuestionsDeveloperLog: React.FC<QuestionsDeveloperLogProps> = ({
  webhookUrl,
  websiteUrl,
  requestBody,
  isVisible
}) => {
  if (!isVisible) return null;
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Developer Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Questions Webhook URL</Label>
            <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
              <code className="text-xs break-all text-slate-700 dark:text-slate-300">
                {webhookUrl || 'Not configured'}
              </code>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Website URL</Label>
            <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
              <code className="text-xs break-all text-slate-700 dark:text-slate-300">
                {websiteUrl || 'Not specified'}
              </code>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Request Body</Label>
            <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md overflow-x-auto">
              <code className="text-xs break-all text-slate-700 dark:text-slate-300">
                {requestBody ? JSON.stringify(requestBody, null, 2) : 'No request body yet'}
              </code>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This is the request body being sent to the questions webhook.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionsDeveloperLog;
