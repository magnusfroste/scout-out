# Simplification Plan for Master Business Agent

## Current Architecture

The application currently has a dual approach for making API calls:

1. **Direct Webhook Calls** (Primary method):
   - Used in `companyWebhookService.ts`
   - Makes direct `fetch` calls to webhook URLs stored in the database

2. **Supabase Edge Function** (Alternative method):
   - Located in `/supabase/functions/trigger-n8n-workflow/`
   - Was previously used in the original `CompanySearch.tsx` component
   - Acts as a proxy for webhook requests

## Simplification Steps

For this proof of concept, we can simplify the architecture by standardizing on the direct webhook approach:

### 1. Update Components to Use Direct Webhook Calls ✅

- [x] Update dashboard `CompanySearch.tsx` to use direct webhook calls (completed)
- [x] Update original `CompanySearch.tsx` to use direct webhook calls (completed)

### 2. Remove Edge Function References

- [ ] Remove any remaining references to the Edge Function URL
- [ ] Update any documentation that mentions the Edge Function

### 3. Standardize Error Handling

- [ ] Ensure consistent error handling across all components
- [ ] Add proper logging for webhook failures

### 4. Environment Configuration

- [ ] Ensure `.env.development` and `.env.production` files are properly configured
- [ ] Add environment variables to Vercel/deployment platform

## Benefits of Simplification

1. **Reduced Complexity**: Simpler architecture with a single approach for API calls
2. **Easier Debugging**: Direct webhook calls are easier to debug than Edge Functions
3. **Fewer Dependencies**: No need to maintain and deploy Edge Functions
4. **Simplified Deployment**: No need to configure Edge Function environment variables

## Future Considerations

If the application grows beyond a proof of concept, you might want to reconsider using Edge Functions for:

1. **Authentication**: Adding more robust authentication for webhook calls
2. **Rate Limiting**: Implementing rate limiting for API calls
3. **Logging**: Centralized logging for all webhook calls
4. **Transformations**: Complex data transformations before/after API calls

For now, the direct webhook approach is simpler and more appropriate for a proof of concept.
