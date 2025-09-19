# Webhook API Response Format Specification

This document defines the expected response formats for all webhook integrations in the application.

## Overview

The application integrates with external webhooks through Supabase Edge Functions, which act as secure proxies that handle authentication and forward requests to external services. Understanding the response format patterns is crucial for successful integration.

## Edge Function Wrapper Pattern

All webhook responses are processed through Supabase Edge Functions, which may wrap the original webhook response in a success/data structure:

```json
{
  "success": true,
  "data": {
    // Original webhook response here
  }
}
```

Our parsing logic automatically unwraps this structure when present.

## Webhook Types and Response Formats

### 1. Questions Webhook API

**Purpose**: Generate strategic questions based on a company's website URL.

**Endpoint**: Configured via `QUESTIONS_WEBHOOK_URL` secret

**Request Format**:
```json
{
  "websiteUrl": "https://example.com"
}
```

**Expected Response Formats** (multiple formats supported):

#### Format 1: Direct Output Structure (Recommended)
```json
{
  "output": {
    "questions": [
      {
        "question": "What are your primary business objectives?",
        "rationale": "Understanding objectives helps tailor our services."
      }
    ]
  }
}
```

#### Format 2: Array with Output Structure
```json
[
  {
    "output": {
      "questions": [
        {
          "question": "How do you approach digital transformation?",
          "rationale": "Helps assess technology readiness."
        }
      ]
    }
  }
]
```

#### Format 3: Direct Questions Array
```json
{
  "questions": [
    {
      "question": "What challenges do you face with scaling?",
      "rationale": "Identifies areas where we can provide value."
    }
  ]
}
```

#### Format 4: Simple Array
```json
[
  {
    "question": "How do you handle cybersecurity?",
    "rationale": "Assesses security consulting needs."
  }
]
```

**Field Mapping**:
- `question` (required): The actual question text
- `rationale` or `explanation`: Why this question is relevant

### 2. Company Research Webhook API

**Purpose**: Research company information and generate answers to specific questions.

**Endpoint**: Configured via `COMPANY_RESEARCH_WEBHOOK_URL` secret

**Request Format**:
```json
{
  "company": "Company Name",
  "questions": [
    {
      "id": "uuid",
      "question": "What is their main business model?"
    }
  ]
}
```

**Expected Response Formats**:

#### Standard Format
```json
{
  "company_name": "Company Name",
  "contact_info": {
    "email": "contact@company.com",
    "phone": "+1-555-0123",
    "website": "https://company.com"
  },
  "answers": [
    {
      "question": "What is their main business model?",
      "answer": "Detailed answer about the business model...",
      "question_id": "uuid"
    }
  ]
}
```

#### Legacy Format (also supported)
```json
{
  "results": {
    "contact_information": {
      "email": "contact@company.com",
      "phone": "+1-555-0123"
    },
    "question_answers": [
      {
        "question": "What is their main business model?",
        "answer": "Detailed answer...",
        "question_id": "uuid"
      }
    ]
  }
}
```

### 3. Value Proposition Webhook API

**Purpose**: Generate customized value propositions based on company and business data.

**Endpoint**: Configured via `VALUE_PROPOSITION_WEBHOOK_URL` secret

**Request Format**:
```json
{
  "companyData": {
    "name": "Target Company",
    "industry": "Technology"
  },
  "businessData": {
    "name": "Our Business",
    "services": ["Consulting", "Development"]
  },
  "additionalData": {
    "context": "Additional context information"
  },
  "userInfo": {
    "userId": "uuid"
  }
}
```

**Expected Response Format**:
```json
{
  "introduction": "Customized introduction text...",
  "subject": "Email subject line...",
  "advice": "Strategic advice and recommendations..."
}
```

### 4. My Business Webhook API

**Purpose**: Generate elevator pitch and business summaries.

**Endpoint**: Configured via `MYBUSINESS_WEBHOOK_URL` secret

**Request Format**:
```json
{
  "businessData": {
    "name": "Business Name",
    "description": "Business description..."
  }
}
```

**Expected Response Format**:
```json
{
  "elevator_pitch": {
    "company_name": "Business Name",
    "tagline": "Brief tagline",
    "about": "Detailed description",
    "services": {
      "service1": "Service description",
      "service2": "Another service description"
    },
    "testimonials": [
      {
        "text": "Great service!",
        "author": "Client Name"
      }
    ]
  }
}
```

## Development vs Production

### Mock Data Mode
Set `VITE_USE_MOCK_DATA=true` in development to use mock responses instead of calling actual webhooks.

### Production Mode
All webhook calls are routed through Supabase Edge Functions for security and authentication.

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request (invalid input data)
- `401`: Unauthorized (authentication failed)
- `500`: Internal Server Error (webhook processing failed)

## Parsing Logic Implementation

The application uses multi-format parsers that attempt to extract data from various response structures:

1. **Edge Function Unwrapping**: First check for `{success: true, data: {...}}` wrapper
2. **Format Detection**: Try multiple parsing strategies based on response structure
3. **Field Mapping**: Handle different field names (`rationale` vs `explanation`)
4. **Graceful Degradation**: Return empty results if no valid format is detected

## Integration Guidelines for Webhook Providers

### Required Response Headers
```
Content-Type: application/json
```

### Response Structure Requirements
1. Use consistent field names across responses
2. Include all required fields for each webhook type
3. Ensure JSON is well-formed and valid
4. Handle errors gracefully with descriptive error messages

### Testing Your Integration
1. Test with the application's mock data first
2. Verify response format matches one of the documented formats
3. Test error scenarios and ensure proper error responses
4. Validate that all required fields are present

## Troubleshooting Common Issues

### "No questions found!" Error
- Check that response contains questions in one of the supported formats
- Verify JSON structure matches documented formats
- Ensure `question` field is present for each question object

### Parsing Errors
- Validate JSON syntax
- Check for correct nesting of objects and arrays
- Ensure field names match expected formats

### Authentication Errors
- Verify webhook URL is correctly configured in secrets
- Check that Edge Function can reach the webhook endpoint
- Ensure webhook endpoint accepts POST requests

## Examples from Real Integrations

### N8N Webhook Response Example
```json
[
  {
    "output": {
      "questions": [
        {
          "question": "What are your organization's primary objectives for digital transformation?",
          "rationale": "Understanding their digital transformation goals helps us assess alignment."
        }
      ]
    }
  }
]
```

This example shows the Format 2 structure that was successfully parsed after implementing the multi-format parsing logic.

## Maintenance Notes

- When adding new webhook types, update this documentation
- Keep parsing logic in sync with documented formats
- Test new formats with both mock and real data
- Update error handling for new response patterns