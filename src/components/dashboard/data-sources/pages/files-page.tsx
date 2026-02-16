"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Button,
  Chip,
  Link,
  Spinner,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import DataSourcesSidebar from "../data-sources-sidebar";
import { useAuth } from "@/contexts/auth-context";
import {
  knowledgeBaseApi,
  type KnowledgeBaseDocument,
  type KnowledgeBaseStats,
  type ProcessingStatus,
} from "@/lib/api-client";

// Supported file types
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/csv",
];
const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md", ".csv"];
const MAX_FILE_SIZE = 500 * 1024; // 500KB

// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Helper to format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Helper to get status color
function getStatusColor(
  status: ProcessingStatus
): "default" | "primary" | "success" | "warning" | "danger" {
  switch (status) {
    case "completed":
      return "success";
    case "processing":
    case "pending":
      return "primary";
    case "failed":
      return "danger";
    case "needs_reprocessing":
      return "warning";
    default:
      return "default";
  }
}

// Helper to get file icon
function getFileIcon(mimeType: string): string {
  if (mimeType === "application/pdf") return "solar:document-text-bold";
  if (mimeType.includes("wordprocessingml")) return "solar:document-bold";
  if (mimeType === "text/csv") return "solar:table-2-bold";
  if (mimeType === "text/markdown") return "solar:code-square-bold";
  return "solar:file-text-bold";
}

export default function FilesPage() {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [isAddFilesOpen, setIsAddFilesOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Data state
  const [files, setFiles] = useState<KnowledgeBaseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<
    { name: string; progress: "uploading" | "processing" | "done" | "error" }[]
  >([]);

  // Polling state for processing files
  const [pollingIds, setPollingIds] = useState<string[]>([]);

  // Stats state for limit checking
  const [stats, setStats] = useState<KnowledgeBaseStats | null>(null);

  // Sidebar refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Delete confirmation
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [fileToDelete, setFileToDelete] = useState<KnowledgeBaseDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action loading states
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  // Fetch stats for limit checking
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const data = await knowledgeBaseApi.getStats(token);
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, [token]);

  // Fetch files on mount
  const fetchFiles = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const [response] = await Promise.all([
        knowledgeBaseApi.listFiles(token),
        fetchStats(),
      ]);
      setFiles(response.files);

      // Check for any files that need status polling
      const pendingFiles = response.files.filter(
        (f) => f.processing_status === "pending" || f.processing_status === "processing"
      );
      if (pendingFiles.length > 0) {
        setPollingIds(pendingFiles.map((f) => f.id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
      console.error("Failed to fetch files:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token, fetchStats]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Poll for processing status
  useEffect(() => {
    if (pollingIds.length === 0 || !token) return;

    const pollInterval = setInterval(async () => {
      const completedIds: string[] = [];

      for (const fileId of pollingIds) {
        try {
          const status = await knowledgeBaseApi.getProcessingStatus(token, fileId);

          if (status.status === "completed" || status.status === "failed") {
            completedIds.push(fileId);

            // Update the file in the list
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileId
                  ? { ...f, processing_status: status.status, processing_error: status.error }
                  : f
              )
            );
          }
        } catch (err) {
          console.error(`Failed to poll status for ${fileId}:`, err);
        }
      }

      if (completedIds.length > 0) {
        setPollingIds((prev) => prev.filter((id) => !completedIds.includes(id)));
        // Refresh sidebar stats
        setRefreshTrigger((t) => t + 1);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [pollingIds, token]);

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        return `Unsupported file type. Please upload ${ACCEPTED_EXTENSIONS.join(", ")} files.`;
      }
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`;
    }
    return null;
  };

  // Handle file upload
  const handleUpload = async (filesToUpload: File[]) => {
    if (!token || filesToUpload.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadingFiles(filesToUpload.map((f) => ({ name: f.name, progress: "uploading" })));

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];

      // Validate
      const validationError = validateFile(file);
      if (validationError) {
        setUploadingFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: "error" } : f))
        );
        setUploadError(validationError);
        continue;
      }

      try {
        // Upload
        setUploadingFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: "uploading" } : f))
        );

        const newDoc = await knowledgeBaseApi.uploadFile(token, { file });

        // Update progress to processing
        setUploadingFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: "processing" } : f))
        );

        // Add to files list
        setFiles((prev) => [newDoc, ...prev]);

        // Add to polling if not completed
        if (newDoc.processing_status !== "completed") {
          setPollingIds((prev) => [...prev, newDoc.id]);
        }

        // Mark as done
        setUploadingFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: "done" } : f))
        );

        // Refresh sidebar and local stats
        setRefreshTrigger((t) => t + 1);
        fetchStats();
      } catch (err) {
        setUploadingFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: "error" } : f))
        );
        setUploadError(err instanceof Error ? err.message : "Upload failed");
        console.error("Upload failed:", err);
      }
    }

    setIsUploading(false);

    // Clear upload status after a delay
    setTimeout(() => {
      setUploadingFiles([]);
    }, 3000);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleUpload(droppedFiles);
  };

  // Handle browse click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleUpload(selectedFiles);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle delete confirmation
  const openDeleteConfirm = (file: KnowledgeBaseDocument) => {
    setFileToDelete(file);
    onDeleteOpen();
  };

  // Handle delete
  const handleDelete = async () => {
    if (!token || !fileToDelete) return;

    setIsDeleting(true);
    try {
      await knowledgeBaseApi.deleteFile(token, fileToDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setRefreshTrigger((t) => t + 1);
      fetchStats();
      onDeleteClose();
      setFileToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
      // Could show error in modal
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle toggle active
  const handleToggleActive = async (fileId: string) => {
    if (!token) return;

    setTogglingIds((prev) => new Set([...prev, fileId]));
    try {
      const result = await knowledgeBaseApi.toggleActive(token, fileId);
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, is_active: result.is_active } : f))
      );
      setRefreshTrigger((t) => t + 1);
    } catch (err) {
      console.error("Toggle active failed:", err);
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
    }
  };

  // Check if limit exceeded using API stats
  const isLimitExceeded = stats
    ? stats.total_documents >= stats.max_documents
    : false;

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Header - Full Width */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">Files</h1>
          <p className="text-sm text-default-500">
            Upload documents to train your AI. Supports PDF, DOCX, TXT, MD, CSV (max 500KB).
          </p>
        </div>
        <Button
          variant="bordered"
          size="sm"
          startContent={<Icon icon="solar:info-circle-linear" width={16} />}
        >
          Learn more
        </Button>
      </div>

      {/* Content Area - Two Columns */}
      <div className="mt-6 flex flex-1 gap-6 overflow-hidden">
        {/* Left Column - Add Files Section + Files List */}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          {/* Add Files Section */}
          <div className="flex flex-col rounded-lg border border-divider">
            {/* Collapsible Header */}
            <Button
              variant="light"
              fullWidth
              onPress={() => setIsAddFilesOpen(!isAddFilesOpen)}
              className="flex items-center justify-between px-4 py-3 h-auto min-h-0 rounded-none data-[hover=true]:bg-default-50"
            >
              <span className="text-sm font-medium text-foreground">Add files</span>
              <Icon
                icon="solar:alt-arrow-down-linear"
                width={16}
                className={cn(
                  "text-default-400 transition-transform",
                  isAddFilesOpen && "rotate-180"
                )}
              />
            </Button>

            {isAddFilesOpen && (
              <div className="flex flex-col px-4 pb-4">
                {/* Warning Alert */}
                {isLimitExceeded && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg bg-warning-50 px-3 py-2 text-warning-600">
                    <Icon icon="solar:danger-circle-linear" width={16} />
                    <span className="text-sm">Upgrade your plan to add more files.</span>
                  </div>
                )}

                {/* Upload Error */}
                {uploadError && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg bg-danger-50 px-3 py-2 text-danger">
                    <Icon icon="solar:danger-triangle-linear" width={16} />
                    <span className="text-sm">{uploadError}</span>
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onPress={() => setUploadError(null)}
                      className="ml-auto text-danger min-w-6 w-6 h-6"
                    >
                      <Icon icon="solar:close-circle-linear" width={16} />
                    </Button>
                  </div>
                )}

                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "flex min-h-[140px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
                    isDragging ? "border-primary bg-primary-50" : "border-default-200 bg-default-50",
                    (isLimitExceeded || isUploading) && "pointer-events-none opacity-60"
                  )}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Spinner size="sm" />
                      <p className="text-sm text-default-500">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="rounded-full bg-default-100 p-3">
                        <Icon
                          icon="solar:upload-minimalistic-linear"
                          width={24}
                          className="text-default-400"
                        />
                      </div>
                      {isLimitExceeded ? (
                        <p className="text-sm text-default-400">
                          Storage limit reached. Please upgrade your plan.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-default-600">
                            Drag and drop files here, or{" "}
                            <Link
                              as="button"
                              size="sm"
                              onPress={handleBrowseClick}
                              className="text-sm"
                            >
                              browse
                            </Link>
                          </p>
                          <p className="text-xs text-default-400">
                            PDF, DOCX, TXT, MD, CSV up to 500KB each
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {uploadingFiles.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    {uploadingFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-default-100 px-3 py-2"
                      >
                        <span className="truncate text-sm text-default-700">{file.name}</span>
                        {file.progress === "uploading" && (
                          <Spinner size="sm" className="ml-2" />
                        )}
                        {file.progress === "processing" && (
                          <Chip size="sm" color="primary" variant="flat">
                            Processing
                          </Chip>
                        )}
                        {file.progress === "done" && (
                          <Icon
                            icon="solar:check-circle-bold"
                            width={18}
                            className="text-success"
                          />
                        )}
                        {file.progress === "error" && (
                          <Icon
                            icon="solar:close-circle-bold"
                            width={18}
                            className="text-danger"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Files List */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-divider">
            <div className="flex items-center justify-between border-b border-divider px-4 py-3">
              <span className="text-sm font-medium text-foreground">
                Uploaded files ({files.length})
              </span>
            </div>

            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12">
                  <Icon icon="solar:danger-triangle-linear" width={32} className="text-danger" />
                  <p className="text-sm text-danger">{error}</p>
                  <Button size="sm" variant="flat" onPress={fetchFiles}>
                    Retry
                  </Button>
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12">
                  <Icon icon="solar:folder-open-linear" width={32} className="text-default-300" />
                  <p className="text-sm text-default-400">No files uploaded yet</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 border-b border-divider px-4 py-3 last:border-b-0 hover:bg-default-50"
                    >
                      {/* File Icon */}
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-default-100">
                        <Icon
                          icon={getFileIcon(file.mime_type)}
                          width={20}
                          className="text-default-500"
                        />
                      </div>

                      {/* File Info */}
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {file.title || file.original_name}
                          </span>
                          {!file.is_active && (
                            <Chip size="sm" variant="flat" color="default">
                              Inactive
                            </Chip>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-default-400">
                          <span>{formatFileSize(file.file_size)}</span>
                          <span>•</span>
                          <span>{formatDate(file.created_at)}</span>
                          {file.category !== "general" && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{file.category}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex flex-shrink-0 items-center gap-2">
                        {file.processing_status === "processing" ||
                        file.processing_status === "pending" ? (
                          <Chip
                            size="sm"
                            color={getStatusColor(file.processing_status)}
                            variant="flat"
                            startContent={<Spinner size="sm" className="h-3 w-3" />}
                          >
                            Processing
                          </Chip>
                        ) : file.processing_status === "failed" ? (
                          <Tooltip content={file.processing_error || "Processing failed"}>
                            <Chip size="sm" color="danger" variant="flat">
                              Failed
                            </Chip>
                          </Tooltip>
                        ) : (
                          <Chip
                            size="sm"
                            color={getStatusColor(file.processing_status)}
                            variant="flat"
                          >
                            Ready
                          </Chip>
                        )}

                        {/* Actions */}
                        <Tooltip content={file.is_active ? "Deactivate" : "Activate"}>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            isLoading={togglingIds.has(file.id)}
                            onPress={() => handleToggleActive(file.id)}
                          >
                            {!togglingIds.has(file.id) && (
                              <Icon
                                icon={
                                  file.is_active
                                    ? "solar:eye-linear"
                                    : "solar:eye-closed-linear"
                                }
                                width={16}
                                className="text-default-400"
                              />
                            )}
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete" color="danger">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => openDeleteConfirm(file)}
                          >
                            <Icon
                              icon="solar:trash-bin-trash-linear"
                              width={16}
                              className="text-danger"
                            />
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <DataSourcesSidebar refreshTrigger={refreshTrigger} />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Delete file</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {fileToDelete?.title || fileToDelete?.original_name}
              </span>
              ? This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose} isDisabled={isDeleting}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDelete} isLoading={isDeleting}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
