
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Edit, Save, X } from "lucide-react";

interface ProfileHeaderProps {
  isEditing: boolean;
  isRefreshing: boolean;
  loading: boolean;
  isSaving: boolean;
  onRefresh: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  isEditing,
  isRefreshing,
  loading,
  isSaving,
  onRefresh,
  onEdit,
  onCancel,
  onSave,
}) => (
  <div className="flex justify-between items-center mb-8">
    <h1 className="text-3xl font-bold">Your Profile</h1>
    {!isEditing ? (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing || loading}
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
    ) : (
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save
            </>
          )}
        </Button>
      </div>
    )}
  </div>
);

export default ProfileHeader;
