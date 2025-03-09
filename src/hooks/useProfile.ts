
import { useState } from 'react';
import { fetchUserProfile, updateUserProfile, UserProfile } from '@/services/profileService';
import { toast } from '@/hooks/use-toast';

export const useProfile = (userId: string | undefined) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshUserProfile = async () => {
    if (!userId) return;
    
    console.log('Refreshing user profile for:', userId);
    setLoading(true);
    try {
      const profile = await fetchUserProfile(userId);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      toast({
        title: "Error",
        description: "Failed to refresh your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'id'>>) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const success = await updateUserProfile(userId, updates);
      if (success) {
        await refreshUserProfile();
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    userProfile,
    loading,
    refreshUserProfile,
    updateProfile
  };
};
