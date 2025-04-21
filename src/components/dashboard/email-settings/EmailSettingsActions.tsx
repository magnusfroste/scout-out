
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { EmailSettings } from '@/types/email';

interface EmailSettingsActionsProps {
  existingSettings: EmailSettings | null;
  isDeleting: boolean;
  isSaving: boolean;
  onDelete: () => Promise<void>;
  onSave: () => Promise<void>;
}

export const EmailSettingsActions = ({
  existingSettings,
  isDeleting,
  isSaving,
  onDelete,
  onSave,
}: EmailSettingsActionsProps) => {
  if (existingSettings) {
    return (
      <>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting || isSaving}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Settings
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Email Settings</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete your email settings? You won't be able to send emails until you configure new settings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button onClick={onSave} disabled={isSaving || isDeleting}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Update Settings
            </>
          )}
        </Button>
      </>
    );
  }

  return (
    <Button onClick={onSave} disabled={isSaving} className="ml-auto">
      {isSaving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Save Settings
        </>
      )}
    </Button>
  );
};
