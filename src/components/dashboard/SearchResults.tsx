
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Globe } from 'lucide-react';
import { Question, Answer, ContactInfo, SearchResultType } from '@/types/company';

interface SearchResultsProps {
  result: SearchResultType | null;
  companyName: string;
  questions: Question[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ result, companyName, questions }) => {
  if (!result) return null;
  
  const renderContactInfo = () => {
    const contactInfo = result.contact_info;
    
    if (!contactInfo) return null;
    
    return (
      <div className="mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border">
        <h3 className="font-medium text-lg mb-3">Contact Information</h3>
        <div className="space-y-2">
          {contactInfo.contact && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{contactInfo.contact}</span>
            </div>
          )}
          {contactInfo.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${contactInfo.email}`} className="text-sm text-blue-600 hover:underline">
                {contactInfo.email}
              </a>
            </div>
          )}
          {contactInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${contactInfo.phone}`} className="text-sm text-blue-600 hover:underline">
                {contactInfo.phone}
              </a>
            </div>
          )}
          {contactInfo.www && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a 
                href={contactInfo.www.startsWith('http') ? contactInfo.www : `https://${contactInfo.www}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-blue-600 hover:underline"
              >
                {contactInfo.www}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (result.results && Array.isArray(result.results) && result.results.length > 0) {
      return (
        <div className="space-y-4">
          {result.results.map((item: Answer, index: number) => {
            const questionObj = questions.find(q => q.id === item.question_id);
            const questionText = questionObj ? questionObj.question : `Question ${index + 1}`;
            
            return (
              <div key={item.question_id || index} className="border p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <h3 className="font-medium text-lg mb-2">{questionText}</h3>
                <p className="text-sm whitespace-pre-wrap">{item.answer || "No answer provided"}</p>
              </div>
            );
          })}
        </div>
      );
    }
    
    // If no results, show a message
    return (
      <div className="border p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
        <p className="text-center text-muted-foreground py-2">
          The search was completed, but no detailed answers were found for this company.
          {result.contact_info ? " Contact information is available above." : ""}
        </p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results for {companyName}</CardTitle>
        {result.contact_info && (
          <CardDescription>
            Contact information available
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[500px]">
          {renderContactInfo()}
          {renderResults()}
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchResults;
