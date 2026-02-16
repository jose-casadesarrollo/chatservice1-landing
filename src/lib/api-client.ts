const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  token?: string;
  body?: unknown;
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, body, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "An unknown error occurred" }));

    throw new ApiError(response.status, error.detail || "Request failed");
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text);
}

// Auth API types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  refresh_token?: string;
  user_id: string;
  email: string;
  role: "user" | "admin" | "owner" | "super_admin";
  tenant_id: string;
  tenant_name: string;
  tenant_slug?: string;
}

export interface MeResponse {
  user_id: string;
  email: string;
  role: string;
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  is_supabase_auth: boolean;
}

// Auth API functions
export const authApi = {
  login: (data: LoginRequest) =>
    apiClient<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: data,
    }),

  me: (token: string) =>
    apiClient<MeResponse>("/api/auth/me", {
      token,
    }),
};

// Branding API types
export type BrandingAssetType = "logo" | "favicon";

export interface BrandingAsset {
  id: string;
  asset_type: BrandingAssetType;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  url: string;
  created_at: string;
}

export interface ListBrandingAssetsResponse {
  assets: BrandingAsset[];
  total: number;
}

export interface ApplyBrandingRequest {
  apply_logo?: boolean;
  apply_favicon?: boolean;
}

export interface ApplyBrandingResponse {
  status: "applied";
  logo_url: string | null;
  favicon_url: string | null;
}

// Branding API functions
export const brandingApi = {
  uploadAsset: (token: string, assetType: BrandingAssetType, file: File) => {
    const formData = new FormData();
    formData.append("asset_type", assetType);
    formData.append("file", file);
    return apiUpload<BrandingAsset>("/api/branding/upload", formData, token);
  },

  listAssets: (token: string) =>
    apiClient<ListBrandingAssetsResponse>("/api/branding/assets", { token }),

  applyBranding: (token: string, data: ApplyBrandingRequest) =>
    apiClient<ApplyBrandingResponse>("/api/branding/apply", {
      token,
      method: "PUT",
      body: data,
    }),

  deleteAsset: (token: string, assetId: string) =>
    apiClient<void>(`/api/branding/assets/${assetId}`, {
      token,
      method: "DELETE",
    }),
};

// Knowledge Base API types
export type KnowledgeBaseCategory =
  | "policy"
  | "faq"
  | "guide"
  | "product"
  | "support"
  | "general";

export type ProcessingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "needs_reprocessing";

export interface KnowledgeBaseDocument {
  id: string;
  title: string;
  filename: string;
  original_name: string;
  category: KnowledgeBaseCategory;
  description?: string;
  mime_type: string;
  file_size: number;
  processing_status: ProcessingStatus;
  processing_error?: string | null;
  is_active: boolean;
  keywords: string[];
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBaseStats {
  total_documents: number;
  active_documents: number;
  max_documents: number;
  remaining_slots: number;
  by_category: Record<string, number>;
  by_processing_status: Record<string, number>;
  total_tokens_used: number;
}

export interface ListDocumentsResponse {
  files: KnowledgeBaseDocument[];
  total: number;
}

export interface UploadDocumentRequest {
  file: File;
  title?: string;
  category?: KnowledgeBaseCategory;
  description?: string;
  keywords?: string;
}

export interface ProcessingStatusResponse {
  id: string;
  status: ProcessingStatus;
  error: string | null;
  tokens_used: number;
  processing_duration_ms: number;
}

export interface DeleteDocumentResponse {
  status: "archived" | "deleted";
  id: string;
}

export interface CreateDocumentRequest {
  title: string;
  content: string;
  category?: KnowledgeBaseCategory;
  description?: string;
  keywords?: string[];
}

export interface UpdateDocumentRequest {
  title?: string;
  category?: KnowledgeBaseCategory;
  description?: string;
  keywords?: string;
}

export interface FileContentResponse {
  id: string;
  content: string;
  mime_type: string;
  title: string;
}

export interface FilePreviewResponse {
  id: string;
  title: string;
  content: string;
  mime_type: string;
  file_size: number;
  category: KnowledgeBaseCategory;
  processing_status: ProcessingStatus;
  created_at: string;
}

export interface SearchDocumentsResponse {
  results: KnowledgeBaseDocument[];
  total: number;
  query: string;
}

export interface ReprocessResponse {
  id: string;
  status: ProcessingStatus;
  message: string;
}

// Helper function for multipart/form-data uploads
async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
  token: string,
  method: "POST" | "PUT" = "POST"
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      // Note: Don't set Content-Type for FormData - browser sets it with boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "An unknown error occurred" }));

    throw new ApiError(response.status, error.detail || "Upload failed");
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text);
}

// Knowledge Base API functions
export const knowledgeBaseApi = {
  getStats: (token: string) =>
    apiClient<KnowledgeBaseStats>("/api/knowledge-base/stats", {
      token,
    }),

  listFiles: (
    token: string,
    params?: { category?: KnowledgeBaseCategory; is_active?: boolean }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.is_active !== undefined)
      searchParams.set("is_active", String(params.is_active));

    const query = searchParams.toString();
    return apiClient<ListDocumentsResponse>(
      `/api/knowledge-base/files${query ? `?${query}` : ""}`,
      { token }
    );
  },

  uploadFile: (token: string, data: UploadDocumentRequest) => {
    const formData = new FormData();
    formData.append("file", data.file);
    if (data.title) formData.append("title", data.title);
    if (data.category) formData.append("category", data.category);
    if (data.description) formData.append("description", data.description);
    if (data.keywords) formData.append("keywords", data.keywords);

    return apiUpload<KnowledgeBaseDocument>(
      "/api/knowledge-base/upload",
      formData,
      token
    );
  },

  getProcessingStatus: (token: string, fileId: string) =>
    apiClient<ProcessingStatusResponse>(
      `/api/knowledge-base/files/${fileId}/status`,
      { token }
    ),

  deleteFile: (token: string, fileId: string, hardDelete = false) =>
    apiClient<DeleteDocumentResponse>(
      `/api/knowledge-base/files/${fileId}${hardDelete ? "?hard_delete=true" : ""}`,
      { token, method: "DELETE" }
    ),

  toggleActive: (token: string, fileId: string) =>
    apiClient<{ id: string; is_active: boolean; message: string }>(
      `/api/knowledge-base/files/${fileId}/toggle-active`,
      { token, method: "PATCH" }
    ),

  createDocument: (token: string, data: CreateDocumentRequest) =>
    apiClient<KnowledgeBaseDocument>("/api/knowledge-base/create", {
      token,
      method: "POST",
      body: data,
    }),

  getFile: (token: string, fileId: string) =>
    apiClient<KnowledgeBaseDocument>(
      `/api/knowledge-base/files/${fileId}`,
      { token }
    ),

  getFileContent: (token: string, fileId: string) =>
    apiClient<FileContentResponse>(
      `/api/knowledge-base/files/${fileId}/content`,
      { token }
    ),

  previewFile: (token: string, fileId: string) =>
    apiClient<FilePreviewResponse>(
      `/api/knowledge-base/files/${fileId}/preview`,
      { token }
    ),

  searchDocuments: (
    token: string,
    params: { q: string; category?: KnowledgeBaseCategory; limit?: number }
  ) => {
    const searchParams = new URLSearchParams();
    searchParams.set("q", params.q);
    if (params.category) searchParams.set("category", params.category);
    if (params.limit) searchParams.set("limit", String(params.limit));

    return apiClient<SearchDocumentsResponse>(
      `/api/knowledge-base/search?${searchParams.toString()}`,
      { token }
    );
  },

  updateFile: (token: string, fileId: string, data: UpdateDocumentRequest) => {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.category) formData.append("category", data.category);
    if (data.description) formData.append("description", data.description);
    if (data.keywords) formData.append("keywords", data.keywords);

    return apiUpload<KnowledgeBaseDocument>(
      `/api/knowledge-base/files/${fileId}`,
      formData,
      token,
      "PUT"
    );
  },

  reprocessFile: (token: string, fileId: string) =>
    apiClient<ReprocessResponse>(
      `/api/knowledge-base/files/${fileId}/reprocess`,
      { token, method: "POST" }
    ),
};
