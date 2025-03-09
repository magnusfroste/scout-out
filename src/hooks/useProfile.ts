
import { useState, useEffect } from 'react';
import { fetchUserProfile, updateUserProfile, UserProfile } from '@/services/profileService';
import { toast } from '@/hooks/use-toast';

export const useProfile = (userId: string | undefined) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshUserProfile = async () => {
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
    } catch (err) {
      console.error('Error refreshing profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh profile'));
      toast({
        title: "Error",
        description: "Failed to refresh your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile when userId changes
  useEffect(() => {
    if (userId) {
      refreshUserProfile();
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
        await refreshUserProfile();
      }
      return success;
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
