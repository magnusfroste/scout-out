
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, User } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProfileDetailsProps {
  user: { email: string | null } | null;
  userProfile: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  isEditing: boolean;
  firstName: string;
  lastName: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  user,
  userProfile,
  isEditing,
  firstName,
  lastName,
  setFirstName,
  setLastName,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle>Account Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6 pt-4">
      <div className="space-y-1">
        <Label className="text-muted-foreground">Email</Label>
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{user?.email}</span>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-muted-foreground">Name</Label>
        {!isEditing ? (
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              {userProfile?.first_name || userProfile?.last_name
                ? `${userProfile?.first_name || ""} ${userProfile?.last_name || ""}`.trim()
                : "Not provided"}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="first-name">First Name</Label>
              <Input
                id="first-name"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default ProfileDetails;
