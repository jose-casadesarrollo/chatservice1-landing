"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Input,
  Textarea,
  Tooltip,
  Chip,
  Spinner,
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
} from "@/lib/api-client";

// Max content size (512KB as per API docs)
const MAX_CONTENT_SIZE = 512 * 1024;

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

export default function TextSnippetsPage() {
  const { token } = useAuth();

  // Form state
  const [isAddSnippetOpen, setIsAddSnippetOpen] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Snippets list state
  const [snippets, setSnippets] = useState<KnowledgeBaseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Delete confirmation
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [snippetToDelete, setSnippetToDelete] = useState<KnowledgeBaseDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action loading states
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  // Sidebar refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Calculate content size in bytes
  const contentSize = new Blob([content]).size;
  const formattedSize =
    contentSize >= 1024
      ? `${(contentSize / 1024).toFixed(1)} KB`
      : `${contentSize} B`;
  const isContentTooLarge = contentSize > MAX_CONTENT_SIZE;

  // Fetch snippets (text documents with category "general" or without specific file upload)
  const fetchSnippets = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setListError(null);

    try {
      // Fetch all documents and filter for text snippets (general category, text mime type)
      const response = await knowledgeBaseApi.listFiles(token, { category: "general" });
      // Filter to only show text-based documents (not uploaded files)
      const textSnippets = response.files.filter(
        (f) => f.mime_type === "text/plain" || f.mime_type === "text/markdown"
      );
      setSnippets(textSnippets);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Failed to load snippets");
      console.error("Failed to fetch snippets:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!token || !title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const newDoc = await knowledgeBaseApi.createDocument(token, {
        title: title.trim(),
        content: content.trim(),
        category: "general",
      });

      // Add to list
      setSnippets((prev) => [newDoc, ...prev]);

      // Clear form
      setTitle("");
      setContent("");
      setSubmitSuccess(true);

      // Refresh sidebar
      setRefreshTrigger((t) => t + 1);

      // Clear success message after delay
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create snippet");
      console.error("Failed to create snippet:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete confirmation
  const openDeleteConfirm = (snippet: KnowledgeBaseDocument) => {
    setSnippetToDelete(snippet);
    onDeleteOpen();
  };

  // Handle delete
  const handleDelete = async () => {
    if (!token || !snippetToDelete) return;

    setIsDeleting(true);
    try {
      await knowledgeBaseApi.deleteFile(token, snippetToDelete.id);
      setSnippets((prev) => prev.filter((s) => s.id !== snippetToDelete.id));
      setRefreshTrigger((t) => t + 1);
      onDeleteClose();
      setSnippetToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle toggle active
  const handleToggleActive = async (snippetId: string) => {
    if (!token) return;

    setTogglingIds((prev) => new Set([...prev, snippetId]));
    try {
      const result = await knowledgeBaseApi.toggleActive(token, snippetId);
      setSnippets((prev) =>
        prev.map((s) => (s.id === snippetId ? { ...s, is_active: result.is_active } : s))
      );
      setRefreshTrigger((t) => t + 1);
    } catch (err) {
      console.error("Toggle active failed:", err);
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(snippetId);
        return next;
      });
    }
  };

  const canSubmit =
    title.trim() && content.trim() && !isContentTooLarge && !isSubmitting;

  const toolbarButtons = [
    { icon: "solar:text-field-linear", tooltip: "Font", hasDropdown: true },
    { icon: "solar:text-bold-linear", tooltip: "Bold" },
    { icon: "solar:text-italic-linear", tooltip: "Italic" },
    { icon: "solar:text-strikethrough-linear", tooltip: "Strikethrough" },
    { type: "divider" },
    { icon: "solar:list-linear", tooltip: "Ordered list" },
    { icon: "solar:list-check-linear", tooltip: "Unordered list" },
    { type: "divider" },
    { icon: "solar:link-linear", tooltip: "Link" },
    { icon: "solar:smile-circle-linear", tooltip: "Emoji" },
  ];

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col">
      {/* Header - Full Width */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">Text snippets</h1>
          <p className="text-sm text-default-500">
            Add text snippets to your knowledge base that the agent gets trained on.
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
        {/* Left Column - Add Text Snippet Section + Snippets List */}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          {/* Add Snippet Section */}
          <div className="flex flex-col rounded-lg border border-divider">
            {/* Collapsible Header */}
            <Button
              variant="light"
              fullWidth
              onPress={() => setIsAddSnippetOpen(!isAddSnippetOpen)}
              className="flex items-center justify-between px-4 py-3 h-auto min-h-0 rounded-none data-[hover=true]:bg-default-50"
            >
              <span className="text-sm font-medium text-foreground">Add text snippet</span>
              <Icon
                icon="solar:alt-arrow-down-linear"
                width={16}
                className={cn(
                  "text-default-400 transition-transform",
                  isAddSnippetOpen && "rotate-180"
                )}
              />
            </Button>

            {isAddSnippetOpen && (
              <div className="flex flex-col px-4 pb-4">
                {/* Success Message */}
                {submitSuccess && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2 text-success">
                    <Icon icon="solar:check-circle-linear" width={16} />
                    <span className="text-sm">Text snippet added successfully!</span>
                  </div>
                )}

                {/* Error Message */}
                {submitError && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg bg-danger-50 px-3 py-2 text-danger">
                    <Icon icon="solar:danger-triangle-linear" width={16} />
                    <span className="text-sm">{submitError}</span>
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onPress={() => setSubmitError(null)}
                      className="ml-auto text-danger min-w-6 w-6 h-6"
                    >
                      <Icon icon="solar:close-circle-linear" width={16} />
                    </Button>
                  </div>
                )}

                {/* Title Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-default-600">Title</label>
                  <Input
                    placeholder="Ex: Refund requests"
                    value={title}
                    onValueChange={setTitle}
                    variant="bordered"
                    size="sm"
                    isDisabled={isSubmitting}
                    classNames={{
                      inputWrapper: "bg-transparent",
                    }}
                  />
                </div>

                {/* Rich Text Editor */}
                <div className="mt-4 flex min-h-[200px] flex-col rounded-lg border border-default-200">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between border-b border-default-200 px-2 py-1.5">
                    <div className="flex items-center gap-0.5">
                      {toolbarButtons.map((btn, index) => {
                        if (btn.type === "divider") {
                          return (
                            <div
                              key={`divider-${index}`}
                              className="mx-1 h-5 w-px bg-default-200"
                            />
                          );
                        }
                        return (
                          <Tooltip key={btn.icon} content={btn.tooltip} size="sm">
                            <Button
                              isIconOnly
                              variant="light"
                              size="sm"
                              isDisabled={isSubmitting}
                              className="min-w-7 w-7 h-7 text-default-500 data-[hover=true]:text-default-700"
                            >
                              <Icon icon={btn.icon!} width={16} />
                              {btn.hasDropdown && (
                                <Icon icon="solar:alt-arrow-down-linear" width={12} />
                              )}
                            </Button>
                          </Tooltip>
                        );
                      })}
                    </div>
                    <span
                      className={cn(
                        "text-xs",
                        isContentTooLarge ? "text-danger" : "text-default-400"
                      )}
                    >
                      {formattedSize}
                      {isContentTooLarge && " (max 512KB)"}
                    </span>
                  </div>

                  {/* Text Area */}
                  <Textarea
                    value={content}
                    onValueChange={setContent}
                    placeholder="Enter your text snippet content..."
                    isDisabled={isSubmitting}
                    minRows={6}
                    variant="flat"
                    classNames={{
                      inputWrapper: "bg-transparent shadow-none p-0 border-none",
                      input: "px-3 py-2 text-sm",
                    }}
                  />

                  {/* Footer with Add Button */}
                  <div className="flex justify-end border-t border-default-200 px-3 py-2">
                    <Button
                      color="default"
                      variant="solid"
                      size="sm"
                      className="bg-default-800 text-white hover:bg-default-700"
                      isDisabled={!canSubmit}
                      isLoading={isSubmitting}
                      onPress={handleSubmit}
                    >
                      Add text snippet
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Snippets List */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-divider">
            <div className="flex items-center justify-between border-b border-divider px-4 py-3">
              <span className="text-sm font-medium text-foreground">
                Text snippets ({snippets.length})
              </span>
            </div>

            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : listError ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12">
                  <Icon icon="solar:danger-triangle-linear" width={32} className="text-danger" />
                  <p className="text-sm text-danger">{listError}</p>
                  <Button size="sm" variant="flat" onPress={fetchSnippets}>
                    Retry
                  </Button>
                </div>
              ) : snippets.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12">
                  <Icon icon="solar:document-text-linear" width={32} className="text-default-300" />
                  <p className="text-sm text-default-400">No text snippets yet</p>
                  <p className="text-xs text-default-300">
                    Add your first snippet using the form above
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {snippets.map((snippet) => (
                    <div
                      key={snippet.id}
                      className="flex items-center gap-3 border-b border-divider px-4 py-3 last:border-b-0 hover:bg-default-50"
                    >
                      {/* Icon */}
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-default-100">
                        <Icon
                          icon="solar:document-text-bold"
                          width={20}
                          className="text-default-500"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {snippet.title}
                          </span>
                          {!snippet.is_active && (
                            <Chip size="sm" variant="flat" color="default">
                              Inactive
                            </Chip>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-default-400">
                          <span>{formatFileSize(snippet.file_size)}</span>
                          <span>•</span>
                          <span>{formatDate(snippet.created_at)}</span>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <Chip
                          size="sm"
                          color={snippet.processing_status === "completed" ? "success" : "primary"}
                          variant="flat"
                        >
                          {snippet.processing_status === "completed" ? "Ready" : "Processing"}
                        </Chip>

                        <Tooltip content={snippet.is_active ? "Deactivate" : "Activate"}>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            isLoading={togglingIds.has(snippet.id)}
                            onPress={() => handleToggleActive(snippet.id)}
                          >
                            {!togglingIds.has(snippet.id) && (
                              <Icon
                                icon={
                                  snippet.is_active
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
                            onPress={() => openDeleteConfirm(snippet)}
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
          <ModalHeader className="flex flex-col gap-1">Delete snippet</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{snippetToDelete?.title}</span>? This
              action cannot be undone.
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
