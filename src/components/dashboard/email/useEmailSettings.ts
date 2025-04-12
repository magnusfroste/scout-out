
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEmailSettings = (userId: string | undefined) => {
  const [hasEmailSettings, setHasEmailSettings] = useState<boolean | null>(null);
  
  useEffect(() => {
    if (userId) {
      checkEmailSettings(userId);
    }
  }, [userId]);
  
  const checkEmailSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_email_settings')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();
      
      setHasEmailSettings(!!data);
      return !!data;
    } catch (error) {
      setHasEmailSettings(false);
      return false;
    }
  };
  
  return {
    hasEmailSettings,
    checkEmailSettings
  };
};

export default useEmailSettings;
