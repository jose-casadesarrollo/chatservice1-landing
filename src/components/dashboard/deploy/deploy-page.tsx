"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Switch,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";

// Types
interface DeployChannel {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg?: string;
  enabled?: boolean;
  hasToggle?: boolean;
  buttonText: string;
  buttonVariant: "setup" | "manage" | "subscribe";
  badge?: string;
  isLarge?: boolean;
  previewImage?: "chat-widget" | "help-page";
}

// Channel configurations
const deployChannels: DeployChannel[] = [
  // Top row - Large cards
  {
    id: "chat-widget",
    name: "Chat widget",
    description: "Add a floating chat window to your site.",
    icon: "solar:chat-round-dots-bold",
    iconColor: "#FFFFFF",
    iconBg: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
    enabled: true,
    hasToggle: true,
    buttonText: "Manage",
    buttonVariant: "manage",
    isLarge: true,
    previewImage: "chat-widget",
  },
  {
    id: "help-page",
    name: "Help page",
    description: "ChatGPT-style help page, deployed standalone or under a path on your site (/help).",
    icon: "solar:question-circle-bold",
    iconColor: "#FFFFFF",
    iconBg: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
    buttonText: "Setup",
    buttonVariant: "setup",
    isLarge: true,
    previewImage: "help-page",
  },
  // Second row
  {
    id: "email",
    name: "Email",
    description: "Connect your agent to an email address and let it respond to messages from your customers.",
    icon: "solar:letter-bold",
    iconColor: "#FFFFFF",
    iconBg: "#F97316",
    buttonText: "Subscribe to enable",
    buttonVariant: "subscribe",
    badge: "Beta",
  },
  {
    id: "make",
    name: "Make",
    description: "Connect your agent with thousands of apps using Make.com automation.",
    icon: "simple-icons:make",
    iconColor: "#FFFFFF",
    iconBg: "#6D29D9",
    buttonText: "Subscribe to enable",
    buttonVariant: "subscribe",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Connect your agent to Slack, mention it, and have it reply to any message.",
    icon: "simple-icons:slack",
    iconColor: "#FFFFFF",
    iconBg: "#4A154B",
    buttonText: "Subscribe to enable",
    buttonVariant: "subscribe",
  },
  // Third row
  {
    id: "wordpress",
    name: "WordPress",
    description: "Use the official plugin for WordPress to add the chat widget to your website.",
    icon: "simple-icons:wordpress",
    iconColor: "#FFFFFF",
    iconBg: "#21759B",
    buttonText: "Setup",
    buttonVariant: "setup",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Connect your agent to a WhatsApp number and let it respond to messages from your customers.",
    icon: "simple-icons:whatsapp",
    iconColor: "#FFFFFF",
    iconBg: "#25D366",
    buttonText: "Subscribe to enable",
    buttonVariant: "subscribe",
  },
  {
    id: "messenger",
    name: "Messenger",
    description: "Connect your agent to a Facebook page and let it respond to messages from your customers.",
    icon: "simple-icons:messenger",
    iconColor: "#FFFFFF",
    iconBg: "#0084FF",
    buttonText: "Subscribe to enable",
    buttonVariant: "subscribe",
  },
  // Fourth row
  {
    id: "instagram",
    name: "Instagram",
    description: "Connect your agent to an Instagram page and let it respond to messages from your customers.",
    icon: "simple-icons:instagram",
    iconColor: "#FFFFFF",
    iconBg: "linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)",
    buttonText: "Subscribe to enable",
    buttonVariant: "subscribe",
  },
  {
    id: "zendesk",
    name: "Zendesk",
    description: "Create Zendesk tickets from your customers and let your agent reply to them.",
    icon: "simple-icons:zendesk",
    iconColor: "#FFFFFF",
    iconBg: "#03363D",
    buttonText: "Subscribe to enable",
    buttonVariant: "subscribe",
  },
  {
    id: "api",
    name: "API",
    description: "Integrate your agent directly with your applications using our REST API.",
    icon: "solar:programming-bold",
    iconColor: "#FFFFFF",
    iconBg: "#6366F1",
    buttonText: "Subscribe to enable",
    buttonVariant: "subscribe",
  },
  // Fifth row
  {
    id: "shopify",
    name: "Shopify",
    description: "Connect your agent to Shopify and let it respond to messages from your customers.",
    icon: "simple-icons:shopify",
    iconColor: "#FFFFFF",
    iconBg: "#96BF48",
    buttonText: "Subscribe to enable",
    buttonVariant: "subscribe",
  },
];

// Large card component for Chat Widget and Help Page
function LargeDeployCard({ channel }: { channel: DeployChannel }) {
  const [isEnabled, setIsEnabled] = useState(channel.enabled ?? false);

  return (
    <Card className="border border-divider shadow-none overflow-hidden">
      {/* Preview Area */}
      <div className="relative h-[230px] overflow-hidden">
        {channel.previewImage === "chat-widget" ? (
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-sky-500">
            {/* Mock chat widget preview */}
            <div className="absolute right-8 top-4 w-[200px] rounded-xl bg-white shadow-lg overflow-hidden">
              <div className="bg-red-500 px-3 py-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-white/80" />
                <span className="text-[10px] text-white font-medium">Coca-Cola Agent</span>
              </div>
              <div className="p-3">
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <span className="text-[10px] text-gray-600">Hi! What can I help you with?</span>
                </div>
              </div>
            </div>
            {/* Mock mobile frame */}
            <div className="absolute right-4 bottom-0 w-[80px] h-[140px] bg-gray-800 rounded-t-xl border-4 border-gray-700">
              <div className="w-full h-full bg-sky-300 rounded-t-lg" />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-1 flex items-center justify-center">
            {/* Mock help page preview */}
            <div className="w-[580px] bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center gap-1 mb-3">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                <div className="h-2 w-2 rounded-full bg-green-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 text-center mb-3">
                How can we help you today?
              </h3>
              <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 flex-1">Ask a question...</span>
                <Icon icon="solar:arrow-up-linear" width={12} className="text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      <CardBody className="gap-2 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">{channel.name}</h3>
          {channel.hasToggle && (
            <Switch
              size="sm"
              isSelected={isEnabled}
              onValueChange={setIsEnabled}
              color="success"
            />
          )}
        </div>
        <p className="text-sm text-default-500">{channel.description}</p>
      </CardBody>

      <CardFooter className="border-t border-divider px-4 py-3 justify-end gap-2">
        <Button
          isIconOnly
          variant="bordered"
          size="sm"
        >
          <Icon icon="solar:copy-linear" width={16} />
        </Button>
        <Button
          variant="bordered"
          size="sm"
        >
          {channel.buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Standard card component for integration channels
function DeployCard({ channel }: { channel: DeployChannel }) {
  return (
    <Card className="border border-divider shadow-none hover:border-default-300 hover:shadow-sm transition-all">
      <CardBody className="gap-3 p-4">
        <div className="flex items-start justify-between">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ background: channel.iconBg }}
          >
            <Icon
              icon={channel.icon}
              width={24}
              style={{ color: channel.iconColor }}
            />
          </div>
          {channel.badge && (
            <Chip
              size="sm"
              variant="flat"
              classNames={{
                base: "bg-default-100",
                content: "text-default-600 text-xs font-medium",
              }}
            >
              {channel.badge}
            </Chip>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-foreground">{channel.name}</h3>
          <p className="text-sm text-default-500 line-clamp-2">{channel.description}</p>
        </div>
      </CardBody>

      <CardFooter className="border-t border-divider px-4 py-3 justify-end gap-2">
        <Button
          isIconOnly
          variant="bordered"
          size="sm"
        >
          <Icon icon="solar:copy-linear" width={16} />
        </Button>
        <Button
          variant="bordered"
          size="sm"
        >
          {channel.buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function DeployPage() {
  const largeChannels = deployChannels.filter((c) => c.isLarge);
  const standardChannels = deployChannels.filter((c) => !c.isLarge);

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col overflow-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">Deploy</h1>
          <p className="text-sm text-default-500">
            Deploy your AI agent across multiple channels and platforms.
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

      {/* Cards Grid */}
      <div className="mt-6 flex flex-col gap-4">
        {/* Top Row - 2 Large Cards */}
        <div className="grid grid-cols-2 gap-4">
          {largeChannels.map((channel) => (
            <LargeDeployCard key={channel.id} channel={channel} />
          ))}
        </div>

        {/* Standard Cards - 3 Column Grid */}
        <div className="grid grid-cols-3 gap-4">
          {standardChannels.map((channel) => (
            <DeployCard key={channel.id} channel={channel} />
          ))}
        </div>
      </div>
    </div>
  );
}
