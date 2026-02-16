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
  type KnowledgeBaseStats,
} from "@/lib/api-client";

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

export default function QAPage() {
  const { token } = useAuth();

  // Form state
  const [isAddQAOpen, setIsAddQAOpen] = useState(true);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<string[]>([""]);
  const [answer, setAnswer] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Q&A list state
  const [qaItems, setQaItems] = useState<KnowledgeBaseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Stats for limit checking
  const [stats, setStats] = useState<KnowledgeBaseStats | null>(null);

  // Delete confirmation
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [itemToDelete, setItemToDelete] = useState<KnowledgeBaseDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action loading states
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  // Sidebar refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Calculate content size in bytes
  const contentSize = new Blob([answer]).size;
  const formattedSize =
    contentSize >= 1024
      ? `${(contentSize / 1024).toFixed(1)} KB`
      : `${contentSize} B`;

  // Limit check from API stats
  const isLimitExceeded = stats
    ? stats.total_documents >= stats.max_documents
    : false;

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const data = await knowledgeBaseApi.getStats(token);
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, [token]);

  // Fetch Q&A items (faq category documents)
  const fetchQAItems = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setListError(null);

    try {
      const [response] = await Promise.all([
        knowledgeBaseApi.listFiles(token, { category: "faq" }),
        fetchStats(),
      ]);
      setQaItems(response.files);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Failed to load Q&A items");
      console.error("Failed to fetch Q&A items:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token, fetchStats]);

  useEffect(() => {
    fetchQAItems();
  }, [fetchQAItems]);

  // Question helpers
  const addQuestion = () => {
    setQuestions([...questions, ""]);
  };

  const updateQuestion = (index: number, value: string) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!token || !title.trim() || !answer.trim()) return;

    const validQuestions = questions.filter((q) => q.trim());
    if (validQuestions.length === 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    // Build content: combine questions and answer into structured text
    const questionsText = validQuestions.map((q) => `Q: ${q}`).join("\n");
    const content = `${questionsText}\n\nA: ${answer.trim()}`;

    try {
      const newDoc = await knowledgeBaseApi.createDocument(token, {
        title: title.trim(),
        content,
        category: "faq",
        keywords: validQuestions.map((q) => q.trim().slice(0, 50)),
      });

      // Add to list
      setQaItems((prev) => [newDoc, ...prev]);

      // Clear form
      setTitle("");
      setQuestions([""]);
      setAnswer("");
      setSubmitSuccess(true);

      // Refresh sidebar and stats
      setRefreshTrigger((t) => t + 1);
      fetchStats();

      // Clear success message after delay
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create Q&A");
      console.error("Failed to create Q&A:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete confirmation
  const openDeleteConfirm = (item: KnowledgeBaseDocument) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  // Handle delete
  const handleDelete = async () => {
    if (!token || !itemToDelete) return;

    setIsDeleting(true);
    try {
      await knowledgeBaseApi.deleteFile(token, itemToDelete.id);
      setQaItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      setRefreshTrigger((t) => t + 1);
      fetchStats();
      onDeleteClose();
      setItemToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle toggle active
  const handleToggleActive = async (itemId: string) => {
    if (!token) return;

    setTogglingIds((prev) => new Set([...prev, itemId]));
    try {
      const result = await knowledgeBaseApi.toggleActive(token, itemId);
      setQaItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, is_active: result.is_active } : item
        )
      );
      setRefreshTrigger((t) => t + 1);
    } catch (err) {
      console.error("Toggle active failed:", err);
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

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

  const canSubmit =
    title.trim() &&
    questions.some((q) => q.trim()) &&
    answer.trim() &&
    !isLimitExceeded &&
    !isSubmitting;

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col">
      {/* Header - Full Width */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">Q&amp;A</h1>
          <p className="text-sm text-default-500">
            Craft responses for key questions, ensuring your AI shares relevant info.
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
        {/* Left Column - Add Q&A Section + Q&A List */}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          {/* Add Q&A Section */}
          <div className="flex flex-col rounded-lg border border-divider">
            {/* Collapsible Header */}
            <Button
              variant="light"
              fullWidth
              onPress={() => setIsAddQAOpen(!isAddQAOpen)}
              className="flex items-center justify-between px-4 py-3 h-auto min-h-0 rounded-none data-[hover=true]:bg-default-50"
            >
              <span className="text-sm font-medium text-foreground">Add Q&amp;A</span>
              <Icon
                icon="solar:alt-arrow-down-linear"
                width={16}
                className={cn(
                  "text-default-400 transition-transform",
                  isAddQAOpen && "rotate-180"
                )}
              />
            </Button>

            {isAddQAOpen && (
              <div className="flex flex-col px-4 pb-4">
                {/* Limit Warning */}
                {isLimitExceeded && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg bg-warning-50 px-3 py-2 text-warning-600">
                    <Icon icon="solar:danger-circle-linear" width={16} />
                    <span className="text-sm">Upgrade your plan to add more Q&amp;A pairs.</span>
                  </div>
                )}

                {/* Success Message */}
                {submitSuccess && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2 text-success">
                    <Icon icon="solar:check-circle-linear" width={16} />
                    <span className="text-sm">Q&amp;A added successfully!</span>
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

                {/* Question Inputs */}
                <div className="mt-4 flex flex-col gap-3">
                  <label className="text-sm text-default-600">Question</label>
                  {questions.map((question, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Ex: How do I request a refund?"
                        value={question}
                        onValueChange={(val) => updateQuestion(index, val)}
                        variant="bordered"
                        size="sm"
                        isDisabled={isSubmitting}
                        classNames={{
                          inputWrapper: "bg-transparent",
                        }}
                      />
                      {questions.length > 1 && (
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          onPress={() => removeQuestion(index)}
                          isDisabled={isSubmitting}
                          className="text-default-400 hover:text-danger"
                        >
                          <Icon icon="solar:trash-bin-trash-linear" width={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="bordered"
                    size="sm"
                    startContent={<Icon icon="solar:add-circle-linear" width={16} />}
                    onPress={addQuestion}
                    isDisabled={isSubmitting}
                    className="w-fit"
                  >
                    Add question
                  </Button>
                </div>

                {/* Answer - Rich Text Editor */}
                <div className="mt-4 flex flex-col gap-1.5">
                  <label className="text-sm text-default-600">Answer</label>
                  <div className="flex min-h-[160px] flex-col rounded-lg border border-default-200">
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
                      <span className="text-xs text-default-400">{formattedSize}</span>
                    </div>

                    {/* Text Area */}
                    <Textarea
                      value={answer}
                      onValueChange={setAnswer}
                      placeholder="Enter your answer..."
                      isDisabled={isSubmitting}
                      minRows={5}
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
                        Add Q&amp;A
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Q&A List */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-divider">
            <div className="flex items-center justify-between border-b border-divider px-4 py-3">
              <span className="text-sm font-medium text-foreground">
                Q&amp;A pairs ({qaItems.length})
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
                  <Button size="sm" variant="flat" onPress={fetchQAItems}>
                    Retry
                  </Button>
                </div>
              ) : qaItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12">
                  <Icon icon="solar:chat-square-like-linear" width={32} className="text-default-300" />
                  <p className="text-sm text-default-400">No Q&amp;A pairs yet</p>
                  <p className="text-xs text-default-300">
                    Add your first Q&amp;A pair using the form above
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {qaItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 border-b border-divider px-4 py-3 last:border-b-0 hover:bg-default-50"
                    >
                      {/* Icon */}
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-default-100">
                        <Icon
                          icon="solar:chat-square-like-bold"
                          width={20}
                          className="text-default-500"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {item.title}
                          </span>
                          {!item.is_active && (
                            <Chip size="sm" variant="flat" color="default">
                              Inactive
                            </Chip>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-default-400">
                          <span>{formatFileSize(item.file_size)}</span>
                          <span>•</span>
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <Chip
                          size="sm"
                          color={item.processing_status === "completed" ? "success" : "primary"}
                          variant="flat"
                        >
                          {item.processing_status === "completed" ? "Ready" : "Processing"}
                        </Chip>

                        <Tooltip content={item.is_active ? "Deactivate" : "Activate"}>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            isLoading={togglingIds.has(item.id)}
                            onPress={() => handleToggleActive(item.id)}
                          >
                            {!togglingIds.has(item.id) && (
                              <Icon
                                icon={
                                  item.is_active
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
                            onPress={() => openDeleteConfirm(item)}
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
          <ModalHeader className="flex flex-col gap-1">Delete Q&amp;A</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{itemToDelete?.title}</span>? This
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
