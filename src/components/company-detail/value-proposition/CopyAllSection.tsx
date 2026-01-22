import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Check, Mail, FileText, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CopyAllSectionProps {
  recipientEmail?: string | null;
  recipientName?: string | null;
  subject: string;
  introduction: string;
}

const CopyAllSection: React.FC<CopyAllSectionProps> = ({
  recipientEmail,
  recipientName,
  subject,
  introduction
}) => {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldName: string) => {
    if (!text) {
      toast({
        title: "Inget att kopiera",
        description: `${fieldName} är tomt.`,
        variant: "destructive"
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Kopierat!",
        description: `${fieldName} kopierad till urklipp.`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Kopieringsfel",
        description: "Kunde inte kopiera till urklipp.",
        variant: "destructive"
      });
    }
  };

  const handleCopyAll = async () => {
    const allText = [
      recipientEmail ? `Till: ${recipientEmail}` : '',
      `Ämne: ${subject}`,
      '',
      introduction
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(allText);
      setCopiedField('all');
      toast({
        title: "Allt kopierat!",
        description: "All information kopierad till urklipp.",
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Copy all failed:', error);
      toast({
        title: "Kopieringsfel",
        description: "Kunde inte kopiera till urklipp.",
        variant: "destructive"
      });
    }
  };

  const CopyButton = ({ 
    onClick, 
    isCopied, 
    disabled = false 
  }: { 
    onClick: () => void; 
    isCopied: boolean; 
    disabled?: boolean;
  }) => (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className="shrink-0"
    >
      {isCopied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>Kopiera för Hubspot</span>
        </div>

        {/* Recipient */}
        {recipientEmail && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground w-16 shrink-0">
              <User className="h-4 w-4" />
              <span>Till:</span>
            </div>
            <div className="flex-1 bg-background rounded px-3 py-2 text-sm font-mono truncate border">
              {recipientEmail}
            </div>
            <CopyButton 
              onClick={() => handleCopy(recipientEmail, 'email')}
              isCopied={copiedField === 'email'}
            />
          </div>
        )}

        {/* Subject */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground w-16 shrink-0">
            <FileText className="h-4 w-4" />
            <span>Ämne:</span>
          </div>
          <div className="flex-1 bg-background rounded px-3 py-2 text-sm truncate border">
            {subject || <span className="text-muted-foreground italic">Inget ämne</span>}
          </div>
          <CopyButton 
            onClick={() => handleCopy(subject, 'ämne')}
            isCopied={copiedField === 'ämne'}
            disabled={!subject}
          />
        </div>

        {/* Introduction preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Brödtext:</span>
            </div>
            <CopyButton 
              onClick={() => handleCopy(introduction, 'brödtext')}
              isCopied={copiedField === 'brödtext'}
              disabled={!introduction}
            />
          </div>
          <div className="bg-background rounded px-3 py-2 text-sm border max-h-24 overflow-hidden">
            {introduction ? (
              <p className="line-clamp-3 text-muted-foreground">{introduction}</p>
            ) : (
              <span className="text-muted-foreground italic">Ingen brödtext</span>
            )}
          </div>
        </div>

        {/* Copy All button */}
        <Button
          onClick={handleCopyAll}
          className="w-full"
          variant="default"
          disabled={!subject && !introduction}
        >
          {copiedField === 'all' ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Kopierat!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Kopiera allt
            </>
          )}
        </Button>

        {/* Hubspot tip */}
        <div className="text-xs text-muted-foreground bg-background/50 rounded p-3 border border-dashed">
          💡 <strong>Tips:</strong> Klistra in i Hubspot och glöm inte att BCC:a din Hubspot-adress för automatisk loggning.
        </div>
      </CardContent>
    </Card>
  );
};

export default CopyAllSection;
