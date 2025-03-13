
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SearchFormProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  isLoading: boolean;
  handleSearch: (e: React.FormEvent) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  webhookUrl,
  setWebhookUrl,
  companyName,
  setCompanyName,
  isLoading,
  handleSearch
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information Search</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="Enter your webhook URL"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Example: https://agent.froste.eu/webhook/lovable
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Will be sent in the request body as "company"
            </p>
          </div>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchForm;
