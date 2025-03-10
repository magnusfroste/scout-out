
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
      // But for now we'll just log it and proceed
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
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ company, questions })
      });
      
      console.log(`Webhook response status: ${response.status}`);
      
      // Check for non-200 responses
      if (!response.ok) {
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
      console.log('Response data:', responseData);
      
      // Handle the complex nested structure of the new response format
      if (Array.isArray(responseData) && responseData.length > 0) {
        // Check for output array at first level
        if (responseData[0].output) {
          const outputData = responseData[0].output;
          
          if (Array.isArray(outputData) && outputData.length > 0) {
            // Extract contact info if it exists
            if (outputData[0].contact_info) {
              contactInfo = outputData[0].contact_info;
              console.log('Contact info extracted:', contactInfo);
            }
            
            // Check if results array exists within the first item of output
            if (outputData[0].results) {
              // Extract the final results array
              const results = outputData[0].results;
              responseData = { results };
            } else {
              // If output doesn't contain results array, use it directly
              responseData = { results: outputData };
            }
          }
        }
      }
      
    } catch (e) {
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
        // First, store the company search with contact info if available
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
        
        // If we have results array, store individual answers
        if (responseData.results && Array.isArray(responseData.results) && responseData.results.length > 0) {
          const answersToInsert = responseData.results.map(result => ({
            company_search_id: searchData.id,
            question_id: result.question_id,
            answer: result.answer,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
          
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
          console.log('No results array found in the response data or it was empty.');
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
