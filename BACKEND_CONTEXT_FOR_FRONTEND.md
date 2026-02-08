# Backend Context for Frontend Development

> **Purpose**: This document provides complete context for frontend agents/developers to integrate with the backend API. It covers all endpoints, authentication flows, payment integration, data models, and programmatic patterns.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication System](#authentication-system)
3. [API Endpoints Reference](#api-endpoints-reference)
4. [MercadoPago Payment Integration](#mercadopago-payment-integration)
5. [Supabase Integration](#supabase-integration)
6. [Data Models & Schemas](#data-models--schemas)
7. [User Flows & Pipelines](#user-flows--pipelines)
8. [Error Handling](#error-handling)
9. [Rate Limiting & Security](#rate-limiting--security)
10. [Environment Configuration](#environment-configuration)
11. [WebSocket & Streaming](#websocket--streaming)
12. [Frontend SDK Integration](#frontend-sdk-integration)

---

## Architecture Overview

### Tech Stack
- **Backend**: Python FastAPI
- **Database**: PostgreSQL (local, not Supabase Postgres)
- **Auth**: JWT (self-hosted) OR Supabase Auth (optional)
- **Payments**: MercadoPago (Chile - CLP currency)
- **Chat**: ChatKit SDK (OpenAI-powered)
- **Storage**: Local filesystem for uploads

### Base URLs
```
Development:  http://localhost:8000
Production:   Configure via BASE_URL env var
```

### Multi-Tenant Architecture
- Each customer is a **tenant** with their own:
  - Users (`tenant_users`)
  - Theme configuration
  - Agent configuration
  - Knowledge base
  - Branding assets
  - Subscription
  - Chat sessions

### Key Concepts
- **Tenant**: Organization/company account
- **Tenant User**: Admin dashboard user (admin, owner, super_admin)
- **End User**: Chat widget user (customer's customer)
- **Session**: Chat widget session for end users

---

## Authentication System

### Authentication Methods

#### Method 1: Legacy JWT (Default)
```
Algorithm: HS256
Secret: JWT_SECRET env var (min 32 chars)
Expiry: JWT_EXPIRY_HOURS (default: 24 hours)
Password Hashing: bcrypt with 12 rounds
```

#### Method 2: Supabase Auth (Optional)
```
Enable: USE_SUPABASE_AUTH=true
Tokens verified via Supabase API (HTTPS)
Users linked via auth_user_id in tenant_users table
```

### Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Payload Structure
```json
{
  "tenant_id": "uuid",
  "user_id": "uuid",
  "email": "user@example.com",
  "role": "admin",
  "exp": 1234567890,
  "iat": 1234567890
}
```

### User Roles & Permissions

| Role | Permissions |
|------|-------------|
| `user` | View own profile only |
| `admin` | Manage tenant settings, view all users |
| `owner` | Full tenant access, manage admins |
| `super_admin` | Full system access, invite users, delete users |

### Session-Based Auth (Chat Widget)
For end users (chat widget), use session-based auth:
```
Header: X-Session-ID: sess_abc123
Header: X-Tenant-Slug: my-company
```

---

## API Endpoints Reference

### Authentication APIs

#### `POST /api/auth/signup`
Create new user in existing tenant.

```typescript
// Request
interface SignupRequest {
  email: string;           // Valid email
  password: string;        // Min 8 chars, 1 upper, 1 lower, 1 digit
  tenant_slug: string;     // Tenant to join
  full_name?: string;      // Optional
}

// Response
interface SignupResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;      // Seconds (86400 = 24h)
  refresh_token?: string;  // Only with Supabase Auth
  user_id: string;         // UUID
  email: string;
  role: string;
  tenant_id: string;       // UUID
  tenant_name: string;
}

// Example
fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123',
    tenant_slug: 'my-company',
    full_name: 'John Doe'
  })
})
```

---

#### `POST /api/auth/login`
Authenticate and get access token.

```typescript
// Request
interface LoginRequest {
  email: string;
  password: string;
}

// Response
interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  refresh_token?: string;
  user_id: string;
  email: string;
  role: "user" | "admin" | "owner" | "super_admin";
  tenant_id: string;
  tenant_name: string;
}

// Example
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123'
  })
})
```

---

#### `GET /api/auth/me`
Get current user info. **Requires Auth.**

```typescript
// Response
interface MeResponse {
  user_id: string;
  email: string;
  role: string;
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  is_supabase_auth: boolean;
}

// Example
fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

---

#### `POST /api/auth/invite`
Invite new user. **Requires Super Admin.**

```typescript
// Request
interface InviteRequest {
  email: string;
  role: "admin" | "user";
  full_name?: string;
  send_invite_email?: boolean;  // Default: true
}

// Response
interface InviteResponse {
  user_id: string;
  email: string;
  role: string;
  invite_sent: boolean;
  temporary_password?: string;  // Only if invite_sent = false
}
```

---

#### `GET /api/auth/users`
List users in tenant. **Requires Auth.**

```typescript
// Query params
interface UsersQuery {
  limit?: number;   // Default: 50
  offset?: number;  // Default: 0
}

// Response
interface UsersResponse {
  users: Array<{
    id: string;
    email: string;
    role: string;
    created_at: string;
  }>;
  total: number;
}
```

---

#### `PUT /api/auth/users/{user_id}/role`
Update user role. **Requires Super Admin.**

```typescript
// Request
interface UpdateRoleRequest {
  role: "admin" | "user";
}

// Response
{ status: "updated", user_id: string, new_role: string }
```

---

#### `DELETE /api/auth/users/{user_id}`
Delete user. **Requires Super Admin.**

```typescript
// Response
{ status: "deleted", user_id: string }
```

---

### Onboarding APIs

#### `POST /api/onboarding/register`
Self-registration (creates tenant + user).

```typescript
// Request
interface RegisterRequest {
  email: string;
  password: string;        // Same validation as signup
  account_name?: string;   // Auto-generated from email if not provided
  full_name?: string;
}

// Response
interface RegisterResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  tenant_id: string;
  user_id: string;
  email: string;
  account_name: string;
  trial_ends_at: string;   // ISO date
}
```

---

#### `GET /api/onboarding/status`
Get onboarding progress. **Requires Auth.**

```typescript
// Response
interface OnboardingStatus {
  tenant_id: string;
  account_name: string;
  plan: "trial" | "starter" | "pro" | "enterprise";
  subscription_status: "trialing" | "active" | "past_due" | "canceled" | "incomplete";
  trial_ends_at?: string;
  is_trial_expired: boolean;
  progress: {
    step_account_created: boolean;
    step_email_verified: boolean;
    step_branding_uploaded: boolean;
    step_knowledge_base_uploaded: boolean;
    step_agent_configured: boolean;
    step_widget_tested: boolean;
    step_payment_completed: boolean;
  };
  completion_percentage: number;  // 0-100
  next_step?: "verify_email" | "upload_branding" | "upload_knowledge_base" | 
              "configure_agent" | "test_widget" | "complete_payment";
}
```

---

#### `PUT /api/onboarding/complete-step`
Update onboarding progress. **Requires Auth.**

```typescript
// Request (all optional, set the ones you completed)
interface CompleteStepRequest {
  step_email_verified?: boolean;
  step_branding_uploaded?: boolean;
  step_knowledge_base_uploaded?: boolean;
  step_agent_configured?: boolean;
  step_widget_tested?: boolean;
  step_payment_completed?: boolean;
}

// Response
{
  status: "updated",
  progress: { ... },
  completion_percentage: number,
  next_step?: string
}
```

---

#### `GET /api/onboarding/trial-info`
Get trial details. **Requires Auth.**

```typescript
// Response
interface TrialInfo {
  plan: string;
  status: string;
  trial_ends_at: string;
  days_remaining: number;
  is_expired: boolean;
}
```

---

### Payment APIs

#### `GET /api/payments/config`
Get MercadoPago config for frontend SDK. **Public.**

```typescript
// Response
interface PaymentConfig {
  enabled: boolean;
  public_key?: string;    // Only if enabled
  is_sandbox?: boolean;
  locale?: string;        // "es-CL"
  message?: string;       // If not enabled
}

// Frontend usage
const config = await fetch('/api/payments/config').then(r => r.json());
if (config.enabled) {
  const mp = new MercadoPago(config.public_key);
}
```

---

#### `GET /api/payments/plans`
Get available plans. **Public.**

```typescript
// Response
interface PlansResponse {
  plans: Array<{
    id: "starter" | "pro" | "enterprise";
    title: string;
    description: string;
    price: number;              // In CLP (e.g., 19990)
    currency: string;           // "CLP"
    monthly_message_quota: number;
  }>;
}

// Current Plans:
// - starter: 19,990 CLP, 10,000 messages
// - pro: 49,990 CLP, 50,000 messages  
// - enterprise: 149,990 CLP, 1,000,000 messages
```

---

#### `POST /api/payments/create-preference`
Create Checkout Pro preference (redirect flow). **Requires Auth.**

```typescript
// Request
interface CreatePreferenceRequest {
  plan: "starter" | "pro" | "enterprise";
}

// Response
interface CreatePreferenceResponse {
  preference_id: string;
  init_point: string;           // Production URL
  sandbox_init_point: string;   // Sandbox URL
  plan: string;
  amount: number;
  currency: string;
}

// Usage: Redirect user to init_point
window.location.href = response.init_point;
```

---

#### `POST /api/payments/process-payment`
Process direct payment (Checkout Bricks). **Requires Auth.**

```typescript
// Request
interface DirectPaymentRequest {
  token: string;                      // Card token from MercadoPago.js
  payment_method_id: string;          // "visa", "master", etc.
  plan: "starter" | "pro" | "enterprise";
  installments?: number;              // Default: 1
  issuer_id?: number;                 // Bank ID
  email: string;
  first_name?: string;
  last_name?: string;
  identification_type?: string;       // "RUT", "DNI", etc.
  identification_number?: string;
}

// Response
interface DirectPaymentResponse {
  payment_id: string;
  status: "approved" | "pending" | "rejected" | "in_process";
  status_detail?: string;
  status_message: string;             // Human-readable
  three_ds_info?: {                   // For 3DS redirects
    external_resource_url: string;
    creq: string;
  };
}
```

---

#### `GET /api/payments/subscription`
Get current subscription. **Requires Auth.**

```typescript
// Response
interface SubscriptionResponse {
  plan: string;
  status: "trialing" | "active" | "past_due" | "canceled" | "incomplete";
  trial_ends_at?: string;
  current_period_start?: string;
  current_period_end?: string;
  is_trial_expired: boolean;
  days_remaining?: number;
}
```

---

#### `POST /api/payments/cancel`
Cancel subscription. **Requires Auth.**

```typescript
// Response
{
  status: "canceled",
  message: string,
  current_period_end: string
}
```

---

#### `GET /api/payments/invoices`
Get payment history. **Requires Auth.**

```typescript
// Query: ?limit=50

// Response
interface InvoicesResponse {
  invoices: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    payment_type?: string;
    paid_at?: string;
    created_at: string;
  }>;
}
```

---

#### `GET /api/payments/payment-methods`
Get available payment methods. **Public.**

```typescript
// Response
interface PaymentMethodsResponse {
  payment_methods: Array<{
    id: string;                // "visa", "master", etc.
    name: string;
    payment_type_id: string;   // "credit_card", "debit_card"
    thumbnail: string;
    secure_thumbnail: string;
    min_allowed_amount: number;
    max_allowed_amount: number;
  }>;
}
```

---

#### `GET /api/payments/card-issuers/{payment_method_id}`
Get card issuers (banks). **Public.**

```typescript
// Response
interface IssuersResponse {
  issuers: Array<{
    id: number;
    name: string;
    thumbnail: string;
    secure_thumbnail: string;
  }>;
}
```

---

#### `GET /api/payments/payment/{payment_id}`
Get payment status (for polling). **Requires Auth.**

```typescript
// Response
interface PaymentStatusResponse {
  payment_id: string;
  status: string;
  status_detail?: string;
  status_message: string;
  amount: number;
  currency: string;
  payment_method: string;
  date_created?: string;
  date_approved?: string;
}
```

---

#### `POST /api/payments/refund` (Admin)
Refund a payment.

```typescript
// Request
interface RefundRequest {
  payment_id: string;
  amount?: number;  // Optional, null = full refund
}

// Response
{
  status: "ok",
  refund_id: string,
  amount: number,
  payment_id: string
}
```

---

#### `POST /api/payments/mark-paid` (Admin)
Manually activate subscription.

```typescript
// Request
interface MarkPaidRequest {
  tenant_id: string;
  plan?: string;       // Default: "pro"
  reason?: string;
}

// Response
{
  status: "ok",
  message: string,
  reason: string
}
```

---

### Branding APIs

#### `POST /api/branding/upload`
Upload branding asset. **Requires Auth.**

```typescript
// Request: multipart/form-data
// - asset_type: "logo" | "favicon" | "hero_image" | "og_image" | "background"
// - file: File

// Response
interface BrandingAssetResponse {
  id: string;
  asset_type: string;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  url: string;
  created_at: string;
}

// Example
const formData = new FormData();
formData.append('asset_type', 'logo');
formData.append('file', fileInput.files[0]);

fetch('/api/branding/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
})
```

---

#### `GET /api/branding/assets`
List branding assets. **Requires Auth.**

```typescript
// Response
{
  assets: BrandingAssetResponse[],
  total: number
}
```

---

#### `DELETE /api/branding/assets/{asset_id}`
Delete branding asset. **Requires Auth.**

```typescript
// Response
{ status: "deleted", id: string }
```

---

#### `PUT /api/branding/apply`
Apply branding to theme. **Requires Auth.**

```typescript
// Request
interface ApplyBrandingRequest {
  apply_logo?: boolean;
  apply_favicon?: boolean;
}

// Response
{
  status: "applied",
  logo_url?: string,
  favicon_url?: string
}
```

---

### Knowledge Base APIs

#### `POST /api/knowledge-base/upload`
Upload document for RAG. **Requires Auth.**

```typescript
// Request: multipart/form-data with 'file'
// Supported: PDF, DOCX, TXT, MD, CSV (max 50MB)

// Response
interface KnowledgeBaseFileResponse {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  processing_status: "pending" | "processing" | "completed" | "failed";
  processing_error?: string;
  chunk_count: number;
  created_at: string;
}
```

---

#### `GET /api/knowledge-base/files`
List knowledge base files. **Requires Auth.**

```typescript
// Response
{
  files: KnowledgeBaseFileResponse[],
  total: number
}
```

---

#### `GET /api/knowledge-base/files/{file_id}/status`
Check processing status. **Requires Auth.**

```typescript
// Response
{
  id: string,
  status: "pending" | "processing" | "completed" | "failed",
  error?: string,
  chunk_count: number
}
```

---

#### `DELETE /api/knowledge-base/files/{file_id}`
Delete file. **Requires Auth.**

```typescript
// Response
{ status: "deleted", id: string }
```

---

#### `POST /api/knowledge-base/files/{file_id}/reprocess`
Retry failed processing. **Requires Auth.**

```typescript
// Response
{
  status: "queued",
  id: string,
  message: string
}
```

---

### Session APIs (Chat Widget)

#### `POST /api/sessions/init`
Initialize chat session. **Public (with tenant slug).**

```typescript
// Headers
// X-Tenant-Slug: my-company

// Request
interface SessionCreate {
  external_user_id?: string;    // Your user ID
  external_user_email?: string;
  external_user_name?: string;
  user_agent?: string;
}

// Response
interface SessionResponse {
  session_id: string;
  expires_at: string;
}

// Example
fetch('/api/sessions/init', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-Slug': 'my-company'
  },
  body: JSON.stringify({
    external_user_id: 'customer-123',
    external_user_email: 'customer@example.com'
  })
})
```

---

#### `POST /api/sessions/validate`
Validate session is still active. **Requires Session.**

```typescript
// Headers
// X-Session-ID: sess_abc123

// Response
{ valid: boolean }
```

---

### Tenant Theme API

#### `GET /api/tenants/{slug}/theme`
Get tenant theme for widget. **Public.**

```typescript
// Response
interface TenantTheme {
  // Colors
  color_scheme: "light" | "dark" | "auto";
  primary_color: string;       // Hex
  accent_color: string;
  background_color?: string;
  surface_background_color?: string;
  surface_foreground_color?: string;
  surface_colors_enabled: boolean;
  accent_enabled: boolean;
  tinted_grayscale: boolean;
  
  // Typography
  font_family: string;
  font_family_mono: string;
  font_size_base: number;
  
  // Layout
  border_radius: "pill" | "round" | "soft" | "sharp";
  density: "compact" | "normal" | "spacious";
  
  // Branding
  logo_url?: string;
  favicon_url?: string;
  
  // Start Screen
  welcome_message: string;
  quick_prompts: Array<{ title: string; prompt: string }>;
  
  // Composer
  placeholder_text: string;
  disclaimer_text: string;
  attachments_enabled: boolean;
  attachments_max_count: number;
  attachments_max_size: number;
  
  // Tools
  composer_tools: any[];
  
  // Message Actions
  feedback_enabled: boolean;
  retry_enabled: boolean;
  
  // Header
  header_enabled: boolean;
  
  // Advanced
  custom_css?: string;
}
```

---

### Admin APIs

#### `GET /api/admin/dashboard/stats`
Dashboard statistics. **Requires Admin.**

```typescript
// Response
interface DashboardStats {
  total_tenants: number;
  active_tenants: number;
  total_requests_today: number;
  total_cost_today: number;
}
```

---

#### `GET /api/admin/tenants`
List tenants. **Requires Admin.**

```typescript
// Query: ?limit=50&offset=0&status=active

// Response
{
  tenants: Tenant[]
}
```

---

#### `GET /api/admin/tenants/{tenant_id}`
Get tenant. **Requires Admin.**

---

#### `PUT /api/admin/tenants/{tenant_id}`
Update tenant. **Requires Admin.**

```typescript
// Request
interface TenantUpdate {
  name?: string;
  status?: "active" | "suspended" | "trial";
  allowed_origins?: string[];
  rate_limit_per_minute?: number;
  monthly_message_quota?: number;
}
```

---

#### `GET /api/admin/tenants/{tenant_id}/theme`
Get tenant theme. **Requires Admin.**

---

#### `PUT /api/admin/tenants/{tenant_id}/theme`
Update tenant theme. **Requires Admin.**

```typescript
// Request: All fields optional
interface TenantThemeUpdate {
  color_scheme?: string;
  primary_color?: string;
  accent_color?: string;
  font_family?: string;
  border_radius?: string;
  density?: string;
  welcome_message?: string;
  // ... all theme fields
}
```

---

#### `GET /api/admin/tenants/{tenant_id}/agent-config`
Get agent config. **Requires Admin.**

---

#### `PUT /api/admin/tenants/{tenant_id}/agent-config`
Update agent config. **Requires Admin.**

```typescript
// Request
interface AgentConfigUpdate {
  agent_name?: string;              // Max 100 chars
  tone?: "friendly" | "professional" | "casual" | "formal";
  greeting_message?: string;
  temperature?: number;             // 0.3 - 1.0
  store_context?: object;           // Custom context data
  model?: string;                   // Admin only
  max_tokens?: number;              // 50 - 2000
  guardrail_config?: {
    pii_redaction: boolean;
    blocked_terms: string[];
  };
}
```

---

#### `GET /api/admin/tenants/{tenant_id}/usage`
Get usage stats. **Requires Admin.**

```typescript
// Query: ?days=30
```

---

#### `GET /api/admin/tenants/{tenant_id}/traces`
Get conversation traces. **Requires Admin.**

```typescript
// Query: ?limit=50&offset=0
```

---

### Health Check

#### `GET /health`
Server health. **Public.**

```typescript
// Response
{
  status: "ok",
  service: "chatkit-phase2",
  timestamp: string
}
```

---

### Attachments API

#### `POST /attachments`
Upload attachment. **Requires Session.**

```typescript
// Headers: X-Session-ID
// Request: multipart/form-data with 'file'

// Response
interface AttachmentResponse {
  id: string;
  name: string;
  mime_type: string;
  upload_url: string;
  preview_url?: string;
}
```

---

#### `GET /attachments/{attachment_id}`
Download attachment. **Public (UUID as access token).**

---

#### `GET /attachments/{attachment_id}/preview`
Get preview/thumbnail. **Public.**

---

#### `DELETE /attachments/{attachment_id}`
Delete attachment. **Requires Session.**

---

### ChatKit Endpoint

#### `POST /chatkit`
Main chat endpoint (streaming). **Requires Session.**

```typescript
// Headers
// X-Session-ID: sess_abc123
// Content-Type: application/json

// This follows the ChatKit protocol
// Handles streaming responses, tool calls, widgets, etc.
```

---

## MercadoPago Payment Integration

### Integration Type
The backend supports **two checkout flows**:

### Flow 1: Checkout Pro (Redirect)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CHECKOUT PRO FLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. User clicks "Subscribe"                                              │
│         │                                                                │
│         ▼                                                                │
│  2. Frontend calls POST /api/payments/create-preference                  │
│         │                                                                │
│         ▼                                                                │
│  3. Backend creates MercadoPago preference                               │
│         │                                                                │
│         ▼                                                                │
│  4. Frontend receives init_point URL                                     │
│         │                                                                │
│         ▼                                                                │
│  5. Frontend redirects to init_point (MercadoPago checkout)              │
│         │                                                                │
│         ▼                                                                │
│  6. User completes payment on MercadoPago                                │
│         │                                                                │
│         ▼                                                                │
│  7. MercadoPago redirects to success/failure/pending URL                 │
│         │                                                                │
│         ▼                                                                │
│  8. MercadoPago sends webhook to POST /api/payments/webhook              │
│         │                                                                │
│         ▼                                                                │
│  9. Backend processes webhook, updates subscription                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Frontend Code:**
```typescript
async function subscribeWithCheckoutPro(plan: string, token: string) {
  // 1. Create preference
  const response = await fetch('/api/payments/create-preference', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ plan })
  });
  
  const { init_point, sandbox_init_point } = await response.json();
  
  // 2. Redirect to MercadoPago
  // Use sandbox_init_point for testing
  window.location.href = init_point;
}

// After redirect back, check subscription status
async function checkPaymentResult(token: string) {
  const params = new URLSearchParams(window.location.search);
  const paymentStatus = params.get('payment');
  
  if (paymentStatus === 'success') {
    // Verify subscription was activated
    const sub = await fetch('/api/payments/subscription', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    if (sub.status === 'active') {
      // Success!
    }
  }
}
```

---

### Flow 2: Checkout Bricks (Direct Payment)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CHECKOUT BRICKS FLOW                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. Frontend loads MercadoPago.js SDK                                    │
│         │                                                                │
│         ▼                                                                │
│  2. User enters card details in secure fields                            │
│         │                                                                │
│         ▼                                                                │
│  3. Frontend calls mp.createCardToken()                                  │
│         │                                                                │
│         ▼                                                                │
│  4. Frontend calls POST /api/payments/process-payment with token         │
│         │                                                                │
│         ▼                                                                │
│  5. Backend creates payment via MercadoPago API                          │
│         │                                                                │
│         ├─── If 3DS required ───► Return three_ds_info                   │
│         │                              │                                 │
│         │                              ▼                                 │
│         │                         Redirect for 3DS                       │
│         │                              │                                 │
│         │                              ▼                                 │
│         │                         Poll payment status                    │
│         │                                                                │
│         ▼                                                                │
│  6. Backend returns payment result                                       │
│         │                                                                │
│         ▼                                                                │
│  7. If approved, subscription activated immediately                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Frontend Code:**
```typescript
// 1. Get MercadoPago config
const config = await fetch('/api/payments/config').then(r => r.json());

// 2. Initialize MercadoPago.js
const mp = new MercadoPago(config.public_key, {
  locale: config.locale
});

// 3. Create card token (call this on form submit)
async function processPayment(cardData: CardData, plan: string, token: string) {
  // Create token from card data
  const cardToken = await mp.createCardToken({
    cardNumber: cardData.number,
    cardExpirationMonth: cardData.expMonth,
    cardExpirationYear: cardData.expYear,
    securityCode: cardData.cvv,
    cardholderName: cardData.name,
    identificationType: cardData.idType,
    identificationNumber: cardData.idNumber
  });

  // Process payment
  const response = await fetch('/api/payments/process-payment', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token: cardToken.id,
      payment_method_id: cardData.paymentMethodId,
      plan: plan,
      installments: 1,
      email: cardData.email,
      identification_type: cardData.idType,
      identification_number: cardData.idNumber
    })
  });

  const result = await response.json();

  // Handle result
  if (result.status === 'approved') {
    // Success! Subscription activated
    return { success: true };
  } else if (result.three_ds_info) {
    // 3DS required - redirect
    window.location.href = result.three_ds_info.external_resource_url;
  } else {
    // Failed
    return { success: false, message: result.status_message };
  }
}

// 4. After 3DS redirect, poll for status
async function pollPaymentStatus(paymentId: string, token: string) {
  const response = await fetch(`/api/payments/payment/${paymentId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}
```

---

### Payment Status Values

| Status | Meaning | Frontend Action |
|--------|---------|-----------------|
| `approved` | Payment successful | Show success, subscription active |
| `pending` | Awaiting confirmation | Show pending message |
| `in_process` | Processing | Show processing message |
| `rejected` | Payment failed | Show error, allow retry |
| `cancelled` | User cancelled | Allow retry |
| `refunded` | Payment refunded | Show refund info |

---

### Webhook Flow (Backend)
```
POST /api/payments/webhook
  │
  ├── Verify signature (X-Signature header)
  │
  ├── Parse webhook type
  │     └── "payment" or "subscription_authorized_payment"
  │
  ├── Fetch payment details from MercadoPago
  │
  ├── Parse external_reference → tenant_id, plan
  │
  ├── Record payment in payment_history
  │
  └── Update subscription status
        ├── approved → status="active", set period dates
        ├── rejected → status="incomplete"
        └── pending → status="incomplete"
```

---

## Supabase Integration

### Architecture
```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE INTEGRATION                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Supabase Cloud                          Local PostgreSQL                │
│  ┌─────────────────┐                    ┌─────────────────┐             │
│  │                 │                    │                 │             │
│  │  auth.users     │◄────────────────►  │  tenant_users   │             │
│  │  (auth only)    │   auth_user_id     │  (user data)    │             │
│  │                 │                    │                 │             │
│  └─────────────────┘                    └─────────────────┘             │
│                                                │                         │
│                                                │ tenant_id               │
│                                                ▼                         │
│                                         ┌─────────────────┐             │
│                                         │    tenants      │             │
│                                         └─────────────────┘             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### What Supabase Handles
- User authentication (login/signup)
- Token generation and verification
- Password management

### What Local PostgreSQL Handles
- User profiles and roles
- Tenant data
- All business data

### Enabling Supabase Auth
```bash
# Environment variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
USE_SUPABASE_AUTH=true
```

### Token Verification Flow
```
1. Frontend sends: Authorization: Bearer <supabase_token>
2. Backend detects Supabase token (has 'sub' claim, 'aud' = 'authenticated')
3. Backend calls Supabase API to verify token
4. Backend looks up tenant_users by auth_user_id
5. Backend creates UserContext with tenant/user info
```

---

## Data Models & Schemas

### Tenant
```typescript
interface Tenant {
  id: string;                    // UUID
  name: string;
  slug: string;                  // URL-friendly identifier
  status: "active" | "suspended" | "trial";
  allowed_origins: string[];     // CORS origins
  rate_limit_per_minute: number;
  monthly_message_quota: number;
  created_at: string;
  updated_at: string;
}
```

### Subscription
```typescript
interface Subscription {
  id: string;
  tenant_id: string;
  plan: "trial" | "starter" | "pro" | "enterprise";
  status: "trialing" | "active" | "past_due" | "canceled" | "incomplete";
  trial_ends_at?: string;
  current_period_start?: string;
  current_period_end?: string;
  mercadopago_subscription_id?: string;
  mercadopago_customer_id?: string;
  mercadopago_payer_email?: string;
  created_at: string;
  updated_at: string;
}
```

### OnboardingProgress
```typescript
interface OnboardingProgress {
  id: string;
  tenant_id: string;
  step_account_created: boolean;
  step_email_verified: boolean;
  step_branding_uploaded: boolean;
  step_knowledge_base_uploaded: boolean;
  step_agent_configured: boolean;
  step_widget_tested: boolean;
  step_payment_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}
```

### EndUserSession
```typescript
interface EndUserSession {
  id: string;
  tenant_id: string;
  external_user_id?: string;
  external_user_email?: string;
  external_user_name?: string;
  first_seen_at: string;
  last_seen_at: string;
  expires_at: string;
  user_agent?: string;
  metadata: Record<string, any>;
}
```

---

## User Flows & Pipelines

### New Customer Registration Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    NEW CUSTOMER REGISTRATION                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. User visits landing page                                             │
│         │                                                                │
│         ▼                                                                │
│  2. Clicks "Start Free Trial"                                            │
│         │                                                                │
│         ▼                                                                │
│  3. POST /api/onboarding/register                                        │
│         │                                                                │
│         ├── Creates tenant                                               │
│         ├── Creates tenant_user with role="owner"                        │
│         ├── Creates subscription with plan="trial"                       │
│         ├── Creates onboarding_progress                                  │
│         └── Returns access_token                                         │
│         │                                                                │
│         ▼                                                                │
│  4. Frontend stores token, redirects to dashboard                        │
│         │                                                                │
│         ▼                                                                │
│  5. Dashboard shows onboarding checklist                                 │
│         │                                                                │
│         ▼                                                                │
│  6. User completes onboarding steps:                                     │
│         ├── Upload branding (logo, favicon)                              │
│         ├── Upload knowledge base documents                              │
│         ├── Configure agent (name, tone, greeting)                       │
│         ├── Test widget                                                  │
│         └── Complete payment                                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Registration Flow (New User from Landing Page)
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW (NEW USER)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Landing Page                                                            │
│       │                                                                  │
│       │  POST /api/onboarding/register                                   │
│       │  { email, password, account_name? }                              │
│       ▼                                                                  │
│  FastAPI Backend                                                         │
│       │                                                                  │
│       ├──► Supabase Auth: Create user (if enabled)                       │
│       │         └── Returns auth_user_id                                 │
│       │                                                                  │
│       ├──► Local PostgreSQL: Create tenant                               │
│       │         └── With default theme & agent config                    │
│       │                                                                  │
│       ├──► Local PostgreSQL: Create tenant_user                          │
│       │         └── Links to auth_user_id                                │
│       │                                                                  │
│       ├──► Local PostgreSQL: Create subscription (trial)                 │
│       │                                                                  │
│       └──► Local PostgreSQL: Create onboarding_progress                  │
│       │                                                                  │
│       ▼                                                                  │
│  Returns: { access_token, tenant_id, user_id, trial_ends_at }            │
│       │                                                                  │
│       ▼                                                                  │
│  Frontend stores token → Redirects to Dashboard                          │
│                                                                          │
│  NOTE: Frontend NEVER talks to Supabase directly!                        │
│        All auth goes through FastAPI.                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Login Flow (Existing User)
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LOGIN FLOW (EXISTING USER)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Login Page                                                              │
│       │                                                                  │
│       │  POST /api/auth/login                                            │
│       │  { email, password }                                             │
│       ▼                                                                  │
│  FastAPI Backend                                                         │
│       │                                                                  │
│       ├──► Look up user in tenant_users table                            │
│       │                                                                  │
│       ├──► If Supabase Auth enabled + user has auth_user_id:             │
│       │         └── Verify password via Supabase API                     │
│       │         └── Get refresh_token from Supabase                      │
│       │                                                                  │
│       ├──► Else (legacy auth):                                           │
│       │         └── Verify password hash locally (bcrypt)                │
│       │                                                                  │
│       └──► Create JWT token with: tenant_id, user_id, email, role        │
│       │                                                                  │
│       ▼                                                                  │
│  Returns: { access_token, user_id, role, tenant_id, tenant_name }        │
│       │                                                                  │
│       ▼                                                                  │
│  Frontend stores token → Redirects to Dashboard                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Dashboard User Authentication Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DASHBOARD AUTHENTICATION                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  On App Load:                                                            │
│  1. Check if access_token exists in localStorage                         │
│  2. If yes: GET /api/auth/me to verify token is still valid              │
│  3. If valid: Store user context in state, proceed                       │
│  4. If 401: Clear token, redirect to /login                              │
│  5. If no token: Redirect to /login                                      │
│                                                                          │
│  On Every API Request:                                                   │
│  1. Include header: Authorization: Bearer <token>                        │
│  2. If response is 401: Clear token, redirect to /login                  │
│                                                                          │
│  Token Expiration:                                                       │
│  - JWT expires in 24 hours (configurable via JWT_EXPIRY_HOURS)           │
│  - When expired, user must re-login                                      │
│  - With Supabase Auth: Can use refresh_token to get new access_token     │
│                                                                          │
│  Logout:                                                                 │
│  1. Clear token from localStorage                                        │
│  2. Clear user state                                                     │
│  3. Redirect to /login                                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Frontend Implementation Example
```typescript
// On app initialization (e.g., in _app.tsx or layout.tsx)
useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    try {
      const user = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => {
        if (!r.ok) throw new Error('Unauthorized');
        return r.json();
      });
      
      setUser(user);  // Store in context/state
    } catch {
      localStorage.removeItem('access_token');
      router.push('/login');
    }
  };
  
  checkAuth();
}, []);

// Login function
async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }
  
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  setUser({
    id: data.user_id,
    email: data.email,
    role: data.role,
    tenantId: data.tenant_id,
    tenantName: data.tenant_name
  });
  
  router.push('/dashboard');
}

// Register function (from landing page)
async function register(email: string, password: string, accountName?: string) {
  const response = await fetch('/api/onboarding/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, account_name: accountName })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Registration failed');
  }
  
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  
  // New user - redirect to onboarding/dashboard
  router.push('/dashboard');
}

// Logout function
function logout() {
  localStorage.removeItem('access_token');
  setUser(null);
  router.push('/login');
}
```

### Chat Widget Session Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CHAT WIDGET SESSION                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. Widget loads on customer's website                                   │
│         │                                                                │
│         ▼                                                                │
│  2. Check for existing session_id in localStorage                        │
│         │                                                                │
│         ├── If exists: POST /api/sessions/validate                       │
│         │                    │                                           │
│         │                    ├── valid=true: Use existing session        │
│         │                    └── valid=false: Create new session         │
│         │                                                                │
│         └── If not exists: Create new session                            │
│                                                                          │
│  3. POST /api/sessions/init with X-Tenant-Slug header                    │
│         │                                                                │
│         ▼                                                                │
│  4. Store session_id in localStorage                                     │
│         │                                                                │
│         ▼                                                                │
│  5. GET /api/tenants/{slug}/theme for UI customization                   │
│         │                                                                │
│         ▼                                                                │
│  6. Chat messages via POST /chatkit with X-Session-ID header             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Subscription Management Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SUBSCRIPTION MANAGEMENT                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Check Status:                                                           │
│  GET /api/payments/subscription                                          │
│      │                                                                   │
│      ├── status="trialing" + is_trial_expired=false → Show trial banner │
│      ├── status="trialing" + is_trial_expired=true  → Force upgrade     │
│      ├── status="active"                            → Full access       │
│      ├── status="past_due"                          → Show warning      │
│      ├── status="canceled"                          → Limited access    │
│      └── status="incomplete"                        → Retry payment     │
│                                                                          │
│  Upgrade:                                                                │
│  1. GET /api/payments/plans → Show plan options                          │
│  2. User selects plan                                                    │
│  3. Use Checkout Pro or Checkout Bricks flow                             │
│  4. On success, subscription status → "active"                           │
│                                                                          │
│  Cancel:                                                                 │
│  1. POST /api/payments/cancel                                            │
│  2. Status → "canceled"                                                  │
│  3. Access continues until current_period_end                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### File Processing Pipeline
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE BASE PROCESSING                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. POST /api/knowledge-base/upload                                      │
│         │                                                                │
│         ▼                                                                │
│  2. File saved to storage                                                │
│         │                                                                │
│         ▼                                                                │
│  3. Record created with status="pending"                                 │
│         │                                                                │
│         ▼                                                                │
│  4. Background job picks up file                                         │
│         │                                                                │
│         ▼                                                                │
│  5. Status → "processing"                                                │
│         │                                                                │
│         ▼                                                                │
│  6. File parsed and chunked                                              │
│         │                                                                │
│         ├── Success: status="completed", chunk_count updated             │
│         │                                                                │
│         └── Failure: status="failed", error message stored               │
│                                                                          │
│  Frontend Polling:                                                       │
│  - Poll GET /api/knowledge-base/files/{id}/status every 2-5 seconds      │
│  - Stop when status is "completed" or "failed"                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Error Handling

### Error Response Format
```typescript
interface ErrorResponse {
  detail: string;
}

// Example
{
  "detail": "Invalid email or password"
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Validation error, invalid input |
| 401 | Unauthorized | Missing/invalid/expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry (e.g., email exists) |
| 422 | Unprocessable Entity | Invalid data format |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server bug |
| 503 | Service Unavailable | Feature not configured |

### Frontend Error Handling Pattern
```typescript
async function apiCall(url: string, options: RequestInit) {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    
    switch (response.status) {
      case 401:
        // Token expired, redirect to login
        logout();
        throw new Error('Session expired. Please login again.');
      
      case 403:
        throw new Error('You do not have permission to perform this action.');
      
      case 404:
        throw new Error('Resource not found.');
      
      case 409:
        throw new Error(error.detail || 'Conflict error.');
      
      case 429:
        throw new Error('Too many requests. Please wait and try again.');
      
      case 503:
        throw new Error('Service unavailable. Feature may not be configured.');
      
      default:
        throw new Error(error.detail || 'An error occurred.');
    }
  }
  
  return response.json();
}
```

---

## Rate Limiting & Security

### Rate Limits

| Endpoint Type | Limit | Scope |
|---------------|-------|-------|
| Public endpoints | 100/min | Per IP |
| Auth endpoints | 10/min | Per IP (brute force protection) |
| Authenticated endpoints | 60/min | Per tenant |
| Session endpoints | 10/min | Per session |
| Attachments upload | 10/min | Per session |
| ChatKit | Per plan | Per tenant + quota |

### Rate Limit Response
```typescript
// 429 Too Many Requests
{
  "detail": "Rate limit exceeded. Try again in X seconds."
}

// Headers
Retry-After: 60
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1234567890
```

### Security Headers
The backend sets these headers on all responses:
- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### CORS Configuration
- Allowed origins configured via `CORS_ORIGINS` env var
- Validated on every request
- Credentials (cookies) supported

---

## Environment Configuration

### Required Variables
```bash
# Core
OPENAI_API_KEY=sk-...                    # OpenAI API key
DATABASE_URL=postgresql://...            # PostgreSQL connection
JWT_SECRET=your-secret-min-32-chars      # JWT signing secret

# Server
PORT=8000
BASE_URL=http://localhost:8000
ENV=development                          # development|staging|production
```

### Optional Variables
```bash
# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# JWT
JWT_EXPIRY_HOURS=24

# Supabase (enable with USE_SUPABASE_AUTH=true)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
USE_SUPABASE_AUTH=false

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_PUBLIC_KEY=APP_USR-...
MERCADOPAGO_WEBHOOK_SECRET=...

# Frontend URLs (for payment redirects)
FRONTEND_URL=http://localhost:3000
PAYMENT_SUCCESS_URL=http://localhost:3000/dashboard?payment=success
PAYMENT_FAILURE_URL=http://localhost:3000/dashboard?payment=failed
PAYMENT_PENDING_URL=http://localhost:3000/dashboard?payment=pending

# Trial
TRIAL_DAYS=14

# Security
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
SESSION_MAX_AGE_DAYS=30
```

---

## WebSocket & Streaming

### ChatKit Streaming
The `/chatkit` endpoint supports streaming responses using Server-Sent Events (SSE).

```typescript
// Frontend streaming example
async function sendMessage(message: string, sessionId: string) {
  const response = await fetch('/chatkit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-ID': sessionId
    },
    body: JSON.stringify({
      // ChatKit protocol payload
      messages: [{ role: 'user', content: message }]
    })
  });

  // Handle streaming response
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    // Process SSE events
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        // Handle event (message chunk, tool call, widget, etc.)
      }
    }
  }
}
```

---

## Frontend SDK Integration

### API Client Setup
```typescript
// api/client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiOptions extends RequestInit {
  token?: string;
  sessionId?: string;
}

export async function apiClient<T>(
  endpoint: string, 
  options: ApiOptions = {}
): Promise<T> {
  const { token, sessionId, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (sessionId) {
    headers['X-Session-ID'] = sessionId;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, error.detail);
  }
  
  return response.json();
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### Auth Hooks
```typescript
// hooks/useAuth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      
      login: async (email, password) => {
        const response = await apiClient<LoginResponse>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        
        set({ 
          token: response.access_token,
          user: {
            id: response.user_id,
            email: response.email,
            role: response.role,
            tenantId: response.tenant_id,
            tenantName: response.tenant_name,
          }
        });
      },
      
      logout: () => {
        set({ token: null, user: null });
      },
      
      checkAuth: async () => {
        const token = get().token;
        if (!token) return false;
        
        try {
          const me = await apiClient<MeResponse>('/api/auth/me', { token });
          set({ 
            user: {
              id: me.user_id,
              email: me.email,
              role: me.role,
              tenantId: me.tenant_id,
              tenantName: me.tenant_name,
            }
          });
          return true;
        } catch {
          set({ token: null, user: null });
          return false;
        }
      },
    }),
    { name: 'auth-storage' }
  )
);
```

### Payment Hook
```typescript
// hooks/usePayment.ts
export function usePayment() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const getConfig = async () => {
    return apiClient<PaymentConfig>('/api/payments/config');
  };
  
  const getPlans = async () => {
    return apiClient<PlansResponse>('/api/payments/plans');
  };
  
  const getSubscription = async () => {
    return apiClient<SubscriptionResponse>('/api/payments/subscription', { token });
  };
  
  const createPreference = async (plan: string) => {
    return apiClient<CreatePreferenceResponse>('/api/payments/create-preference', {
      method: 'POST',
      token,
      body: JSON.stringify({ plan }),
    });
  };
  
  const processPayment = async (data: DirectPaymentRequest) => {
    return apiClient<DirectPaymentResponse>('/api/payments/process-payment', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  };
  
  return {
    loading,
    getConfig,
    getPlans,
    getSubscription,
    createPreference,
    processPayment,
  };
}
```

### Onboarding Hook
```typescript
// hooks/useOnboarding.ts
export function useOnboarding() {
  const { token } = useAuth();
  
  const getStatus = async () => {
    return apiClient<OnboardingStatus>('/api/onboarding/status', { token });
  };
  
  const completeStep = async (step: Partial<OnboardingProgressUpdate>) => {
    return apiClient('/api/onboarding/complete-step', {
      method: 'PUT',
      token,
      body: JSON.stringify(step),
    });
  };
  
  const getTrialInfo = async () => {
    return apiClient<TrialInfo>('/api/onboarding/trial-info', { token });
  };
  
  return { getStatus, completeStep, getTrialInfo };
}
```

---

## Quick Reference

### Headers Summary

| Header | Purpose | When to Use |
|--------|---------|-------------|
| `Authorization: Bearer <token>` | Admin auth | All authenticated endpoints |
| `X-Session-ID: <session_id>` | Chat widget auth | Chat/attachment endpoints |
| `X-Tenant-Slug: <slug>` | Identify tenant | Session init |
| `Content-Type: application/json` | JSON body | POST/PUT requests |

### Common API Patterns

```typescript
// Authenticated request
fetch('/api/endpoint', {
  headers: { 'Authorization': `Bearer ${token}` }
})

// Session-based request
fetch('/chatkit', {
  headers: { 'X-Session-ID': sessionId }
})

// File upload
const formData = new FormData();
formData.append('file', file);
fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData  // No Content-Type header for FormData!
})
```

### Status Code Quick Reference

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 201 | Created | Resource created |
| 400 | Bad Request | Fix input |
| 401 | Unauthorized | Re-login |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Resource missing |
| 409 | Conflict | Duplicate exists |
| 429 | Rate Limited | Wait and retry |
| 500 | Server Error | Report bug |
| 503 | Unavailable | Feature not configured |

---

## Endpoint Count Summary

| Category | Count |
|----------|-------|
| Auth | 6 |
| Onboarding | 4 |
| Payments | 12 |
| Branding | 4 |
| Knowledge Base | 5 |
| Sessions | 2 |
| Tenant Theme | 1 |
| Admin | 12 |
| Platform Config | 4 |
| Attachments | 4 |
| ChatKit | 1 |
| Health | 1 |
| **Total** | **68** |

---

*Last updated: 2026-02-08*
*Backend version: Phase 2 (ChatKit Multi-tenant)*
