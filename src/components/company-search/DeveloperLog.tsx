
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface DeveloperLogProps {
  webhookUrl: string;
  companyName: string;
  requestBody: any;
  agentQuestions: any[];
  additionalData?: any;
  userInfo?: any;
}

const DeveloperLog: React.FC<DeveloperLogProps> = ({
  webhookUrl,
  companyName,
  requestBody,
  agentQuestions,
  additionalData,
  userInfo
}) => {
  if (!webhookUrl || !companyName) return null;
  
  // Add additional data and user info to request body if provided
  const displayRequestBody = {
    ...requestBody
  };
  
  if (additionalData) {
    displayRequestBody.additionalData = additionalData;
  }
  
  if (userInfo) {
    displayRequestBody.userInfo = userInfo;
  }
  
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
                {JSON.stringify(displayRequestBody, null, 2)}
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
          
          {additionalData && (
            <div>
              <Label className="text-sm font-medium">Additional Data</Label>
              <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md overflow-x-auto">
                <code className="text-xs break-all text-slate-700 dark:text-slate-300">
                  {JSON.stringify(additionalData, null, 2)}
                </code>
              </div>
            </div>
          )}
          
          {userInfo && (
            <div>
              <Label className="text-sm font-medium">User Info</Label>
              <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md overflow-x-auto">
                <code className="text-xs break-all text-slate-700 dark:text-slate-300">
                  {JSON.stringify(userInfo, null, 2)}
                </code>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeveloperLog;
