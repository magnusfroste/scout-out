
import React from 'react';
import { Separator } from '@/components/ui/separator';

interface ContactInformationProps {
  website?: string | null;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
}

const ContactInformation: React.FC<ContactInformationProps> = ({
  website,
  contact,
  email,
  phone,
  role
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="space-y-3">
          {website && (
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-24">Website:</span>
              <a 
                href={website.startsWith('http') ? website : `https://${website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {website}
              </a>
            </div>
          )}
          {contact && (
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-24">Contact:</span>
              <span>{contact}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {email && (
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-24">Email:</span>
              <a
                href={`mailto:${email}`}
                className="text-blue-600 hover:underline break-all"
              >
                {email}
              </a>
            </div>
          )}
          {phone && (
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-24">Phone:</span>
              <a
                href={`tel:${phone}`}
                className="text-blue-600 hover:underline"
              >
                {phone}
              </a>
            </div>
          )}
          {role && (
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-24">Role:</span>
              <span>{role}</span>
            </div>
          )}
        </div>
      </div>
      <Separator className="my-2" />
    </div>
  );
};

export default ContactInformation;
