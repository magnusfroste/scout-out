/**
 * Profile Service - Business logic for user profiles
 * Uses the data layer for database operations
 */

import { profileRepository } from '@/data/profileRepository';
import { UserProfile, ProfileUpdate } from '@/models/profile';

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  console.log('Fetching profile for user:', userId);
  const profile = await profileRepository.ensureExists(userId);
  if (profile) {
    console.log('Profile found/created:', profile);
  }
  return profile;
};

export const updateUserProfile = async (
  userId: string, 
  updates: Partial<Omit<UserProfile, 'id'>>
): Promise<boolean> => {
  return profileRepository.update(userId, updates as ProfileUpdate);
};

export type { UserProfile } from '@/models/profile';
