
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Code } from 'lucide-react';

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
  const [showLog, setShowLog] = useState(false);
  
  if (!showLog) {
    return (
      <Card className="bg-slate-50 dark:bg-slate-800 border-dashed">
        <CardFooter className="flex justify-center py-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={() => setShowLog(true)}
          >
            <Code className="h-4 w-4 mr-2" />
            Show Developer Details
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="bg-slate-50 dark:bg-slate-800 border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          Developer Information
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowLog(false)}
            className="h-8 w-8 p-0"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <h3 className="font-medium mb-1">Webhook URL:</h3>
          <code className="bg-slate-100 dark:bg-slate-700 p-2 rounded-md block whitespace-pre-wrap text-xs">
            {webhookUrl}
          </code>
        </div>
        
        <div>
          <h3 className="font-medium mb-1">Request Body:</h3>
          <pre className="bg-slate-100 dark:bg-slate-700 p-2 rounded-md overflow-auto max-h-[300px] text-xs">
            {JSON.stringify(requestBody, null, 2)}
          </pre>
        </div>
        
        {requestBody && requestBody.userInfo && (
          <div>
            <h3 className="font-medium mb-1">User Information:</h3>
            <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-md overflow-auto">
              <div className="text-xs"><strong>First Name:</strong> {requestBody.userInfo.first_name || "Not provided"}</div>
              <div className="text-xs"><strong>Last Name:</strong> {requestBody.userInfo.last_name || "Not provided"}</div>
            </div>
          </div>
        )}
        
        <div>
          <h3 className="font-medium mb-1">Questions ({agentQuestions.length}):</h3>
          <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-md overflow-auto max-h-[300px]">
            {agentQuestions.map((q, index) => (
              <div key={q.id} className="mb-2 last:mb-0 border-b border-slate-200 dark:border-slate-600 last:border-b-0 pb-2 last:pb-0">
                <div className="text-xs"><strong>{index + 1}. ID:</strong> {q.id}</div>
                <div className="text-xs"><strong>Question:</strong> {q.question}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeveloperLog;
