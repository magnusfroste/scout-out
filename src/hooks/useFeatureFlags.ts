import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FeatureFlags {
  emailModuleEnabled: boolean;
  composioMcpEnabled: boolean;
}

interface UseFeatureFlagsReturn {
  flags: FeatureFlags;
  loading: boolean;
  updateFlag: (key: string, value: boolean) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export const useFeatureFlags = (): UseFeatureFlagsReturn => {
  const { userProfile } = useAuth();
  const [flags, setFlags] = useState<FeatureFlags>({
    emailModuleEnabled: false,
    composioMcpEnabled: false
  });
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value');

      if (error) {
        console.error('Error fetching feature flags:', error);
        return;
      }

      if (data) {
        const newFlags: FeatureFlags = {
          emailModuleEnabled: false,
          composioMcpEnabled: false
        };

        data.forEach((setting) => {
          if (setting.key === 'email_module_enabled') {
            newFlags.emailModuleEnabled = setting.value === true || setting.value === 'true';
          } else if (setting.key === 'composio_mcp_enabled') {
            newFlags.composioMcpEnabled = setting.value === true || setting.value === 'true';
          }
        });

        setFlags(newFlags);
      }
    } catch (error) {
      console.error('Error in fetchFlags:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFlag = async (key: string, value: boolean): Promise<boolean> => {
    if (!userProfile?.is_admin) {
      console.error('Only admins can update feature flags');
      return false;
    }

    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ 
          value: value,
          updated_at: new Date().toISOString(),
          updated_by: userProfile.id
        })
        .eq('key', key);

      if (error) {
        console.error('Error updating feature flag:', error);
        return false;
      }

      // Update local state
      if (key === 'email_module_enabled') {
        setFlags(prev => ({ ...prev, emailModuleEnabled: value }));
      } else if (key === 'composio_mcp_enabled') {
        setFlags(prev => ({ ...prev, composioMcpEnabled: value }));
      }

      return true;
    } catch (error) {
      console.error('Error in updateFlag:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  return {
    flags,
    loading,
    updateFlag,
    refetch: fetchFlags
  };
};
