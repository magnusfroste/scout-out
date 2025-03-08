
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
    
    // Parse the response data properly
    let responseData;
    let responseBody;
    
    try {
      // First try to get the response as text
      responseBody = await response.text();
      console.log('Response body:', responseBody);
      
      try {
        // Try to parse as JSON - this may throw an error if not valid JSON
        responseData = JSON.parse(responseBody);
        console.log('Parsed JSON response:', responseData);
        
        // Handle the case where responseData is an array with a single object containing results
        if (Array.isArray(responseData) && responseData.length > 0) {
          responseData = responseData[0];
        }
        
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        // If JSON parsing fails, create an object with the text response
        responseData = { 
          response: responseBody,
          error: "Response is not valid JSON"
        };
      }
    } catch (textError) {
      console.error('Error reading response body:', textError);
      responseData = { 
        error: "Could not read response body",
        details: textError.message
      };
    }
    
    // Prepare a standardized output format
    const output = {
      company: company,
      timestamp: new Date().toISOString(),
      data: responseData
    };
    
    // Store the result if we have a user ID
    if (userId) {
      try {
        // Only store one entry per search
        const { data: existingSearch, error: searchError } = await supabase
          .from('company_searches')
          .select('id')
          .eq('user_id', userId)
          .eq('company_name', company)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (searchError) {
          console.error('Error checking existing searches:', searchError);
        }
        
        // Only insert if there's no recent search for this company by this user
        if (!existingSearch || existingSearch.length === 0 || 
            (new Date().getTime() - new Date(existingSearch[0].created_at).getTime() > 5000)) {
          
          const { data: insertData, error: insertError } = await supabase
            .from('company_searches')
            .insert({
              user_id: userId,
              company_name: company,
              result: output
            })
            .select('id')
            .single();
            
          if (insertError) {
            console.error('Database insertion error:', insertError);
          } else if (insertData && responseData && responseData.results) {
            // If we have question results, store them as answers
            const answers = responseData.results.map((item: any) => ({
              company_search_id: insertData.id,
              question_id: item.question_id,
              answer: item.answer || JSON.stringify(item)
            }));
            
            if (answers.length > 0) {
              const { error: answersError } = await supabase
                .from('company_question_answers')
                .insert(answers);
                
              if (answersError) {
                console.error('Error inserting answers:', answersError);
              }
            }
          }
        } else {
          console.log('Skipping duplicate company search storage (within 5 seconds)');
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if DB storage fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        output: output
      }),
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
