
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
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
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

    // Call the webhook
    let response;
    try {
      console.log(`Sending webhook request to: ${webhookUrl}`);
      
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ company, questions })
      });
      
      console.log(`Webhook response status: ${response.status}`);
      
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
    
    // Get the response data and parse it according to the new format
    let responseData;
    let contactInfo = null;
    
    try {
      // Parse the webhook response
      const responseJson = await response.json();
      console.log('Raw webhook response:', JSON.stringify(responseJson));
      
      // Handle the new format: [{ output: [{ results: [...], contact_info: {...} }] }]
      if (Array.isArray(responseJson) && responseJson.length > 0 && responseJson[0].output) {
        // Extract from the new format
        const output = responseJson[0].output;
        
        if (Array.isArray(output) && output.length > 0) {
          const firstOutput = output[0];
          
          // Extract results
          if (firstOutput.results && Array.isArray(firstOutput.results)) {
            responseData = {
              results: firstOutput.results
            };
          }
          
          // Extract contact info if available
          if (firstOutput.contact_info) {
            contactInfo = firstOutput.contact_info;
          }
        }
      } else {
        // Fallback to the old format handling
        responseData = responseJson;
        
        if (responseJson.contact_info) {
          contactInfo = responseJson.contact_info;
        }
        
        if (!Array.isArray(responseData.results)) {
          responseData = Array.isArray(responseJson) ? { results: responseJson } : { results: [responseJson] };
        }
      }
      
      if (!responseData || !responseData.results) {
        console.error('Failed to parse results from response:', responseJson);
        responseData = { 
          results: [{ answer: "Could not parse response data" }] 
        };
      }
      
    } catch (e) {
      console.error('Error parsing response JSON:', e);
      // If not JSON, try to get text
      try {
        const text = await response.text();
        console.log('Text response:', text);
        responseData = { results: [{ answer: text }] };
      } catch (textError) {
        console.error('Error reading response:', textError);
        responseData = { results: [{ answer: "Could not parse response" }] };
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

    // Return successful response
    const responseObject = { 
      success: true, 
      data: responseData.results,
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
