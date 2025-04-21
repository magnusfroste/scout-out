
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Server } from 'lucide-react';

interface ServerSettingsProps {
  smtpHost: string;
  smtpPort: string;
  onSmtpHostChange: (value: string) => void;
  onSmtpPortChange: (value: string) => void;
}

export const ServerSettings = ({
  smtpHost,
  smtpPort,
  onSmtpHostChange,
  onSmtpPortChange,
}: ServerSettingsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="smtpHost">SMTP Host</Label>
        <div className="relative">
          <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="smtpHost"
            placeholder="smtp.example.com"
            value={smtpHost}
            onChange={(e) => onSmtpHostChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="smtpPort">SMTP Port</Label>
        <Input
          id="smtpPort"
          placeholder="587"
          value={smtpPort}
          onChange={(e) => onSmtpPortChange(e.target.value.replace(/\D/g, ''))}
          type="number"
        />
      </div>
    </div>
  );
};
