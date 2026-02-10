# Theme Playground Implementation Guide

> **Last Updated:** February 2026  
> **Verified Against:** Actual codebase implementation

This guide explains how to build a Theme Studio/Playground in your Next.js dashboard that lets users customize the chat widget appearance with live preview.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [What Actually Works](#what-actually-works)
3. [Backend API Reference](#backend-api-reference)
4. [Frontend Implementation](#frontend-implementation)
5. [Building the Theme Studio](#building-the-theme-studio)
6. [Theme Properties Reference](#theme-properties-reference)
7. [Environment Setup](#environment-setup)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR NEXT.JS DASHBOARD                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Theme Studio Page                      │    │
│  │  ┌──────────────┐          ┌────────────────────────┐   │    │
│  │  │ Theme Editor │          │   Widget Preview       │   │    │
│  │  │              │  ──────► │   (iframe)             │   │    │
│  │  │ - Colors     │ postMsg  │                        │   │    │
│  │  │ - Fonts      │          │  ?tenant=slug          │   │    │
│  │  │ - Layout     │          │  &preview=true         │   │    │
│  │  └──────────────┘          └────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ JWT Auth                          │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Backend API                            │    │
│  │  GET  /api/user/theme        - Load current theme        │    │
│  │  PUT  /api/user/theme        - Save theme changes        │    │
│  │  GET  /api/user/theme-presets - Get preset themes        │    │
│  │  POST /api/user/theme/apply-preset/{id}                  │    │
│  │  GET  /api/user/widget-url   - Get preview iframe URL    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              PostgreSQL (tenant_themes table)            │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**Key Components:**
- **Theme Editor** - UI controls for editing theme properties
- **Widget Preview** - iframe showing the actual widget with `?preview=true`
- **postMessage API** - Real-time theme updates without page reload
- **Backend API** - JWT-authenticated endpoints for theme CRUD
- **PostgreSQL** - Theme storage in `tenant_themes` table

---

## What Actually Works

**Important:** There are TWO frontend entry points with different feature support:
- **App.tsx** (`/` route) - Full-featured main application
- **Widget.tsx** (`/widget` route) - Simplified embeddable widget used in preview mode

### Properties That Work in BOTH App.tsx and Widget.tsx

| Property | What It Does |
|----------|--------------|
| `color_scheme` | `'light'` or `'dark'` mode (note: `'auto'` is accepted but treated as `'light'`) |
| `accent_color` + `accent_enabled` | Custom accent color (only when `accent_enabled: true`) |
| `surface_background_color` + `surface_foreground_color` + `surface_colors_enabled` | Custom surface colors (only when all three are set) |
| `font_family` | Main font name (see font loading note below) |
| `font_size_base` | Base font size (maps to 14-18px) |
| `border_radius` | Corner style: `'sharp'`, `'soft'`, `'round'`, `'pill'` |
| `density` | Spacing: `'compact'`, `'normal'`, `'spacious'` |
| `welcome_message` | Greeting text on start screen |
| `quick_prompts` | Starter prompt buttons (array of `{label, prompt}`) |
| `placeholder_text` | Input field placeholder |

### Properties That Work ONLY in App.tsx (NOT in Widget Preview)

These work in the main app but are **HARDCODED** in Widget.tsx:

| Property | App.tsx | Widget.tsx (Preview) |
|----------|---------|---------------------|
| `attachments_enabled` | Reads from theme | **Hardcoded: `true`** |
| `attachments_max_count` | Reads from theme | **Hardcoded: `5`** |
| `attachments_max_size` | Reads from theme | **Hardcoded: `10485760`** |
| `header_enabled` | Reads from theme | **Hardcoded: `true`** |
| `feedback_enabled` | Reads from theme | **Hardcoded: `true`** |
| `retry_enabled` | Reads from theme | **Hardcoded: `true`** |
| `disclaimer_text` | Reads from theme | **Not implemented** |
| `composer_tools` | Reads from theme | **Not implemented** |
| `font_family_mono` | Reads from theme | **Not implemented** |

### Font Loading Differences

| Entry Point | Font Loading |
|-------------|--------------|
| **App.tsx** | Has `getFontSources()` - loads Inter, JetBrains Mono, Lora, OpenAI Sans from CDN |
| **Widget.tsx** | **NO font loading** - only sets `fontFamily` name, fonts must be pre-loaded |

This means in the **widget preview**, custom fonts won't display unless they're system fonts or already loaded by the page.

### Not Applied (Stored but Ignored in Both)

| Property | Why |
|----------|-----|
| `primary_color` | Not mapped to ChatKit SDK |
| `background_color` | Not mapped to ChatKit SDK |
| `tinted_grayscale` | Not mapped to ChatKit SDK |
| `logo_url` | Not used by either entry point |
| `favicon_url` | Not used by either entry point |
| `custom_css` | Not injected anywhere |

---

## Backend API Reference

### Authentication

All `/api/user/*` endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

The JWT must contain a `tenant_id` claim that identifies the user's tenant.

### Endpoints

#### GET `/api/user/theme`

Returns the current theme for the authenticated user's tenant.

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "color_scheme": "light",
  "primary_color": "#000000",
  "accent_color": "#0066cc",
  "background_color": null,
  "surface_background_color": null,
  "surface_foreground_color": null,
  "surface_colors_enabled": false,
  "accent_enabled": false,
  "tinted_grayscale": false,
  "font_family": "Inter",
  "font_family_mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  "font_size_base": 16,
  "border_radius": "soft",
  "density": "normal",
  "logo_url": null,
  "favicon_url": null,
  "welcome_message": "How can I help you today?",
  "quick_prompts": [],
  "placeholder_text": "Type a message...",
  "disclaimer_text": "",
  "attachments_enabled": true,
  "attachments_max_count": 5,
  "attachments_max_size": 10485760,
  "composer_tools": [],
  "feedback_enabled": true,
  "retry_enabled": true,
  "header_enabled": true,
  "custom_css": null,
  "updated_at": "2026-02-10T12:00:00.000Z"
}
```

#### PUT `/api/user/theme`

Updates the theme. Supports partial updates - only send fields you want to change.

**Request:**
```json
{
  "color_scheme": "dark",
  "accent_color": "#ff6600",
  "accent_enabled": true
}
```

**Response:** Updated theme object (same format as GET)

#### GET `/api/user/theme-presets`

Returns available preset themes.

**Response:**
```json
{
  "presets": [
    {
      "id": "default-light",
      "name": "Default Light",
      "description": "Clean and professional light theme",
      "theme": {
        "color_scheme": "light",
        "accent_color": "#0066cc",
        "accent_enabled": false,
        "border_radius": "soft",
        "density": "normal",
        "font_family": "Inter",
        "font_size_base": 14
      }
    }
  ],
  "total": 8
}
```

**Available Presets:**
- `default-light` - Clean professional light
- `default-dark` - Modern dark theme
- `modern-blue` - Vibrant blue accent
- `elegant-purple` - Sophisticated purple
- `warm-orange` - Friendly orange
- `compact-professional` - Space-efficient
- `dark-elegant` - Premium dark with custom surfaces
- `minimalist` - Clean minimal design

#### POST `/api/user/theme/apply-preset/{preset_id}`

Applies a preset theme to the user's tenant.

**Response:** Updated theme object

#### GET `/api/user/widget-url`

Returns the widget preview URL for the iframe.

**Response:**
```json
{
  "preview_url": "http://localhost:5173/widget?tenant=my-company&preview=true",
  "tenant_slug": "my-company",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Frontend Implementation

### How Themes Are Fetched

**File:** `frontend/src/lib/tenant.ts`

```typescript
// Get tenant slug (from URL param, data attribute, subdomain, or 'default')
export function getTenantSlug(): string { ... }

// Fetch theme from backend
export async function fetchTenantTheme(tenantSlug: string): Promise<any | null> {
  const response = await fetch(`${API_URL}/api/tenants/${tenantSlug}/theme`);
  return response.ok ? response.json() : null;
}
```

### How Themes Are Applied

**File:** `frontend/src/App.tsx`

The theme is converted from database format to ChatKit SDK format:

```typescript
// Database → ChatKit SDK mapping
const chatkitTheme = {
  colorScheme: theme?.color_scheme === 'dark' ? 'dark' : 'light',
  radius: mapRadius(theme?.border_radius),      // 'sharp'|'soft'|'round'|'pill'
  density: mapDensity(theme?.density),          // 'compact'|'normal'|'spacious'
  color: {
    accent: { primary: theme?.accent_color, level: 1 },      // if accent_enabled
    surface: { background: '...', foreground: '...' },       // if surface_colors_enabled
  },
  typography: {
    baseSize: mapFontSize(theme?.font_size_base),  // 14|15|16|17|18
    fontFamily: theme?.font_family,
    fontFamilyMono: theme?.font_family_mono,
    fontSources: getFontSources(theme?.font_family),
  }
};

// Then passed to useChatKit:
const { control } = useChatKit({
  theme: chatkitTheme,
  composer: {
    placeholder: theme?.placeholder_text,
    attachments: { enabled: theme?.attachments_enabled, ... },
    tools: theme?.composer_tools,
  },
  startScreen: {
    greeting: theme?.welcome_message,
    prompts: theme?.quick_prompts,
  },
  header: { enabled: theme?.header_enabled },
  threadItemActions: {
    feedback: theme?.feedback_enabled,
    retry: theme?.retry_enabled,
  },
  disclaimer: theme?.disclaimer_text ? { text: theme.disclaimer_text } : undefined,
});
```

### Preview Mode (Widget.tsx)

When the widget loads with `?preview=true`, it:
1. Listens for `postMessage` events from allowed origins
2. Sends `CHATKIT_PREVIEW_READY` when loaded
3. Updates theme in real-time via `CHATKIT_THEME_UPDATE` messages

**PostMessage Protocol:**

```typescript
// Parent → Widget: Update theme
iframe.contentWindow.postMessage({
  type: 'CHATKIT_THEME_UPDATE',
  theme: { /* full theme object */ }
}, WIDGET_ORIGIN);

// Parent → Widget: Reset to original
iframe.contentWindow.postMessage({
  type: 'CHATKIT_THEME_RESET'
}, WIDGET_ORIGIN);

// Parent → Widget: New conversation
iframe.contentWindow.postMessage({
  type: 'CHATKIT_NEW_CONVERSATION'
}, WIDGET_ORIGIN);

// Widget → Parent: Ready signal
{ type: 'CHATKIT_PREVIEW_READY', theme: {...}, tenantSlug: '...' }

// Widget → Parent: Theme applied
{ type: 'CHATKIT_THEME_APPLIED', theme: {...} }
```

---

## Building the Theme Studio

### Complete Next.js Example

```tsx
// app/theme-studio/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const WIDGET_URL = process.env.NEXT_PUBLIC_WIDGET_URL!;

interface Theme {
  color_scheme: string;
  accent_color: string;
  accent_enabled: boolean;
  surface_colors_enabled: boolean;
  surface_background_color: string | null;
  surface_foreground_color: string | null;
  font_family: string;
  font_size_base: number;
  border_radius: string;
  density: string;
  welcome_message: string;
  placeholder_text: string;
  quick_prompts: Array<{ label: string; prompt: string }>;
  attachments_enabled: boolean;
  header_enabled: boolean;
  feedback_enabled: boolean;
  retry_enabled: boolean;
  disclaimer_text: string;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  theme: Partial<Theme>;
}

export default function ThemeStudio() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [widgetReady, setWidgetReady] = useState(false);
  const [tenantSlug, setTenantSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get your JWT token from your auth system
  const getAuthToken = () => {
    // Replace with your actual auth logic
    return localStorage.getItem('jwt_token') || '';
  };

  const authHeaders = {
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  };

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [themeRes, presetsRes, urlRes] = await Promise.all([
          fetch(`${API_URL}/api/user/theme`, { headers: authHeaders }),
          fetch(`${API_URL}/api/user/theme-presets`, { headers: authHeaders }),
          fetch(`${API_URL}/api/user/widget-url`, { headers: authHeaders }),
        ]);

        if (!themeRes.ok) throw new Error('Failed to load theme');
        
        setTheme(await themeRes.json());
        setPresets((await presetsRes.json()).presets);
        setTenantSlug((await urlRes.json()).tenant_slug);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      }
    }
    loadData();
  }, []);

  // Listen for widget messages
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Validate origin
      if (!event.origin.startsWith(WIDGET_URL.replace(/\/$/, ''))) return;

      switch (event.data.type) {
        case 'CHATKIT_PREVIEW_READY':
          setWidgetReady(true);
          break;
        case 'CHATKIT_THEME_APPLIED':
          console.log('Theme applied in preview');
          break;
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Send theme update to widget preview
  const updatePreview = useCallback((newTheme: Theme) => {
    if (iframeRef.current?.contentWindow && widgetReady) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'CHATKIT_THEME_UPDATE', theme: newTheme },
        WIDGET_URL
      );
    }
  }, [widgetReady]);

  // Handle field change
  const handleChange = <K extends keyof Theme>(key: K, value: Theme[K]) => {
    if (!theme) return;
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);
    updatePreview(newTheme);
  };

  // Save theme to server
  const saveTheme = async () => {
    if (!theme) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/user/theme`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(theme),
      });
      if (!res.ok) throw new Error('Failed to save');
      setTheme(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Apply preset
  const applyPreset = async (presetId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/api/user/theme/apply-preset/${presetId}`,
        { method: 'POST', headers: authHeaders }
      );
      if (!res.ok) throw new Error('Failed to apply preset');
      const newTheme = await res.json();
      setTheme(newTheme);
      updatePreview(newTheme);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply preset');
    }
  };

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!theme) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex h-screen">
      {/* Editor Panel */}
      <div className="w-96 p-6 border-r overflow-y-auto bg-white">
        <h1 className="text-2xl font-bold mb-6">Theme Studio</h1>

        {/* Presets */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Quick Start</h2>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className="p-3 text-sm border rounded-lg hover:bg-gray-50 text-left"
              >
                <div className="font-medium">{preset.name}</div>
                <div className="text-xs text-gray-500">{preset.description}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Color Scheme */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Appearance</h2>
          
          <label className="block mb-4">
            <span className="text-sm font-medium">Color Scheme</span>
            <select
              value={theme.color_scheme}
              onChange={(e) => handleChange('color_scheme', e.target.value)}
              className="mt-1 block w-full p-2 border rounded-lg"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>

          {/* Accent Color */}
          <label className="flex items-center gap-3 mb-2">
            <input
              type="checkbox"
              checked={theme.accent_enabled}
              onChange={(e) => handleChange('accent_enabled', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Custom Accent Color</span>
          </label>
          {theme.accent_enabled && (
            <input
              type="color"
              value={theme.accent_color}
              onChange={(e) => handleChange('accent_color', e.target.value)}
              className="w-full h-10 rounded border cursor-pointer"
            />
          )}
        </section>

        {/* Typography */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Typography</h2>
          
          <label className="block mb-4">
            <span className="text-sm font-medium">Font Family</span>
            <select
              value={theme.font_family}
              onChange={(e) => handleChange('font_family', e.target.value)}
              className="mt-1 block w-full p-2 border rounded-lg"
            >
              <option value="Inter">Inter (Default)</option>
              <option value="OpenAI Sans">OpenAI Sans</option>
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="Lora">Lora (Serif)</option>
              <option value="system-ui">System Default</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Font Size</span>
            <select
              value={theme.font_size_base}
              onChange={(e) => handleChange('font_size_base', parseInt(e.target.value))}
              className="mt-1 block w-full p-2 border rounded-lg"
            >
              <option value={14}>Small (14px)</option>
              <option value={15}>Medium Small (15px)</option>
              <option value={16}>Medium (16px)</option>
              <option value={17}>Medium Large (17px)</option>
              <option value={18}>Large (18px)</option>
            </select>
          </label>
        </section>

        {/* Layout */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Layout</h2>
          
          <label className="block mb-4">
            <span className="text-sm font-medium">Border Radius</span>
            <select
              value={theme.border_radius}
              onChange={(e) => handleChange('border_radius', e.target.value)}
              className="mt-1 block w-full p-2 border rounded-lg"
            >
              <option value="sharp">Sharp (Square)</option>
              <option value="soft">Soft (Rounded)</option>
              <option value="round">Round</option>
              <option value="pill">Pill (Full)</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Density</span>
            <select
              value={theme.density}
              onChange={(e) => handleChange('density', e.target.value)}
              className="mt-1 block w-full p-2 border rounded-lg"
            >
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="spacious">Spacious</option>
            </select>
          </label>
        </section>

        {/* Content */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Content</h2>
          
          <label className="block mb-4">
            <span className="text-sm font-medium">Welcome Message</span>
            <textarea
              value={theme.welcome_message}
              onChange={(e) => handleChange('welcome_message', e.target.value)}
              className="mt-1 block w-full p-2 border rounded-lg"
              rows={2}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Input Placeholder</span>
            <input
              type="text"
              value={theme.placeholder_text}
              onChange={(e) => handleChange('placeholder_text', e.target.value)}
              className="mt-1 block w-full p-2 border rounded-lg"
            />
          </label>
        </section>

        {/* Features - NOTE: These are saved but won't show in preview (hardcoded in Widget.tsx) */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Features</h2>
          <p className="text-xs text-gray-500 mb-3">
            Note: These save correctly but won't reflect in the preview iframe.
          </p>
          
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={theme.header_enabled}
                onChange={(e) => handleChange('header_enabled', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Show Header</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={theme.attachments_enabled}
                onChange={(e) => handleChange('attachments_enabled', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Allow File Attachments</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={theme.feedback_enabled}
                onChange={(e) => handleChange('feedback_enabled', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Show Feedback Buttons</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={theme.retry_enabled}
                onChange={(e) => handleChange('retry_enabled', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Show Retry Button</span>
            </label>
          </div>
        </section>

        {/* Save Button */}
        <button
          onClick={saveTheme}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-medium"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Preview Panel */}
      <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center">
        <div className="w-full max-w-md h-[700px] bg-white rounded-2xl shadow-2xl overflow-hidden">
          {tenantSlug && (
            <iframe
              ref={iframeRef}
              src={`${WIDGET_URL}/widget?tenant=${tenantSlug}&preview=true`}
              className="w-full h-full border-0"
              title="Chat Widget Preview"
            />
          )}
        </div>
        {!widgetReady && (
          <div className="absolute text-gray-500">Loading preview...</div>
        )}
      </div>
    </div>
  );
}
```

---

## Theme Properties Reference

### Colors

| Property | Type | Valid Values | Default |
|----------|------|--------------|---------|
| `color_scheme` | string | `'light'`, `'dark'`, `'auto'` | `'light'` |
| `accent_color` | string | Any hex color | `'#0066cc'` |
| `accent_enabled` | boolean | | `false` |
| `surface_background_color` | string \| null | Any hex color | `null` |
| `surface_foreground_color` | string \| null | Any hex color | `null` |
| `surface_colors_enabled` | boolean | | `false` |

> **Important:** 
> - Accent colors only apply when `accent_enabled: true`. 
> - Surface colors require all three fields set.
> - `'auto'` is accepted by the backend but the frontend treats it as `'light'` (no system preference detection).

### Typography

| Property | Type | Valid Values | Default |
|----------|------|--------------|---------|
| `font_family` | string | Any font name | `'Inter'` |
| `font_family_mono` | string | Any font stack | `'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'` |
| `font_size_base` | number | 8-24 (maps to 14-18) | `16` |

> **Important Font Loading:**
> - **App.tsx only** has built-in font loading for: `'Inter'`, `'JetBrains Mono'`, `'Lora'`, `'OpenAI Sans'`
> - **Widget.tsx (preview)** does NOT load fonts - it only sets the font name
> - `'system-ui'` works everywhere (no loading needed)
> - Other fonts require you to load them externally

### Layout

| Property | Type | Valid Values | Default |
|----------|------|--------------|---------|
| `border_radius` | string | `'sharp'`, `'soft'`, `'round'`, `'pill'` | `'soft'` |
| `density` | string | `'compact'`, `'normal'`, `'spacious'` | `'normal'` |

### Content

| Property | Type | Default |
|----------|------|---------|
| `welcome_message` | string | `'How can I help you today?'` |
| `placeholder_text` | string | `'Type a message...'` |
| `quick_prompts` | `Array<{label, prompt}>` | `[]` |

> **Note:** `disclaimer_text` is listed under Features as it doesn't work in Widget preview.

### Features

| Property | Type | Default | Works in Widget Preview? |
|----------|------|---------|-------------------------|
| `header_enabled` | boolean | `true` | **No** (hardcoded `true`) |
| `attachments_enabled` | boolean | `true` | **No** (hardcoded `true`) |
| `attachments_max_count` | number (1-20) | `5` | **No** (hardcoded `5`) |
| `attachments_max_size` | number (1MB-100MB) | `10485760` | **No** (hardcoded) |
| `feedback_enabled` | boolean | `true` | **No** (hardcoded `true`) |
| `retry_enabled` | boolean | `true` | **No** (hardcoded `true`) |
| `disclaimer_text` | string | `''` | **No** (not implemented) |
| `composer_tools` | array | `[]` | **No** (not implemented) |

> **Note:** These properties work correctly in the main App.tsx but are hardcoded in Widget.tsx (used for preview). Changes to these values won't be visible in the Theme Studio preview iframe.

---

## Environment Setup

### Backend (.env)

```env
# Allow your dashboard origin for CORS
CORS_ORIGINS=http://localhost:3000,https://your-dashboard.com

# Widget URL for preview endpoint
WIDGET_BASE_URL=https://widget.your-domain.com

# Database
DATABASE_URL=postgresql://...
```

### Widget Frontend (.env)

```env
# API URL
VITE_API_URL=https://api.your-domain.com

# ChatKit domain key
VITE_CHATKIT_DOMAIN_KEY=your_domain_key

# Allowed origins for preview mode postMessage
VITE_ALLOWED_STUDIO_ORIGINS=http://localhost:3000,https://your-dashboard.com
```

### Your Next.js Dashboard (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_WIDGET_URL=https://widget.your-domain.com
```

---

## Troubleshooting

### Preview Doesn't Reflect All Theme Changes

The widget preview (`/widget?preview=true`) has limitations compared to the main app:

**These won't change in preview** (hardcoded in Widget.tsx):
- `attachments_enabled`, `attachments_max_count`, `attachments_max_size`
- `header_enabled`, `feedback_enabled`, `retry_enabled`
- `disclaimer_text`, `composer_tools`

**Fonts may not load in preview** - Widget.tsx doesn't include font loading code. Only system fonts or pre-loaded fonts will display.

The changes WILL work in the actual deployed widget (App.tsx) - they just won't preview correctly.

### Widget Not Responding to Theme Updates

1. **Check origin whitelist:** `VITE_ALLOWED_STUDIO_ORIGINS` must include your dashboard origin (exact match, no trailing slash)
2. **Check preview parameter:** iframe URL must have `?preview=true`
3. **Check browser console:** Look for "Blocked message from untrusted origin" warnings
4. **Wait for ready signal:** Don't send updates until you receive `CHATKIT_PREVIEW_READY`

### API Returns 401 Unauthorized

1. Check JWT token is valid and not expired
2. Check `Authorization: Bearer <token>` header format
3. Verify token contains `tenant_id` claim

### API Returns 404 on Theme Endpoint

1. Tenant may not have a theme record (created during onboarding)
2. Check tenant exists in database

### CORS Errors

1. Add dashboard origin to `CORS_ORIGINS` in backend
2. Restart backend after changing env vars
3. Ensure exact origin match (protocol + domain + port)

### Fonts Not Loading

1. Only Inter, JetBrains Mono, Lora, OpenAI Sans have built-in loading
2. For other fonts, add to `getFontSources()` in `App.tsx` and `Widget.tsx`
3. Or load fonts externally in your HTML

### Theme Changes Not Persisting

1. Call `PUT /api/user/theme` to save changes
2. Preview updates via postMessage are temporary (not saved)
3. Check API response for errors

---

## Summary

This guide covers everything you need to build a Theme Studio:

1. **Backend API** is fully functional with JWT auth
2. **Preview mode** works via postMessage protocol
3. **Most theme properties** are applied (see "What Actually Works")
4. **Some properties** are stored but not used (custom_css, logo_url, etc.)

The example Next.js component provides a complete, working implementation you can adapt to your dashboard.
