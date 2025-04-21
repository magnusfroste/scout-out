
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail } from 'lucide-react';

interface BasicSettingsProps {
  emailAddress: string;
  emailProvider: string;
  onEmailAddressChange: (value: string) => void;
  onEmailProviderChange: (value: string) => void;
}

export const BasicSettings = ({
  emailAddress,
  emailProvider,
  onEmailAddressChange,
  onEmailProviderChange,
}: BasicSettingsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="emailAddress">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="emailAddress"
            placeholder="your-email@example.com"
            value={emailAddress}
            onChange={(e) => onEmailAddressChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="emailProvider">Email Provider</Label>
        <Select value={emailProvider} onValueChange={onEmailProviderChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select email provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gmail">Gmail</SelectItem>
            <SelectItem value="outlook">Outlook</SelectItem>
            <SelectItem value="office365">Office 365</SelectItem>
            <SelectItem value="yahoo">Yahoo Mail</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
