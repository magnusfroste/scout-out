
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CompanyInputProps {
  companyName: string;
  setCompanyName: (name: string) => void;
  isDisabled: boolean;
}

const CompanyInput: React.FC<CompanyInputProps> = ({
  companyName,
  setCompanyName,
  isDisabled
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="companyName">Company Name</Label>
      <Input
        id="companyName"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        placeholder="Enter company name to research"
        disabled={isDisabled}
      />
    </div>
  );
};

export default CompanyInput;
