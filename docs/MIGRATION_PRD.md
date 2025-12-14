# Migration PRD: External Supabase → Lovable Cloud

**Version:** 1.0  
**Datum:** 2025-12-14  
**Status:** Draft  

---

## 1. Översikt

Detta dokument beskriver migreringen av applikationen från extern Supabase-instans till Lovable Cloud. Applikationen är ett B2B-verktyg för företagsresearch och value proposition-generering.

### 1.1 Nuvarande Arkitektur
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Supabase (extern instans)
- **Project ID:** `pqskutdrekcinpymvigm`
- **Database:** PostgreSQL 15

---

## 2. Databas-schema

### 2.1 Tabeller

#### `profiles`
**Syfte:** Användarprofildata  
**RLS:** Aktiverad

| Kolumn | Typ | Nullable | Default |
|--------|-----|----------|---------|
| id | uuid | Nej | - |
| first_name | text | Ja | - |
| last_name | text | Ja | - |
| avatar_url | text | Ja | - |
| credits | integer | Nej | 5 |
| is_admin | boolean | Nej | false |
| website_url | text | Ja | - |
| business_data | jsonb | Ja | - |
| updated_at | timestamptz | Ja | now() |

**RLS Policies:**
- Users can view/update own profile
- Admins can access all profiles

---

#### `agent_questions`
**Syfte:** Användardefinierade forskningsfrågor  
**RLS:** Aktiverad

| Kolumn | Typ | Nullable | Default |
|--------|-----|----------|---------|
| id | uuid | Nej | gen_random_uuid() |
| user_id | uuid | Nej | - |
| question | text | Nej | - |
| rationale | text | Ja | - |
| created_at | timestamptz | Nej | now() |
| updated_at | timestamptz | Nej | now() |

**RLS Policies:**
- Users can CRUD their own questions

---

#### `company_searches`
**Syfte:** Sparade företagsresearch-resultat  
**RLS:** Aktiverad

| Kolumn | Typ | Nullable | Default |
|--------|-----|----------|---------|
| id | uuid | Nej | gen_random_uuid() |
| user_id | uuid | Nej | - |
| company_name | text | Nej | - |
| www | text | Ja | - |
| result | jsonb | Ja | - |
| contact | text | Ja | - |
| contact_info | jsonb | Ja | - |
| email | text | Ja | - |
| phone | text | Ja | - |
| role | text | Ja | - |
| subject | text | Ja | - |
| introduction | text | Ja | - |
| advice | text | Ja | - |
| score | integer | Ja | - |
| sent_email_at | timestamptz | Ja | - |
| created_at | timestamptz | Nej | now() |
| updated_at | date | Ja | - |

**RLS Policies:**
- Users can CRUD their own company searches

---

#### `company_question_answers`
**Syfte:** Svar på frågor per företagssökning  
**RLS:** Aktiverad

| Kolumn | Typ | Nullable | Default |
|--------|-----|----------|---------|
| id | uuid | Nej | gen_random_uuid() |
| company_search_id | uuid | Nej | - |
| question_id | uuid | Nej | - |
| answer | text | Ja | - |
| created_at | timestamptz | Nej | now() |
| updated_at | timestamptz | Nej | now() |

**Foreign Keys:**
- `company_search_id` → `company_searches.id`
- `question_id` → `agent_questions.id`

**RLS Policies:**
- Access via company_searches ownership check

---

#### `credit_transactions`
**Syfte:** Kredithistorik  
**RLS:** Aktiverad

| Kolumn | Typ | Nullable | Default |
|--------|-----|----------|---------|
| id | uuid | Nej | gen_random_uuid() |
| user_id | uuid | Nej | - |
| amount | integer | Nej | - |
| description | text | Nej | - |
| created_at | timestamptz | Nej | now() |

**RLS Policies:**
- Users can view/insert own transactions

---

#### `user_email_settings`
**Syfte:** E-postkonfiguration för utskick  
**RLS:** Aktiverad

| Kolumn | Typ | Nullable | Default |
|--------|-----|----------|---------|
| id | uuid | Nej | uuid_generate_v4() |
| user_id | uuid | Nej | - |
| email_address | text | Nej | - |
| email_provider | text | Nej | - |
| smtp_host | text | Nej | - |
| smtp_port | integer | Nej | - |
| app_password | text | Ja | - |
| oauth2_client_id | text | Ja | - |
| oauth2_client_secret | text | Ja | - |
| oauth2_refresh_token | text | Ja | - |
| connection_type | text | Ja | 'individual' |
| hubspot_bcc_address | text | Ja | - |
| is_active | boolean | Ja | true |
| created_at | timestamptz | Ja | now() |
| updated_at | timestamptz | Ja | now() |

**RLS Policies:**
- Users can CRUD their own email settings

---

#### `oauth_connections`
**Syfte:** OAuth-anslutningar (Composio/MCP)  
**RLS:** Aktiverad

| Kolumn | Typ | Nullable | Default |
|--------|-----|----------|---------|
| id | uuid | Nej | gen_random_uuid() |
| user_id | uuid | Nej | - |
| email_address | text | Nej | - |
| status | text | Nej | 'pending' |
| connection_type | text | Nej | 'composio' |
| auth_config_id | text | Ja | - |
| mcp_server_id | text | Ja | - |
| connected_at | timestamptz | Ja | - |
| created_at | timestamptz | Nej | now() |
| updated_at | timestamptz | Nej | now() |

**RLS Policies:**
- Users can CRUD their own oauth connections

---

#### `api_searches`
**Syfte:** API-sökningslogg  
**RLS:** Aktiverad (public read/insert)

| Kolumn | Typ | Nullable | Default |
|--------|-----|----------|---------|
| id | bigint | Nej | - |
| data | jsonb | Ja | - |
| created_at | timestamptz | Nej | now() |

---

#### `app_integrations`
**Syfte:** Applikationsintegrationer  
**RLS:** Ej aktiverad

| Kolumn | Typ | Nullable | Default |
|--------|-----|----------|---------|
| id | uuid | Nej | gen_random_uuid() |
| integration_name | text | Nej | - |
| config | jsonb | Nej | - |
| created_at | timestamptz | Ja | now() |
| updated_at | timestamptz | Ja | now() |

---

#### `webhook_testing`
**Syfte:** Webhook-testkonfiguration  
**RLS:** Aktiverad (public read only)

| Kolumn | Typ | Nullable | Default |
|--------|-----|----------|---------|
| id | uuid | Nej | gen_random_uuid() |
| webhook_url | text | Nej | - |
| is_active | boolean | Nej | true |
| created_at | timestamptz | Nej | now() |
| updated_at | timestamptz | Nej | now() |

---

#### `prompt_evaluations`
**Syfte:** Prompt-utvärderingar  
**RLS:** Aktiverad

| Kolumn | Typ | Nullable | Default |
|--------|-----|----------|---------|
| id | uuid | Nej | gen_random_uuid() |
| user_id | uuid | Ja | - |
| user_prompt | text | Nej | - |
| master_prompt | text | Nej | - |
| webhook_url | text | Nej | - |
| status | text | Ja | 'pending' |
| evaluation_results | jsonb | Ja | - |
| company_name | text | Ja | - |
| industry | text | Ja | - |
| company_size | text | Ja | - |
| target_audience | text | Ja | - |
| created_at | timestamptz | Nej | now() |
| updated_at | timestamptz | Nej | now() |

**RLS Policies:**
- Users can CRUD their own evaluations

---

#### `keep_alive`
**Syfte:** Keep-alive för databas  
**RLS:** Ej aktiverad

| Kolumn | Typ | Nullable | Default |
|--------|-----|----------|---------|
| id | bigint | Nej | - |
| created_at | timestamptz | Nej | now() |

---

### 2.2 Lab-tabeller (Advanced Research)

#### `lab_company_profiles`
**Syfte:** Detaljerade företagsprofiler för advanced research  
**RLS:** Aktiverad (demo mode - public access)

| Kolumn | Typ | Nullable | Default |
|--------|-----|----------|---------|
| id | uuid | Nej | gen_random_uuid() |
| user_id | uuid | Nej | - |
| company_name | text | Nej | - |
| website_url | text | Nej | - |
| linkedin_url | text | Ja | - |
| industry | text | Nej | - |
| company_size | text | Nej | - |
| mission | text | Nej | - |
| vision | text | Ja | - |
| values | text[] | Nej | '{}' |
| main_offerings | text[] | Nej | '{}' |
| offering_type | text[] | Nej | '{}' |
| target_industries | text[] | Nej | '{}' |
| ideal_client_size | text[] | Nej | '{}' |
| geographic_markets | text[] | Nej | '{}' |
| unique_differentiators | text[] | Nej | '{}' |
| typical_results | text[] | Nej | '{}' |
| credentials | text[] | Nej | '{}' |
| delivery_model | text[] | Nej | '{}' |
| project_scope | text | Nej | - |
| pricing_positioning | text | Nej | - |
| communication_style | text | Nej | - |
| organizational_personality | text[] | Nej | '{}' |
| known_clients | boolean | Ja | false |
| known_clients_list | text | Ja | - |
| success_story | text | Ja | - |
| years_active | text | Ja | - |
| business_registration | text | Ja | - |
| is_complete | boolean | Ja | false |
| created_at | timestamptz | Nej | now() |
| updated_at | timestamptz | Nej | now() |

---

#### `lab_user_profiles`
**Syfte:** Detaljerade användarprofiler för outreach-stil  
**RLS:** Aktiverad (demo mode)

| Kolumn | Typ | Nullable | Default |
|--------|-----|----------|---------|
| id | uuid | Nej | gen_random_uuid() |
| user_id | uuid | Nej | - |
| full_name | text | Nej | - |
| linkedin_profile | text | Ja | - |
| date_of_birth | date | Ja | - |
| birthplace | text | Ja | - |
| current_location | text | Ja | - |
| role_in_organization | text | Nej | - |
| outreach_experience | text | Nej | - |
| prospects_per_week | text | Nej | - |
| communication_style | text | Nej | - |
| introduction_style | text | Nej | - |
| expertise_positioning | text | Nej | - |
| credibility_preference | text[] | Nej | '{}' |
| preferred_contact_channel | text[] | Nej | '{}' |
| followup_timing | text | Nej | - |
| nonresponse_handling | text | Nej | - |
| pain_points_focus | text[] | Nej | '{}' |
| objection_handling | text[] | Nej | '{}' |
| meeting_format | text[] | Nej | '{}' |
| meeting_duration | text | Nej | - |
| success_metrics | text[] | Nej | '{}' |
| credits | integer | Nej | 5 |
| is_complete | boolean | Ja | false |
| created_at | timestamptz | Nej | now() |
| updated_at | timestamptz | Nej | now() |

---

#### `lab_prospect_research`
**Syfte:** Advanced prospect research-resultat  
**RLS:** Aktiverad (demo mode)

| Kolumn | Typ | Nullable | Default |
|--------|-----|----------|---------|
| id | uuid | Nej | gen_random_uuid() |
| user_id | uuid | Nej | - |
| company_profile_id | uuid | Nej | - |
| user_profile_id | uuid | Nej | - |
| prospect_company_name | text | Nej | - |
| prospect_website_url | text | Nej | - |
| prospect_linkedin_url | text | Ja | - |
| webhook_url | text | Nej | - |
| research_type | text | Nej | 'standard' |
| status | text | Nej | 'pending' |
| research_results | jsonb | Ja | - |
| fit_score | integer | Ja | - |
| decision_makers | jsonb | Ja | - |
| contact_strategy | jsonb | Ja | - |
| value_proposition | jsonb | Ja | - |
| error_message | text | Ja | - |
| tags | text[] | Ja | '{}' |
| notes | text | Ja | - |
| is_starred | boolean | Ja | false |
| started_at | timestamptz | Ja | - |
| completed_at | timestamptz | Ja | - |
| exported_at | timestamptz | Ja | - |
| created_at | timestamptz | Nej | now() |
| updated_at | timestamptz | Nej | now() |

**Foreign Keys:**
- `company_profile_id` → `lab_company_profiles.id`
- `user_profile_id` → `lab_user_profiles.id`

---

#### `lab_research_templates`
**Syfte:** Research-mallar  
**RLS:** Aktiverad

| Kolumn | Typ | Nullable | Default |
|--------|-----|----------|---------|
| id | uuid | Nej | gen_random_uuid() |
| user_id | uuid | Nej | - |
| name | text | Nej | - |
| description | text | Ja | - |
| master_prompt | text | Nej | - |
| research_type | text | Nej | 'custom' |
| is_default | boolean | Ja | false |
| is_active | boolean | Ja | true |
| created_at | timestamptz | Nej | now() |
| updated_at | timestamptz | Nej | now() |

---

#### `lab_credit_transactions`
**Syfte:** Kredithistorik för lab-modulen  
**RLS:** Aktiverad

| Kolumn | Typ | Nullable | Default |
|--------|-----|----------|---------|
| id | uuid | Nej | gen_random_uuid() |
| user_id | uuid | Nej | - |
| research_id | uuid | Ja | - |
| amount | integer | Nej | - |
| description | text | Nej | - |
| created_at | timestamptz | Nej | now() |

**Foreign Keys:**
- `research_id` → `lab_prospect_research.id`

---

## 3. Edge Functions

### 3.1 Aktiva Edge Functions

| Funktion | Syfte | JWT | Beroenden (Secrets) |
|----------|-------|-----|---------------------|
| `send-email` | SMTP e-postutskick | Ja | - |
| `send-graph-email` | Microsoft Graph e-post | Ja | - |
| `trigger-mybusiness-webhook` | Webhook för företagsdata | Ja | MYBUSINESS_WEBHOOK_URL |
| `trigger-questions-webhook` | Webhook för frågor | Ja | QUESTIONS_WEBHOOK_URL |
| `trigger-value-proposition-webhook` | Webhook för value proposition | Ja | VALUE_PROPOSITION_WEBHOOK_URL |
| `trigger-company-research-webhook` | Webhook för företagsresearch | Ja | COMPANY_RESEARCH_WEBHOOK_URL |
| `trigger-n8n-workflow` | n8n workflow trigger | Ja | N8N_API_KEY |
| `o365-auth` | Office 365 OAuth (individuell) | Ja | - |
| `o365-auth-shared` | Office 365 OAuth (delad) | Ja | SHARED_O365_CLIENT_ID, SHARED_O365_CLIENT_SECRET |
| `o365-auth-refresh` | Token refresh | Ja | SHARED_O365_CLIENT_ID, SHARED_O365_CLIENT_SECRET |
| `get-shared-client-id` | Hämta delad klient-ID | Ja | SHARED_O365_CLIENT_ID |
| `create-payment` | Stripe checkout | Ja | STRIPE_SECRET_KEY |
| `stripe-webhook` | Stripe webhook handler | Ja | STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET |
| `get-or-create-mcp-connection` | MCP/Composio integration | Ja | COMPOSIO_API_KEY |
| `composio-connect-account` | Composio konto-koppling | Ja | COMPOSIO_API_KEY |
| `test-composio-mcp` | MCP testning | Ja | COMPOSIO_API_KEY |
| `create-user-mcp-server` | Skapa MCP-server | Ja | COMPOSIO_API_KEY |

---

## 4. Secrets

### 4.1 Webhook URLs
| Secret | Beskrivning |
|--------|-------------|
| `VALUE_PROPOSITION_WEBHOOK_URL` | URL för value proposition webhook |
| `QUESTIONS_WEBHOOK_URL` | URL för fråge-webhook |
| `MYBUSINESS_WEBHOOK_URL` | URL för företagsdata webhook |
| `COMPANY_RESEARCH_WEBHOOK_URL` | URL för företagsresearch webhook |

### 4.2 Betalning (Stripe)
| Secret | Beskrivning |
|--------|-------------|
| `STRIPE_SECRET_KEY` | Stripe API-nyckel |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook-signering |
| `LAB_STRIPE_WEBHOOK_SECRET` | Lab-modul Stripe webhook |

### 4.3 OAuth/Integration
| Secret | Beskrivning |
|--------|-------------|
| `SHARED_O365_CLIENT_ID` | Delad Office 365 klient-ID |
| `SHARED_O365_CLIENT_SECRET` | Delad Office 365 hemlighet |
| `COMPOSIO_API_KEY` | Composio API-nyckel |
| `N8N_API_KEY` | n8n API-nyckel |

### 4.4 Supabase (Auto-genererade)
| Secret | Beskrivning |
|--------|-------------|
| `SUPABASE_URL` | Supabase projekt-URL |
| `SUPABASE_ANON_KEY` | Supabase anonym nyckel |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publik nyckel |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role |
| `SUPABASE_DB_URL` | Databas-URL |

---

## 5. Database Functions

### 5.1 Applikationsfunktioner

```sql
-- Hämta användarens e-postinställningar
CREATE OR REPLACE FUNCTION public.get_user_email_settings()
RETURNS SETOF user_email_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM user_email_settings
  WHERE user_id = auth.uid()
  AND is_active = true;
END;
$$;
```

```sql
-- Hantera nya användare (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', null);
  RETURN new;
END;
$$;
```

```sql
-- Uppdatera updated_at automatiskt
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

---

## 6. Frontend Services

### 6.1 API Services
| Fil | Syfte |
|-----|-------|
| `src/services/companySearchService.ts` | Företagssökning |
| `src/services/companyWebhookService.ts` | Webhook-anrop |
| `src/services/valueProposition/` | Value proposition-generering |
| `src/services/myBusinessWebhookService.ts` | Företagsdata-webhook |
| `src/services/questionService.ts` | Frågehantering |
| `src/services/profileService.ts` | Profilhantering |
| `src/services/email/graphEmailService.ts` | Graph e-post |
| `src/services/oauth/` | OAuth-flöden |

### 6.2 Hooks
| Fil | Syfte |
|-----|-------|
| `src/hooks/useCompanySearch.ts` | Företagssökning |
| `src/hooks/useCompanySearches.tsx` | Sökhistorik |
| `src/hooks/useCompanyDetail.ts` | Företagsdetaljer |
| `src/hooks/useProfile.ts` | Användarprofil |
| `src/hooks/useEmailSettings.tsx` | E-postinställningar |
| `src/hooks/useSearchHistory.ts` | Sökhistorik |

---

## 7. Migreringsplan

### Fas 1: Förberedelse
- [ ] Exportera all data från befintlig Supabase
- [ ] Dokumentera alla RLS-policies
- [ ] Testa alla edge functions lokalt
- [ ] Skapa backup av hela projektet

### Fas 2: Lovable Cloud Setup
- [ ] Aktivera Lovable Cloud i projektet
- [ ] Skapa databas-schema via migrationer
- [ ] Konfigurera alla RLS-policies
- [ ] Skapa database functions och triggers

### Fas 3: Edge Functions
- [ ] Kopiera alla edge functions till nya strukturen
- [ ] Uppdatera `supabase/config.toml`
- [ ] Konfigurera alla secrets i Lovable Cloud
- [ ] Testa varje edge function individuellt

### Fas 4: Data Migration
- [ ] Importera profiles-data
- [ ] Importera agent_questions
- [ ] Importera company_searches
- [ ] Importera övriga tabeller
- [ ] Verifiera foreign key-relationer

### Fas 5: Frontend Updates
- [ ] Uppdatera `src/integrations/supabase/client.ts`
- [ ] Verifiera alla API-anrop
- [ ] Testa autentiseringsflöde
- [ ] Testa alla CRUD-operationer

### Fas 6: Verifiering
- [ ] Kör igenom alla användarflöden
- [ ] Verifiera e-postutskick
- [ ] Testa betalningsflöde
- [ ] Verifiera webhook-integrationer

---

## 8. Testchecklista

### Autentisering
- [ ] Registrering fungerar
- [ ] Inloggning fungerar
- [ ] Profilskapande (trigger) fungerar
- [ ] Utloggning fungerar

### Kärnfunktioner
- [ ] Skapa/redigera frågor
- [ ] Företagssökning
- [ ] Value proposition-generering
- [ ] E-postutskick
- [ ] Kreditavdrag

### Integrationer
- [ ] Office 365 OAuth
- [ ] Stripe betalningar
- [ ] Webhooks (alla 4)
- [ ] Composio MCP

---

## 9. Rollback-plan

### Vid misslyckad migrering:
1. Byt tillbaka Supabase client URL till extern instans
2. Verifiera att extern databas fortfarande är intakt
3. Dokumentera vad som gick fel
4. Planera ny migreringsförsök

### Kritiska filer att behålla backup av:
- `src/integrations/supabase/client.ts`
- `supabase/config.toml`
- Alla edge function-filer
- Databas-export (SQL dump)

---

## 10. Post-migration

### Städning
- [ ] Ta bort gammal Supabase-koppling
- [ ] Uppdatera dokumentation
- [ ] Informera användare om eventuell nedtid
- [ ] Övervaka loggar första veckan

### Optimering
- [ ] Lägg till databas-index vid behov
- [ ] Optimera RLS-policies
- [ ] Konfigurera connection pooling
- [ ] Sätt upp monitoring

---

*Dokumentet uppdateras löpande under migreringen.*
