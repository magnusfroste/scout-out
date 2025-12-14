/**
 * Profile Update Service
 * @deprecated Use profileRepository.update() directly or fetchUserProfile service
 */

import { profileRepository } from '@/data/profileRepository';
import { UserProfile, ProfileUpdate } from '@/models/profile';

export const updateUserProfile = async (
  userId: string, 
  updates: Partial<Omit<UserProfile, 'id'>>
): Promise<boolean> => {
  return profileRepository.update(userId, updates as ProfileUpdate);
};
