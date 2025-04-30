
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Save, Mail, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ContactInformationProps {
  website?: string | null;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  emailSentAt?: string | null;
  onUpdate?: (updates: ContactUpdates) => Promise<void>;
}

export interface ContactUpdates {
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
  role,
  emailSentAt,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState(contact || '');
  const [editedEmail, setEditedEmail] = useState(email || '');
  const [editedPhone, setEditedPhone] = useState(phone || '');
  const [editedRole, setEditedRole] = useState(role || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      
      await onUpdate({
        contact: editedContact || null,
        email: editedEmail || null,
        phone: editedPhone || null,
        role: editedRole || null
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving contact information:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderEmailSentStatus = () => {
    if (!emailSentAt) return null;
    
    return (
      <div className="mt-2 flex items-center text-sm text-emerald-600 dark:text-emerald-400">
        <CheckCircle className="h-4 w-4 mr-1" />
        <span>Email sent on {format(new Date(emailSentAt), 'MMM d, yyyy h:mm a')}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Contact Information</h3>
        {onUpdate && (
          isEditing ? (
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )
        )}
      </div>
      
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
          {!isEditing ? (
            contact && (
              <div className="flex items-start gap-2">
                <span className="font-medium min-w-24">Contact:</span>
                <span>{contact}</span>
              </div>
            )
          ) : (
            <div className="flex flex-col gap-1">
              <span className="font-medium">Contact:</span>
              <Input
                value={editedContact}
                onChange={(e) => setEditedContact(e.target.value)}
                placeholder="Contact name"
              />
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {!isEditing ? (
            <>
              {email && (
                <div className="flex flex-col">
                  <div className="flex items-start gap-2">
                    <span className="font-medium min-w-24">Email:</span>
                    <a
                      href={`mailto:${email}`}
                      className="text-blue-600 hover:underline break-all"
                    >
                      {email}
                    </a>
                  </div>
                  {renderEmailSentStatus()}
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
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <span className="font-medium">Email:</span>
                <Input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  placeholder="Email address"
                />
                {emailSentAt && (
                  <div className="mt-1 text-xs text-emerald-600 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    <span>Email previously sent on {format(new Date(emailSentAt), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium">Phone:</span>
                <Input
                  type="tel"
                  value={editedPhone}
                  onChange={(e) => setEditedPhone(e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium">Role:</span>
                <Input
                  value={editedRole}
                  onChange={(e) => setEditedRole(e.target.value)}
                  placeholder="Role/Position"
                />
              </div>
            </>
          )}
        </div>
      </div>
      <Separator className="my-2" />
    </div>
  );
};

export default ContactInformation;
