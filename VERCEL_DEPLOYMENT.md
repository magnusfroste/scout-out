
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

## Important Notes

- **Mock Data**: Setting `VITE_USE_MOCK_DATA=false` is crucial to ensure your application makes real API calls in production.
- **Webhook URLs**: Webhook URLs are stored in the database, not as environment variables.

## Troubleshooting

If you're experiencing issues with your Vercel deployment:

1. **Check Logs**: Go to "Deployments" > select your deployment > "Functions" > check the logs for any errors.
2. **Verify Environment Variables**: Ensure all environment variables are correctly set.
3. **Rebuild**: If you've updated environment variables, you may need to redeploy your application.

## Local vs Production

- `.env.development` - Used for local development
- `.env.production` - Used for production builds

When you run `npm run build`, Vite will automatically use the `.env.production` file.
