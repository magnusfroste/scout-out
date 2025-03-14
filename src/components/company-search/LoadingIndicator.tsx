
import React from 'react';
import { Loader2, Database, Search as SearchIcon, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = "Searching for information..." 
}) => {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <div>
            <h3 className="font-medium">{message}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Our AI agent is working on your request:
            </p>
            <ul className="text-sm space-y-1 mt-2">
              <li className="flex items-center">
                <SearchIcon className="h-3.5 w-3.5 mr-2 text-primary" />
                <span>Searching company databases</span>
              </li>
              <li className="flex items-center opacity-75">
                <Globe className="h-3.5 w-3.5 mr-2 text-primary" />
                <span>Crawling relevant websites</span>
              </li>
              <li className="flex items-center opacity-50">
                <Database className="h-3.5 w-3.5 mr-2 text-primary" />
                <span>Accessing multiple knowledge bases</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">
              This may take a few moments. Thank you for your patience.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingIndicator;
