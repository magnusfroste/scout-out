
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCompanyDetail } from '@/hooks/useCompanyDetail';
import CompanyHeader from './company-detail/CompanyHeader';
import ValuePropositionSection from './company-detail/ValuePropositionSection';
import ContactInformation, { ContactUpdates } from './company-detail/ContactInformation';
import QuestionsAnswersSection from './company-detail/QuestionsAnswersSection';
import LoadingIndicator from './company-detail/LoadingIndicator';
import NotFoundState from './company-detail/NotFoundState';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CompanySearchDetailProps {
  searchId: string;
  onBack: () => void;
  onUpdate?: (id: string, data: any) => void;
}

const CompanySearchDetail = ({ searchId, onBack, onUpdate }: CompanySearchDetailProps) => {
  console.log('CompanySearchDetail rendered with searchId:', searchId);

  // Create a wrapper for onUpdate that respects the stayOnPage flag
  const handleUpdate = (id: string, data: any) => {
    // Only call onBack/navigate if stayOnPage is not true
    if (onUpdate) {
      // Always add stayOnPage flag to keep user on the detail view
      onUpdate(id, { ...data, stayOnPage: true });
    }
  };

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
    adjustTextareaHeight,
    refetchCompanyData
  } = useCompanyDetail(searchId, handleUpdate);

  // Log initial data from companySearch when it changes
  useEffect(() => {
    if (companySearch) {
      console.log("CompanySearchDetail received data from Supabase:", {
        id: companySearch.id,
        name: companySearch.company_name,
        emailSent: companySearch.sent_email_at,
        hasAdvice: !!companySearch.advice,
        adviceLength: companySearch.advice?.length,
        hasIntroduction: !!companySearch.introduction,
        introLength: companySearch.introduction?.length,
        hasSubject: !!companySearch.subject,
        displayIntroLength: displayIntroduction?.length,
      });
    } else {
      console.log("CompanySearchDetail: No company search data received");
    }
  }, [companySearch, displayIntroduction]);

  const handleContactUpdate = async (updates: ContactUpdates) => {
    if (!searchId) return;
    
    try {
      console.log('Updating contact information:', updates);
      
      const { error } = await supabase
        .from('company_searches')
        .update(updates)
        .eq('id', searchId);
        
      if (error) throw error;
      
      console.log('Contact information updated successfully, refetching data');
      // After successful update, refetch the data to ensure we have the latest
      await refetchCompanyData();
      
      toast({
        title: 'Success',
        description: 'Contact information updated successfully',
      });
      
      // Call the handleUpdate function with stayOnPage flag
      if (handleUpdate) {
        handleUpdate(searchId, updates);
      }
    } catch (error: any) {
      console.error('Error updating contact information:', error);
      toast({
        title: 'Error',
        description: `Failed to update contact information: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleEmailSent = async () => {
    console.log('Email sent callback triggered in CompanySearchDetail, refreshing data');
    
    try {
      await refetchCompanyData();
      console.log('Company data refreshed successfully after email sent');
      
      // Double check if the sent_email_at was updated
      const { data, error } = await supabase
        .from('company_searches')
        .select('sent_email_at')
        .eq('id', searchId)
        .single();
        
      if (error) {
        console.error('Error fetching sent_email_at after refresh:', error);
      } else {
        console.log('Current sent_email_at value after refresh:', data.sent_email_at);
      }
    } catch (error) {
      console.error('Failed to refresh company data after email sent:', error);
      toast({
        title: 'Data Refresh Error',
        description: 'Could not refresh data after email was sent',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!companySearch) {
    console.log("CompanySearchDetail: Rendering NotFoundState because companySearch is null");
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
            displayScore={displayScore}
            onAdviceChange={setDisplayAdvice}
            onIntroductionChange={setDisplayIntroduction}
            onSubjectChange={setDisplaySubject}
            onScoreChange={setDisplayScore}
            onMagicSuccess={(score, advice, introduction, subject) => 
              handleMagicSuccess(score, advice, introduction, subject)
            }
            onCopySuccess={handleCopySuccess}
            adjustTextareaHeight={(textarea) => {
              if (textarea) adjustTextareaHeight(textarea);
            }}
            onSave={handleSave}
            onEmailSent={handleEmailSent}
          />

          <Separator className="my-2" />
          
          <ContactInformation 
            website={companySearch.www}
            contact={companySearch.contact}
            email={companySearch.email}
            phone={companySearch.phone}
            role={companySearch.role}
            emailSentAt={companySearch.sent_email_at}
            onUpdate={handleContactUpdate}
          />
          
          <QuestionsAnswersSection questionAnswers={questionAnswers} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySearchDetail;
