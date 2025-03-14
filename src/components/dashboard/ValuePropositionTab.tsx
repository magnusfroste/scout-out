
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import CompanySearchesList from '@/components/CompanySearchesList';

const ValuePropositionTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Value Proposition</CardTitle>
          <CardDescription>
            Review your researched companies, rate their potential, and prepare your approach.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanySearchesList />
        </CardContent>
      </Card>
    </div>
  );
};

export default ValuePropositionTab;
