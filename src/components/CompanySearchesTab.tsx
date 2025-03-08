
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import CompanySearchesList from './CompanySearchesList';

const CompanySearchesTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Company Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanySearchesList />
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySearchesTab;
