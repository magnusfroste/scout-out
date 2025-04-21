
import { supabase } from '@/integrations/supabase/client';

export const sendEmailViaGraphAPI = async (
  accessToken: string, 
  to: string, 
  subject: string, 
  content: string,
  senderEmail: string
) => {
  try {
    console.log('Calling send-graph-email with token length:', accessToken.length);
    const response = await supabase.functions.invoke('send-graph-email', {
      body: JSON.stringify({
        accessToken,
        to,
        subject,
        body: content,
        senderEmail,
        debug: true
      })
    });

    if (response.error) {
      console.error('Graph API email send error:', response.error);
      throw new Error(response.error.message || 'Failed to send email via Graph API');
    }

    if (!response.data || !response.data.success) {
      console.error('Graph API unsuccessful response:', response.data);
      throw new Error(response.data?.error || 'Unknown error sending email via Graph API');
    }

    return response.data;
  } catch (error) {
    console.error('Error sending email via Graph API:', error);
    throw error;
  }
};
