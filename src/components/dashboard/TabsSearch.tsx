
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CompanySearch from './CompanySearch';
import { Question } from '@/types/company';

interface TabsSearchProps {
  questions: Question[];
  onSearch: () => void;
}

type SearchTab = {
  id: string;
  label: string;
};

const TabsSearch: React.FC<TabsSearchProps> = ({ questions, onSearch }) => {
  const [tabs, setTabs] = useState<SearchTab[]>([
    { id: 'tab-1', label: 'Search 1' }
  ]);
  const [activeTab, setActiveTab] = useState('tab-1');

  const addNewTab = () => {
    const newTabId = `tab-${tabs.length + 1}`;
    setTabs([...tabs, { id: newTabId, label: `Search ${tabs.length + 1}` }]);
    setActiveTab(newTabId);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center mb-4">
        <TabsList className="flex-grow">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex-1">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-2"
          onClick={addNewTab}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          New Search
        </Button>
      </div>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-0">
          {/* Each tab has its own isolated CompanySearch instance */}
          <CompanySearch 
            key={tab.id} 
            questions={questions} 
            onSearch={onSearch} 
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default TabsSearch;
