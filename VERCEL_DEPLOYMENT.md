# Vercel Deployment Guide

## Environment Variables

When deploying to Vercel, you need to configure environment variables to ensure the application works correctly in production. Follow these steps:

1. Log in to your Vercel dashboard
2. Select your project
3. Go to "Settings" > "Environment Variables"
4. Add the following environment variables:

| Name | Value | Description |
|------|-------|-------------|
| `VITE_USE_MOCK_DATA` | `false` | Ensures the application uses real API data in production |
| `VITE_API_TIMEOUT` | `15000` | Sets the API timeout in milliseconds (adjust as needed) |

## Supabase Edge Functions

This project uses Supabase Edge Functions for webhook functionality. The Edge Function `trigger-n8n-workflow` is used to proxy requests to external webhooks. 

### Important Notes About Edge Functions:

1. **Deployment**: Ensure the Edge Function is deployed to your Supabase project. You can deploy it using the Supabase CLI:
   ```bash
   supabase functions deploy trigger-n8n-workflow
   ```

2. **Environment Variables**: The Edge Function uses these environment variables:
   - `SUPABASE_URL` - Set automatically by Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` - Set automatically by Supabase

3. **Hardcoded URL**: The frontend code currently has a hardcoded URL to the Edge Function:
   ```
   https://pqskutdrekcinpymvigm.supabase.co/functions/v1/trigger-n8n-workflow
   ```
   
   If you're using a different Supabase project in production, you'll need to update this URL.

## Important Notes

- **Mock Data**: Setting `VITE_USE_MOCK_DATA=false` is crucial to ensure your application makes real API calls in production.
- **Supabase**: The Supabase URL and key are hardcoded in the application, so no environment variables are needed for that.
- **Webhook URLs**: Webhook URLs are stored in the database, not as environment variables.

## Troubleshooting

If you're experiencing issues with your Vercel deployment:

1. **Check Logs**: Go to "Deployments" > select your deployment > "Functions" > check the logs for any errors.
2. **Verify Environment Variables**: Ensure all environment variables are correctly set.
3. **Rebuild**: If you've updated environment variables, you may need to redeploy your application.
4. **Edge Function Issues**: If the webhook functionality isn't working, check the Supabase Edge Function logs in the Supabase dashboard.

## Local vs Production

- `.env.development` - Used for local development
- `.env.production` - Used for production builds

When you run `npm run build`, Vite will automatically use the `.env.production` file.
