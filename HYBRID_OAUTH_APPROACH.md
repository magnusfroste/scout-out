# Hybrid OAuth2 Approach for Office 365 Integration

## Overview
This document outlines the implementation of a hybrid approach for Office 365 OAuth2 authentication, offering both simplified onboarding and advanced control options.

## Current Implementation (Individual App Registration)
Users must:
1. Create their own Azure app registration
2. Configure redirect URIs and permissions
3. Provide Client ID and Client Secret
4. Handle OAuth flow individually

**Benefits:**
- Complete control over app registration
- Isolated from shared app limitations
- Custom branding and permissions

**Drawbacks:**
- Complex setup process
- Technical barrier for non-developers
- Time-consuming onboarding

## New Implementation (Shared App + Individual Option)

### Simple Connect (Shared App)
- **Route:** `/simple-connect`
- **Edge Function:** `o365-auth-shared`
- **Database:** `connection_type = 'shared'`
- **Secrets:** `SHARED_O365_CLIENT_ID`, `SHARED_O365_CLIENT_SECRET`

**User Experience:**
1. Click "Simple Connect" option in settings
2. Enter email address
3. Redirect to Microsoft OAuth (using shared app)
4. One-click authorization
5. Automatic token storage

**Implementation Details:**
- Uses MBA's Azure app registration
- Shared credentials stored in Supabase secrets
- Separate edge function for security isolation
- Same token storage mechanism as individual flow

### Advanced Setup (Individual App Registration)
- **Route:** `/settings` (existing)
- **Edge Function:** `o365-auth` (existing)
- **Database:** `connection_type = 'individual'`
- **User provides:** Client ID, Client Secret

**User Experience:**
1. Create Azure app registration
2. Configure redirect URIs and permissions
3. Provide Client ID and Client Secret in settings
4. Complete OAuth flow with individual app

## Database Schema Changes

### user_email_settings Table
```sql
ALTER TABLE public.user_email_settings 
ADD COLUMN connection_type TEXT DEFAULT 'individual' 
CHECK (connection_type IN ('individual', 'shared'));
```

**Values:**
- `'individual'`: User provided their own Azure app credentials
- `'shared'`: User used the shared app OAuth flow

## Technical Implementation

### 1. Shared OAuth Edge Function
**File:** `supabase/functions/o365-auth-shared/index.ts`
- Retrieves shared credentials from Supabase secrets
- Handles token exchange with Microsoft
- Returns same token structure as individual flow
- Isolated from existing `o365-auth` function

### 2. Simple Connect Service
**File:** `src/services/oauth/sharedOAuthFlowService.ts`
- `initiateO365AuthShared()`: Start shared app OAuth flow
- `handleO365AuthCallbackShared()`: Process callback with shared app
- Separate from existing individual OAuth service

### 3. Simple Connect Page
**File:** `src/components/SimpleConnect.tsx`
- Clean, minimal UI similar to HubSpot
- Handles OAuth callback processing
- Automatic redirection to settings after success
- Email address collection and validation

### 4. Settings Integration
**File:** `src/components/dashboard/email-settings/EmailSettingsContainer.tsx`
- Connection type selector (Simple vs Advanced)
- Visual indicators for each option
- Link to Simple Connect page
- Maintains existing Advanced Setup flow

## Security Considerations

### Shared App Security
- Shared credentials stored in Supabase secrets (encrypted)
- Separate edge function prevents credential exposure
- Same OAuth scopes and permissions as individual apps
- Row Level Security policies apply to all connections

### Isolation Benefits
- New edge function (`o365-auth-shared`) isolated from existing flow
- No risk of breaking existing user configurations
- Easy to disable/modify shared app without affecting individual users
- Separate error handling and logging

## User Migration Strategy

### Phase 1: Introduction
- Add Simple Connect option to settings page
- Keep existing Advanced Setup as default
- A/B test user preference and completion rates

### Phase 2: Optimization
- Based on usage data, potentially make Simple Connect the default
- Add user education about the differences
- Provide migration path between connection types

### Phase 3: Maintenance
- Monitor shared app usage and quotas
- Update shared app permissions as needed
- Provide fallback to individual apps if shared app has issues

## Benefits of Hybrid Approach

### For Users
- **Choice:** Simple setup OR advanced control
- **Flexibility:** Can switch between connection types
- **Reliability:** Fallback options if one method fails

### For Business
- **Lower barrier to entry:** More users can complete setup
- **Better retention:** Reduced dropoff during onboarding
- **Differentiation:** Advanced users still get full control

### For Development
- **Risk mitigation:** Existing functionality unchanged
- **Gradual rollout:** Can test and iterate on shared app
- **Monitoring:** Clear separation allows better analytics

## Implementation Status

✅ **Completed:**
- Database migration for `connection_type` field
- Shared OAuth edge function (`o365-auth-shared`)
- Shared OAuth service (`sharedOAuthFlowService.ts`)
- Simple Connect page component
- Settings page integration
- Route configuration
- Type definitions update

🔄 **Next Steps:**
- Test shared app flow with different O365 accounts
- Monitor edge function logs and performance
- Gather user feedback on both flows
- Optimize UX based on usage patterns

## Configuration Requirements

### Supabase Secrets
```
SHARED_O365_CLIENT_ID = "your-mba-client-id"
SHARED_O365_CLIENT_SECRET = "your-mba-client-secret"
```

### Azure App Registration (MBA Shared App)
- **Redirect URIs:** `https://your-domain.com/simple-connect`
- **Permissions:** Same as individual apps
- **Multi-tenant:** Yes (to support any O365 organization)

## Monitoring and Analytics

### Key Metrics
- Shared app vs individual app usage rates
- Setup completion rates for each method
- Error rates and common failure points
- User satisfaction and support ticket volume

### Logging
- Edge function performance and errors
- OAuth flow completion rates
- Connection type distribution
- Migration between connection types

## Future Enhancements

### Potential Improvements
- **Auto-detection:** Determine best connection method based on user's O365 org
- **Bulk migration:** Help existing users migrate to shared app if beneficial
- **Additional providers:** Extend hybrid approach to Gmail, etc.
- **Enterprise features:** Custom shared apps for enterprise customers

### Scalability Considerations
- Monitor shared app rate limits and quotas
- Plan for multiple shared apps if needed
- Consider regional shared apps for performance
- Implement shared app health monitoring

---

*Document created: January 2025*
*Last updated: January 2025*