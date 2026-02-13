"use client";

import { useState } from "react";
import { Button, Input, Tooltip, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import DataSourcesSidebar from "../data-sources-sidebar";

export default function QAPage() {
  const [isAddQAOpen, setIsAddQAOpen] = useState(true);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<string[]>([""]);
  const [answer, setAnswer] = useState("");

  // TODO: Wire this to actual stats from a shared context
  const isLimitExceeded = false;

  // Calculate content size in bytes
  const contentSize = new Blob([answer]).size;
  const formattedSize = contentSize >= 1024 
    ? `${(contentSize / 1024).toFixed(1)} KB` 
    : `${contentSize} B`;

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

  const canSubmit = title.trim() && questions.some(q => q.trim()) && answer.trim() && !isLimitExceeded;

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
      <div className="mt-6 flex flex-1 gap-6">
        {/* Left Column - Add Q&A Section */}
        <div className="flex flex-1 flex-col rounded-lg border border-divider">
          {/* Collapsible Header */}
          <button
            onClick={() => setIsAddQAOpen(!isAddQAOpen)}
            className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-default-50 transition-colors"
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
          </button>

          {isAddQAOpen && (
            <div className="flex flex-1 flex-col px-4 pb-4 overflow-auto">
              {/* Title Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-default-600">Title</label>
                <Input
                  placeholder="Ex: Refund requests"
                  value={title}
                  onValueChange={setTitle}
                  variant="bordered"
                  size="sm"
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
                  className="w-fit"
                >
                  Add question
                </Button>
              </div>

              {/* Answer - Rich Text Editor */}
              <div className="mt-4 flex flex-1 flex-col gap-1.5">
                <label className="text-sm text-default-600">Answer</label>
                <div className="flex flex-1 flex-col rounded-lg border border-default-200">
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
                            <button
                              className="flex items-center gap-0.5 rounded p-1.5 text-default-500 hover:bg-default-100 hover:text-default-700 transition-colors"
                            >
                              <Icon icon={btn.icon!} width={16} />
                              {btn.hasDropdown && (
                                <Icon icon="solar:alt-arrow-down-linear" width={12} />
                              )}
                            </button>
                          </Tooltip>
                        );
                      })}
                    </div>
                    <span className="text-xs text-default-400">{formattedSize}</span>
                  </div>

                  {/* Text Area */}
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter your answer..."
                    className="flex-1 resize-none bg-transparent p-3 text-sm text-foreground placeholder:text-default-300 focus:outline-none min-h-[120px]"
                  />
                </div>
              </div>

              {/* Add Q&A Button */}
              <div className="mt-4 flex justify-end">
                <Button
                  color="default"
                  variant="solid"
                  size="sm"
                  className="bg-default-800 text-white hover:bg-default-700"
                  isDisabled={!canSubmit}
                >
                  Add Q&amp;A
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <DataSourcesSidebar />
      </div>
    </div>
  );
}
