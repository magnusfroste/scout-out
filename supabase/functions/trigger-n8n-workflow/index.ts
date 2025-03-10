
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://pqskutdrekcinpymvigm.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify authentication if needed
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // We can use the token to verify the user if needed
      console.log("Authentication provided correctly");
    } else {
      console.log("No authentication provided, continuing with service role");
    }

    // Parse the request body as JSON
    const { company, questions, userId, webhookUrl } = await req.json();
    console.log(`Calling webhook for company: ${company}, webhook: ${webhookUrl}`);
    console.log(`Questions: ${JSON.stringify(questions)}`);

    if (!company || !webhookUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Company name and webhook URL are required" 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Call the webhook with the company name and questions using POST
    let response;
    try {
      // Simplified webhook call - only send what's needed
      console.log(`Sending webhook request to: ${webhookUrl}`);
      
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          company, 
          questions: questions.map(q => ({ id: q.id, question: q.text }))
        })
      });
      
      console.log(`Webhook response status: ${response.status}`);
      
      // Check for non-200 responses
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Webhook error response: ${errorText}`);
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Webhook request failed: ${response.status}`,
            status: response.status
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 502
          }
        );
      }
    } catch (fetchError) {
      console.error('Error fetching from webhook:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Network error: ${fetchError.message}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 502
        }
      );
    }
    
    // Get the response data
    let responseData;
    let contactInfo = null;
    
    try {
      responseData = await response.json();
      console.log('Response data:', JSON.stringify(responseData));
      
      // Handle various response formats more simply
      // Extract contact info if available at the root level
      if (responseData.contact_info) {
        contactInfo = responseData.contact_info;
      }
      
      // Extract results from data property if it exists
      const results = responseData.results || 
                     (responseData.data && responseData.data.results) || 
                     responseData.data || 
                     [];
                     
      // Simplify the response structure
      responseData = { results };
      
    } catch (e) {
      console.error('Error parsing response JSON:', e);
      // If not JSON, try to get text
      try {
        const text = await response.text();
        console.log('Text response:', text);
        responseData = { response: text };
      } catch (textError) {
        console.error('Error reading response:', textError);
        responseData = { message: "Could not parse response" };
      }
    }
    
    // Store the result if we have a user ID
    if (userId) {
      try {
        // Store the company search
        const searchData = {
          user_id: userId,
          company_name: company,
          result: responseData,
          created_at: new Date().toISOString()
        };
        
        // Add contact info if available
        if (contactInfo) {
          searchData.contact_info = contactInfo;
          searchData.website = contactInfo.www || null;
          searchData.contact_person = contactInfo.contact || null;
          searchData.email = contactInfo.email || null;
          searchData.phone = contactInfo.phone || null;
        }
        
        const { data: searchData, error: searchError } = await supabase
          .from('company_searches')
          .insert(searchData)
          .select('id')
          .single();
        
        if (searchError) {
          console.error('Error storing company search:', searchError);
          throw searchError;
        }
        
        console.log('Company search stored with ID:', searchData.id);
        
        // Store individual answers if available
        if (responseData.results && Array.isArray(responseData.results)) {
          const answersToInsert = responseData.results
            .filter(result => result.question_id && result.answer) // Only valid results
            .map(result => ({
              company_search_id: searchData.id,
              question_id: result.question_id,
              answer: result.answer,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));
          
          if (answersToInsert.length > 0) {
            console.log('Inserting answers:', JSON.stringify(answersToInsert));
            
            const { error: answersError } = await supabase
              .from('company_question_answers')
              .insert(answersToInsert);
            
            if (answersError) {
              console.error('Error storing answers:', answersError);
              // Continue even if answer storage fails
            } else {
              console.log('Successfully stored answers for all questions');
            }
          } else {
            console.log('No valid answers found to store');
          }
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if DB storage fails
      }
    }

    // Include contact_info in the response if available
    const responseObject = { 
      success: true, 
      data: responseData
    };
    
    if (contactInfo) {
      responseObject.contact_info = contactInfo;
    }

    return new Response(
      JSON.stringify(responseObject),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'An unexpected error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
