
import React from 'react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Button from '@/components/Button';

interface CompanyHeaderProps {
  companyName: string;
  createdAt: string;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({
  companyName,
  createdAt,
  onBack,
  onSave,
  isSaving,
  hasUnsavedChanges,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={onBack} size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
      </div>

      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div>
          <CardTitle className="text-2xl font-semibold tracking-tight">{companyName}</CardTitle>
          <CardDescription className="text-sm mt-1">
            Searched on {formatDate(createdAt)}
          </CardDescription>
        </div>
        <Button 
          onClick={onSave} 
          disabled={isSaving || !hasUnsavedChanges}
          className={`${hasUnsavedChanges ? 'bg-green-600 hover:bg-green-700' : ''} transition-all duration-200`}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {hasUnsavedChanges ? 'Save Changes' : 'No Changes to Save'}
            </>
          )}
        </Button>
      </CardHeader>
    </>
  );
};

export default CompanyHeader;
