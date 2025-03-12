
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, Mail, CreditCard, RefreshCw, Save, Edit, X } from 'lucide-react';
import CreditDisplay from '@/components/dashboard/CreditDisplay';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const Profile = () => {
  const { user, loading, userProfile, refreshUserProfile, updateProfile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Ensure profile is up to date when component mounts
    if (user && !userProfile) {
      refreshUserProfile();
    }
  }, [user, userProfile, refreshUserProfile]);

  useEffect(() => {
    // Update local state when userProfile changes
    if (userProfile) {
      setFirstName(userProfile.first_name || '');
      setLastName(userProfile.last_name || '');
    }
  }, [userProfile]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUserProfile();
      toast({
        title: "Profile Refreshed",
        description: "Your profile has been refreshed successfully.",
      });
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form values to current profile values
    if (userProfile) {
      setFirstName(userProfile.first_name || '');
      setLastName(userProfile.last_name || '');
    }
  };

  const handleSave = async () => {
    if (!userProfile) return;
    
    setIsSaving(true);
    try {
      const success = await updateProfile({
        first_name: firstName,
        last_name: lastName
      });
      
      if (success) {
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your name has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
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
          </div>
          
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-pulse text-muted-foreground">Loading profile...</div>
            </div>
          ) : !userProfile ? (
            <div className="text-center space-y-4 p-8">
              <div className="text-muted-foreground">Could not load your profile.</div>
              <Button onClick={refreshUserProfile}>Try Again</Button>
            </div>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Account Information</CardTitle>
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleEdit}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={handleSave}
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
                          {userProfile.first_name || userProfile.last_name 
                            ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
                            : 'Not provided'}
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
              
              <Card>
                <CardHeader>
                  <CardTitle>Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center md:flex-row md:justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-3">
                      <CreditDisplay credits={userProfile.credits} size="lg" />
                      <span className="text-sm text-muted-foreground">Available for searches</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>1 credit = 10 questions per search</li>
                        <li>Unused credits never expire</li>
                        <li>New accounts start with 50 credits</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
