
/**
 * CORS headers for all responses
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Creates a JSON response with the given data and status code, including CORS headers
 */
export function createJsonResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    { 
      status,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      } 
    }
  );
}
