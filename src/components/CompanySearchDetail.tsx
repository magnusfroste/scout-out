
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCompanyDetail } from '@/hooks/useCompanyDetail';
import CompanyHeader from './company-detail/CompanyHeader';
import ValuePropositionSection from './company-detail/ValuePropositionSection';
import ContactInformation from './company-detail/ContactInformation';
import QuestionsAnswersSection from './company-detail/QuestionsAnswersSection';
import LoadingIndicator from './company-detail/LoadingIndicator';
import NotFoundState from './company-detail/NotFoundState';
import { CompanySearchRecord } from '@/types/company';

interface CompanySearchDetailProps {
  searchId: string;
  onBack: () => void;
  onUpdate?: (id: string, data: any) => void;
}

const CompanySearchDetail = ({ searchId, onBack, onUpdate }: CompanySearchDetailProps) => {
  const {
    companySearch,
    questionAnswers,
    isLoading,
    isSaving,
    displayScore,
    setDisplayScore,
    displayAdvice,
    setDisplayAdvice,
    displayIntroduction,
    setDisplayIntroduction,
    displaySubject,
    setDisplaySubject,
    hasUnsavedChanges,
    handleSave,
    handleMagicSuccess,
    handleCopySuccess,
    adjustTextareaHeight
  } = useCompanyDetail(searchId, onUpdate);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!companySearch) {
    return <NotFoundState onBack={onBack} />;
  }

  return (
    <div className="space-y-6">
      <CompanyHeader
        companyName={companySearch.company_name}
        createdAt={companySearch.created_at}
        onBack={onBack}
        onSave={handleSave}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <Card className="shadow-md border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <CardContent className="space-y-6 pt-6">
          <ValuePropositionSection 
            companyId={searchId}
            companyName={companySearch.company_name}
            companyEmail={companySearch.email}
            displayAdvice={displayAdvice}
            displayIntroduction={displayIntroduction}
            displaySubject={displaySubject}
            onAdviceChange={setDisplayAdvice}
            onIntroductionChange={setDisplayIntroduction}
            onSubjectChange={setDisplaySubject}
            onMagicSuccess={handleMagicSuccess}
            onCopySuccess={handleCopySuccess}
            adjustTextareaHeight={adjustTextareaHeight}
          />

          <Separator className="my-2" />
          
          <ContactInformation 
            website={companySearch.www}
            contact={companySearch.contact}
            email={companySearch.email}
            phone={companySearch.phone}
            role={companySearch.role}
          />
          
          <QuestionsAnswersSection questionAnswers={questionAnswers} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySearchDetail;
