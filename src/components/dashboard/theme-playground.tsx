"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Alert,
  Button,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ScrollShadow,
  Switch,
  Tabs,
  Tab,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Select,
  SelectItem,
  Input,
  Textarea,
  Spinner,
  cn,
  addToast,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from "@/contexts/auth-context";

// ============================================================================
// Configuration
// ============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://chatservice-demo.robotice.io";
const WIDGET_URL = process.env.NEXT_PUBLIC_WIDGET_URL || "https://chatservice-demo.robotice.io";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_ATTACHMENTS_MAX_COUNT = 5;
const DEFAULT_ATTACHMENTS_MAX_SIZE_MB = 10;
const BYTES_PER_MB = 1048576;
const DEBOUNCE_DELAY_MS = 300;

// ============================================================================
// Types
// ============================================================================

interface QuickPrompt {
  label: string;
  prompt: string;
}

// Theme interface - includes all API fields for compatibility
// Note: Some fields are stored but not exposed in UI (see guide "Not Applied" section)
interface Theme {
  // Colors - Working in both App.tsx and Widget.tsx
  color_scheme: "light" | "dark";
  accent_color: string;
  accent_enabled: boolean;
  surface_background_color: string | null;
  surface_foreground_color: string | null;
  surface_colors_enabled: boolean;
  // Colors - Stored but NOT applied (kept for API compatibility)
  primary_color: string;
  background_color: string | null;
  tinted_grayscale: boolean;
  // Typography
  font_family: string;
  font_family_mono: string;
  font_size_base: number;
  // Layout
  border_radius: "sharp" | "soft" | "round" | "pill";
  density: "compact" | "normal" | "spacious";
  // Branding - Stored but NOT used
  logo_url: string | null;
  favicon_url: string | null;
  // Start Screen - Working
  welcome_message: string;
  quick_prompts: QuickPrompt[];
  // Composer - placeholder_text works; others are preview-limited
  placeholder_text: string;
  disclaimer_text: string;
  attachments_enabled: boolean;
  attachments_max_count: number;
  attachments_max_size: number;
  composer_tools: string[];
  // Features - Save correctly but hardcoded in Widget preview
  header_enabled: boolean;
  feedback_enabled: boolean;
  retry_enabled: boolean;
  // Advanced - Stored but NOT applied
  custom_css: string | null;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validates theme data from API
 * Handles nullable fields correctly per API spec
 */
function validateTheme(data: unknown): Theme | null {
  if (!data || typeof data !== "object") return null;
  
  const theme = data as Record<string, unknown>;
  
  // Required string properties (never null)
  const requiredStrings = [
    "color_scheme", "primary_color", "accent_color", "font_family",
    "font_family_mono", "border_radius", "density", 
    "welcome_message", "placeholder_text", "disclaimer_text"
  ];
  
  for (const key of requiredStrings) {
    if (typeof theme[key] !== "string") return null;
  }
  
  // Nullable string properties (can be string or null)
  const nullableStrings = [
    "logo_url", "favicon_url", "custom_css", 
    "background_color", "surface_background_color", "surface_foreground_color"
  ];
  
  for (const key of nullableStrings) {
    if (theme[key] !== null && typeof theme[key] !== "string") return null;
  }
  
  // Required booleans
  const requiredBooleans = [
    "accent_enabled", "surface_colors_enabled", "tinted_grayscale",
    "attachments_enabled", "header_enabled", "feedback_enabled", "retry_enabled"
  ];
  
  for (const key of requiredBooleans) {
    if (typeof theme[key] !== "boolean") return null;
  }
  
  // Required numbers
  if (typeof theme.font_size_base !== "number") return null;
  if (typeof theme.attachments_max_count !== "number") return null;
  if (typeof theme.attachments_max_size !== "number") return null;
  
  // Arrays
  if (!Array.isArray(theme.quick_prompts)) return null;
  if (!Array.isArray(theme.composer_tools)) return null;
  
  return data as Theme;
}

/**
 * Custom hook for debouncing values
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// Reusable Components
// ============================================================================

interface SectionHeaderProps {
  title: string;
  tooltip?: string;
}

function SectionHeader({ title, tooltip }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-1.5 pb-2">
      <span className="text-xs font-medium text-default-500 uppercase tracking-wide">{title}</span>
      {tooltip && (
        <Tooltip content={tooltip} placement="right" size="sm">
          <span className="cursor-help">
            <Icon
              icon="solar:info-circle-linear"
              className="text-default-400"
              width={14}
            />
          </span>
        </Tooltip>
      )}
    </div>
  );
}

interface SettingRowProps {
  label: string;
  tooltip?: string;
  children: React.ReactNode;
}

function SettingRow({ label, tooltip, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-foreground">{label}</span>
        {tooltip && (
          <Tooltip content={tooltip} placement="right" size="sm">
            <span className="cursor-help">
              <Icon
                icon="solar:info-circle-linear"
                className="text-default-400"
                width={14}
              />
            </span>
          </Tooltip>
        )}
      </div>
      <div className="flex w-[140px] items-center justify-end">
        {children}
      </div>
    </div>
  );
}

/**
 * Alert component for sections with preview limitations
 */
function PreviewLimitedAlert() {
  return (
    <Alert
      color="warning"
      variant="flat"
      classNames={{
        base: "py-2 px-3 mb-3",
        title: "text-xs",
      }}
      hideIconWrapper
      icon={<Icon icon="solar:eye-closed-linear" width={16} />}
      title="Changes save but won't reflect in preview"
    />
  );
}

// Color Picker Component
interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  const presetColors = [
    "#000000",
    "#0066cc",
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
  ];

  if (disabled) {
    return (
      <div
        className="h-6 w-6 rounded-md border border-default-200 bg-default-100"
        aria-label="Color picker disabled"
      />
    );
  }

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <button
          className="h-6 w-6 rounded-md border border-default-200 shadow-sm transition-transform hover:scale-105"
          style={{ backgroundColor: value || "#000000" }}
          aria-label="Choose color"
        />
      </PopoverTrigger>
      <PopoverContent className="p-3">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                className={cn(
                  "h-6 w-6 rounded-md border-2 transition-transform hover:scale-110",
                  value === color ? "border-foreground" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
                onClick={() => onChange(color)}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value || "#000000"}
              onChange={(e) => onChange(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
            />
            <span className="text-xs text-default-500 uppercase">{value || "none"}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Quick Prompts Editor Modal
interface QuickPromptsEditorProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: QuickPrompt[];
  onSave: (prompts: QuickPrompt[]) => void;
}

function QuickPromptsEditor({ isOpen, onClose, prompts, onSave }: QuickPromptsEditorProps) {
  const [editingPrompts, setEditingPrompts] = useState<QuickPrompt[]>(prompts);

  useEffect(() => {
    if (isOpen) {
      setEditingPrompts(prompts);
    }
  }, [isOpen, prompts]);

  const handleAdd = () => {
    setEditingPrompts([...editingPrompts, { label: "", prompt: "" }]);
  };

  const handleRemove = (index: number) => {
    setEditingPrompts(editingPrompts.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof QuickPrompt, value: string) => {
    const updated = [...editingPrompts];
    updated[index] = { ...updated[index], [field]: value };
    setEditingPrompts(updated);
  };

  const handleSave = () => {
    // Filter out empty prompts
    const validPrompts = editingPrompts.filter(p => p.label.trim() && p.prompt.trim());
    onSave(validPrompts);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <span>Quick Prompts</span>
          <span className="text-sm font-normal text-default-500">
            Starter prompts shown on the welcome screen
          </span>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            {editingPrompts.length === 0 ? (
              <div className="py-8 text-center text-default-400">
                <Icon icon="solar:chat-square-like-linear" width={32} className="mx-auto mb-2" />
                <p className="text-sm">No prompts configured</p>
                <p className="text-xs">Add prompts to help users get started</p>
              </div>
            ) : (
              editingPrompts.map((prompt, index) => (
                <div key={index} className="flex gap-3 rounded-lg border border-default-200 p-3">
                  <div className="flex flex-1 flex-col gap-2">
                    <Input
                      size="sm"
                      label="Button Label"
                      labelPlacement="outside"
                      placeholder="e.g., Tell me a joke"
                      value={prompt.label}
                      onValueChange={(val) => handleUpdate(index, "label", val)}
                      classNames={{
                        label: "text-xs",
                        input: "text-sm",
                      }}
                    />
                    <Textarea
                      size="sm"
                      label="Prompt Text"
                      labelPlacement="outside"
                      placeholder="The actual message that will be sent"
                      value={prompt.prompt}
                      onValueChange={(val) => handleUpdate(index, "prompt", val)}
                      minRows={2}
                      classNames={{
                        label: "text-xs",
                        input: "text-sm",
                      }}
                    />
                  </div>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => handleRemove(index)}
                    aria-label="Remove prompt"
                    className="mt-6"
                  >
                    <Icon icon="solar:trash-bin-trash-linear" width={18} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-between">
          <Button
            variant="flat"
            onPress={handleAdd}
            startContent={<Icon icon="solar:add-circle-linear" width={18} />}
          >
            Add Prompt
          </Button>
          <div className="flex gap-2">
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSave}>
              Save Prompts
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function ThemePlayground() {
  // Auth context - tenantSlug is fetched at login time
  const { user } = useAuth();
  const tenantSlug = user?.tenantSlug || "";

  // Core state
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [originalTheme, setOriginalTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Quick prompts editor modal state
  const [isQuickPromptsOpen, setIsQuickPromptsOpen] = useState(false);

  // Preview resize state
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewSize, setPreviewSize] = useState({ width: 400, height: 580 });
  const [isResizing, setIsResizing] = useState<"left" | "right" | "bottom" | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // Preview size constraints
  const MIN_WIDTH = 320;
  const MAX_WIDTH = 800;
  const MIN_HEIGHT = 400;
  const MAX_HEIGHT = 600;

  // Debounced theme for preview updates
  const debouncedTheme = useDebounce(theme, DEBOUNCE_DELAY_MS);

  // Check if theme has unsaved changes
  const isDirty = theme && originalTheme 
    ? JSON.stringify(theme) !== JSON.stringify(originalTheme)
    : false;

  // Auth helpers
  const getAuthToken = useCallback(() => localStorage.getItem("access_token"), []);

  const buildHeaders = useCallback((includeContentType = false): HeadersInit => {
    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    if (includeContentType) {
      headers["Content-Type"] = "application/json";
    }
    
    return headers;
  }, [getAuthToken]);

  // ============================================================================
  // API Functions
  // ============================================================================

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      const headers = buildHeaders();

      try {
        const themeResponse = await fetch(`${API_URL}/api/user/theme`, { headers });
        if (!themeResponse.ok) {
          throw new Error(`Failed to load theme: ${themeResponse.status}`);
        }
        
        const themeData = await themeResponse.json();
        const validatedTheme = validateTheme(themeData);
        
        if (!validatedTheme) {
          throw new Error("Invalid theme data received from server");
        }
        
        setTheme(validatedTheme);
        setOriginalTheme(validatedTheme);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load theme";
        setError(message);
        addToast({
          title: "Error",
          description: message,
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [buildHeaders]);

  // Send theme update to widget
  const updatePreview = useCallback((themeToSend: Theme) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "CHATKIT_THEME_UPDATE", theme: themeToSend },
        WIDGET_URL
      );
    }
  }, []);

  // Send debounced theme updates
  useEffect(() => {
    if (debouncedTheme) {
      updatePreview(debouncedTheme);
    }
  }, [debouncedTheme, updatePreview]);

  // Handle theme change (debounced for text inputs)
  const handleChange = useCallback((key: keyof Theme, value: Theme[keyof Theme]) => {
    setTheme((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  // Handle immediate changes (switches, selects)
  const handleImmediateChange = useCallback((key: keyof Theme, value: Theme[keyof Theme]) => {
    setTheme((prev) => {
      if (!prev) return prev;
      const newTheme = { ...prev, [key]: value };
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: "CHATKIT_THEME_UPDATE", theme: newTheme },
          WIDGET_URL
        );
      }
      return newTheme;
    });
  }, []);

  // Save theme to server
  const saveTheme = async () => {
    if (!theme) return;
    setIsSaving(true);
    
    try {
      const response = await fetch(`${API_URL}/api/user/theme`, {
        method: "PUT",
        headers: buildHeaders(true),
        body: JSON.stringify(theme),
      });
      
      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`);
      }
      
      setOriginalTheme(theme);
      addToast({
        title: "Success",
        description: "Theme saved successfully",
        color: "success",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save theme";
      addToast({
        title: "Error",
        description: message,
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset theme to saved version
  const resetTheme = () => {
    if (originalTheme) {
      setTheme(originalTheme);
      updatePreview(originalTheme);
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: "CHATKIT_THEME_RESET" },
          WIDGET_URL
        );
      }
    }
  };

  // Start new conversation in preview
  const newConversation = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "CHATKIT_NEW_CONVERSATION" },
        WIDGET_URL
      );
    }
  };

  // Handle quick prompts save
  const handleQuickPromptsSave = (prompts: QuickPrompt[]) => {
    handleImmediateChange("quick_prompts", prompts);
  };

  // ============================================================================
  // Preview Resize Handlers
  // ============================================================================

  const handleResizeStart = useCallback((
    e: React.MouseEvent,
    direction: "left" | "right" | "bottom"
  ) => {
    e.preventDefault();
    setIsResizing(direction);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: previewSize.width,
      height: previewSize.height,
    };
  }, [previewSize]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return;

      const { x, y, width, height } = resizeStartRef.current;
      
      if (isResizing === "left") {
        // Dragging left handle: moving left increases width
        const delta = x - e.clientX;
        const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width + delta * 2));
        setPreviewSize(prev => ({ ...prev, width: newWidth }));
      } else if (isResizing === "right") {
        // Dragging right handle: moving right increases width
        const delta = e.clientX - x;
        const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width + delta * 2));
        setPreviewSize(prev => ({ ...prev, width: newWidth }));
      } else if (isResizing === "bottom") {
        // Dragging bottom handle: grows/shrinks equally from top and bottom (like width)
        const delta = e.clientY - y;
        const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, height + delta * 2));
        setPreviewSize(prev => ({ ...prev, height: newHeight }));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(null);
      resizeStartRef.current = null;
    };

    // Add listeners to document to capture mouse events outside the element
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Add cursor style to body while resizing
    document.body.style.cursor = isResizing === "bottom" ? "ns-resize" : "ew-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // ============================================================================
  // Loading State
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-140px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <span className="text-sm text-default-500">Loading theme...</span>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Error State
  // ============================================================================

  if (error || !theme) {
    return (
      <div className="flex h-[calc(100vh-140px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Icon
            icon="solar:danger-triangle-linear"
            className="text-danger"
            width={48}
          />
          <div className="flex flex-col gap-1">
            <span className="text-lg font-medium text-foreground">
              Failed to load theme
            </span>
            <span className="text-sm text-default-500">
              {error || "Unable to load theme configuration"}
            </span>
          </div>
          <Button
            color="primary"
            variant="flat"
            onPress={() => window.location.reload()}
            startContent={<Icon icon="solar:refresh-linear" width={18} />}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left Sidebar - Controls */}
      <div className="flex w-[400px] flex-shrink-0 flex-col border-r border-divider bg-background">
        {/* Scrollable Controls Area */}
        <ScrollShadow className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-0.5 px-5 py-5">
            {/* Sidebar Title */}
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:pallete-2-linear"
                className="text-default-500"
                width={20}
              />
              <span className="text-base font-semibold text-foreground">Theme Studio</span>
            </div>

            <Divider className="my-4" />

            {/* Colors Section */}
            <SectionHeader title="Colors" />

            {/* Color Scheme - Only Light/Dark (Auto not supported) */}
            <SettingRow label="Color scheme">
              <Tabs
                size="sm"
                variant="bordered"
                selectedKey={theme.color_scheme}
                onSelectionChange={(key) =>
                  handleImmediateChange("color_scheme", key as Theme["color_scheme"])
                }
                classNames={{
                  tabList: "h-7 p-0.5 gap-0",
                  tab: "h-6 px-3 text-xs",
                  cursor: "rounded-md",
                }}
              >
                <Tab key="light" title="Light" />
                <Tab key="dark" title="Dark" />
              </Tabs>
            </SettingRow>

            {/* Accent Color */}
            <SettingRow label="Accent color" tooltip="Custom accent color for buttons and highlights">
              <div className="flex items-center gap-2">
                {theme.accent_enabled && (
                  <ColorPicker
                    value={theme.accent_color}
                    onChange={(color) => handleImmediateChange("accent_color", color)}
                  />
                )}
                <Switch
                  size="sm"
                  isSelected={theme.accent_enabled}
                  onValueChange={(val) => handleImmediateChange("accent_enabled", val)}
                  aria-label="Enable accent color"
                />
              </div>
            </SettingRow>

            {/* Surface Colors */}
            <SettingRow label="Custom surfaces" tooltip="Override default surface colors">
              <Switch
                size="sm"
                isSelected={theme.surface_colors_enabled}
                onValueChange={(val) => handleImmediateChange("surface_colors_enabled", val)}
                aria-label="Enable custom surface colors"
              />
            </SettingRow>

            {theme.surface_colors_enabled && (
              <>
                <SettingRow label="Surface background">
                  <ColorPicker
                    value={theme.surface_background_color || "#ffffff"}
                    onChange={(color) => handleImmediateChange("surface_background_color", color)}
                  />
                </SettingRow>
                <SettingRow label="Surface foreground">
                  <ColorPicker
                    value={theme.surface_foreground_color || "#000000"}
                    onChange={(color) => handleImmediateChange("surface_foreground_color", color)}
                  />
                </SettingRow>
              </>
            )}

            <Divider className="my-4" />

            {/* Typography Section */}
            <SectionHeader title="Typography" />

            {/* Font Family - Only fonts with built-in loading */}
            <SettingRow label="Font family">
              <Select
                size="sm"
                selectedKeys={[theme.font_family]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  if (selected) handleImmediateChange("font_family", selected);
                }}
                classNames={{
                  trigger: "h-8 min-h-8 w-full",
                  value: "text-xs",
                }}
                aria-label="Select font family"
              >
                <SelectItem key="Inter">Inter (Default)</SelectItem>
                <SelectItem key="system-ui">System UI</SelectItem>
                <SelectItem key="OpenAI Sans">OpenAI Sans</SelectItem>
                <SelectItem key="JetBrains Mono">JetBrains Mono</SelectItem>
                <SelectItem key="Lora">Lora (Serif)</SelectItem>
              </Select>
            </SettingRow>

            {/* Monospace Font */}
            <SettingRow label="Monospace" tooltip="Used for code blocks. Note: May not preview correctly">
              <Select
                size="sm"
                selectedKeys={[theme.font_family_mono]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  if (selected) handleImmediateChange("font_family_mono", selected);
                }}
                classNames={{
                  trigger: "h-8 min-h-8 w-full",
                  value: "text-xs",
                }}
                aria-label="Select monospace font"
              >
                <SelectItem key="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace">System Mono</SelectItem>
                <SelectItem key="JetBrains Mono">JetBrains Mono</SelectItem>
              </Select>
            </SettingRow>

            {/* Font Size */}
            <SettingRow label="Base size">
              <Select
                size="sm"
                selectedKeys={[`${theme.font_size_base}`]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  if (selected) handleImmediateChange("font_size_base", Number(selected) || 16);
                }}
                classNames={{
                  trigger: "h-8 min-h-8 w-full",
                  value: "text-xs",
                }}
                aria-label="Select font size"
              >
                <SelectItem key="14">14px</SelectItem>
                <SelectItem key="15">15px</SelectItem>
                <SelectItem key="16">16px</SelectItem>
                <SelectItem key="17">17px</SelectItem>
                <SelectItem key="18">18px</SelectItem>
              </Select>
            </SettingRow>

            <Divider className="my-4" />

            {/* Layout Section */}
            <SectionHeader title="Layout" />

            {/* Border Radius */}
            <SettingRow label="Corners">
              <Select
                size="sm"
                selectedKeys={[theme.border_radius]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  if (selected) handleImmediateChange("border_radius", selected as Theme["border_radius"]);
                }}
                classNames={{
                  trigger: "h-8 min-h-8 w-full",
                  value: "text-xs",
                }}
                aria-label="Select border radius"
              >
                <SelectItem key="sharp">Sharp</SelectItem>
                <SelectItem key="soft">Soft</SelectItem>
                <SelectItem key="round">Round</SelectItem>
                <SelectItem key="pill">Pill</SelectItem>
              </Select>
            </SettingRow>

            {/* Density */}
            <SettingRow label="Density">
              <Select
                size="sm"
                selectedKeys={[theme.density]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  if (selected) handleImmediateChange("density", selected as Theme["density"]);
                }}
                classNames={{
                  trigger: "h-8 min-h-8 w-full",
                  value: "text-xs",
                }}
                aria-label="Select density"
              >
                <SelectItem key="compact">Compact</SelectItem>
                <SelectItem key="normal">Normal</SelectItem>
                <SelectItem key="spacious">Spacious</SelectItem>
              </Select>
            </SettingRow>

            <Divider className="my-4" />

            {/* Start Screen Section */}
            <SectionHeader title="Start Screen" tooltip="Customize the initial chat screen" />

            {/* Welcome Message */}
            <div className="flex flex-col gap-2 py-2">
              <label className="text-sm text-foreground">Welcome message</label>
              <Textarea
                size="sm"
                value={theme.welcome_message}
                onValueChange={(val) => handleChange("welcome_message", val)}
                placeholder="What can I help with today?"
                minRows={2}
                classNames={{
                  input: "text-xs",
                }}
              />
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-col gap-2 py-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">Quick prompts</label>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="h-7 w-7 min-w-0"
                  onPress={() => setIsQuickPromptsOpen(true)}
                  aria-label="Edit quick prompts"
                >
                  <Icon icon="solar:pen-linear" width={14} />
                </Button>
              </div>
              <span className="text-xs text-default-400">
                {theme.quick_prompts?.length || 0} prompts configured
              </span>
            </div>

            <Divider className="my-4" />

            {/* Composer Section */}
            <SectionHeader title="Composer" tooltip="Input area settings" />

            {/* Placeholder */}
            <div className="flex flex-col gap-2 py-2">
              <label className="text-sm text-foreground">Placeholder</label>
              <Input
                size="sm"
                value={theme.placeholder_text}
                onValueChange={(val) => handleChange("placeholder_text", val)}
                placeholder="Type a message..."
                classNames={{
                  inputWrapper: "h-9",
                  input: "text-xs",
                }}
              />
            </div>

            {/* Preview-limited settings alert */}
            <div className="mt-3 mb-1">
              <PreviewLimitedAlert />
            </div>

            {/* Disclaimer */}
            <div className="flex flex-col gap-2 py-2">
              <label className="text-sm text-foreground">Disclaimer</label>
              <Input
                size="sm"
                value={theme.disclaimer_text}
                onValueChange={(val) => handleChange("disclaimer_text", val)}
                placeholder="AI can make mistakes"
                classNames={{
                  inputWrapper: "h-9",
                  input: "text-xs",
                }}
              />
            </div>

            {/* Attachments */}
            <SettingRow label="Attachments">
              <Switch
                size="sm"
                isSelected={theme.attachments_enabled}
                onValueChange={(val) => handleImmediateChange("attachments_enabled", val)}
                aria-label="Enable attachments"
              />
            </SettingRow>

            {theme.attachments_enabled && (
              <>
                <SettingRow label="Max files">
                  <Input
                    size="sm"
                    type="number"
                    value={String(theme.attachments_max_count)}
                    onValueChange={(val) => {
                      const num = Number(val);
                      handleImmediateChange(
                        "attachments_max_count", 
                        Number.isFinite(num) && num > 0 ? num : DEFAULT_ATTACHMENTS_MAX_COUNT
                      );
                    }}
                    classNames={{
                      inputWrapper: "h-8 w-full",
                      input: "text-xs text-center",
                    }}
                  />
                </SettingRow>
                <SettingRow label="Max size (MB)">
                  <Input
                    size="sm"
                    type="number"
                    value={String(Math.round(theme.attachments_max_size / BYTES_PER_MB))}
                    onValueChange={(val) => {
                      const num = Number(val);
                      const mb = Number.isFinite(num) && num > 0 ? num : DEFAULT_ATTACHMENTS_MAX_SIZE_MB;
                      handleImmediateChange("attachments_max_size", mb * BYTES_PER_MB);
                    }}
                    classNames={{
                      inputWrapper: "h-8 w-full",
                      input: "text-xs text-center",
                    }}
                  />
                </SettingRow>
              </>
            )}

            <Divider className="my-4" />

            {/* Features Section */}
            <SectionHeader title="Features" />
            <PreviewLimitedAlert />

            <SettingRow label="Header">
              <Switch
                size="sm"
                isSelected={theme.header_enabled}
                onValueChange={(val) => handleImmediateChange("header_enabled", val)}
                aria-label="Enable header"
              />
            </SettingRow>

            <SettingRow label="Feedback buttons">
              <Switch
                size="sm"
                isSelected={theme.feedback_enabled}
                onValueChange={(val) => handleImmediateChange("feedback_enabled", val)}
                aria-label="Enable feedback"
              />
            </SettingRow>

            <SettingRow label="Retry button">
              <Switch
                size="sm"
                isSelected={theme.retry_enabled}
                onValueChange={(val) => handleImmediateChange("retry_enabled", val)}
                aria-label="Enable retry"
              />
            </SettingRow>

            {/* Footer Actions */}
            <div className="mt-8 flex flex-col gap-2 border-t border-divider pt-5">
              <Button
                color={isDirty ? "primary" : "default"}
                size="md"
                className="w-full font-medium"
                onPress={saveTheme}
                isLoading={isSaving}
                isDisabled={!isDirty}
                startContent={
                  isDirty ? (
                    <Icon icon="solar:diskette-linear" width={18} />
                  ) : (
                    <Icon icon="solar:check-circle-linear" width={18} />
                  )
                }
              >
                {isDirty ? "Save Changes" : "All Changes Saved"}
              </Button>
              {isDirty && (
                <Button
                  variant="flat"
                  size="md"
                  className="w-full"
                  onPress={resetTheme}
                  startContent={<Icon icon="solar:restart-linear" width={18} />}
                >
                  Discard Changes
                </Button>
              )}
            </div>
          </div>
        </ScrollShadow>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex flex-1 flex-col bg-default-50">
        {/* Preview Content with Resize Handles */}
        <div 
          ref={previewContainerRef}
          className="relative flex flex-1 items-center justify-center overflow-auto p-6 pt-4"
        >
          {/* Floating Preview Controls */}
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg bg-background/80 px-3 py-1.5 shadow-sm backdrop-blur-sm border border-divider">
            <span className="text-xs text-default-500">
              {previewSize.width} × {previewSize.height}
            </span>
            <Tooltip content="Start new conversation">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={newConversation}
                isDisabled={!tenantSlug}
                className="h-6 w-6 min-w-0"
              >
                <Icon icon="solar:restart-linear" width={14} />
              </Button>
            </Tooltip>
          </div>
          {/* Resizable Preview Container */}
          <div className="relative inline-flex flex-col items-center">
            {/* Main Preview Frame with Side Handles */}
            <div className="relative flex items-stretch">
              {/* Left Resize Handle */}
              <div
                className={cn(
                  "group flex w-5 cursor-ew-resize items-center justify-center",
                  isResizing === "left" && "bg-primary/5"
                )}
                style={{ height: previewSize.height }}
                onMouseDown={(e) => handleResizeStart(e, "left")}
              >
                <div 
                  className={cn(
                    "h-12 w-1 rounded-full bg-default-300 transition-colors",
                    "group-hover:bg-primary group-hover:w-1.5",
                    isResizing === "left" && "bg-primary w-1.5"
                  )}
                />
              </div>

              {/* Preview Frame */}
              <div 
                className="relative flex-shrink-0 overflow-hidden rounded-2xl border border-divider bg-background shadow-lg"
                style={{ 
                  width: previewSize.width, 
                  height: previewSize.height,
                }}
              >
                {/* Missing tenant message */}
                {!tenantSlug && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-3">
                      <Icon
                        icon="solar:widget-5-linear"
                        className="text-default-300"
                        width={48}
                      />
                      <span className="text-sm text-default-500">
                        Widget preview unavailable
                      </span>
                      <span className="text-xs text-default-400">
                        Tenant configuration missing
                      </span>
                    </div>
                  </div>
                )}
                {/* Chat Widget Iframe */}
                {tenantSlug && (
                  <iframe
                    ref={iframeRef}
                    src={`${WIDGET_URL}/widget?tenant=${encodeURIComponent(tenantSlug)}&preview=true`}
                    className="h-full w-full border-0"
                    style={{ pointerEvents: isResizing ? "none" : "auto" }}
                    title="Chat Widget Preview"
                    allow="clipboard-write"
                  />
                )}
              </div>

              {/* Right Resize Handle */}
              <div
                className={cn(
                  "group flex w-5 cursor-ew-resize items-center justify-center",
                  isResizing === "right" && "bg-primary/5"
                )}
                style={{ height: previewSize.height }}
                onMouseDown={(e) => handleResizeStart(e, "right")}
              >
                <div 
                  className={cn(
                    "h-12 w-1 rounded-full bg-default-300 transition-colors",
                    "group-hover:bg-primary group-hover:w-1.5",
                    isResizing === "right" && "bg-primary w-1.5"
                  )}
                />
              </div>
            </div>

            {/* Bottom Resize Handle */}
            <div
              className={cn(
                "group flex h-5 cursor-ns-resize items-center justify-center",
                isResizing === "bottom" && "bg-primary/5"
              )}
              style={{ width: previewSize.width + 40 }}
              onMouseDown={(e) => handleResizeStart(e, "bottom")}
            >
              <div 
                className={cn(
                  "h-1 w-12 rounded-full bg-default-300 transition-colors",
                  "group-hover:bg-primary group-hover:h-1.5",
                  isResizing === "bottom" && "bg-primary h-1.5"
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Prompts Editor Modal */}
      <QuickPromptsEditor
        isOpen={isQuickPromptsOpen}
        onClose={() => setIsQuickPromptsOpen(false)}
        prompts={theme.quick_prompts || []}
        onSave={handleQuickPromptsSave}
      />
    </div>
  );
}
