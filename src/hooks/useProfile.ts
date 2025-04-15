
import { useState, useEffect, useCallback } from 'react';
import { fetchUserProfile, updateUserProfile, UserProfile } from '@/services/profileService';
import { toast } from '@/hooks/use-toast';

export const useProfile = (userId: string | undefined) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const refreshUserProfile = useCallback(async (showToasts = false) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    console.log('Refreshing user profile for:', userId);
    setLoading(true);
    setError(null);
    
    try {
      const profile = await fetchUserProfile(userId);
      setUserProfile(profile);
      
      if (showToasts && !isInitialLoad) {
        toast({
          title: "Success",
          description: "Profile refreshed successfully.",
        });
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh profile'));
      
      if (showToasts) {
        toast({
          title: "Error",
          description: "Failed to refresh your profile. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [userId, isInitialLoad]);

  // Only fetch profile on initial mount and when userId changes
  useEffect(() => {
    if (userId) {
      refreshUserProfile(false);
    } else {
      setUserProfile(null);
      setLoading(false);
    }
  }, [userId]);

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'id'>>) => {
    if (!userId) return false;
    
    setLoading(true);
    try {
      const success = await updateUserProfile(userId, updates);
      if (success) {
        await refreshUserProfile(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      }
      return success;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    userProfile,
    loading,
    error,
    refreshUserProfile,
    updateProfile
  };
};
