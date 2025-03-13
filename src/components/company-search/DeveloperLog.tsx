
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface DeveloperLogProps {
  webhookUrl: string;
  companyName: string;
  requestBody: any;
  agentQuestions: any[];
}

const DeveloperLog: React.FC<DeveloperLogProps> = ({
  webhookUrl,
  companyName,
  requestBody,
  agentQuestions
}) => {
  if (!webhookUrl || !companyName) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Developer Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Request Body</Label>
            <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md overflow-x-auto">
              <code className="text-xs break-all text-slate-700 dark:text-slate-300">
                {requestBody ? JSON.stringify(requestBody, null, 2) : 'No request body yet'}
              </code>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This is the complete request body being sent, including company name and all questions.
            </p>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Total Questions</Label>
            <div className="mt-1">
              <span className="text-sm">{agentQuestions.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeveloperLog;
