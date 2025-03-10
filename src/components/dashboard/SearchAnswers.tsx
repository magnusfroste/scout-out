
import React from 'react';
import { Loader2, User, Mail, Phone, Globe } from 'lucide-react';
import { CompanyAnswer } from '@/hooks/useSearchAnswers';
import { ContactInfo } from '@/hooks/useCompanySearch';

interface SearchAnswersProps {
  searchId: string;
  isLoading: boolean;
  answers: CompanyAnswer[] | undefined;
  contactInfo?: ContactInfo;
}

const SearchAnswers: React.FC<SearchAnswersProps> = ({ 
  searchId,
  isLoading,
  answers,
  contactInfo
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  
  const renderContactInfo = () => {
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
  
  if (!answers || answers.length === 0) {
    return (
      <div>
        {contactInfo && renderContactInfo()}
        <p className="text-center text-muted-foreground py-2">
          No answers found for this search.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {contactInfo && renderContactInfo()}
      {answers.map((answer) => (
        <div key={answer.id} className="border-l-4 border-slate-300 pl-3 py-1">
          <h4 className="font-medium mb-1">{answer.question}</h4>
          <p className="text-sm whitespace-pre-wrap">{answer.answer || "No answer provided"}</p>
        </div>
      ))}
    </div>
  );
};

export default SearchAnswers;
